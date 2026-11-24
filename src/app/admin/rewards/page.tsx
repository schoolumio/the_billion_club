import { Download } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { getConfig } from "@/lib/referrals/server";
import { rewardRuns } from "@/lib/referrals/admin-queries";
import { approveRunAction, fundRunAction, runRewardsAction, voidRunAction } from "@/lib/referrals/admin-actions";
import { liveRunBlocker } from "@/lib/referrals/config";
import { PageTitle, Panel, Pill, Table, fmtDate, td } from "@/components/app/ui";
import { ActionForm } from "@/components/app/AdminForms";
import { formatNaira } from "@/lib/finance/model";

const k = (v: string | number) => formatNaira(Number(v) / 100);

export default async function Rewards() {
  const s = await requirePermission("admin:rewards");
  const write = can(s.role, "admin:rewards:write");
  const [{ config }, runs] = await Promise.all([getConfig(), rewardRuns()]);
  const blocker = liveRunBlocker(config);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageTitle title="Referral rewards engine" lead="Daily calculation, approval, funding status and reconciliation. Payments are a separate module and are not enabled." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Run a calculation">
          {write ? (
            <ActionForm action={runRewardsAction} submit="Run calculation">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-navy-800">Contribution date<input type="date" name="runDate" defaultValue={today} className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm" /></label>
                <label className="block text-sm font-medium text-navy-800">Mode
                  <select name="mode" defaultValue="simulation" className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm"><option value="simulation">Simulation (may use sample data, never payable)</option><option value="live" disabled={!!blocker}>Live {blocker ? "— blocked" : ""}</option></select>
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-navy-800">Note<input name="note" maxLength={200} className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm" /></label>
            </ActionForm>
          ) : <p className="text-sm text-navy-500">Read-only for your role.</p>}
          {blocker && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Live runs blocked: {blocker}</p>}
        </Panel>
        <Panel title="How a run works">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-navy-700">
            <li><strong>Pool</strong> = contributions for the date ({config.poolBasis === "net_received" ? "reconciled, net of refunds and failures" : "received, before refunds"}); live runs use real money only.</li>
            <li><strong>Allocation</strong> = pool × {config.allocationBps / 100}% (floored to the kobo).</li>
            <li><strong>Denominator</strong> = {config.denominator === "paying_members_on_day" ? "members who contributed that day" : "all verified members"}; each member&apos;s eligible direct referrals are counted against it.</li>
            <li>Each share is floored; the remainder is <strong>unallocated</strong> and {config.unallocatedPolicy === "return_to_reserve" ? "returns to the reserve" : "carries forward"}.</li>
            <li>Inputs are hashed with the config version so any run can be reproduced exactly.</li>
            <li>Lines start as <em>estimated</em> → approved → funded. “Paid” is only set by the payments module after approval.</li>
          </ol>
        </Panel>
      </div>

      <Panel className="mt-6" title="Runs & reconciliation">
        <Table head={["Date", "Status", "Pool", "Allocation", "Distributed", "Unallocated", "Denominator", "Recipients", "Config", "Actions"]} minWidth={1200}>
          {runs.map((r) => {
            const balanced = Number(r.distributed_kobo) + Number(r.unallocated_kobo) === Number(r.allocation_kobo);
            return (
              <tr key={r.id} className="align-top">
                <td className={td}>{fmtDate(r.run_date)}<p className="font-mono text-[0.6rem] text-navy-400" title={r.inputs_hash}>{r.inputs_hash.slice(0, 12)}…</p></td>
                <td className={td}><Pill value={r.status === "simulation" ? "simulated" : r.status === "calculated" ? "pending" : r.status === "void" ? "closed" : r.status === "approved" || r.status === "funded" ? "verified" : r.status} /><p className="mt-1 text-[0.65rem] text-navy-500">{r.pool_source}</p></td>
                <td className={`${td} tabular`}>{k(r.pool_kobo)}</td><td className={`${td} tabular`}>{k(r.allocation_kobo)}</td><td className={`${td} tabular`}>{k(r.distributed_kobo)}</td>
                <td className={`${td} tabular`}>{k(r.unallocated_kobo)}<p className={`text-[0.65rem] ${balanced ? "text-good" : "text-critical"}`}>{balanced ? "✓ reconciles" : "✗ does not reconcile"}</p></td>
                <td className={`${td} tabular`}>{r.denominator.toLocaleString("en-NG")}<p className="text-[0.65rem] text-navy-500">{r.eligible_referrals.toLocaleString("en-NG")} eligible refs</p></td>
                <td className={`${td} tabular`}>{r.recipients}</td><td className={`${td} font-mono text-xs`}>v{r.config_version}</td>
                <td className={td}>
                  <a href={`/api/admin/export?type=run&id=${r.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 hover:underline"><Download className="h-3 w-3" aria-hidden />CSV</a>
                  {write && r.status !== "simulation" && r.status !== "void" && r.status !== "paid" && (
                    <form className="mt-2 flex flex-col gap-1.5">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="reason" required minLength={3} placeholder="Reason / reference" className="rounded-md border border-navy-200 px-2 py-1 text-xs" />
                      <div className="flex gap-1">
                        {r.status === "calculated" && <button formAction={approveRunAction} className="rounded-md bg-good px-2 py-1 text-[0.65rem] font-semibold text-white">Approve</button>}
                        {r.status === "approved" && <button formAction={fundRunAction} className="rounded-md bg-[#0d1b2b] px-2 py-1 text-[0.65rem] font-semibold text-white">Mark funded</button>}
                        <button formAction={voidRunAction} className="rounded-md border border-red-200 px-2 py-1 text-[0.65rem] font-semibold text-critical">Void</button>
                      </div>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
          {runs.length === 0 && <tr><td colSpan={10} className={`${td} py-8 text-center text-navy-500`}>No runs yet.</td></tr>}
        </Table>
      </Panel>
    </>
  );
}
