import { BUCKETS, allocate, formatNaira, type Allocation, type BucketKey } from "@/lib/finance/model";

/** Four groups — order validated for colour-vision-deficiency separation. */
export const GROUPS: { key: string; label: string; color: string; members: BucketKey[] }[] = [
  { key: "award", label: "Beneficiary awards", color: "var(--color-series-2)", members: ["awards"] },
  { key: "eco", label: "Ecosystem (business + community)", color: "var(--color-series-1)", members: ["business", "community"] },
  { key: "protect", label: "Reserves & statutory", color: "var(--color-series-3)", members: ["reserve", "regulatory"] },
  { key: "ops", label: "Operating costs", color: "var(--color-series-4)", members: ["processing", "operations", "assurance"] },
];

export function AllocationChart({ allocation, gross, compact = false }: { allocation: Allocation; gross: number; compact?: boolean }) {
  const amounts = allocate(gross, allocation);
  const groups = GROUPS.map((g) => ({ ...g, pct: g.members.reduce((s, m) => s + allocation[m], 0) })).filter((g) => g.pct > 0);
  return (
    <div>
      <div className="flex h-11 w-full gap-[2px] overflow-hidden rounded-[6px]" role="img" aria-label={groups.map((g) => `${g.label} ${g.pct}%`).join(", ")}>
        {groups.map((g) => (
          <div key={g.key} className="relative flex h-full items-center justify-start px-2 text-[0.7rem] font-semibold text-navy-950" style={{ width: `${g.pct}%`, background: g.color }}>
            {g.pct >= 9 && <span className="tabular rounded bg-white/85 px-1">{g.pct}%</span>}
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-700">
        {groups.map((g) => (
          <li key={g.key} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: g.color }} aria-hidden />
            {g.label} <span className="tabular text-navy-500">{g.pct}%</span>
          </li>
        ))}
      </ul>
      {!compact && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Monthly allocation by fund</caption>
            <thead className="text-xs uppercase tracking-wider text-navy-500">
              <tr className="border-b border-navy-100"><th className="py-2 pr-3 font-medium">Fund</th><th className="py-2 pr-3 font-medium">Nature</th><th className="py-2 pr-3 text-right font-medium">Share</th><th className="py-2 text-right font-medium">Monthly</th></tr>
            </thead>
            <tbody>
              {BUCKETS.map((b) => (
                <tr key={b.key} className="border-b border-navy-50 align-top">
                  <td className="py-2.5 pr-3">
                    <span className="font-medium text-navy-900">{b.label}</span>
                    <div className="mt-1 h-1 rounded-full bg-navy-50"><div className="h-1 rounded-full bg-navy-700" style={{ width: `${allocation[b.key]}%` }} /></div>
                  </td>
                  <td className="py-2.5 pr-3 text-navy-600">{b.nature}</td>
                  <td className="py-2.5 pr-3 text-right tabular">{allocation[b.key]}%</td>
                  <td className="py-2.5 text-right font-medium tabular">{formatNaira(amounts[b.key], { compact: true, decimals: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
