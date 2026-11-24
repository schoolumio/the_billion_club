import "server-only";
import { query, one } from "@/lib/db";

const n = (v: unknown) => Number(v ?? 0);

export async function waitlistMetrics() {
  const m = await one<Record<string, string>>(`
    SELECT count(*) total,
           count(*) FILTER (WHERE email_verified_at IS NOT NULL) verified,
           count(*) FILTER (WHERE created_at >= (now() AT TIME ZONE 'Africa/Lagos')::date) today,
           count(*) FILTER (WHERE created_at > now() - interval '7 days') d7,
           count(*) FILTER (WHERE created_at BETWEEN now() - interval '14 days' AND now() - interval '7 days') prev7,
           count(*) FILTER (WHERE created_at > now() - interval '30 days') d30,
           count(*) FILTER (WHERE created_at BETWEEN now() - interval '60 days' AND now() - interval '30 days') prev30,
           count(*) FILTER (WHERE referred_by IS NOT NULL) referred,
           count(*) FILTER (WHERE referred_by IS NULL) organic,
           count(*) FILTER (WHERE status = 'suspended') suspended,
           count(*) FILTER (WHERE is_demo) demo
    FROM users WHERE role = 'member'`);
  const r = await one<Record<string, string>>(`
    SELECT count(*) total, count(*) FILTER (WHERE status='verified') verified, count(*) FILTER (WHERE status='pending') pending,
           count(*) FILTER (WHERE status='under_review') review, count(*) FILTER (WHERE status='rejected') rejected,
           count(DISTINCT referrer_id) FILTER (WHERE status='verified') active_referrers,
           (SELECT count(*) FROM referral_appeals WHERE status='open') appeals
    FROM referrals`);
  const clicks = await one<{ c: string }>(`SELECT COALESCE(sum(count),0) c FROM referral_daily_activity WHERE kind='click'`);
  const alerts = await one<{ c: string }>(`SELECT count(*) c FROM fraud_alerts WHERE status='open' AND rule LIKE 'REFERRAL%'`);
  const daily = await query<{ d: Date; total: string; referred: string }>(`
    SELECT g::date d, count(u.id) total, count(u.id) FILTER (WHERE u.referred_by IS NOT NULL) referred
    FROM generate_series(current_date - 29, current_date, interval '1 day') g
    LEFT JOIN users u ON u.role = 'member' AND u.created_at::date = g::date
    GROUP BY g ORDER BY g`);
  const states = await query<{ state: string; n: string; verified: string }>(`
    SELECT COALESCE(state,'Unknown') state, count(*) n, count(*) FILTER (WHERE email_verified_at IS NOT NULL) verified
    FROM users WHERE role='member' GROUP BY 1 ORDER BY 2 DESC LIMIT 12`);
  const top = await query<{ full_name: string; referral_code: string; verified: number; pending: number; under_review: number; rejected: number; clicks: number; registrations: number; is_demo: boolean }>(`
    SELECT u.full_name, u.referral_code, s.verified, s.pending, s.under_review, s.rejected, s.clicks, s.registrations, u.is_demo
    FROM referral_stats s JOIN users u ON u.id = s.user_id WHERE s.verified > 0 ORDER BY s.verified DESC LIMIT 10`);
  const stamp = await one<{ t: Date }>(`SELECT max(updated_at) t FROM referral_stats`);
  return {
    total: n(m?.total), verified: n(m?.verified), today: n(m?.today), d7: n(m?.d7), prev7: n(m?.prev7), d30: n(m?.d30), prev30: n(m?.prev30),
    referred: n(m?.referred), organic: n(m?.organic), suspended: n(m?.suspended), demo: n(m?.demo),
    refTotal: n(r?.total), refVerified: n(r?.verified), refPending: n(r?.pending), refReview: n(r?.review), refRejected: n(r?.rejected), activeReferrers: n(r?.active_referrers), appeals: n(r?.appeals),
    clicks: n(clicks?.c), alerts: n(alerts?.c),
    daily: daily.map((d) => ({ date: new Date(d.d), total: n(d.total), referred: n(d.referred) })),
    states: states.map((s) => ({ state: s.state, n: n(s.n), verified: n(s.verified) })),
    top, statsUpdatedAt: stamp?.t ?? null,
  };
}

export const reviewQueue = () => query<{ id: string; status: string; risk_score: number; risk_flags: string[]; created_at: Date; code_used: string; source: string; referrer_name: string; referrer_code: string; referred_name: string; referred_email: string; email_verified_at: Date | null; is_demo: boolean }>(`
  SELECT r.id, r.status, r.risk_score, r.risk_flags, r.created_at, r.code_used, r.source, ru.full_name referrer_name, ru.referral_code referrer_code,
         fu.full_name referred_name, fu.email referred_email, fu.email_verified_at, r.is_demo
  FROM referrals r JOIN users ru ON ru.id = r.referrer_id JOIN users fu ON fu.id = r.referred_id
  WHERE r.status = 'under_review' ORDER BY r.risk_score DESC, r.created_at LIMIT 100`);

export const openAppeals = () => query<{ id: string; reason: string; created_at: Date; referral_id: string; decision_reason: string | null; referrer_name: string; referred_name: string; risk_flags: string[] }>(`
  SELECT a.id, a.reason, a.created_at, a.referral_id, r.decision_reason, ru.full_name referrer_name, fu.full_name referred_name, r.risk_flags
  FROM referral_appeals a JOIN referrals r ON r.id = a.referral_id JOIN users ru ON ru.id = r.referrer_id JOIN users fu ON fu.id = r.referred_id
  WHERE a.status = 'open' ORDER BY a.created_at`);

export async function referralLookup(q: string) {
  const term = q.trim();
  const user = await one<{ id: string; full_name: string; email: string; referral_code: string; referred_by: string | null; created_at: Date; email_verified_at: Date | null; status: string }>(
    `SELECT id, full_name, email, referral_code, referred_by, created_at, email_verified_at, status FROM users WHERE referral_code = upper($1) OR email_normalized = lower($1) OR member_no = $1 LIMIT 1`, [term]);
  if (!user) return null;
  const incoming = await one<{ id: string; status: string; code_used: string; source: string; campaign_slug: string | null; risk_score: number; risk_flags: string[]; created_at: Date; referrer_name: string }>(
    `SELECT r.id, r.status, r.code_used, r.source, r.campaign_slug, r.risk_score, r.risk_flags, r.created_at, u.full_name referrer_name FROM referrals r JOIN users u ON u.id = r.referrer_id WHERE r.referred_id = $1`, [user.id]);
  const events = incoming ? await query<{ from_status: string | null; to_status: string; reason: string | null; created_at: Date; actor: string | null }>(
    `SELECT e.from_status, e.to_status, e.reason, e.created_at, u.email actor FROM referral_events e LEFT JOIN users u ON u.id = e.actor_id WHERE e.referral_id = $1 ORDER BY e.id`, [incoming.id]) : [];
  const outgoing = await one<Record<string, string>>(`SELECT count(*) total, count(*) FILTER (WHERE status='verified') verified, count(*) FILTER (WHERE status='rejected') rejected FROM referrals WHERE referrer_id = $1`, [user.id]);
  return { user, incoming, events, outgoing: { total: n(outgoing?.total), verified: n(outgoing?.verified), rejected: n(outgoing?.rejected) } };
}

export const configVersions = () => query<{ id: number; change_note: string; created_at: Date; email: string | null; config: Record<string, unknown> }>(
  `SELECT v.id, v.change_note, v.created_at, u.email, v.config FROM referral_config_versions v LEFT JOIN users u ON u.id = v.created_by ORDER BY v.id DESC LIMIT 20`);

export const rewardRuns = () => query<{ id: string; run_date: Date; status: string; config_version: number; pool_kobo: string; pool_source: string; allocation_kobo: string; denominator: number; eligible_referrals: number; distributed_kobo: string; unallocated_kobo: string; recipients: number; inputs_hash: string; notes: string | null; created_at: Date }>(
  `SELECT * FROM referral_reward_runs ORDER BY created_at DESC LIMIT 30`);
