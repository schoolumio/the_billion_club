import { Search } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { openAppeals, referralLookup, reviewQueue } from "@/lib/referrals/admin-queries";
import { approveReferralAction, dismissAppealAction, rejectReferralAction, upholdAppealAction } from "@/lib/referrals/admin-actions";
import { DemoTag, PageTitle, Panel, Pill, fmtDate, fmtDateTime } from "@/components/app/ui";

export default async function ReferralReview({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const s = await requirePermission("admin:referrals");
  const write = can(s.role, "admin:referrals:write");
  const q = (await searchParams).q?.slice(0, 120);
  const [queue, appeals, lookup] = await Promise.all([reviewQueue(), openAppeals(), q ? referralLookup(q) : Promise.resolve(null)]);
  const field = "rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs";

  return (
    <>
      <PageTitle title="Referral review" lead="Flagged referrals, appeals and the audit trail for any member. Decisions are permanent records." />

      <Panel title="Look up a member or referral">
        <form className="flex flex-wrap gap-3" role="search">
          <label className="relative min-w-[14rem] flex-1"><span className="sr-only">Referral code, email or member number</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Referral code, email or member number" className="w-full rounded-xl border border-navy-200 py-2.5 pl-9 pr-3 text-sm" />
          </label>
          <button className="rounded-xl bg-[#0d1b2b] px-5 py-2.5 text-sm font-semibold text-white">Search</button>
        </form>
        {q && !lookup && <p className="mt-4 text-sm text-navy-500">No member found for “{q}”.</p>}
        {lookup && (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl bg-mist p-4 text-sm">
              <p className="font-semibold text-navy-950">{lookup.user.full_name} <span className="font-mono text-xs text-navy-500">{lookup.user.referral_code}</span></p>
              <p className="text-navy-600">{lookup.user.email} · joined {fmtDate(lookup.user.created_at)} · email {lookup.user.email_verified_at ? "verified" : "not verified"} · {lookup.user.status}</p>
              <p className="mt-2 text-navy-700">Referred others: <strong>{lookup.outgoing.total}</strong> ({lookup.outgoing.verified} verified, {lookup.outgoing.rejected} rejected)</p>
              {lookup.incoming ? (
                <p className="mt-2 text-navy-700">Was referred by <strong>{lookup.incoming.referrer_name}</strong> via {lookup.incoming.source.replace("_", " ")} ({lookup.incoming.code_used}{lookup.incoming.campaign_slug ? `, campaign ${lookup.incoming.campaign_slug}` : ""}) · risk {lookup.incoming.risk_score} {lookup.incoming.risk_flags.join(", ")}</p>
              ) : <p className="mt-2 text-navy-700">Joined organically (no referrer).</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Attribution audit trail</p>
              <ol className="mt-2 space-y-2 border-l-2 border-gold-200 pl-4 text-sm">
                {lookup.events.map((e, i) => (
                  <li key={i}><p className="text-navy-900">{e.from_status ? `${e.from_status} → ` : ""}<strong>{e.to_status}</strong></p><p className="text-xs text-navy-500">{fmtDateTime(e.created_at)} · {e.actor ?? "system"}{e.reason ? ` · ${e.reason}` : ""}</p></li>
                ))}
                {lookup.events.length === 0 && <li className="text-navy-500">No referral events.</li>}
              </ol>
            </div>
          </div>
        )}
      </Panel>

      <Panel className="mt-6" title={`Review queue (${queue.length})`} action={!write && <span className="text-xs text-navy-500">Read-only for your role</span>}>
        <ul className="divide-y divide-navy-50">
          {queue.map((r) => (
            <li key={r.id} className="grid gap-4 py-4 first:pt-0 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2"><Pill value={r.risk_score >= 70 ? "high" : "medium"} /><span className="text-xs text-navy-500">risk {r.risk_score}</span>{r.risk_flags.map((f) => <span key={f} className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-[0.65rem] text-navy-700">{f}</span>)}{r.is_demo && <DemoTag />}</div>
                <p className="mt-2 text-sm text-navy-900"><strong>{r.referred_name}</strong> ({r.referred_email}{r.email_verified_at ? ", verified" : ", email unverified"}) referred by <strong>{r.referrer_name}</strong> <span className="font-mono text-xs">{r.referrer_code}</span></p>
                <p className="text-xs text-navy-500">{fmtDateTime(r.created_at)} · via {r.source.replace("_", " ")}</p>
              </div>
              {write && (
                <form className="flex flex-wrap items-start gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input name="reason" required minLength={3} placeholder="Reason (shown to referrer if rejected)" className={`${field} w-60`} />
                  <button formAction={approveReferralAction} className="rounded-lg bg-good px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                  <button formAction={rejectReferralAction} className="rounded-lg bg-critical px-3 py-1.5 text-xs font-semibold text-white">Reject</button>
                </form>
              )}
            </li>
          ))}
          {queue.length === 0 && <li className="py-8 text-center text-sm text-navy-500">Nothing to review.</li>}
        </ul>
      </Panel>

      <Panel className="mt-6" title={`Open appeals (${appeals.length})`}>
        <ul className="divide-y divide-navy-50">
          {appeals.map((a) => (
            <li key={a.id} className="grid gap-4 py-4 first:pt-0 lg:grid-cols-[1fr_auto]">
              <div className="text-sm">
                <p className="text-navy-900"><strong>{a.referrer_name}</strong> appeals the rejection of <strong>{a.referred_name}</strong></p>
                <p className="mt-1 text-navy-600">Rejected because: {a.decision_reason ?? "—"} {a.risk_flags.length ? `(${a.risk_flags.join(", ")})` : ""}</p>
                <blockquote className="mt-2 rounded-lg bg-mist px-3 py-2 text-navy-700">“{a.reason}”</blockquote>
                <p className="mt-1 text-xs text-navy-500">{fmtDateTime(a.created_at)}</p>
              </div>
              {write && (
                <form className="flex flex-wrap items-start gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <input name="resolution" required minLength={3} placeholder="Resolution note" className={`${field} w-56`} />
                  <button formAction={upholdAppealAction} className="rounded-lg bg-good px-3 py-1.5 text-xs font-semibold text-white">Uphold</button>
                  <button formAction={dismissAppealAction} className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-800">Dismiss</button>
                </form>
              )}
            </li>
          ))}
          {appeals.length === 0 && <li className="py-8 text-center text-sm text-navy-500">No open appeals.</li>}
        </ul>
      </Panel>
    </>
  );
}
