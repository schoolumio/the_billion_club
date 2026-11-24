import { ShieldAlert } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { memberTickets } from "@/lib/db/queries";
import { PageTitle, Panel, Pill, fmtDate } from "@/components/app/ui";
import { TicketForm } from "@/components/app/TicketForm";

export default async function Support() {
  const s = await requirePermission("member:dashboard");
  const tickets = await memberTickets(s.sub);
  return (
    <>
      <PageTitle eyebrow="Account" title="Help & support" lead="Ask a question, report a problem or tell us about a scam." />
      <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
        <p><strong>We will never</strong> ask for your PIN, OTP, password or card details, and we are not collecting money during pre-launch. If anyone asks you to pay in our name, report it below using “Fraud report”.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="New request"><TicketForm /></Panel>
        <Panel title="Your requests">
          <ul className="divide-y divide-navy-50">
            {tickets.map((t) => (
              <li key={t.id} className="py-4 first:pt-0">
                <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-navy-950">{t.subject}</p><Pill value={t.status} /></div>
                <p className="mt-1 text-xs text-navy-500">{t.category} · opened {fmtDate(t.created_at)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-navy-600">{t.body}</p>
              </li>
            ))}
            {tickets.length === 0 && <li className="py-6 text-center text-sm text-navy-500">No requests yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
