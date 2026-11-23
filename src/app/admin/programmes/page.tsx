import { Award } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { ventures } from "@/lib/db/queries";
import { DemoTag, PageTitle, Panel, Stat, Table, fmtDate, td } from "@/components/app/ui";
import { formatNaira } from "@/lib/finance/model";
import { koboToNaira } from "@/lib/db";

export default async function Programmes() {
  await requirePermission("admin:finance");
  const v = await ventures();
  const jobs = v.reduce((s, x) => s + x.jobs_created, 0);
  const sup = v.reduce((s, x) => s + x.suppliers_engaged, 0);
  return (
    <>
      <PageTitle title="Beneficiaries, ventures & employment" lead="Beneficiary records, business development tracking and employment statistics." />
      <Panel title="Beneficiary records">
        <div className="flex flex-col items-center py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50"><Award className="h-6 w-6 text-navy-400" aria-hidden /></span>
          <p className="mt-4 font-medium text-navy-950">No beneficiaries</p>
          <p className="mt-1 max-w-md text-sm text-navy-500">No selection has taken place and none will until the selection methodology is approved. The beneficiary selection module is deliberately not implemented in this build.</p>
        </div>
      </Panel>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Ventures in pipeline" value={v.length} hint="Demonstration records" />
        <Stat label="Jobs created" value={jobs} hint="Actual: none yet" />
        <Stat label="Suppliers engaged" value={sup} hint="Actual: none yet" />
      </div>
      <Panel className="mt-6" title={<span className="flex items-center gap-2">Business development tracking <DemoTag /></span>}>
        <Table head={["Venture", "Sector", "State", "Stage", "Capital committed", "Jobs", "Updated"]} minWidth={760}>
          {v.map((x) => (
            <tr key={x.id}>
              <td className={`${td} font-medium text-navy-950`}>{x.name}</td>
              <td className={td}>{x.sector}</td><td className={td}>{x.state}</td>
              <td className={td}><span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-800">{x.stage}</span></td>
              <td className={`${td} tabular`}>{formatNaira(koboToNaira(x.capital_kobo))}</td>
              <td className={`${td} tabular`}>{x.jobs_created}</td>
              <td className={td}>{fmtDate(x.updated_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
