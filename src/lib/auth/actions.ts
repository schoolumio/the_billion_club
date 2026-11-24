"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { one, query, DatabaseUnavailableError } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, endSession, getSession, startSession } from "./session";
import { sendEmail, emailDeliveryConfigured } from "@/lib/mailer";
import { createEmailToken, getConfig, signalHash } from "@/lib/referrals/server";
import { normalizeEmail, normalizePhone } from "@/lib/referrals/codes";
import { resolveAttribution } from "@/lib/referrals/attribution";
import { REVIEW_AT, isDisposableEmail, sameName, scoreRegistration } from "@/lib/referrals/risk";
import type { Role } from "./roles";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

// Constant-time-ish failure path: compare against a dummy hash when the user is unknown.
const DUMMY_HASH = "$2b$11$qqMlJv1Xh.ZzzhJNG/lmLO28DVCVR/SjQK8lg.psZfeawox9HLR3q";

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { email, password, next } = parsed.data;
  const ip = await clientIp();
  const rl = rateLimit(`login:${ip}:${email}`, 6, 5 * 60_000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${rl.retryAfter}s.` };

  let user: { id: string; email: string; full_name: string; role: Role; password_hash: string; status: string } | null;
  try {
    user = await one(`SELECT id, email, full_name, role, password_hash, status FROM users WHERE email_normalized = $1`, [normalizeEmail(email)]);
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) return { error: "The member database is not available. See README → Database setup." };
    throw e;
  }
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) {
    await audit({ actorEmail: email, action: "LOGIN_FAILED", ip });
    return { error: "Email or password is incorrect." };
  }
  if (user.status !== "active") return { error: "This account is not active. Please contact support." };

  await startSession({ sub: user.id, email: user.email, name: user.full_name, role: user.role });
  await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);
  await audit({ actorId: user.id, actorEmail: user.email, action: "LOGIN", ip });

  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : user.role === "member" ? "/dashboard" : "/admin";
  redirect(dest);
}

const joinSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  phone: z.string().trim().refine((v) => !!normalizePhone(v), "Enter a valid Nigerian phone number"),
  state: z.string().trim().min(2, "Select your state"),
  password: z.string().min(10, "Use at least 10 characters").regex(/[A-Z]/, "Include an uppercase letter").regex(/[0-9]/, "Include a number"),
  ref: z.string().trim().max(20).optional().default(""),
  linkRef: z.string().max(20).optional().default(""),
  campaign: z.string().max(40).optional().default(""),
  consentTerms: z.literal("on", { message: "Please tick to accept the terms, privacy notice and referral policy" }),
  consentNotInvestment: z.literal("on", { message: "Please tick to confirm you understand joining is free and not an investment" }),
  adult: z.literal("on", { message: "You must be 18 or older to join" }),
  leaderboardOptIn: z.string().optional(),
  marketingConsent: z.string().optional(),
  website: z.string().optional().default(""), // honeypot
  startedAt: z.coerce.number().optional().default(0),
});

export async function joinAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = joinSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const d = parsed.data;
  const ip = await clientIp();
  if (!rateLimit(`join:${ip}`, 8, 60 * 60_000).ok) return { error: "Too many registrations from this network in the last hour. Please try again later." };

  const jar = await cookies();
  const deviceId = jar.get("tbc_did")?.value ?? null;
  const ipHash = signalHash(ip);
  const deviceHash = signalHash(deviceId);
  const emailNorm = normalizeEmail(d.email);
  const phoneNorm = normalizePhone(d.phone)!;

  try {
    const { config } = await getConfig();
    const dup = await one<{ e: boolean; p: boolean }>(`SELECT bool_or(email_normalized = $1) e, bool_or(phone_normalized = $2) p FROM users WHERE email_normalized = $1 OR phone_normalized = $2`, [emailNorm, phoneNorm]);
    if (dup?.e) return { error: "An account with this email already exists. Please sign in instead." };
    if (dup?.p) return { error: "An account with this phone number already exists. Please sign in instead." };

    // ---- attribution (see src/lib/referrals/attribution.ts for the policy)
    const att = resolveAttribution({ formCode: d.ref, linkCode: d.linkRef, cookieCode: jar.get("tbc_ref")?.value, campaign: d.campaign || jar.get("tbc_c")?.value });
    let referrer: { id: string; full_name: string; signup_ip_hash: string | null; signup_device_hash: string | null; status: string; role: string } | null = null;
    if (att.code && config.referralsEnabled) {
      referrer = await one(`SELECT id, full_name, signup_ip_hash, signup_device_hash, status, role FROM users WHERE referral_code = $1`, [att.code]);
      if (!referrer) return { fieldErrors: { ref: ["We couldn’t find that invite code. Check it, or remove it to join without one."] } };
      if (referrer.status !== "active" || referrer.role !== "member") referrer = null; // inactive/staff codes credit nobody
    }

    // ---- risk scoring (never rejects on a shared network alone)
    const velocity = referrer
      ? await one<{ ip: string; all: string }>(
          `SELECT count(*) FILTER (WHERE u.signup_ip_hash = $2) ip, count(*) "all" FROM referrals r JOIN users u ON u.id = r.referred_id WHERE r.referrer_id = $1 AND r.created_at > now() - interval '1 hour'`, [referrer.id, ipHash])
      : null;
    const deviceAccounts = deviceHash ? Number((await one<{ n: string }>(`SELECT count(*) n FROM users WHERE signup_device_hash = $1`, [deviceHash]))?.n ?? 0) : 0;
    const risk = scoreRegistration({
      honeypotFilled: !!d.website,
      formFillMs: d.startedAt ? Date.now() - d.startedAt : 0,
      sameDeviceAsReferrer: !!referrer && !!deviceHash && referrer.signup_device_hash === deviceHash,
      sameIpAsReferrer: !!referrer && !!ipHash && referrer.signup_ip_hash === ipHash,
      referrerIpVelocity1h: Number(velocity?.ip ?? 0),
      referrerVelocity1h: Number(velocity?.all ?? 0),
      deviceAccounts,
      disposableEmail: isDisposableEmail(emailNorm),
      nameMatchesReferrer: !!referrer && sameName(referrer.full_name, d.fullName),
    });
    if (risk.block) {
      await audit({ actorEmail: d.email, action: "JOIN_BLOCKED", metadata: { flags: risk.flags }, ip });
      return { error: "We couldn't complete your registration. Please wait a moment and try again." };
    }

    const hash = await bcrypt.hash(d.password, 12);
    const user = await one<{ id: string; referral_code: string }>(
      `INSERT INTO users(member_no, email, email_normalized, phone, phone_normalized, password_hash, full_name, state, role, verification,
                         referred_by, leaderboard_opt_in, marketing_consent, signup_ip_hash, signup_device_hash)
       VALUES ('TBC-' || to_char(now(),'YYMM') || '-' || upper(substr(md5(random()::text),1,6)), $1,$2,$3,$4,$5,$6,$7,'member','unverified',$8,$9,$10,$11,$12)
       RETURNING id, referral_code`,
      [d.email, emailNorm, d.phone, phoneNorm, hash, d.fullName, d.state, referrer?.id ?? null, d.leaderboardOptIn === "on", d.marketingConsent === "on", ipHash, deviceHash]);

    if (referrer && att.code) {
      const status = risk.score >= REVIEW_AT ? "under_review" : "pending";
      const ref = await one<{ id: string }>(
        `INSERT INTO referrals(referrer_id, referred_id, code_used, source, campaign_slug, status, risk_score, risk_flags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [referrer.id, user!.id, att.code, att.source, att.campaign, status, risk.score, risk.flags]);
      await query(`INSERT INTO referral_events(referral_id, to_status, reason) VALUES ($1,$2,$3)`, [ref!.id, status, status === "pending" ? "Registered; awaiting email verification" : `Flagged for review: ${risk.flags.join(", ")}`]);
      if (status === "under_review") {
        await query(`INSERT INTO fraud_alerts(user_id, rule, severity, description, is_demo) VALUES ($1,'REFERRAL_RISK',$2,$3,false)`,
          [user!.id, risk.score >= 70 ? "high" : "medium", `Referral by ${att.code} flagged (score ${risk.score}): ${risk.flags.join(", ")}`]);
      }
    }

    const token = await createEmailToken(user!.id);
    const origin = await siteOrigin();
    const link = `${origin}/verify?token=${token}`;
    await sendEmail(d.email, "Verify your place in The Billionaire Circle",
      `Welcome to The Billionaire Circle founding community, ${d.fullName.split(" ")[0]}.\n\nPlease verify your email to secure your place on the waitlist:\n${link}\n\nJoining is free. The waitlist is not an investment and does not guarantee any financial return.\n\nIf you did not request this, ignore this email.`);
    if (!emailDeliveryConfigured()) jar.set("tbc_demo_verify", link, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60, secure: process.env.NODE_ENV === "production" });
    jar.delete("tbc_ref");
    jar.delete("tbc_c");

    await audit({ actorId: user!.id, actorEmail: d.email, action: "WAITLIST_JOIN", entity: "user", entityId: user!.id, ip,
      metadata: { referred: !!referrer, source: att.source, campaign: att.campaign, risk: risk.score, flags: risk.flags } });
    await startSession({ sub: user!.id, email: d.email, name: d.fullName, role: "member" });
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) return { error: "Registration is unavailable: the database is not connected." };
    if ((e as { code?: string }).code === "23505") return { error: "An account with these details already exists. Please sign in instead." };
    throw e;
  }
  redirect("/dashboard/referrals?welcome=1");
}

export async function resendVerification(): Promise<FormState> {
  const s = await getSession();
  if (!s) return { error: "Please sign in again." };
  if (!rateLimit(`resend:${s.sub}`, 3, 60 * 60_000).ok) return { error: "Please wait before requesting another email." };
  const u = await one<{ email: string; email_verified_at: Date | null }>(`SELECT email, email_verified_at FROM users WHERE id = $1`, [s.sub]);
  if (!u || u.email_verified_at) return {};
  const token = await createEmailToken(s.sub);
  const link = `${await siteOrigin()}/verify?token=${token}`;
  await sendEmail(u.email, "Verify your place in The Billionaire Circle", `Verify your email to secure your place on the waitlist:\n${link}`);
  if (!emailDeliveryConfigured()) (await cookies()).set("tbc_demo_verify", link, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600, secure: process.env.NODE_ENV === "production" });
  return { error: undefined };
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function logoutAction() {
  const s = await getSession();
  if (s) await audit({ actorId: s.sub, actorEmail: s.email, action: "LOGOUT", ip: await clientIp() });
  await endSession();
  redirect("/");
}
