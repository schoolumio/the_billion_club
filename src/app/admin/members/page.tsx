import Link from "next/link";
import { Search } from "lucide-react";
import { requirePermission, clientIp } from "@/lib/auth/session";
import { listMembers } from "@/lib/db/queries";
import { audit } from "@/lib/audit";
import { PageTitle, Panel, Pill, Table, fmtDate, td } from "@/components/app/ui";
import { formatNaira } from "@/lib/finance/model";
import { koboToNaira } from "@/lib/db";

export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string; v?: string; page?: string }> }) {
  const s = await requirePermission("admin:members");
  const sp = await searchParams;
  const q = sp.q?.slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const res = await listMembers({ q, verification: sp.v, page });
  await audit({ actorId: s.sub, actorEmail: s.email, action: "ADMIN_VIEW_MEMBERS", metadata: { q: q ?? null, v: sp.v ?? null, page }, ip: await clientIp() });
  const pages = Math.max(1, Math.ceil(res.total / res.size));
  const qs = (p: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(sp.v ? { v: sp.v } : {}), page: String(p) })}`;
  return (
    <>
      <PageTitle title="Members" lead="Search, filter and review member records. Access to this page is audit-logged." />
      <Panel>
        <form className="mb-5 flex flex-wrap gap-3" role="search">
          <label className="relative flex-1 min-w-[14rem]">
            <span className="sr-only">Search members</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Name, email or member number" className="w-full rounded-xl border border-navy-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-900 focus:outline-none" />
          </label>
          <select name="v" defaultValue={sp.v ?? ""} className="rounded-xl border border-navy-200 px-3 py-2.5 text-sm" aria-label="Verification status">
            <option value="">All verification states</option>
            {["verified", "pending", "unverified", "rejected"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button className="rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white">Apply</button>
        </form>
        <Table head={["Member", "State", "Joined", "Verification", "Status", "Recorded", "Last entry"]} minWidth={860}>
          {res.rows.map((m) => (
            <tr key={m.id}>
              <td className={td}><p className="font-medium text-navy-950">{m.full_name}</p><p className="font-mono text-xs text-navy-500">{m.member_no}</p></td>
              <td className={td}>{m.state}</td>
              <td className={td}>{fmtDate(m.created_at)}</td>
              <td className={td}><Pill value={m.verification} /></td>
              <td className={td}><Pill value={m.status} /></td>
              <td className={`${td} tabular`}>{formatNaira(koboToNaira(m.contributed))}</td>
              <td className={td}>{fmtDate(m.last_contribution)}</td>
            </tr>
          ))}
        </Table>
        <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-navy-500">{res.total} members · page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs(page - 1)} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Previous</Link>}
            {page < pages && <Link href={qs(page + 1)} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Next</Link>}
          </div>
        </nav>
      </Panel>
    </>
  );
}
