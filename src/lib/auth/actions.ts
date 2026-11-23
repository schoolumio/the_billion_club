"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { one, query, DatabaseUnavailableError } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, endSession, getSession, startSession } from "./session";
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
    user = await one(`SELECT id, email, full_name, role, password_hash, status FROM users WHERE email = $1`, [email]);
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

const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Enter your full name").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().regex(/^\+?[0-9 ]{10,16}$/, "Enter a valid phone number"),
    state: z.string().trim().min(2, "Select your state"),
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    consent: z.literal("on", { message: "Please confirm you have read the pre-launch notice" }),
  });

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const d = parsed.data;
  const ip = await clientIp();
  if (!rateLimit(`register:${ip}`, 5, 60 * 60_000).ok) return { error: "Too many registrations from this network. Try later." };

  try {
    const exists = await one(`SELECT 1 FROM users WHERE email = $1`, [d.email]);
    if (exists) return { error: "An account with this email already exists." };
    const hash = await bcrypt.hash(d.password, 12);
    const user = await one<{ id: string }>(
      `INSERT INTO users(member_no, email, password_hash, full_name, phone, state, role, verification)
       VALUES ('TBC-' || to_char(now(),'YYMM') || '-' || upper(substr(md5(random()::text),1,6)), $1,$2,$3,$4,$5,'member','unverified') RETURNING id`,
      [d.email, hash, d.fullName, d.phone, d.state],
    );
    await audit({ actorId: user!.id, actorEmail: d.email, action: "REGISTER", entity: "user", entityId: user!.id, ip });
    await startSession({ sub: user!.id, email: d.email, name: d.fullName, role: "member" });
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) return { error: "Registration is unavailable: the database is not connected." };
    throw e;
  }
  redirect("/dashboard?welcome=1");
}

export async function logoutAction() {
  const s = await getSession();
  if (s) await audit({ actorId: s.sub, actorEmail: s.email, action: "LOGOUT", ip: await clientIp() });
  await endSession();
  redirect("/");
}
