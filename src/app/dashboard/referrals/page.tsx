import { cookies } from "next/headers";
import { AlertTriangle, Award, CheckCircle2, Clock, Eye, MailWarning, MousePointerClick, Share2, ShieldX, Trophy, UserPlus, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getConfig, memberReferralView } from "@/lib/referrals/server";
import { estimateShare } from "@/lib/referrals/calc";
import { levelFor } from "@/lib/referrals/config";
import { maskName, referralUrl } from "@/lib/referrals/codes";
import { qrSvg } from "@/lib/referrals/qr";
import { DemoTag, PageTitle, Panel, Pill, Stat, Table, fmtDate, td } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { ShareKit } from "@/components/waitlist/ShareKit";
import { AppealForm, LeaderboardPrefs, ResendVerification } from "@/components/waitlist/MemberForms";
import { StatusBadge } from "@/components/ui/primitives";
import { formatNaira } from "@/lib/finance/model";

const STATUS_HELP: Record<string, string> = {
  pending: "Waiting for them to verify their email",
  verified: "Counts towards your total",
  under_review: "Being checked by our team",
  rejected: "Does not count",
};

const FLAG_TEXT: Record<string, string> = {
  SAME_DEVICE_AS_REFERRER: "registered on the same device as you",
  SAME_NETWORK_AS_REFERRER: "same network as you",
  IP_VELOCITY: "many sign-ups from one network in a short time",
  REFERRER_VELOCITY: "unusually many sign-ups in an hour",
  DEVICE_MULTI_ACCOUNT: "several accounts on one device",
  DEVICE_REUSED: "device used for another account",
  DISPOSABLE_EMAIL: "temporary email address",
  NAME_MATCHES_REFERRER: "same name as you",
};

export default async function Referrals({ searchParams }: { searchParams: Promise<{ welcome?: string; verified?: string }> }) {
  const sp = await searchParams;
  const s = await requirePermission("member:dashboard");
  const [v, { config }] = await Promise.all([memberReferralView(s.sub), getConfig()]);
  if (!v) return null;
  const url = referralUrl(config.baseUrl, v.user.referral_code);
  const qr = await qrSvg(url);
  const demoVerify = !v.user.email_verified_at ? (await cookies()).get("tbc_demo_verify")?.value : undefined;
  const lvl = levelFor(v.counts.verified, config.levels);
  const denominator = v.communityVerified;
  const pct = denominator ? (v.counts.verified / denominator) * 100 : 0;
  // Actual pool today (real, reconciled contributions only). Zero before launch.
  const allocationKobo = Math.floor((v.todayPoolKobo * config.allocationBps) / 10_000);
  const estimate = estimateShare({ poolKobo: v.todayPoolKobo, allocationBps: config.allocationBps, denominator: v.todayPayers, eligibleReferrals: Math.min(v.eligibleToday, v.todayPayers) });
  const invited = v.stats?.clicks ?? 0;
  const conv = invited ? Math.round((v.counts.registrations / invited) * 100) : null;
  const shares = v.channels.filter((c) => c.kind === "share");
  const totalShares = shares.reduce((t, c) => t + c.n, 0);

  return (
    <>
      {sp.welcome && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Welcome to the founding community! Verify your email to secure your place, then start sharing your link below.</p>}
      {sp.verified && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Email verified — your place on the waitlist is secured.</p>}
      {!v.user.email_verified_at && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2"><MailWarning className="h-5 w-5 shrink-0" aria-hidden /><span><strong>Verify your email</strong> ({v.user.email}) to secure your place. Your own referrals can still be credited to you, but you only count as a verified member once you verify.</span></p>
          <div className="flex flex-col items-start gap-2">
            {demoVerify && <a href={demoVerify} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white">Verify now (demo link — email delivery not configured)</a>}
            <ResendVerification />
          </div>
        </div>
      )}

      <PageTitle title="Invite your circle" lead="Share your link. A referral counts once the person you invite verifies their account." actions={v.user.is_demo ? <DemoTag /> : undefined} />

      <Panel><ShareKit url={url} code={v.user.referral_code} firstName={v.user.full_name.split(" ")[0]} qr={qr} /></Panel>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="People invited" value={invited.toLocaleString("en-NG")} hint="Visits to your link" icon={<MousePointerClick className="h-4 w-4 text-gold-600" />} />
        <Stat label="Registrations" value={v.counts.registrations.toLocaleString("en-NG")} hint={conv !== null ? `${conv}% of visits` : "Using your link or code"} icon={<UserPlus className="h-4 w-4 text-gold-600" />} />
        <Stat tone="navy" label="Verified referrals" value={v.counts.verified.toLocaleString("en-NG")} hint="The number that counts" icon={<CheckCircle2 className="h-4 w-4 text-gold-300" />} />
        <Stat label="Your ranking" value={v.stats?.rank ? `#${v.stats.rank.toLocaleString("en-NG")}` : "—"} hint={v.stats?.rank ? `of ${v.rankedMembers.toLocaleString("en-NG")} referrers` : "Rank appears after your first verified referral"} icon={<Trophy className="h-4 w-4 text-gold-600" />} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Pending" value={v.counts.pending} hint="Awaiting verification" icon={<Clock className="h-4 w-4 text-warning" />} />
        <Stat label="Under review" value={v.counts.under_review} hint="Being checked" icon={<Eye className="h-4 w-4 text-warning" />} />
        <Stat label="Rejected" value={v.counts.rejected} hint="Not counted" icon={<ShieldX className="h-4 w-4 text-critical" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-600" aria-hidden /> Milestones</span>}>
          <p className="text-sm text-navy-600">Current level</p>
          <p className="font-display text-3xl text-navy-950">{lvl.current?.name ?? "Not yet ranked"}</p>
          {lvl.next ? (
            <>
              <div className="mt-4 h-2.5 rounded-full bg-navy-50" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lvl.progress * 100)} aria-label={`Progress to ${lvl.next.name}`}><div className="h-2.5 rounded-full bg-[#d4af37]" style={{ width: `${Math.max(2, lvl.progress * 100)}%` }} /></div>
              <p className="mt-2 text-xs text-navy-500">{lvl.remaining.toLocaleString("en-NG")} more verified referral{lvl.remaining === 1 ? "" : "s"} to <strong className="text-navy-800">{lvl.next.name}</strong></p>
            </>
          ) : <p className="mt-2 text-sm text-good">Highest level reached — thank you for building the movement.</p>}
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {config.levels.map((l) => {
              const got = v.counts.verified >= l.min;
              return <li key={l.name} className={`rounded-xl px-3 py-2 text-xs ${got ? "bg-[#0d1b2b] text-[#d4af37]" : "bg-mist text-navy-500"}`}><span className="block font-semibold">{l.name}</span>{l.min.toLocaleString("en-NG")}+ verified</li>;
            })}
          </ul>
        </Panel>

        <Panel title="Your share of the community">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-navy-500">Referral percentage</dt><dd className="mt-1 font-display text-2xl tabular text-navy-950">{pct < 0.01 && pct > 0 ? "<0.01" : pct.toFixed(2)}%</dd><dd className="text-xs text-navy-500">{v.counts.verified.toLocaleString("en-NG")} ÷ {denominator.toLocaleString("en-NG")} verified members</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-navy-500">Today&apos;s referral allocation</dt><dd className="mt-1 font-display text-2xl tabular text-navy-950">{formatNaira(allocationKobo / 100)}</dd><dd className="text-xs text-navy-500">{config.allocationBps / 100}% of today&apos;s actual contribution pool ({formatNaira(v.todayPoolKobo / 100)})</dd></div>
          </dl>
          <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50/60 p-4 text-sm text-navy-800">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-gold-700" aria-hidden /> Your estimated share today: {formatNaira(estimate.amountKobo / 100)} <span className="font-normal text-navy-500">(estimate — {v.eligibleToday} eligible referral{v.eligibleToday === 1 ? "" : "s"} contributed today)</span></p>
            <p className="mt-1 text-xs leading-relaxed text-navy-600">Only real contributions actually received count. Before launch there is no contribution pool, so there is nothing to share. After launch, if approved, each of your verified referrals who contributes on a day would count — at ₦100 a day that works out to about ₦1 per contributing referral per day. An estimate is never a payable reward.</p>
            <div className="mt-3"><StatusBadge kind="pending" label={config.rewardsState === "active" ? "Rewards active" : "Rewards start after approval"} /></div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title={<span className="flex items-center gap-2">Verified referrals · last 30 days {v.user.is_demo && <DemoTag />}</span>}>
          <BarChart title="Verified referrals per day, last 30 days" data={v.daily.map((d) => ({ label: String(d.date.getDate()), value: d.value, detail: fmtDate(d.date) }))} everyNthLabel={3} height={190} />
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Share2 className="h-4 w-4 text-gold-600" aria-hidden /> Sharing statistics</span>}>
          {shares.length === 0 ? <p className="text-sm text-navy-500">No shares yet. Use the buttons above — we count shares by channel (never who you shared with).</p> : (
            <ul className="space-y-2.5">
              {shares.map((c) => (
                <li key={c.channel} className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="capitalize text-navy-700">{c.channel.replace(/_/g, " ")}</span>
                  <span className="h-2 rounded-full bg-navy-50"><span className="block h-2 rounded-full bg-[var(--color-series-1)]" style={{ width: `${(c.n / Math.max(...shares.map((x) => x.n))) * 100}%` }} /></span>
                  <span className="text-right font-medium tabular">{c.n}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-navy-500">{totalShares} share actions · {invited} link visits</p>
        </Panel>
      </div>

      <Panel className="mt-6" title={<span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold-600" aria-hidden /> Referral activity</span>} action={<span className="text-xs text-navy-500">Most recent 25 · names shortened for privacy</span>}>
        <Table head={["Member", "Joined", "How", "Status", ""]} minWidth={620}>
          {v.recent.map((r) => (
            <tr key={r.id} className="align-top">
              <td className={`${td} font-medium text-navy-950`}>{maskName(r.full_name)}</td>
              <td className={td}>{fmtDate(r.created_at)}</td>
              <td className={`${td} text-navy-600`}>{r.source === "manual_code" ? "Typed your code" : r.source === "campaign" ? "Campaign link" : "Your link"}</td>
              <td className={td}>
                <Pill value={r.status === "under_review" ? "investigating" : r.status} />
                <p className="mt-1 text-xs text-navy-500">{r.status === "rejected" && r.decision_reason ? r.decision_reason : r.status === "under_review" && r.risk_flags.length ? `Checking: ${r.risk_flags.map((f) => FLAG_TEXT[f] ?? f).join(", ")}` : STATUS_HELP[r.status]}</p>
              </td>
              <td className={td}>{r.status === "rejected" && (r.appeal_status ? <span className="text-xs text-navy-500">Appeal {r.appeal_status}</span> : <AppealForm referralId={r.id} />)}</td>
            </tr>
          ))}
          {v.recent.length === 0 && <tr><td colSpan={5} className={`${td} py-10 text-center text-navy-500`}>No referrals yet — share your link to get started.</td></tr>}
        </Table>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Reward history">
          {v.rewards.length === 0 ? (
            <p className="text-sm text-navy-500">No rewards. Referral rewards are inactive until TBC launches and the programme is legally approved and funded.</p>
          ) : (
            <Table head={["Date", "Eligible", "Share", "Amount", "Status"]} minWidth={480}>
              {v.rewards.map((r, i) => (
                <tr key={i}><td className={td}>{fmtDate(r.run_date)}</td><td className={`${td} tabular`}>{r.eligible_referrals}</td><td className={`${td} tabular`}>{(Number(r.share_ppm) / 10_000).toFixed(4)}%</td><td className={`${td} tabular`}>{formatNaira(Number(r.amount_kobo) / 100)}</td><td className={td}><Pill value={r.status} /></td></tr>
              ))}
            </Table>
          )}
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-600">
            <li className="rounded-lg bg-mist p-2"><strong className="text-navy-900">Estimated</strong> — calculated, not payable</li>
            <li className="rounded-lg bg-mist p-2"><strong className="text-navy-900">Approved</strong> — signed off by finance</li>
            <li className="rounded-lg bg-mist p-2"><strong className="text-navy-900">Funded</strong> — money received and set aside</li>
            <li className="rounded-lg bg-mist p-2"><strong className="text-navy-900">Paid</strong> — sent to your verified account</li>
          </ul>
        </Panel>
        <Panel title="Leaderboard privacy">
          <LeaderboardPrefs optIn={v.user.leaderboard_opt_in} alias={v.user.leaderboard_alias ?? ""} preview={maskName(v.user.full_name)} />
        </Panel>
      </div>
    </>
  );
}
