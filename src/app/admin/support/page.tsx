import { requirePermission } from "@/lib/auth/session";
import { allTickets } from "@/lib/db/queries";
import { updateTicketStatus } from "@/lib/actions";
import { PageTitle, Panel, Pill, fmtDate } from "@/components/app/ui";

export default async function SupportDesk() {
  await requirePermission("admin:support");
  const tickets = await allTickets();
  return (
    <>
      <PageTitle title="Support desk" lead="Customer support management. Fraud reports are automatically prioritised." />
      <Panel>
        <ul className="divide-y divide-navy-50">
          {tickets.map((t) => (
            <li key={t.id} className="grid gap-4 py-5 first:pt-0 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2"><Pill value={t.priority} /><Pill value={t.status} /><span className="text-xs text-navy-500">{t.category}</span></div>
                <p className="mt-2 font-medium text-navy-950">{t.subject}</p>
                <p className="mt-1 text-sm text-navy-600">{t.body}</p>
                <p className="mt-2 text-xs text-navy-500">{t.full_name} · <span className="font-mono">{t.member_no}</span> · {fmtDate(t.created_at)}</p>
              </div>
              <form action={updateTicketStatus} className="flex items-start gap-2">
                <input type="hidden" name="id" value={t.id} />
                <select name="status" defaultValue={t.status} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs" aria-label="Ticket status">
                  {["open", "in_progress", "resolved", "closed"].map((x) => <option key={x} value={x}>{x.replace("_", " ")}</option>)}
                </select>
                <button className="rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white">Update</button>
              </form>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
