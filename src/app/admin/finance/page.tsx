import { requirePermission } from "@/lib/auth/session";
import { adminKpis, reconciliation } from "@/lib/db/queries";
import { DemoTag, PageTitle, Panel, Stat, Table, fmtDate, td } from "@/components/app/ui";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ADOPTED_ALLOCATION, formatNaira } from "@/lib/finance/model";
import { koboToNaira } from "@/lib/db";

export default async function Finance() {
  await requirePermission("admin:finance");
  const [k, rec] = await Promise.all([adminKpis(), reconciliation(14)]);
  const policy = ADOPTED_ALLOCATION;
  const recRate = k.txns ? (k.reconciled / (k.txns - k.failed)) * 100 : 0;
  return (
    <>
      <PageTitle eyebrow="Money" title="Payments & accounts" lead="Daily payments, checks against the bank, and how each month’s money is shared. All sample data until launch." actions={<DemoTag />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total (sample)" value={formatNaira(k.contribTotal, { compact: true, decimals: 2 })} hint={`${k.txns.toLocaleString("en-NG")} entries`} />
        <Stat label="Month to date" value={formatNaira(k.contribMtd, { compact: true, decimals: 2 })} />
        <Stat label="Checked with bank" value={`${recRate.toFixed(1)}%`} hint={`${k.unreconciled.toLocaleString("en-NG")} still to check`} />
        <Stat label="Failed payments" value={k.failed.toLocaleString("en-NG")} hint="Not counted in totals" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Bank checks · last 14 days" description="Each payment is matched against the bank statement.">
          <Table head={["Day", "Matched", "Still to check", "Failed", "Amount"]} minWidth={520}>
            {rec.map((r) => (
              <tr key={String(r.d)}>
                <td className={td}>{fmtDate(r.d)}</td>
                <td className={`${td} tabular`}>{r.reconciled}</td>
                <td className={`${td} tabular ${Number(r.pending) ? "font-semibold text-warning" : ""}`}>{r.pending}</td>
                <td className={`${td} tabular`}>{r.failed}</td>
                <td className={`${td} font-medium tabular`}>{formatNaira(koboToNaira(r.amount))}</td>
              </tr>
            ))}
          </Table>
          <p className="mt-4 text-xs text-navy-500">After launch, a payment only counts as matched once it appears on the independent bank’s statement.</p>
        </Panel>
        <Panel title="How this month’s money would be shared" description="Using the agreed 60/40 split. Sample data — nothing has actually moved.">
          <AllocationChart allocation={policy} gross={k.contribMtd} />
          
        </Panel>
      </div>
    </>
  );
}
