import Link from "next/link";
import { clsx } from "clsx";
import { MailCheck, MailWarning, Search, Users } from "lucide-react";
import { requirePermission, clientIp } from "@/lib/auth/session";
import { listMembers } from "@/lib/db/queries";
import { audit } from "@/lib/audit";
import { EmptyState, PageTitle, Panel, Pill, Table, fmtDate, td } from "@/components/app/ui";
import { formatNaira } from "@/lib/finance/model";
import { koboToNaira } from "@/lib/db";

const CHIPS: { label: string; params: Record<string, string> }[] = [
  { label: "Everyone", params: {} },
  { label: "Email confirmed", params: { email: "confirmed" } },
  { label: "Email not confirmed (2+ days)", params: { email: "unconfirmed" } },
  { label: "ID verified", params: { v: "verified" } },
  { label: "ID check pending", params: { v: "pending" } },
];

export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string; v?: string; email?: string; page?: string }> }) {
  const s = await requirePermission("admin:members");
  const sp = await searchParams;
  const q = sp.q?.slice(0, 80);
  const email = sp.email === "confirmed" || sp.email === "unconfirmed" ? sp.email : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const res = await listMembers({ q, verification: sp.v, email, page });
  await audit({ actorId: s.sub, actorEmail: s.email, action: "ADMIN_VIEW_MEMBERS", metadata: { q: q ?? null, v: sp.v ?? null, email: email ?? null, page }, ip: await clientIp() });
  const pages = Math.max(1, Math.ceil(res.total / res.size));
  const base = { ...(q ? { q } : {}), ...(sp.v ? { v: sp.v } : {}), ...(email ? { email } : {}) };
  const qs = (p: number) => `?${new URLSearchParams({ ...base, page: String(p) })}`;
  const chipActive = (p: Record<string, string>) => (p.email ?? "") === (email ?? "") && (p.v ?? "") === (sp.v ?? "");

  return (
    <>
      <PageTitle eyebrow="People" title="Members" lead="Find and review member records. Every visit to this page is recorded in the activity log." />
      <Panel>
        <form className="flex flex-wrap gap-3" role="search">
          {email && <input type="hidden" name="email" value={email} />}
          {sp.v && <input type="hidden" name="v" value={sp.v} />}
          <label className="relative min-w-[14rem] flex-1">
            <span className="sr-only">Search members</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Search by name, email or member number" className="w-full rounded-xl border border-navy-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-900 focus:outline-none" />
          </label>
          <button className="rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick filters">
          {CHIPS.map((c) => (
            <Link key={c.label} href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...c.params })}`} className={clsx("rounded-full px-3 py-1.5 text-xs font-semibold transition", chipActive(c.params) ? "bg-navy-950 text-white" : "bg-mist text-navy-700 hover:bg-navy-100")}>{c.label}</Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-navy-500"><strong className="text-navy-800">{res.total.toLocaleString("en-NG")}</strong> member{res.total === 1 ? "" : "s"} found</p>

        <div className="mt-3">
          {res.rows.length === 0 ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="No members match" body="Try a different search or filter." />
          ) : (
            <Table head={["Member", "State", "Joined", "Email", "ID check", "Account", "Paid (sample)", "Last payment"]} minWidth={940}>
              {res.rows.map((m) => (
                <tr key={m.id}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[0.65rem] font-bold text-navy-700">{m.full_name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                      <span><span className="block font-medium text-navy-950">{m.full_name}</span><span className="block font-mono text-[0.7rem] text-navy-500">{m.member_no}</span></span>
                    </div>
                  </td>
                  <td className={td}>{m.state}</td>
                  <td className={td}>{fmtDate(m.created_at)}</td>
                  <td className={td}>{(m as { email_verified_at?: Date | null }).email_verified_at
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-good"><MailCheck className="h-3.5 w-3.5" aria-hidden />Confirmed</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning"><MailWarning className="h-3.5 w-3.5" aria-hidden />Not yet</span>}</td>
                  <td className={td}><Pill value={m.verification} /></td>
                  <td className={td}><Pill value={m.status} /></td>
                  <td className={`${td} tabular`}>{formatNaira(koboToNaira(m.contributed))}</td>
                  <td className={td}>{fmtDate(m.last_contribution)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
        <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-navy-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs(page - 1)} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Previous</Link>}
            {page < pages && <Link href={qs(page + 1)} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Next</Link>}
          </div>
        </nav>
      </Panel>
    </>
  );
}
