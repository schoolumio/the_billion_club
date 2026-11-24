import { requirePermission } from "@/lib/auth/session";
import { complianceItems, fraudAlerts } from "@/lib/db/queries";
import { resolveAlert } from "@/lib/actions";
import { DemoTag, PageTitle, Panel, Pill, Table, fmtDateTime, fmtDate, td } from "@/components/app/ui";

export default async function Risk() {
  const s = await requirePermission("admin:risk");
  const [comp, alerts] = await Promise.all([complianceItems(), fraudAlerts()]);
  const canAct = s.role === "admin";
  return (
    <>
      <PageTitle eyebrow="Safety" title="Fraud & compliance" lead="Suspicious activity to investigate, and our progress on legal and licensing requirements." />
      <Panel title={<span className="flex items-center gap-2">Suspicious activity <DemoTag /></span>} action={!canAct && <span className="text-xs text-navy-500">View only for auditors</span>}>
        <ul className="divide-y divide-navy-50">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Pill value={a.severity} /><span className="font-mono text-xs text-navy-600">{a.rule}</span><Pill value={a.status} /></div>
                <p className="mt-2 text-sm text-navy-800">{a.description}</p>
                <p className="mt-1 text-xs text-navy-500">{a.member_no ?? "No member"} · {fmtDateTime(a.created_at)}</p>
              </div>
              {canAct && (
                <form action={resolveAlert} className="flex gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="status" defaultValue={a.status} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs" aria-label="Alert status">
                    {["open", "investigating", "escalated", "dismissed"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                  <button className="rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white">Update</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel className="mt-6" title="Legal & licensing checklist" description="What we must have in place before launch, and who is responsible.">
        <Table head={["Area", "What’s needed", "Regulator", "Owner", "Status", "Updated"]} minWidth={900}>
          {comp.map((c) => (
            <tr key={c.id} className="align-top">
              <td className={`${td} font-medium text-navy-950`}>{c.area}</td>
              <td className={`${td} max-w-sm text-navy-700`}>{c.requirement}</td>
              <td className={td}>{c.authority}</td>
              <td className={`${td} text-navy-500`}>{c.owner}</td>
              <td className={td}><Pill value={c.status} /></td>
              <td className={td}>{fmtDate(c.updated_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
