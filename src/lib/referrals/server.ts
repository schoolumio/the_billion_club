import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { query, one } from "@/lib/db";
import { audit } from "@/lib/audit";
import { DEFAULT_CONFIG, liveRunBlocker, type ReferralConfig } from "./config";
import { calculateReferralRewards, canonicalInputs } from "./calc";
import { REFRESH_STATS_SQL } from "./sql";

/* --------------------------------- hashing -------------------------------- */

/** One-way, salted hash for network/device signals: we compare, never store raw. */
export function signalHash(v: string | null | undefined): string | null {
  if (!v) return null;
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? "tbc"}:${v}`).digest("hex").slice(0, 32);
}
const tokenHash = (t: string) => createHash("sha256").update(t).digest("hex");

/* --------------------------------- config --------------------------------- */

export const getConfig = cache(async (): Promise<{ version: number; config: ReferralConfig; createdAt: Date | null; note: string }> => {
  const row = await one<{ id: number; config: Partial<ReferralConfig>; created_at: Date; change_note: string }>(
    `SELECT id, config, created_at, change_note FROM referral_config_versions ORDER BY id DESC LIMIT 1`);
  if (!row) return { version: 0, config: { ...DEFAULT_CONFIG, baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_CONFIG.baseUrl }, createdAt: null, note: "Defaults (not yet saved)" };
  return { version: row.id, config: { ...DEFAULT_CONFIG, ...row.config }, createdAt: row.created_at, note: row.change_note };
});

export function validateConfig(c: ReferralConfig): string | null {
  if (c.allocationBps < 0 || c.allocationBps > 1000) return "Allocation must be between 0% and 10%.";
  if (c.perMemberCapBps < 0 || c.perMemberCapBps > 10_000) return "Cap must be between 0% and 100% of the allocation.";
  if (c.denominator === "paying_members_on_day" && c.eligibility !== "verified_and_paid_on_day")
    return "When the denominator is members who paid that day, only referrals who paid that day can count (otherwise shares could exceed 100%).";
  if (c.denominator === "all_verified_members" && c.eligibility !== "verified")
    return "When the denominator is all verified members, the numerator must be verified referrals.";
  if (!/^\d{2}:\d{2}$/.test(c.cutoffTime)) return "Cut-off time must be HH:MM.";
  try { new URL(c.baseUrl); } catch { return "Referral domain must be a full URL, e.g. https://thebillionairecircle.club"; }
  if (c.rewardsState === "active" && (!c.fundingConfirmed || !c.legalApprovalRef.trim()))
    return "Rewards can only be activated with confirmed funding and a recorded legal approval reference.";
  const mins = c.levels.map((l) => l.min);
  if (mins.some((m, i) => i > 0 && m <= mins[i - 1])) return "Achievement thresholds must increase.";
  return null;
}

export async function saveConfig(next: ReferralConfig, note: string, actor: { id: string; email: string }) {
  const err = validateConfig(next);
  if (err) return { error: err };
  const prev = await getConfig();
  const row = await one<{ id: number }>(`INSERT INTO referral_config_versions(config, change_note, created_by) VALUES ($1,$2,$3) RETURNING id`, [JSON.stringify(next), note, actor.id]);
  const changed = Object.keys(next).filter((k) => JSON.stringify(next[k as keyof ReferralConfig]) !== JSON.stringify(prev.config[k as keyof ReferralConfig]));
  await audit({ actorId: actor.id, actorEmail: actor.email, action: "REFERRAL_CONFIG_CHANGED", entity: "referral_config", entityId: String(row?.id), metadata: { changed, note } });
  return { version: row?.id };
}

/* ------------------------------ verification ------------------------------ */

export async function createEmailToken(userId: string): Promise<string> {
  const raw = randomBytes(24).toString("base64url");
  await query(`INSERT INTO verification_tokens(user_id, kind, token_hash, expires_at) VALUES ($1,'email',$2, now() + interval '48 hours')`, [userId, tokenHash(raw)]);
  return raw;
}

/** Marks the email verified and moves the member's own incoming referral from pending → verified. */
export async function consumeEmailToken(raw: string): Promise<{ ok: boolean; userId?: string; reason?: string }> {
  const t = await one<{ id: string; user_id: string; expires_at: Date; used_at: Date | null }>(`SELECT id, user_id, expires_at, used_at FROM verification_tokens WHERE token_hash = $1 AND kind = 'email'`, [tokenHash(raw)]);
  if (!t) return { ok: false, reason: "This verification link is not valid." };
  if (t.used_at) return { ok: true, userId: t.user_id };
  if (new Date(t.expires_at) < new Date()) return { ok: false, reason: "This verification link has expired. Request a new one from your dashboard." };
  await query(`UPDATE verification_tokens SET used_at = now() WHERE id = $1`, [t.id]);
  await query(`UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1`, [t.user_id]);
  const cfg = (await getConfig()).config;
  if (cfg.verification === "email") await promoteIfPending(t.user_id);
  await audit({ actorId: t.user_id, action: "EMAIL_VERIFIED", entity: "user", entityId: t.user_id });
  return { ok: true, userId: t.user_id };
}

async function promoteIfPending(referredId: string) {
  const r = await one<{ id: string }>(`UPDATE referrals SET status = 'verified', verified_at = now() WHERE referred_id = $1 AND status = 'pending' RETURNING id`, [referredId]);
  if (r) await query(`INSERT INTO referral_events(referral_id, from_status, to_status, reason) VALUES ($1,'pending','verified','Referred member verified their email')`, [r.id]);
}

/* -------------------------------- activity -------------------------------- */

export async function recordActivity(code: string, kind: "click" | "share", channel: string) {
  const ch = channel.replace(/[^a-z0-9_-]/gi, "").slice(0, 24) || "unknown";
  await query(
    `INSERT INTO referral_daily_activity(referrer_id, day, channel, kind, count)
     SELECT id, (now() AT TIME ZONE 'Africa/Lagos')::date, $2, $3, 1 FROM users WHERE referral_code = $1
     ON CONFLICT (referrer_id, day, channel, kind) DO UPDATE SET count = referral_daily_activity.count + 1`, [code, ch, kind]);
}

/* ---------------------------- referral decisions -------------------------- */

export async function decideReferral(id: string, to: "verified" | "rejected", reason: string, actor: { id: string; email: string }) {
  const r = await one<{ status: string; referred_id: string; email_verified_at: Date | null }>(
    `SELECT r.status, r.referred_id, u.email_verified_at FROM referrals r JOIN users u ON u.id = r.referred_id WHERE r.id = $1`, [id]);
  if (!r) return { error: "Referral not found" };
  if (to === "verified" && !r.email_verified_at) return { error: "The referred member has not verified their email yet." };
  await query(`UPDATE referrals SET status = $2::referral_status, decision_reason = $3, decided_by = $4, decided_at = now(), verified_at = CASE WHEN $2::referral_status = 'verified' THEN now() ELSE verified_at END WHERE id = $1`, [id, to, reason, actor.id]);
  await query(`INSERT INTO referral_events(referral_id, from_status, to_status, reason, actor_id) VALUES ($1,$2::referral_status,$3::referral_status,$4,$5)`, [id, r.status, to, reason, actor.id]);
  await audit({ actorId: actor.id, actorEmail: actor.email, action: to === "verified" ? "REFERRAL_APPROVED" : "REFERRAL_REJECTED", entity: "referral", entityId: id, metadata: { reason, from: r.status } });
  return { ok: true };
}

/* --------------------------- aggregation (job) ---------------------------- */

/**
 * Recomputes per-member aggregates and ranks in a handful of set-based SQL
 * statements. Run on a schedule (cron) and on demand by admins. At 10M scale,
 * move to incremental updates keyed on referrals.updated_at (see docs).
 */
export async function refreshReferralStats() {
  const started = Date.now();
  for (const sql of REFRESH_STATS_SQL) await query(sql);
  return { ms: Date.now() - started };
}

/** Public, verified-only, real-only counter (cheap: reads the latest snapshot). */
export async function waitlistProgress() {
  const s = await one<{ verified_members: number; taken_at: Date }>(`SELECT verified_members, taken_at FROM referral_snapshots ORDER BY id DESC LIMIT 1`);
  if (s) return { verified: Number(s.verified_members), asOf: s.taken_at };
  const live = await one<{ n: string }>(`SELECT count(*) n FROM users WHERE role='member' AND status='active' AND NOT is_demo AND email_verified_at IS NOT NULL`);
  return { verified: Number(live?.n ?? 0), asOf: new Date() };
}

/* ------------------------------ reward engine ----------------------------- */

interface RunOptions { runDate: string; mode: "simulation" | "live"; actor: { id: string | null; email: string }; note?: string }

/**
 * Daily calculation. LIVE runs: only real (non-demo) contributions that have
 * actually been received/reconciled for that date, and only when the config
 * passes liveRunBlocker(). SIMULATION runs may use demonstration data and are
 * stored with status 'simulation' — never payable.
 */
export async function runReferralRewards(o: RunOptions) {
  const { version, config } = await getConfig();
  if (!version) return { error: "Save the programme configuration before running calculations." };
  if (o.mode === "live") {
    const blocker = liveRunBlocker(config);
    if (blocker) return { error: `Live run refused: ${blocker}` };
  }
  const live = o.mode === "live";
  const contribFilter = live
    ? (config.poolBasis === "net_received" ? `c.status = 'reconciled' AND NOT c.is_demo` : `c.status IN ('reconciled','reversed') AND NOT c.is_demo`)
    : `c.status <> 'failed'`;

  const pool = await one<{ kobo: string; payers: string }>(
    `SELECT COALESCE(sum(c.amount_kobo),0) kobo, count(DISTINCT c.user_id) payers FROM contributions c WHERE c.contribution_date = $1 AND ${contribFilter}`, [o.runDate]);
  const poolKobo = Number(pool?.kobo ?? 0);

  let denominator: number;
  let rows: { user_id: string; n: string }[];
  const referrerOk = `ru.status = 'active' AND ru.role = 'member' AND ru.email_verified_at IS NOT NULL`;
  if (config.denominator === "paying_members_on_day") {
    denominator = Number(pool?.payers ?? 0);
    rows = await query(
      `SELECT r.referrer_id user_id, count(DISTINCT r.referred_id) n
       FROM referrals r JOIN users ru ON ru.id = r.referrer_id JOIN users fu ON fu.id = r.referred_id
       WHERE r.status = 'verified' AND fu.status = 'active' AND ${referrerOk}
         AND EXISTS (SELECT 1 FROM contributions c WHERE c.user_id = r.referred_id AND c.contribution_date = $1 AND ${contribFilter})
       GROUP BY r.referrer_id`, [o.runDate]);
  } else {
    const d = await one<{ n: string }>(`SELECT count(*) n FROM users WHERE role='member' AND status='active' AND email_verified_at IS NOT NULL ${live ? "AND NOT is_demo" : ""}`);
    denominator = Number(d?.n ?? 0);
    rows = await query(
      `SELECT r.referrer_id user_id, count(*) n FROM referrals r JOIN users ru ON ru.id = r.referrer_id JOIN users fu ON fu.id = r.referred_id
       WHERE r.status = 'verified' AND fu.status = 'active' AND fu.email_verified_at IS NOT NULL AND ${referrerOk} ${live ? "AND NOT fu.is_demo" : ""}
       GROUP BY r.referrer_id`);
  }
  const members = rows.map((r) => ({ userId: r.user_id, eligibleReferrals: Number(r.n) }));
  const input = { poolKobo, allocationBps: config.allocationBps, denominator, members, perMemberCapBps: config.perMemberCapBps };
  const result = calculateReferralRewards(input);
  const hash = createHash("sha256").update(canonicalInputs({ ...input, runDate: o.runDate, configVersion: version })).digest("hex");

  const run = await one<{ id: string }>(
    `INSERT INTO referral_reward_runs(run_date, status, config_version, pool_kobo, pool_source, allocation_kobo, denominator, eligible_referrals, distributed_kobo, unallocated_kobo, recipients, inputs_hash, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o.runDate, live ? "calculated" : "simulation", version, poolKobo, live ? `contributions:${config.poolBasis}` : "contributions:simulated (demo data)",
     result.allocationKobo, denominator, result.eligibleReferrals, result.distributedKobo, result.unallocatedKobo, result.lines.length, hash, o.note ?? null, o.actor.id]);
  // Batched insert of lines
  for (let i = 0; i < result.lines.length; i += 500) {
    const chunk = result.lines.slice(i, i + 500);
    const params: unknown[] = [];
    const values = chunk.map((l, k) => {
      params.push(run!.id, l.userId, l.eligibleReferrals, l.sharePpm, l.amountKobo);
      const b = k * 5;
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},'estimated')`;
    });
    await query(`INSERT INTO referral_rewards(run_id, user_id, eligible_referrals, share_ppm, amount_kobo, status) VALUES ${values.join(",")}`, params);
  }
  await audit({ actorId: o.actor.id, actorEmail: o.actor.email, action: live ? "REFERRAL_RUN_CALCULATED" : "REFERRAL_RUN_SIMULATED", entity: "referral_reward_run", entityId: run!.id,
    metadata: { runDate: o.runDate, poolKobo, allocationKobo: result.allocationKobo, distributedKobo: result.distributedKobo, unallocatedKobo: result.unallocatedKobo, hash } });
  return { ok: true, runId: run!.id, result };
}

/** Status transitions for a live run: calculated → approved → funded → paid. Payment itself is a separate, gated module. */
export async function advanceRun(runId: string, to: "approved" | "funded" | "void", actor: { id: string; email: string }, reason: string) {
  const run = await one<{ status: string }>(`SELECT status FROM referral_reward_runs WHERE id = $1`, [runId]);
  if (!run) return { error: "Run not found" };
  const allowed: Record<string, string[]> = { calculated: ["approved", "void"], approved: ["funded", "void"], funded: ["void"] };
  if (!allowed[run.status]?.includes(to)) return { error: `Cannot move a ${run.status} run to ${to}.` };
  if (to === "funded") {
    const { config } = await getConfig();
    const b = liveRunBlocker(config);
    if (b) return { error: `Cannot mark funded: ${b}` };
  }
  await query(`UPDATE referral_reward_runs SET status = $2::run_status, approved_by = CASE WHEN $2::run_status = 'approved' THEN $3::uuid ELSE approved_by END, approved_at = CASE WHEN $2::run_status = 'approved' THEN now() ELSE approved_at END, notes = concat_ws(' | ', notes, $4::text) WHERE id = $1`, [runId, to, actor.id, reason]);
  const rewardStatus = to === "void" ? "reversed" : to;
  await query(`UPDATE referral_rewards SET status = $2::reward_status, adjustment_reason = CASE WHEN $2::reward_status = 'reversed' THEN $3 ELSE adjustment_reason END WHERE run_id = $1`, [runId, rewardStatus, reason]);
  await audit({ actorId: actor.id, actorEmail: actor.email, action: `REFERRAL_RUN_${to.toUpperCase()}`, entity: "referral_reward_run", entityId: runId, metadata: { reason } });
  return { ok: true };
}

/* ------------------------------ member view ------------------------------- */

export async function memberReferralView(userId: string) {
  const u = await one<{ full_name: string; referral_code: string; email: string; email_verified_at: Date | null; leaderboard_opt_in: boolean; leaderboard_alias: string | null; status: string; is_demo: boolean }>(
    `SELECT full_name, referral_code, email, email_verified_at, leaderboard_opt_in, leaderboard_alias, status, is_demo FROM users WHERE id = $1`, [userId]);
  if (!u) return null;
  const counts = await one<Record<string, string>>(
    `SELECT count(*) registrations,
            count(*) FILTER (WHERE status='verified') verified,
            count(*) FILTER (WHERE status='pending') pending,
            count(*) FILTER (WHERE status='under_review') under_review,
            count(*) FILTER (WHERE status='rejected') rejected
     FROM referrals WHERE referrer_id = $1`, [userId]);
  const stats = await one<{ clicks: number; shares: number; rank: number | null; updated_at: Date }>(`SELECT clicks, shares, rank, updated_at FROM referral_stats WHERE user_id = $1`, [userId]);
  const ranked = await one<{ n: string }>(`SELECT count(*) n FROM referral_stats WHERE rank IS NOT NULL`);
  const snapshot = await one<{ verified_members: number }>(`SELECT verified_members FROM referral_snapshots ORDER BY id DESC LIMIT 1`);
  const community = await one<{ n: string }>(`SELECT count(*) n FROM users WHERE role='member' AND status='active' AND email_verified_at IS NOT NULL`);
  const recent = await query<{ id: string; full_name: string; status: string; created_at: Date; decision_reason: string | null; risk_flags: string[]; source: string; appeal_status: string | null }>(
    `SELECT r.id, u.full_name, r.status, r.created_at, r.decision_reason, r.risk_flags, r.source, a.status appeal_status
     FROM referrals r JOIN users u ON u.id = r.referred_id LEFT JOIN referral_appeals a ON a.referral_id = r.id
     WHERE r.referrer_id = $1 ORDER BY r.created_at DESC LIMIT 25`, [userId]);
  const daily = await query<{ d: Date; n: string }>(
    `SELECT g::date d, count(r.id) n FROM generate_series(current_date - 29, current_date, interval '1 day') g
     LEFT JOIN referrals r ON r.referrer_id = $1 AND r.status = 'verified' AND r.verified_at::date = g::date
     GROUP BY g ORDER BY g`, [userId]);
  const channels = await query<{ channel: string; kind: string; n: string }>(
    `SELECT channel, kind, sum(count) n FROM referral_daily_activity WHERE referrer_id = $1 GROUP BY channel, kind ORDER BY n DESC`, [userId]);
  const rewards = await query<{ run_date: Date; eligible_referrals: number; share_ppm: string; amount_kobo: string; status: string; adjustment_reason: string | null }>(
    `SELECT rr.run_date, w.eligible_referrals, w.share_ppm, w.amount_kobo, w.status, w.adjustment_reason
     FROM referral_rewards w JOIN referral_reward_runs rr ON rr.id = w.run_id
     WHERE w.user_id = $1 AND rr.status <> 'simulation' ORDER BY rr.run_date DESC LIMIT 30`, [userId]);
  const todayPool = await one<{ kobo: string; payers: string }>(
    `SELECT COALESCE(sum(amount_kobo),0) kobo, count(DISTINCT user_id) payers FROM contributions WHERE contribution_date = current_date AND status = 'reconciled' AND NOT is_demo`);
  const eligibleToday = await one<{ n: string }>(
    `SELECT count(DISTINCT r.referred_id) n FROM referrals r
     WHERE r.referrer_id = $1 AND r.status = 'verified'
       AND EXISTS (SELECT 1 FROM contributions c WHERE c.user_id = r.referred_id AND c.contribution_date = current_date AND c.status = 'reconciled' AND NOT c.is_demo)`, [userId]);
  return {
    eligibleToday: Number(eligibleToday?.n ?? 0),
    user: u,
    counts: Object.fromEntries(Object.entries(counts ?? {}).map(([k, v]) => [k, Number(v)])) as Record<"registrations" | "verified" | "pending" | "under_review" | "rejected", number>,
    stats,
    rankedMembers: Number(ranked?.n ?? 0),
    publicVerified: snapshot?.verified_members ?? 0,
    communityVerified: Number(community?.n ?? 0),
    recent,
    daily: daily.map((d) => ({ date: new Date(d.d), value: Number(d.n) })),
    channels: channels.map((c) => ({ channel: c.channel, kind: c.kind, n: Number(c.n) })),
    rewards,
    todayPoolKobo: Number(todayPool?.kobo ?? 0),
    todayPayers: Number(todayPool?.payers ?? 0),
  };
}

/* ------------------------------ leaderboard ------------------------------- */

export type BoardKind = "all" | "week" | "month";

export async function leaderboard(kind: BoardKind, limit: number) {
  const col = kind === "week" ? "s.verified_7d" : kind === "month" ? "s.verified_30d" : "s.verified";
  const rows = await query<{ user_id: string; n: number; full_name: string; leaderboard_opt_in: boolean; leaderboard_alias: string | null; referral_code: string; state: string | null; is_demo: boolean }>(
    `SELECT s.user_id, ${col} n, u.full_name, u.leaderboard_opt_in, u.leaderboard_alias, u.referral_code, u.state, u.is_demo
     FROM referral_stats s JOIN users u ON u.id = s.user_id
     WHERE ${col} > 0 AND u.status = 'active'
     ORDER BY ${col} DESC, s.user_id LIMIT $1`, [limit]);
  const updated = await one<{ t: Date }>(`SELECT max(updated_at) t FROM referral_stats`);
  return { rows, updatedAt: updated?.t ?? null };
}
