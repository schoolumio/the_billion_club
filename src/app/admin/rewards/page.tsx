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
      <PageTitle eyebrow="Money" title="Referral rewards" lead="Calculate each day’s referral rewards, approve them and confirm the money is there. Actually paying people is a separate step that is switched off." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Calculate rewards for a day" description="Practice calculations can use sample data and are never paid.">
          {write ? (
            <ActionForm action={runRewardsAction} submit="Calculate">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-navy-800">Day to calculate<input type="date" name="runDate" defaultValue={today} className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm" /></label>
                <label className="block text-sm font-medium text-navy-800">Mode
                  <select name="mode" defaultValue="simulation" className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm"><option value="simulation">Practice (never paid)</option><option value="live" disabled={!!blocker}>Real {blocker ? "— switched off" : ""}</option></select>
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-navy-800">Note<input name="note" maxLength={200} className="mt-1.5 block w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm" /></label>
            </ActionForm>
          ) : <p className="text-sm text-navy-500">Read-only for your role.</p>}
          {blocker && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Real calculations are switched off: {blocker}</p>}
        </Panel>
        <Panel title="How it works">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-navy-700">
            <li><strong>Day’s money</strong> = what members paid that day ({config.poolBasis === "net_received" ? "after refunds and failed payments" : "before refunds"}). Real calculations only use real money.</li>
            <li><strong>Referral money</strong> = day’s money × {config.allocationBps / 100}%.</li>
            <li><strong>Each inviter’s share</strong> = people they invited ÷ {config.denominator === "paying_members_on_day" ? "everyone who paid that day" : "all confirmed members"}.</li>
            <li>Amounts are rounded down to the kobo. Anything left over is <strong>unclaimed</strong> and {config.unallocatedPolicy === "return_to_reserve" ? "goes to the emergency reserve" : "is added to the next day"}.</li>
            <li>Every calculation is fingerprinted, so it can be checked and repeated exactly later.</li>
            <li>Rewards move from <em>estimated</em> → <em>approved</em> → <em>funded</em>. Only the separate payments step can mark them <em>paid</em>.</li>
          </ol>
        </Panel>
      </div>

      <Panel className="mt-6" title="Past calculations" description="Each row must balance: shared + unclaimed = referral money.">
        <Table head={["Day", "Status", "Day’s money", "Referral money", "Shared", "Unclaimed", "Divided among", "People", "Settings", "Actions"]} minWidth={1200}>
          {runs.map((r) => {
            const balanced = Number(r.distributed_kobo) + Number(r.unallocated_kobo) === Number(r.allocation_kobo);
            return (
              <tr key={r.id} className="align-top">
                <td className={td}>{fmtDate(r.run_date)}<p className="font-mono text-[0.6rem] text-navy-400" title={r.inputs_hash}>{r.inputs_hash.slice(0, 12)}…</p></td>
                <td className={td}><Pill value={r.status === "simulation" ? "simulated" : r.status === "calculated" ? "pending" : r.status === "void" ? "closed" : r.status === "approved" || r.status === "funded" ? "verified" : r.status} /><p className="mt-1 text-[0.65rem] text-navy-500">{r.pool_source}</p></td>
                <td className={`${td} tabular`}>{k(r.pool_kobo)}</td><td className={`${td} tabular`}>{k(r.allocation_kobo)}</td><td className={`${td} tabular`}>{k(r.distributed_kobo)}</td>
                <td className={`${td} tabular`}>{k(r.unallocated_kobo)}<p className={`text-[0.65rem] ${balanced ? "text-good" : "text-critical"}`}>{balanced ? "✓ balances" : "✗ does not balance"}</p></td>
                <td className={`${td} tabular`}>{r.denominator.toLocaleString("en-NG")}<p className="text-[0.65rem] text-navy-500">{r.eligible_referrals.toLocaleString("en-NG")} invitees counted</p></td>
                <td className={`${td} tabular`}>{r.recipients}</td><td className={`${td} font-mono text-xs`}>v{r.config_version}</td>
                <td className={td}>
                  <a href={`/api/admin/export?type=run&id=${r.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 hover:underline"><Download className="h-3 w-3" aria-hidden />CSV</a>
                  {write && r.status !== "simulation" && r.status !== "void" && r.status !== "paid" && (
                    <form className="mt-2 flex flex-col gap-1.5">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="reason" required minLength={3} placeholder="Reason or reference" className="rounded-md border border-navy-200 px-2 py-1 text-xs" />
                      <div className="flex gap-1">
                        {r.status === "calculated" && <button formAction={approveRunAction} className="rounded-md bg-good px-2 py-1 text-[0.65rem] font-semibold text-white">Approve</button>}
                        {r.status === "approved" && <button formAction={fundRunAction} className="rounded-md bg-[#0d1b2b] px-2 py-1 text-[0.65rem] font-semibold text-white">Confirm money is there</button>}
                        <button formAction={voidRunAction} className="rounded-md border border-red-200 px-2 py-1 text-[0.65rem] font-semibold text-critical">Cancel</button>
                      </div>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
          {runs.length === 0 && <tr><td colSpan={10} className={`${td} py-8 text-center text-navy-500`}>No calculations yet.</td></tr>}
        </Table>
      </Panel>
    </>
  );
}
