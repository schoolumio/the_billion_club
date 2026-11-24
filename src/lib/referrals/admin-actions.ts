"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query, one } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { advanceRun, decideReferral, getConfig, refreshReferralStats, runReferralRewards, saveConfig } from "./server";
import type { ReferralConfig } from "./config";
import { promoViolation } from "./promo";

export interface AdminState { ok?: boolean; error?: string; message?: string }

const actorOf = (s: { sub: string; email: string }) => ({ id: s.sub, email: s.email });

/* ------------------------------ aggregates -------------------------------- */

export async function refreshStatsAction(): Promise<AdminState> {
  const s = await requirePermission("admin:referrals:write");
  const r = await refreshReferralStats();
  await audit({ actorId: s.sub, actorEmail: s.email, action: "REFERRAL_STATS_REFRESHED", metadata: r });
  revalidatePath("/admin/waitlist");
  return { ok: true, message: `Aggregates refreshed in ${r.ms} ms.` };
}

/* ------------------------------ review queue ------------------------------ */

async function decide(form: FormData, decision: "verified" | "rejected") {
  const s = await requirePermission("admin:referrals:write");
  const p = z.object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(form));
  if (!p.success) return;
  await decideReferral(p.data.id, decision, p.data.reason, actorOf(s));
  revalidatePath("/admin/referrals");
}
export async function approveReferralAction(form: FormData) { await decide(form, "verified"); }
export async function rejectReferralAction(form: FormData) { await decide(form, "rejected"); }

export async function upholdAppealAction(form: FormData) { await decideAppeal(form, "upheld"); }
export async function dismissAppealAction(form: FormData) { await decideAppeal(form, "dismissed"); }

async function decideAppeal(form: FormData, outcome: "upheld" | "dismissed") {
  const s = await requirePermission("admin:referrals:write");
  const parsed = z.object({ id: z.string().uuid(), resolution: z.string().trim().min(3).max(500) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const p = { ...parsed.data, outcome };
  const a = await one<{ referral_id: string; status: string }>(`SELECT referral_id, status FROM referral_appeals WHERE id = $1`, [p.id]);
  if (!a || a.status !== "open") return;
  await query(`UPDATE referral_appeals SET status = $2, resolution = $3, decided_by = $4, decided_at = now() WHERE id = $1`, [p.id, p.outcome, p.resolution, s.sub]);
  if (p.outcome === "upheld") await decideReferral(a.referral_id, "verified", `Appeal upheld: ${p.resolution}`, actorOf(s));
  await audit({ actorId: s.sub, actorEmail: s.email, action: "REFERRAL_APPEAL_DECIDED", entity: "referral_appeal", entityId: p.id, metadata: { outcome: p.outcome } });
  revalidatePath("/admin/referrals");
}

/* ------------------------------ configuration ----------------------------- */

const levelSchema = z.object({ name: z.string().trim().min(2).max(40), min: z.coerce.number().int().min(1) });

export async function saveConfigAction(_: AdminState, form: FormData): Promise<AdminState> {
  const s = await requirePermission("admin:referral-config:write");
  const f = Object.fromEntries(form);
  const { config: prev } = await getConfig();
  const levels: { name: string; min: number }[] = [];
  for (let i = 0; i < 10; i++) {
    if (f[`level_name_${i}`] === undefined) break;
    const l = levelSchema.safeParse({ name: f[`level_name_${i}`], min: f[`level_min_${i}`] });
    if (!l.success) return { error: `Achievement level ${i + 1} is invalid.` };
    levels.push(l.data);
  }
  const pct = Number(f.allocationPct);
  if (!Number.isFinite(pct)) return { error: "Allocation must be a number." };
  const next: ReferralConfig = {
    ...prev,
    referralsEnabled: f.referralsEnabled === "on",
    rewardsState: z.enum(["inactive", "simulation_only", "active"]).parse(f.rewardsState),
    allocationBps: Math.round(pct * 100),
    poolBasis: z.enum(["net_received", "gross_received"]).parse(f.poolBasis),
    denominator: z.enum(["paying_members_on_day", "all_verified_members"]).parse(f.denominator),
    eligibility: f.denominator === "paying_members_on_day" ? "verified_and_paid_on_day" : "verified",
    unallocatedPolicy: z.enum(["return_to_reserve", "carry_forward"]).parse(f.unallocatedPolicy),
    perMemberCapBps: Math.round(Number(f.capPct || 0) * 100),
    verification: z.enum(["email", "email_and_phone"]).parse(f.verification),
    cutoffTime: String(f.cutoffTime ?? "23:59"),
    distributionSchedule: z.enum(["daily", "weekly", "monthly"]).parse(f.distributionSchedule),
    fundingConfirmed: f.fundingConfirmed === "on",
    legalApprovalRef: String(f.legalApprovalRef ?? "").trim().slice(0, 120),
    baseUrl: String(f.baseUrl ?? "").trim().replace(/\/+$/, ""),
    levels: levels.length ? levels : prev.levels,
  };
  const note = String(f.changeNote ?? "").trim();
  if (note.length < 5) return { error: "Describe the reason for this change (min 5 characters) — it is kept in the version history." };
  const r = await saveConfig(next, note, actorOf(s));
  if ("error" in r && r.error) return { error: r.error };
  revalidatePath("/admin/referral-settings");
  return { ok: true, message: `Saved as version ${r.version}.` };
}

/* ------------------------------ reward runs ------------------------------- */

export async function runRewardsAction(_: AdminState, form: FormData): Promise<AdminState> {
  const s = await requirePermission("admin:rewards:write");
  const p = z.object({ runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), mode: z.enum(["simulation", "live"]), note: z.string().max(200).optional() }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Choose a valid date and mode." };
  const r = await runReferralRewards({ ...p.data, actor: actorOf(s) });
  if ("error" in r) return { error: r.error };
  revalidatePath("/admin/rewards");
  const res = r.result!;
  return { ok: true, message: `${p.data.mode === "simulation" ? "Simulation" : "Calculation"} complete: allocation ₦${(res.allocationKobo / 100).toLocaleString("en-NG")}, distributed ₦${(res.distributedKobo / 100).toLocaleString("en-NG")} to ${res.lines.length} members, unallocated ₦${(res.unallocatedKobo / 100).toLocaleString("en-NG")}.` };
}

async function advance(form: FormData, to: "approved" | "funded" | "void") {
  const s = await requirePermission("admin:rewards:write");
  const p = z.object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(form));
  if (!p.success) return;
  await advanceRun(p.data.id, to, actorOf(s), p.data.reason);
  revalidatePath("/admin/rewards");
}
export async function approveRunAction(form: FormData) { await advance(form, "approved"); }
export async function fundRunAction(form: FormData) { await advance(form, "funded"); }
export async function voidRunAction(form: FormData) { await advance(form, "void"); }

/* ------------------------------ campaigns --------------------------------- */

export async function saveCampaignAction(_: AdminState, form: FormData): Promise<AdminState> {
  const s = await requirePermission("admin:campaigns");
  const p = z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Slug: 2–40 lowercase letters, numbers or hyphens"), name: z.string().trim().min(3).max(80), description: z.string().trim().max(300).optional() }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message };
  try {
    await query(`INSERT INTO campaigns(slug, name, description) VALUES ($1,$2,$3)`, [p.data.slug, p.data.name, p.data.description || null]);
  } catch { return { error: "A campaign with that slug already exists." }; }
  await audit({ actorId: s.sub, actorEmail: s.email, action: "CAMPAIGN_CREATED", entity: "campaign", entityId: p.data.slug });
  revalidatePath("/admin/campaigns");
  return { ok: true };
}

export async function toggleCampaignAction(form: FormData) {
  const s = await requirePermission("admin:campaigns");
  const slug = String(form.get("slug") ?? "");
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return;
  await query(`UPDATE campaigns SET active = NOT active WHERE slug = $1`, [slug]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "CAMPAIGN_TOGGLED", entity: "campaign", entityId: slug });
  revalidatePath("/admin/campaigns");
}

export async function savePromoAction(_: AdminState, form: FormData): Promise<AdminState> {
  const s = await requirePermission("admin:campaigns");
  const p = z.object({
    id: z.string().uuid().optional().or(z.literal("")),
    kind: z.enum(["whatsapp", "social", "description", "email"]),
    title: z.string().trim().min(3).max(100),
    body: z.string().trim().min(10).max(2000),
    campaign: z.string().optional(),
    published: z.string().optional(),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const hit = promoViolation(`${p.data.title} ${p.data.body}`);
  if (hit) return { error: `“${hit}” could be read as a financial promise. Please rephrase — approved disclaimers such as “not an investment” are fine.` };
  if (!p.data.body.includes("{link}")) return { error: "Include {link} where the member's referral link should appear." };
  const campaign = p.data.campaign || null;
  if (p.data.id) {
    await query(`UPDATE promo_materials SET kind=$2, title=$3, body=$4, campaign_slug=$5, published=$6, updated_at=now() WHERE id=$1`, [p.data.id, p.data.kind, p.data.title, p.data.body, campaign, p.data.published === "on"]);
  } else {
    await query(`INSERT INTO promo_materials(kind, title, body, campaign_slug, published, created_by) VALUES ($1,$2,$3,$4,$5,$6)`, [p.data.kind, p.data.title, p.data.body, campaign, p.data.published === "on", s.sub]);
  }
  await audit({ actorId: s.sub, actorEmail: s.email, action: p.data.id ? "PROMO_UPDATED" : "PROMO_CREATED", entity: "promo_material", entityId: p.data.id || undefined, metadata: { published: p.data.published === "on" } });
  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard/promote");
  return { ok: true };
}

export async function togglePromoAction(form: FormData) {
  const s = await requirePermission("admin:campaigns");
  const parsed = z.string().uuid().safeParse(form.get("id"));
  if (!parsed.success) return;
  const id = parsed.data;
  await query(`UPDATE promo_materials SET published = NOT published, updated_at = now() WHERE id = $1`, [id]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "PROMO_TOGGLED", entity: "promo_material", entityId: id });
  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard/promote");
}
