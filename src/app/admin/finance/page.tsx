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
      <PageTitle title="Finance & reconciliation" lead="Contribution monitoring, reconciliation status and fund allocation against the proposed policy." actions={<DemoTag />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ledger total" value={formatNaira(k.contribTotal, { compact: true, decimals: 2 })} hint={`${k.txns.toLocaleString("en-NG")} entries`} />
        <Stat label="Month to date" value={formatNaira(k.contribMtd, { compact: true, decimals: 2 })} />
        <Stat label="Reconciled" value={`${recRate.toFixed(1)}%`} hint={`${k.unreconciled.toLocaleString("en-NG")} awaiting reconciliation`} />
        <Stat label="Failed attempts" value={k.failed.toLocaleString("en-NG")} hint="Excluded from totals" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Daily reconciliation · last 14 days">
          <Table head={["Date", "Reconciled", "Pending", "Failed", "Amount"]} minWidth={520}>
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
          <p className="mt-4 text-xs text-navy-500">Production: entries become “reconciled” only when matched to the custodian bank statement by the reconciliation service.</p>
        </Panel>
        <Panel title="Fund allocation monitoring (month to date)">
          <AllocationChart allocation={policy} gross={k.contribMtd} />
          <p className="mt-4 text-xs text-navy-500">Applies the adopted 60/40 policy to month-to-date simulated inflow. No funds have been allocated or moved.</p>
        </Panel>
      </div>
    </>
  );
}
