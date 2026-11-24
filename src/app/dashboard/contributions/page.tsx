import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { memberSummary, memberTransactions } from "@/lib/db/queries";
import { DemoTag, PageTitle, Panel, Pill, Stat, Table, fmtDate, td } from "@/components/app/ui";
import { formatNaira } from "@/lib/finance/model";
import { koboToNaira } from "@/lib/db";

export default async function Contributions({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const s = await requirePermission("member:dashboard");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [sum, tx] = await Promise.all([memberSummary(s.sub), memberTransactions(s.sub, page, 15)]);
  const pages = Math.max(1, Math.ceil(tx.total / tx.size));
  return (
    <>
      <PageTitle title="Contribution history" lead="Your personal statement. Everything shown here is sample data — no real money has been taken." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total recorded" value={formatNaira(sum.total)} hint="Simulated" />
        <Stat label="Entries" value={sum.count} hint={sum.first ? `Since ${fmtDate(sum.first)}` : "—"} />
        <Stat label="Average per active day" value={formatNaira(sum.count ? sum.total / sum.count : 0)} hint="Proposed contribution: ₦100/day" />
      </div>
      <Panel className="mt-6" title={<span className="flex items-center gap-2">Transaction records <DemoTag /></span>} action={<span className="text-xs text-navy-500">{tx.total} records</span>}>
        <Table head={["Date", "Reference", "Channel", "Amount", "Status"]}>
          {tx.rows.map((t) => (
            <tr key={t.id}>
              <td className={td}>{fmtDate(t.contribution_date)}</td>
              <td className={`${td} font-mono text-xs text-navy-600`}>{t.reference}</td>
              <td className={td}>{t.channel}</td>
              <td className={`${td} font-medium tabular`}>{formatNaira(koboToNaira(t.amount_kobo))}</td>
              <td className={td}><Pill value={t.status} /></td>
            </tr>
          ))}
          {tx.rows.length === 0 && <tr><td colSpan={5} className={`${td} py-10 text-center text-navy-500`}>No contribution records. Contributions open only after regulatory approval.</td></tr>}
        </Table>
        <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-navy-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Previous</Link>}
            {page < pages && <Link href={`?page=${page + 1}`} className="rounded-full border border-navy-200 px-4 py-1.5 font-medium hover:bg-navy-50">Next</Link>}
          </div>
        </nav>
      </Panel>
      <p className="mt-4 text-xs text-navy-500">Payment processing is intentionally not implemented. It will be integrated through licensed partners only after the financial model, regulatory approvals and operating rules are finalised.</p>
    </>
  );
}
