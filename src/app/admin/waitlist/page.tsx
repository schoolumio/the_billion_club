import Link from "next/link";
import { AlertTriangle, Download, Gauge, MousePointerClick, Sprout, Target, UserCheck, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { waitlistMetrics } from "@/lib/referrals/admin-queries";
import { refreshStatsAction } from "@/lib/referrals/admin-actions";
import { DemoTag, PageTitle, Panel, Stat, Table, fmtDate, fmtDateTime, td } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { RefreshButton } from "@/components/app/AdminForms";

const TARGET = 10_000_000;
const growth = (now: number, prev: number) => (prev ? `${now >= prev ? "+" : ""}${Math.round(((now - prev) / prev) * 100)}% vs previous` : "No previous period");

export default async function WaitlistAdmin() {
  const s = await requirePermission("admin:waitlist");
  const m = await waitlistMetrics();
  const pct = (m.verified / TARGET) * 100;
  const verifyRate = m.total ? Math.round((m.verified / m.total) * 100) : 0;
  const clickConv = m.clicks ? ((m.referred / m.clicks) * 100).toFixed(1) : "—";
  const refConv = m.refTotal ? Math.round((m.refVerified / m.refTotal) * 100) : 0;
  const maxState = Math.max(1, ...m.states.map((x) => x.n));

  return (
    <>
      <PageTitle
        eyebrow="Growth"
        title="Waitlist & growth"
        lead={<>Live numbers{m.demo ? <> · includes <strong>{m.demo.toLocaleString("en-NG")} sample members</strong> for testing (never shown on the public counter)</> : null}.</>}
        actions={<div className="flex flex-wrap items-center gap-2">{m.demo > 0 && <DemoTag />}{can(s.role, "admin:referrals:write") && <RefreshButton action={refreshStatsAction} />}</div>}
      />

      <Panel className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Progress to 10 million verified members</p><p className="mt-1 font-display text-4xl tabular text-navy-950">{m.verified.toLocaleString("en-NG")}</p></div>
          <p className="text-sm text-navy-500"><Target className="mr-1 inline h-4 w-4" aria-hidden />{pct < 0.01 ? "<0.01" : pct.toFixed(2)}% of target</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-navy-50"><div className="h-3 rounded-full bg-[#d4af37]" style={{ width: `${Math.max(0.5, Math.min(100, pct))}%` }} /></div>
      </Panel>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Sign-ups" value={m.total.toLocaleString("en-NG")} hint={`${m.today} today`} icon={<Users className="h-4 w-4 text-gold-600" />} />
        <Stat label="Confirmed email" value={m.verified.toLocaleString("en-NG")} hint={`${verifyRate}% have confirmed`} icon={<UserCheck className="h-4 w-4 text-gold-600" />} />
        <Stat label="Last 7 days" value={m.d7.toLocaleString("en-NG")} hint={growth(m.d7, m.prev7)} icon={<Gauge className="h-4 w-4 text-gold-600" />} />
        <Stat label="Last 30 days" value={m.d30.toLocaleString("en-NG")} hint={growth(m.d30, m.prev30)} icon={<Gauge className="h-4 w-4 text-gold-600" />} />
        <Stat label="From an invite" value={m.referred.toLocaleString("en-NG")} hint={`${m.total ? Math.round((m.referred / m.total) * 100) : 0}% of sign-ups`} icon={<Sprout className="h-4 w-4 text-gold-600" />} />
        <Stat label="Joined directly" value={m.organic.toLocaleString("en-NG")} hint="No invite code used" />
        <Stat label="Active inviters" value={m.activeReferrers.toLocaleString("en-NG")} hint="At least one confirmed invitee" />
        <Stat label="Link visits that sign up" value={`${clickConv}%`} hint={`${m.clicks.toLocaleString("en-NG")} visits · ${refConv}% of referrals verified`} icon={<MousePointerClick className="h-4 w-4 text-gold-600" />} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Waiting to confirm" value={m.refPending.toLocaleString("en-NG")} hint="Invitees who haven’t confirmed email" />
        <Link href="/admin/referrals"><Stat label="Being checked" value={m.refReview.toLocaleString("en-NG")} hint={`${m.appeals} open appeals →`} /></Link>
        <Stat label="Turned down" value={m.refRejected.toLocaleString("en-NG")} hint={`${m.suspended} suspended accounts`} />
        <Link href="/admin/risk"><Stat label="Suspicious sign-ups" value={m.alerts.toLocaleString("en-NG")} hint="Open →" icon={<AlertTriangle className="h-4 w-4 text-warning" />} /></Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Daily sign-ups · last 30 days">
          <BarChart title="Daily registrations, last 30 days" data={m.daily.map((d) => ({ label: String(d.date.getDate()), value: d.total, detail: `${fmtDate(d.date)} · ${d.referred} via referral` }))} everyNthLabel={3} />
        </Panel>
        <Panel title="Where members are">
          <ul className="space-y-2.5">
            {m.states.map((x) => (
              <li key={x.state} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="truncate text-navy-700">{x.state}</span>
                <span className="h-2 rounded-full bg-navy-50"><span className="block h-2 rounded-full bg-[var(--color-series-1)]" style={{ width: `${(x.n / maxState) * 100}%` }} /></span>
                <span className="text-right font-medium tabular">{x.n.toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" title="Top inviters" action={<div className="flex items-center gap-3 text-xs text-navy-500">Updated {m.statsUpdatedAt ? fmtDateTime(m.statsUpdatedAt) : "never"}<a href="/api/admin/export?type=referrals" className="inline-flex items-center gap-1 font-semibold text-navy-800 hover:underline"><Download className="h-3.5 w-3.5" aria-hidden />Download all referrals (CSV)</a></div>}>
        <Table head={["Member", "Code", "Link visits", "Signed up", "Confirmed", "Waiting", "Checking", "Turned down"]} minWidth={760}>
          {m.top.map((t) => (
            <tr key={t.referral_code}>
              <td className={`${td} font-medium text-navy-950`}>{t.full_name} {t.is_demo && <DemoTag />}</td>
              <td className={`${td} font-mono text-xs`}><Link href={`/admin/referrals?q=${t.referral_code}`} className="hover:underline">{t.referral_code}</Link></td>
              <td className={`${td} tabular`}>{t.clicks}</td><td className={`${td} tabular`}>{t.registrations}</td>
              <td className={`${td} font-semibold tabular`}>{t.verified}</td><td className={`${td} tabular`}>{t.pending}</td><td className={`${td} tabular`}>{t.under_review}</td><td className={`${td} tabular`}>{t.rejected}</td>
            </tr>
          ))}
          {m.top.length === 0 && <tr><td colSpan={8} className={`${td} py-8 text-center text-navy-500`}>No confirmed invitees yet. If you expected some, press “Recalculate now”.</td></tr>}
        </Table>
      </Panel>
    </>
  );
}
