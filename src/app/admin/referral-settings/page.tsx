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
      <PageTitle eyebrow="Settings" title="Referral settings" lead={`Version ${version || "— (defaults)"}${createdAt ? ` · saved ${fmtDateTime(createdAt)}` : ""} · ${note}`} />
      <div className={`mb-6 flex gap-3 rounded-2xl border p-4 text-sm ${blocker ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
        <p>{blocker ? <>Real reward calculations are <strong>switched off</strong>: {blocker} You can still run practice calculations — they are never paid.</> : <>Real reward calculations are <strong>switched on</strong>. Every calculation still needs approval and funding before anyone is paid.</>}</p>
      </div>

      <ActionForm action={saveConfigAction} submit="Save new version" className="space-y-6">
        <fieldset disabled={dis} className="space-y-6">
          <Panel title="On / off switches" description="Control whether invites are counted and whether rewards can be calculated.">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="referralsEnabled" defaultChecked={c.referralsEnabled} className="mt-0.5 h-4 w-4 accent-[#0d1b2b]" /><span><strong>Count new invites</strong><span className="block text-xs text-navy-500">Turning this off stops crediting new sign-ups to inviters. Existing referrals are kept.</span></span></label>
              <L label="Rewards" help="“On” also needs funding confirmed and a legal approval reference below.">
                <select name="rewardsState" defaultValue={c.rewardsState} className={f}><option value="inactive">Off</option><option value="simulation_only">Practice calculations only</option><option value="active">On — real calculations</option></select>
              </L>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="fundingConfirmed" defaultChecked={c.fundingConfirmed} className="mt-0.5 h-4 w-4 accent-[#0d1b2b]" /><span><strong>Money is in the bank</strong><span className="block text-xs text-navy-500">Tick only when members&apos; payments have actually arrived in the independent bank account.</span></span></label>
              <L label="Legal approval reference" help="The reference number of the lawyer’s written opinion or the regulator’s approval."><input name="legalApprovalRef" defaultValue={c.legalApprovalRef} placeholder="Not approved yet" className={f} /></L>
            </div>
          </Panel>

          <Panel title="How rewards are calculated" description="These rules decide how much referral money there is each day and how it is shared.">
            <div className="grid gap-5 md:grid-cols-2">
              <L label="Referral share (% of each day’s money)" help="Agreed rule: 1%. Only change this with the founders’ approval."><input name="allocationPct" type="number" step="0.01" min="0" max="10" defaultValue={c.allocationBps / 100} className={f} /></L>
              <L label="Which money counts" help="Only real money received — never estimates.">
                <select name="poolBasis" defaultValue={c.poolBasis} className={f}><option value="net_received">Money we kept (after refunds and failed payments) — recommended</option><option value="gross_received">All money received (before refunds)</option></select>
              </L>
              <L label="Share it among" help="Each inviter’s share = the people they invited ÷ this group. The matching rule for inviters is set automatically so shares never add up to more than 100%.">
                <select name="denominator" defaultValue={c.denominator} className={f}><option value="paying_members_on_day">Everyone who paid that day — recommended (₦1 per paying invitee per day)</option><option value="all_verified_members">All confirmed members, paying or not</option></select>
              </L>
              <L label="Unclaimed referral money" help="Members who joined without an invite, limits and rounding leave some money unclaimed each day.">
                <select name="unallocatedPolicy" defaultValue={c.unallocatedPolicy} className={f}><option value="return_to_reserve">Put it in the emergency reserve</option><option value="carry_forward">Add it to the next day</option></select>
              </L>
              <L label="Limit per person (% of the day’s referral money)" help="0 means no limit. Use this to stop one person taking too large a share."><input name="capPct" type="number" step="0.01" min="0" max="100" defaultValue={c.perMemberCapBps / 100} className={f} /></L>
              <L label="How often rewards are paid"><select name="distributionSchedule" defaultValue={c.distributionSchedule} className={f}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></L>
              <L label="Daily cut-off time (Lagos time)"><input name="cutoffTime" type="time" defaultValue={c.cutoffTime} className={f} /></L>
              <L label="What a new member must confirm to count">
                <select name="verification" defaultValue={c.verification} className={f}><option value="email">Email only</option><option value="email_and_phone">Email and phone (needs an SMS provider)</option></select>
              </L>
            </div>
          </Panel>

          <Panel title="Invite links & levels" description="The web address used in every invite link, and the levels members can reach.">
            <L label="Website address for invite links" help="Used in every member’s link, QR code and invite card."><input name="baseUrl" type="url" defaultValue={c.baseUrl} className={f} /></L>
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
            <Panel title="Why are you making this change?">
              <textarea name="changeNote" required rows={2} placeholder="e.g. Approved by board resolution BR-2027-03" className="w-full rounded-xl border border-navy-200 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-navy-500">Settings are never overwritten. Each save creates a new version with your reason, so we always know what changed, when and why.</p>
            </Panel>
          )}
        </fieldset>
      </ActionForm>

      <Panel className="mt-8" title="Change history" description="Every saved version, newest first.">
        <Table head={["Version", "Saved", "By", "Reason", "Referral share", "Rewards"]} minWidth={720}>
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
