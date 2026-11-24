import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, Headset, MailWarning, ShieldCheck, Sprout, Target, UserCheck, UserSearch, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { adminKpis, attentionCounts, dailyTotals } from "@/lib/db/queries";
import { waitlistMetrics } from "@/lib/referrals/admin-queries";
import { AttentionCard, DemoTag, PageTitle, Panel, Stat, fmtDate } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { formatCount, formatNaira } from "@/lib/finance/model";

const TARGET = 10_000_000;
const change = (now: number, prev: number) => (prev ? `${now >= prev ? "▲" : "▼"} ${Math.abs(Math.round(((now - prev) / prev) * 100))}% vs previous 7 days` : "First week of data");

export default async function AdminOverview() {
  const s = await requirePermission("admin:view");
  const showFinance = can(s.role, "admin:finance");
  const [k, w, att, daily] = await Promise.all([adminKpis(), waitlistMetrics(), attentionCounts(), showFinance ? dailyTotals(30) : Promise.resolve([])]);
  const pct = (w.verified / TARGET) * 100;
  const maxState = Math.max(1, ...w.states.map((x) => x.n));
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });

  return (
    <>
      <PageTitle eyebrow={today} title="Overview" lead={<>Everything at a glance.{w.demo > 0 && <> Includes <strong>{w.demo.toLocaleString("en-NG")} sample members</strong> for testing — they&apos;re never shown publicly.</>}</>} actions={w.demo > 0 ? <DemoTag /> : undefined} />

      {/* NEEDS ATTENTION */}
      <h2 className="mb-3 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy-500">Needs your attention</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {can(s.role, "admin:referrals") && <AttentionCard href="/admin/referrals" label="Referrals to review" count={att.review} hint={`${att.appeals} appeal${att.appeals === 1 ? "" : "s"} waiting`} icon={<UserSearch className="h-5 w-5" />} />}
        {can(s.role, "admin:risk") && <AttentionCard href="/admin/risk" label="Fraud alerts" count={att.alerts} hint="To investigate" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />}
        {can(s.role, "admin:support") && <AttentionCard href="/admin/support" label="Support requests" count={att.tickets} hint="Open or in progress" tone="navy" icon={<Headset className="h-5 w-5" />} />}
        <AttentionCard href="/admin/members?email=unconfirmed" label="Email not confirmed" count={att.pendingVerify} hint="2+ days after joining" tone="navy" icon={<MailWarning className="h-5 w-5" />} />
      </div>

      {/* GOAL */}
      <section className="mt-6 overflow-hidden rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-300"><Target className="h-3.5 w-3.5" aria-hidden />Goal: 10 million verified members</p>
            <p className="mt-2 font-display text-4xl tabular sm:text-5xl">{w.verified.toLocaleString("en-NG")}</p>
            <p className="mt-1 text-sm text-navy-300">verified so far · {pct < 0.01 ? "<0.01" : pct.toFixed(2)}% of the goal</p>
          </div>
          {can(s.role, "admin:waitlist") && <Link href="/admin/waitlist" className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">Growth details <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${Math.max(0.6, Math.min(100, pct))}%` }} /></div>
      </section>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Sign-ups" value={formatCount(w.total)} hint={`${w.today} today · ${change(w.d7, w.prev7)}`} icon={<Users className="h-4 w-4 text-gold-700" />} />
        <Stat label="Confirmed email" value={formatCount(w.verified)} hint={`${w.total ? Math.round((w.verified / w.total) * 100) : 0}% of sign-ups`} icon={<UserCheck className="h-4 w-4 text-gold-700" />} />
        <Stat label="Came from a referral" value={`${w.total ? Math.round((w.referred / w.total) * 100) : 0}%`} hint={`${formatCount(w.referred)} people · ${formatCount(w.organic)} joined directly`} icon={<Sprout className="h-4 w-4 text-gold-700" />} />
        <Stat label="Active inviters" value={formatCount(w.activeReferrers)} hint="Members with at least one confirmed referral" icon={<BadgeCheck className="h-4 w-4 text-gold-700" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="New sign-ups · last 30 days" description="Hover over a bar for the day's details.">
          <BarChart title="Daily sign-ups, last 30 days" data={w.daily.map((d) => ({ label: String(d.date.getDate()), value: d.total, detail: `${fmtDate(d.date)} · ${d.referred} via referral` }))} everyNthLabel={3} height={210} />
        </Panel>
        <Panel title="Where members are" description="Top states by sign-ups.">
          <ul className="space-y-2.5">
            {w.states.slice(0, 8).map((x) => (
              <li key={x.state} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="truncate text-navy-700">{x.state}</span>
                <span className="h-2 rounded-full bg-navy-50"><span className="block h-2 rounded-full bg-[var(--color-series-1)]" style={{ width: `${(x.n / maxState) * 100}%` }} /></span>
                <span className="text-right font-medium tabular">{x.n.toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {showFinance && (
        <section className="mt-10" aria-labelledby="money-preview">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="money-preview" className="flex items-center gap-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy-500">Payments preview <DemoTag /></h2>
            <Link href="/admin/finance" className="text-xs font-semibold text-navy-700 hover:text-navy-950">Payments & accounts →</Link>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Sample total" value={formatNaira(k.contribTotal, { compact: true, decimals: 2 })} hint={`${k.txns.toLocaleString("en-NG")} payments`} />
              <Stat label="This month" value={formatNaira(k.contribMtd, { compact: true, decimals: 2 })} hint="Sample data" />
              <Stat label="Checked with bank" value={`${k.txns ? Math.round((k.reconciled / Math.max(1, k.txns - k.failed)) * 100) : 0}%`} hint={`${k.unreconciled.toLocaleString("en-NG")} still to check`} />
              <Stat label="Legal checklist" value={`${k.compDone}/${k.compTotal}`} hint="Items complete" icon={<ShieldCheck className="h-4 w-4 text-gold-700" />} />
            </div>
            <Panel title="Daily payments · last 30 days (sample)">
              <BarChart title="Daily sample payments, last 30 days" data={daily.map((d) => ({ label: String(d.date.getDate()), value: d.value, detail: `${fmtDate(d.date)} · ${d.members} members` }))} format="nairaCompact" everyNthLabel={3} height={190} />
            </Panel>
          </div>
        </section>
      )}
    </>
  );
}
