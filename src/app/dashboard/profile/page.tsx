import { CheckCircle2, Circle, Clock } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getMember } from "@/lib/db/queries";
import { PageTitle, Panel, Pill, fmtDate } from "@/components/app/ui";

export default async function Profile() {
  const s = await requirePermission("member:dashboard");
  const m = await getMember(s.sub);
  if (!m) return null;
  const v = m.verification;
  const steps = [
    { t: "Account created", d: fmtDate(m.created_at), done: true },
    { t: "Contact details confirmed", d: "Email and phone", done: v !== "unverified" },
    { t: "Identity verification (NIN / BVN)", d: "Via licensed identity partner — integration pending approval", done: v === "verified", current: v === "pending" },
    { t: "Eligibility review", d: "Rules awaiting regulatory approval", done: false },
  ];
  return (
    <>
      <PageTitle eyebrow="Account" title="Profile & verification" lead="Your details and where you are in the verification process." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Member profile">
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            {[["Full name", m.full_name], ["Member number", m.member_no], ["Email", m.email], ["Phone", m.phone ?? "—"], ["State", m.state ?? "—"], ["Member since", fmtDate(m.created_at)], ["Last sign-in", fmtDate(m.last_login_at)]].map(([k, val]) => (
              <div key={k}><dt className="text-xs uppercase tracking-wider text-navy-500">{k}</dt><dd className="mt-1 break-words font-medium text-navy-950">{val}</dd></div>
            ))}
            <div><dt className="text-xs uppercase tracking-wider text-navy-500">Account status</dt><dd className="mt-1"><Pill value={m.status} /></dd></div>
          </dl>
          <p className="mt-6 text-xs text-navy-500">To change your details, open a request in the Support centre. Changes to verified identity data require re-verification.</p>
        </Panel>
        <Panel title={<span className="flex items-center gap-2">Verification status <Pill value={v} /></span>}>
          <ol className="space-y-5">
            {steps.map((st) => (
              <li key={st.t} className="flex gap-3">
                {st.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-good" aria-hidden /> : st.current ? <Clock className="h-5 w-5 shrink-0 text-warning" aria-hidden /> : <Circle className="h-5 w-5 shrink-0 text-navy-200" aria-hidden />}
                <div><p className="text-sm font-medium text-navy-950">{st.t} <span className="sr-only">{st.done ? "(complete)" : st.current ? "(in progress)" : "(not started)"}</span></p><p className="text-xs text-navy-500">{st.d}</p></div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
