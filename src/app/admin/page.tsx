import Link from "next/link";
import { AlertTriangle, BadgeCheck, Headset, ShieldCheck, UserCheck, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { adminKpis, dailyTotals, membersByState } from "@/lib/db/queries";
import { DemoTag, PageTitle, Panel, Stat, fmtDate } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { formatCount, formatNaira } from "@/lib/finance/model";

export default async function AdminOverview() {
  const s = await requirePermission("admin:view");
  const [k, daily, states] = await Promise.all([adminKpis(), dailyTotals(30), membersByState()]);
  const maxState = Math.max(1, ...states.map((x) => Number(x.n)));
  const showFinance = can(s.role, "admin:finance");
  return (
    <>
      <PageTitle title="Operations overview" lead={<>Live figures from the database. All records are <strong>demonstration data</strong> until launch.</>} actions={<DemoTag />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Registered members" value={formatCount(k.members)} hint={`+${k.new30} in last 30 days`} icon={<Users className="h-4 w-4 text-gold-600" />} />
        <Stat label="Verified members" value={formatCount(k.verified)} hint={`${k.pending} pending verification`} icon={<BadgeCheck className="h-4 w-4 text-gold-600" />} />
        <Stat label="Active (7 days)" value={formatCount(k.active7)} hint={`${k.members ? Math.round((k.active7 / k.members) * 100) : 0}% of members`} icon={<UserCheck className="h-4 w-4 text-gold-600" />} />
        <Stat tone="navy" label="Ledger total (simulated)" value={showFinance ? formatNaira(k.contribTotal, { compact: true, decimals: 2 }) : "Restricted"} hint={showFinance ? `${formatNaira(k.contribMtd, { compact: true, decimals: 2 })} month to date` : "Finance permission required"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel title={<span className="flex items-center gap-2">Daily contribution inflow · 30 days <DemoTag /></span>}>
          {showFinance ? (
            <BarChart title="Daily simulated contribution inflow" data={daily.map((d) => ({ label: String(d.date.getDate()), value: d.value, detail: `${fmtDate(d.date)} · ${d.members} members` }))} format="nairaCompact" everyNthLabel={3} />
          ) : <p className="text-sm text-navy-500">Your role does not include financial data.</p>}
        </Panel>
        <Panel title="Members by state (top 10)">
          <ul className="space-y-2.5">
            {states.map((x) => (
              <li key={x.state} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="truncate text-navy-700">{x.state}</span>
                <span className="h-2 rounded-full bg-navy-50"><span className="block h-2 rounded-full bg-[var(--color-series-1)]" style={{ width: `${(Number(x.n) / maxState) * 100}%` }} /></span>
                <span className="text-right font-medium tabular">{x.n}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/admin/risk" className="rounded-2xl border border-navy-100 bg-white p-5 transition hover:border-navy-300">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-950"><AlertTriangle className="h-4 w-4 text-warning" aria-hidden /> Open fraud alerts</div>
          <p className="mt-3 font-display text-3xl tabular">{k.alerts}</p>
        </Link>
        <Link href="/admin/support" className="rounded-2xl border border-navy-100 bg-white p-5 transition hover:border-navy-300">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-950"><Headset className="h-4 w-4 text-navy-500" aria-hidden /> Open support tickets</div>
          <p className="mt-3 font-display text-3xl tabular">{k.tickets}</p>
        </Link>
        <Link href="/admin/risk" className="rounded-2xl border border-navy-100 bg-white p-5 transition hover:border-navy-300">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-950"><ShieldCheck className="h-4 w-4 text-good" aria-hidden /> Compliance register</div>
          <p className="mt-3 font-display text-3xl tabular">{k.compDone}<span className="text-lg text-navy-400">/{k.compTotal} complete</span></p>
        </Link>
      </div>
    </>
  );
}
