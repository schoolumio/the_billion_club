import { requirePermission } from "@/lib/auth/session";
import { auditLogs } from "@/lib/db/queries";
import { PageTitle, Panel, Table, fmtDateTime, td } from "@/components/app/ui";

export default async function Audit() {
  await requirePermission("admin:audit");
  const logs = await auditLogs(150);
  return (
    <>
      <PageTitle eyebrow="Safety" title="Activity log" lead="A permanent record of sign-ins, changes and staff actions. Nothing here can be edited or deleted." />
      <Panel>
        <Table head={["Time", "Actor", "Action", "Entity", "Details", "IP"]} minWidth={860}>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className={`${td} whitespace-nowrap text-navy-600`}>{fmtDateTime(l.created_at)}</td>
              <td className={td}>{l.actor_email ?? "system"}</td>
              <td className={td}><span className="rounded bg-navy-50 px-2 py-0.5 font-mono text-xs text-navy-800">{l.action}</span></td>
              <td className={`${td} text-navy-600`}>{l.entity ?? "—"}</td>
              <td className={`${td} max-w-xs truncate font-mono text-xs text-navy-500`}>{Object.keys(l.metadata ?? {}).length ? JSON.stringify(l.metadata) : "—"}</td>
              <td className={`${td} font-mono text-xs text-navy-500`}>{l.ip ?? "—"}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
