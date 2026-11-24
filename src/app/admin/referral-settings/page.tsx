import { ShieldAlert } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { getConfig } from "@/lib/referrals/server";
import { configVersions } from "@/lib/referrals/admin-queries";
import { saveConfigAction } from "@/lib/referrals/admin-actions";
import { liveRunBlocker } from "@/lib/referrals/config";
import { PageTitle, Panel, Table, fmtDateTime, td } from "@/components/app/ui";
import { ActionForm } from "@/components/app/AdminForms";

const f = "mt-1.5 block w-full rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-sm disabled:bg-mist";
const L = ({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-navy-800">{label}{children}{help && <span className="mt-1 block text-xs font-normal text-navy-500">{help}</span>}</label>
);

export default async function ReferralSettings() {
  const s = await requirePermission("admin:referral-config");
  const write = can(s.role, "admin:referral-config:write");
  const [{ version, config: c, createdAt, note }, versions] = await Promise.all([getConfig(), configVersions()]);
  const blocker = liveRunBlocker(c);
  const dis = !write;

  return (
    <>
      <PageTitle title="Referral programme settings" lead={`Version ${version || "— (defaults)"}${createdAt ? ` · saved ${fmtDateTime(createdAt)}` : ""} · ${note}`} />
      <div className={`mb-6 flex gap-3 rounded-2xl border p-4 text-sm ${blocker ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
        <p>{blocker ? <>Live reward calculations are <strong>blocked</strong>: {blocker} Simulations remain available and are never payable.</> : <>Live reward calculations are <strong>enabled</strong>. Every run still requires approval and funding before any reward is payable.</>}</p>
      </div>

      <ActionForm action={saveConfigAction} submit="Save new version" className="space-y-6">
        <fieldset disabled={dis} className="space-y-6">
          <Panel title="Programme status">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="referralsEnabled" defaultChecked={c.referralsEnabled} className="mt-0.5 h-4 w-4 accent-[#0d1b2b]" /><span><strong>Referrals enabled</strong><span className="block text-xs text-navy-500">Pausing stops new attributions; existing ones are kept.</span></span></label>
              <L label="Rewards engine" help="“Active” additionally requires confirmed funding and a legal approval reference.">
                <select name="rewardsState" defaultValue={c.rewardsState} className={f}><option value="inactive">Inactive</option><option value="simulation_only">Simulation only</option><option value="active">Active</option></select>
              </L>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="fundingConfirmed" defaultChecked={c.fundingConfirmed} className="mt-0.5 h-4 w-4 accent-[#0d1b2b]" /><span><strong>Funding confirmed</strong><span className="block text-xs text-navy-500">Tick only when contributions have actually been received into the custodial account.</span></span></label>
              <L label="Legal approval reference" help="E.g. the reference of counsel's written opinion or regulator approval."><input name="legalApprovalRef" defaultValue={c.legalApprovalRef} placeholder="Not yet approved" className={f} /></L>
            </div>
          </Panel>

          <Panel title="Allocation & calculation">
            <div className="grid gap-5 md:grid-cols-2">
              <L label="Referral allocation (% of daily pool)" help="Confirmed business rule: 1%. Changing this requires founder approval."><input name="allocationPct" type="number" step="0.01" min="0" max="10" defaultValue={c.allocationBps / 100} className={f} /></L>
              <L label="Pool basis" help="Which contributions form the daily pool. Never projections.">
                <select name="poolBasis" defaultValue={c.poolBasis} className={f}><option value="net_received">Net received (reconciled, after refunds & failed payments)</option><option value="gross_received">Gross received (before refunds)</option></select>
              </L>
              <L label="Denominator (total eligible users)" help="The numerator follows automatically so that shares can never exceed 100%.">
                <select name="denominator" defaultValue={c.denominator} className={f}><option value="paying_members_on_day">Members who contributed that day (numerator: your verified referrals who contributed that day)</option><option value="all_verified_members">All verified members (numerator: all your verified referrals)</option></select>
              </L>
              <L label="Undistributed allocation" help="Organic members, caps and rounding leave part of the allocation unclaimed.">
                <select name="unallocatedPolicy" defaultValue={c.unallocatedPolicy} className={f}><option value="return_to_reserve">Return to the reserve</option><option value="carry_forward">Carry forward to the next day</option></select>
              </L>
              <L label="Cap per member (% of daily allocation, 0 = none)" help="Optional concentration limit."><input name="capPct" type="number" step="0.01" min="0" max="100" defaultValue={c.perMemberCapBps / 100} className={f} /></L>
              <L label="Distribution schedule"><select name="distributionSchedule" defaultValue={c.distributionSchedule} className={f}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></L>
              <L label="Daily cut-off (Africa/Lagos)"><input name="cutoffTime" type="time" defaultValue={c.cutoffTime} className={f} /></L>
              <L label="Verification required for a referral to count">
                <select name="verification" defaultValue={c.verification} className={f}><option value="email">Email</option><option value="email_and_phone">Email and phone (requires SMS provider)</option></select>
              </L>
            </div>
          </Panel>

          <Panel title="Links & achievements">
            <L label="Referral link domain" help="Used to build every member's link, QR code and card."><input name="baseUrl" type="url" defaultValue={c.baseUrl} className={f} /></L>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.levels.map((l, i) => (
                <div key={i} className="rounded-xl bg-mist p-3">
                  <input name={`level_name_${i}`} defaultValue={l.name} aria-label={`Level ${i + 1} name`} className="w-full rounded-lg border border-navy-200 px-2.5 py-1.5 text-sm font-semibold" />
                  <label className="mt-2 flex items-center gap-2 text-xs text-navy-600">From <input name={`level_min_${i}`} type="number" min={1} defaultValue={l.min} className="w-24 rounded-lg border border-navy-200 px-2 py-1 text-sm" /> verified referrals</label>
                </div>
              ))}
            </div>
          </Panel>

          {write && (
            <Panel title="Reason for change">
              <textarea name="changeNote" required rows={2} placeholder="e.g. Approved by board resolution BR-2027-03" className="w-full rounded-xl border border-navy-200 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-navy-500">Saved settings are never edited — each save creates a new version, and reward runs record the version they used.</p>
            </Panel>
          )}
        </fieldset>
      </ActionForm>

      <Panel className="mt-8" title="Version history">
        <Table head={["Version", "Saved", "By", "Reason", "Allocation", "Rewards"]} minWidth={720}>
          {versions.map((v) => (
            <tr key={v.id}>
              <td className={`${td} font-mono`}>v{v.id}</td><td className={td}>{fmtDateTime(v.created_at)}</td><td className={td}>{v.email ?? "system"}</td>
              <td className={`${td} max-w-xs text-navy-700`}>{v.change_note}</td><td className={`${td} tabular`}>{Number(v.config.allocationBps ?? 0) / 100}%</td><td className={td}>{String(v.config.rewardsState ?? "")}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
