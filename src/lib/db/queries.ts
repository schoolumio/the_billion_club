import "server-only";
import { query, one, koboToNaira } from "./index";

/* ------------------------------- member ---------------------------------- */

export interface MemberProfile {
  id: string; member_no: string; email: string; full_name: string; phone: string | null; state: string | null;
  role: string; verification: "unverified" | "pending" | "verified" | "rejected"; status: string; is_demo: boolean;
  created_at: Date; last_login_at: Date | null;
}

export const getMember = (id: string) => one<MemberProfile>(`SELECT * FROM users WHERE id = $1`, [id]);

export async function memberSummary(id: string) {
  const r = await one<{ total: string; n: string; last30: string; first: Date | null; last: Date | null }>(
    `SELECT COALESCE(sum(amount_kobo) FILTER (WHERE status <> 'failed'),0) total,
            count(*) FILTER (WHERE status <> 'failed') n,
            count(DISTINCT contribution_date) FILTER (WHERE contribution_date > current_date - 30 AND status <> 'failed') last30,
            min(contribution_date) first, max(contribution_date) last
     FROM contributions WHERE user_id = $1`, [id]);
  const streak = await one<{ streak: number }>(
    `WITH d AS (SELECT DISTINCT contribution_date FROM contributions WHERE user_id = $1 AND status <> 'failed'),
          g AS (SELECT contribution_date, contribution_date - (row_number() OVER (ORDER BY contribution_date))::int grp FROM d)
     SELECT COALESCE(max(cnt),0)::int streak FROM (SELECT grp, count(*) cnt, max(contribution_date) mx FROM g GROUP BY grp) x
     WHERE mx >= current_date - 1`, [id]);
  return {
    total: koboToNaira(r?.total), count: Number(r?.n ?? 0), activeDays30: Number(r?.last30 ?? 0),
    first: r?.first ?? null, last: r?.last ?? null, streak: streak?.streak ?? 0,
  };
}

export async function memberDaily(id: string, days = 30) {
  const rows = await query<{ d: Date; amt: string }>(
    `SELECT g::date d, COALESCE(sum(c.amount_kobo) FILTER (WHERE c.status <> 'failed'),0) amt
     FROM generate_series(current_date - ($2::int - 1), current_date, interval '1 day') g
     LEFT JOIN contributions c ON c.contribution_date = g::date AND c.user_id = $1
     GROUP BY g ORDER BY g`, [id, days]);
  return rows.map((r) => ({ date: new Date(r.d), value: koboToNaira(r.amt) }));
}

export interface Txn { id: string; amount_kobo: string; contribution_date: Date; channel: string; reference: string; status: string; is_demo: boolean }
export async function memberTransactions(id: string, page = 1, size = 15) {
  const rows = await query<Txn>(`SELECT id, amount_kobo, contribution_date, channel, reference, status, is_demo FROM contributions WHERE user_id = $1 ORDER BY contribution_date DESC, created_at DESC LIMIT $2 OFFSET $3`, [id, size, (page - 1) * size]);
  const total = await one<{ n: string }>(`SELECT count(*) n FROM contributions WHERE user_id = $1`, [id]);
  return { rows, total: Number(total?.n ?? 0), page, size };
}

export const announcements = (limit = 10) =>
  query<{ id: string; title: string; body: string; category: string; published_at: Date; is_demo: boolean }>(`SELECT * FROM announcements ORDER BY published_at DESC LIMIT $1`, [limit]);

export const opportunities = (kind?: string) =>
  query<{ id: string; kind: string; title: string; organisation: string; location: string; summary: string; closes_at: Date | null; is_demo: boolean }>(
    kind ? `SELECT * FROM opportunities WHERE kind = $1 ORDER BY created_at DESC` : `SELECT * FROM opportunities ORDER BY created_at DESC`, kind ? [kind] : []);

export const ventures = () =>
  query<{ id: string; name: string; sector: string; state: string; stage: string; capital_kobo: string; jobs_created: number; suppliers_engaged: number; is_demo: boolean; updated_at: Date }>(`SELECT * FROM ventures ORDER BY updated_at DESC`);

export interface Ticket { id: string; user_id: string; subject: string; category: string; body: string; status: string; priority: string; created_at: Date; updated_at: Date; full_name?: string; member_no?: string }
export const memberTickets = (id: string) => query<Ticket>(`SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`, [id]);

/* -------------------------------- admin ---------------------------------- */

export async function adminKpis() {
  const m = await one<Record<string, string>>(`
    SELECT count(*) FILTER (WHERE role = 'member') total,
           count(*) FILTER (WHERE role = 'member' AND verification = 'verified') verified,
           count(*) FILTER (WHERE role = 'member' AND verification = 'pending') pending,
           count(*) FILTER (WHERE role = 'member' AND status = 'suspended') suspended,
           count(*) FILTER (WHERE role = 'member' AND created_at > now() - interval '30 days') new30
    FROM users`);
  const active = await one<{ n: string }>(`SELECT count(DISTINCT user_id) n FROM contributions WHERE contribution_date > current_date - 7 AND status <> 'failed'`);
  const c = await one<Record<string, string>>(`
    SELECT COALESCE(sum(amount_kobo) FILTER (WHERE status <> 'failed'),0) total,
           COALESCE(sum(amount_kobo) FILTER (WHERE status <> 'failed' AND contribution_date >= date_trunc('month', current_date)),0) mtd,
           count(*) FILTER (WHERE status = 'failed') failed,
           count(*) FILTER (WHERE status = 'reconciled') reconciled,
           count(*) FILTER (WHERE status = 'simulated') unreconciled,
           count(*) n
    FROM contributions`);
  const risk = await one<Record<string, string>>(`
    SELECT (SELECT count(*) FROM fraud_alerts WHERE status = 'open') alerts,
           (SELECT count(*) FROM support_tickets WHERE status IN ('open','in_progress')) tickets,
           (SELECT count(*) FROM compliance_items WHERE status = 'complete') comp_done,
           (SELECT count(*) FROM compliance_items) comp_total`);
  return {
    members: Number(m?.total), verified: Number(m?.verified), pending: Number(m?.pending), suspended: Number(m?.suspended), new30: Number(m?.new30),
    active7: Number(active?.n),
    contribTotal: koboToNaira(c?.total), contribMtd: koboToNaira(c?.mtd), failed: Number(c?.failed), reconciled: Number(c?.reconciled), unreconciled: Number(c?.unreconciled), txns: Number(c?.n),
    alerts: Number(risk?.alerts), tickets: Number(risk?.tickets), compDone: Number(risk?.comp_done), compTotal: Number(risk?.comp_total),
  };
}

export async function dailyTotals(days = 30) {
  const rows = await query<{ d: Date; amt: string; members: string; failed: string }>(
    `SELECT g::date d, COALESCE(sum(c.amount_kobo) FILTER (WHERE c.status <> 'failed'),0) amt,
            count(DISTINCT c.user_id) FILTER (WHERE c.status <> 'failed') members,
            count(*) FILTER (WHERE c.status = 'failed') failed
     FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') g
     LEFT JOIN contributions c ON c.contribution_date = g::date
     GROUP BY g ORDER BY g`, [days]);
  return rows.map((r) => ({ date: new Date(r.d), value: koboToNaira(r.amt), members: Number(r.members), failed: Number(r.failed) }));
}

export async function reconciliation(days = 14) {
  return query<{ d: Date; reconciled: string; pending: string; failed: string; amount: string }>(
    `SELECT contribution_date d,
            count(*) FILTER (WHERE status = 'reconciled') reconciled,
            count(*) FILTER (WHERE status = 'simulated') pending,
            count(*) FILTER (WHERE status = 'failed') failed,
            COALESCE(sum(amount_kobo) FILTER (WHERE status <> 'failed'),0) amount
     FROM contributions WHERE contribution_date > current_date - $1::int
     GROUP BY contribution_date ORDER BY contribution_date DESC`, [days]);
}

export const membersByState = () => query<{ state: string; n: string }>(`SELECT COALESCE(state,'Unknown') state, count(*) n FROM users WHERE role='member' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`);

export async function listMembers({ q, verification, page = 1, size = 20 }: { q?: string; verification?: string; page?: number; size?: number }) {
  const where: string[] = ["u.role = 'member'"];
  const params: unknown[] = [];
  if (q) { params.push(`%${q}%`); where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.member_no ILIKE $${params.length})`); }
  if (verification && ["unverified", "pending", "verified", "rejected"].includes(verification)) { params.push(verification); where.push(`u.verification = $${params.length}`); }
  const w = where.join(" AND ");
  const total = await one<{ n: string }>(`SELECT count(*) n FROM users u WHERE ${w}`, params);
  params.push(size, (page - 1) * size);
  const rows = await query<MemberProfile & { contributed: string; last_contribution: Date | null }>(
    `SELECT u.*, COALESCE(sum(c.amount_kobo) FILTER (WHERE c.status <> 'failed'),0) contributed, max(c.contribution_date) last_contribution
     FROM users u LEFT JOIN contributions c ON c.user_id = u.id
     WHERE ${w} GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return { rows, total: Number(total?.n ?? 0), page, size };
}

export const complianceItems = () => query<{ id: number; area: string; requirement: string; authority: string; status: string; owner: string | null; updated_at: Date }>(`SELECT * FROM compliance_items ORDER BY id`);
export const fraudAlerts = () => query<{ id: string; rule: string; severity: string; description: string; status: string; created_at: Date; member_no: string | null; is_demo: boolean }>(
  `SELECT f.*, u.member_no FROM fraud_alerts f LEFT JOIN users u ON u.id = f.user_id ORDER BY CASE f.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, f.created_at DESC`);
export const auditLogs = (limit = 100) => query<{ id: string; actor_email: string | null; action: string; entity: string | null; entity_id: string | null; metadata: Record<string, unknown>; ip: string | null; created_at: Date }>(
  `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`, [limit]);
export const allTickets = () => query<Ticket>(`SELECT t.*, u.full_name, u.member_no FROM support_tickets t JOIN users u ON u.id = t.user_id ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, t.created_at DESC`);
