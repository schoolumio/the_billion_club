import { getSession, clientIp } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { query } from "@/lib/db";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const esc = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : v === null || v === undefined ? "" : Array.isArray(v) ? v.join("|") : String(v);
  // Neutralise spreadsheet formula injection and quote everything.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/**
 * Streams CSV in keyset-paginated pages so a 10M-row export never loads into memory.
 *   ?type=referrals          — all referral attributions (admin, auditor)
 *   ?type=run&id=<uuid>      — one reward run's lines (admin, auditor)
 */
export async function GET(req: Request) {
  const s = await getSession();
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const perm = type === "run" ? "admin:rewards" : "admin:waitlist";
  if (!s || !can(s.role, perm) || (type === "referrals" && s.role === "support")) return new Response("Forbidden", { status: 403 });

  let sql: string;
  let header: string[];
  let params: unknown[] = [];
  if (type === "referrals") {
    header = ["referral_id", "created_at", "status", "verified_at", "referrer_code", "referred_member_no", "source", "campaign", "risk_score", "risk_flags", "decision_reason", "is_demo"];
    sql = `SELECT r.id::text k, r.id, r.created_at, r.status, r.verified_at, ru.referral_code, fu.member_no, r.source, r.campaign_slug, r.risk_score, r.risk_flags, r.decision_reason, r.is_demo
           FROM referrals r JOIN users ru ON ru.id = r.referrer_id JOIN users fu ON fu.id = r.referred_id
           WHERE r.id::text > $1 ORDER BY r.id::text LIMIT 5000`;
  } else if (type === "run") {
    const id = url.searchParams.get("id") ?? "";
    if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Bad id", { status: 400 });
    header = ["run_id", "run_date", "run_status", "config_version", "inputs_hash", "member_no", "referral_code", "eligible_referrals", "share_ppm", "amount_kobo", "reward_status", "adjustment_reason"];
    sql = `SELECT w.id::text k, rr.id, rr.run_date, rr.status, rr.config_version, rr.inputs_hash, u.member_no, u.referral_code, w.eligible_referrals, w.share_ppm, w.amount_kobo, w.status, w.adjustment_reason
           FROM referral_rewards w JOIN referral_reward_runs rr ON rr.id = w.run_id JOIN users u ON u.id = w.user_id
           WHERE w.run_id = $2 AND w.id::text > $1 ORDER BY w.id::text LIMIT 5000`;
    params = [id];
  } else return new Response("Unknown export", { status: 400 });

  await audit({ actorId: s.sub, actorEmail: s.email, action: "EXPORT", entity: type, entityId: url.searchParams.get("id") ?? undefined, ip: await clientIp() });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(header.join(",") + "\n"));
      let last = "";
      for (;;) {
        const rows = await query<Record<string, unknown>>(sql, [last, ...params]);
        if (!rows.length) break;
        controller.enqueue(enc.encode(rows.map((r) => Object.entries(r).filter(([k]) => k !== "k").map(([, v]) => esc(v)).join(",")).join("\n") + "\n"));
        last = String(rows[rows.length - 1].k);
        if (rows.length < 5000) break;
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="tbc-${type}-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
