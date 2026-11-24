"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query, one } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission, clientIp } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export interface ActionState { ok?: boolean; error?: string }

const prefs = z.object({ optIn: z.string().optional(), alias: z.string().trim().max(30).optional().default("") });

export async function updateLeaderboardPrefs(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requirePermission("member:dashboard");
  const p = prefs.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Please check your display name." };
  const alias = p.data.alias.replace(/[^\p{L}\p{N} .'-]/gu, "").trim() || null;
  await query(`UPDATE users SET leaderboard_opt_in = $2, leaderboard_alias = $3 WHERE id = $1`, [s.sub, p.data.optIn === "on", alias]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "LEADERBOARD_PREFS_UPDATED", metadata: { optIn: p.data.optIn === "on", alias: !!alias } });
  revalidatePath("/dashboard/referrals");
  return { ok: true };
}

export async function submitAppeal(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requirePermission("member:dashboard");
  if (!rateLimit(`appeal:${s.sub}`, 10, 24 * 60 * 60_000).ok) return { error: "Appeal limit reached for today." };
  const p = z.object({ referralId: z.string().uuid(), reason: z.string().trim().min(15, "Please explain in a sentence or two.").max(1000) }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const r = await one<{ status: string }>(`SELECT status FROM referrals WHERE id = $1 AND referrer_id = $2`, [p.data.referralId, s.sub]);
  if (!r) return { error: "Referral not found." };
  if (r.status !== "rejected") return { error: "Only rejected referrals can be appealed." };
  try {
    await query(`INSERT INTO referral_appeals(referral_id, user_id, reason) VALUES ($1,$2,$3)`, [p.data.referralId, s.sub, p.data.reason]);
  } catch {
    return { error: "This referral has already been appealed." };
  }
  await audit({ actorId: s.sub, actorEmail: s.email, action: "REFERRAL_APPEAL_SUBMITTED", entity: "referral", entityId: p.data.referralId, ip: await clientIp() });
  revalidatePath("/dashboard/referrals");
  return { ok: true };
}
