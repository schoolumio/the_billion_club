import Link from "next/link";
import { Activity, ArrowRight, BadgeCheck, CalendarCheck, Flame, Gift, Hourglass, MailWarning, Megaphone, Trophy, Wallet } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { announcements, getMember, memberDaily, memberSummary, opportunities, ventures } from "@/lib/db/queries";
import { DemoTag, Panel, Pill, Stat, fmtDate } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { formatNaira } from "@/lib/finance/model";
import { getConfig, memberReferralView } from "@/lib/referrals/server";
import { levelFor } from "@/lib/referrals/config";
import { referralUrl } from "@/lib/referrals/codes";
import { CopyBlock } from "@/components/waitlist/CopyBlock";

export default async function MemberOverview({ searchParams }: { searchParams: Promise<{ welcome?: string; denied?: string }> }) {
  const sp = await searchParams;
  const s = await requirePermission("member:dashboard");
  const [m, sum, daily, ann, opps, vens, ref, { config }] = await Promise.all([getMember(s.sub), memberSummary(s.sub), memberDaily(s.sub, 30), announcements(4), opportunities(), ventures(), memberReferralView(s.sub), getConfig()]);
  const link = ref ? referralUrl(config.baseUrl, ref.user.referral_code) : "";
  const lvl = levelFor(ref?.counts.verified ?? 0, config.levels);
  if (!m) return null;

  return (
    <>
      {sp.denied && <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">You do not have permission to view that area.</p>}
      {sp.welcome && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Welcome to The Billionaire Circle. Your interest is registered — we will never ask you for payment during pre-launch.</p>}

      <div className="relative mb-8 overflow-hidden rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Member {m.member_no}</p>
            <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Good to see you, {m.full_name.split(" ")[0]}.</h1>
            <p className="mt-2 text-sm text-navy-200">Member since {fmtDate(m.created_at, { month: "long", year: "numeric" })} · {m.state ?? "State not set"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">Verification: <strong className="capitalize">{m.verification}</strong></span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">Account: <strong className="capitalize">{m.status}</strong></span>
          </div>
        </div>
      </div>

      {ref && (
        <section aria-labelledby="fc-title" className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="fc-title" className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal text-navy-950"><Gift className="h-4 w-4 text-gold-600" aria-hidden />Your founding-community place</h2>
              {ref.user.email_verified_at
                ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200"><BadgeCheck className="h-3.5 w-3.5" aria-hidden />Place secured</span>
                : <Link href="/dashboard/referrals" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200"><MailWarning className="h-3.5 w-3.5" aria-hidden />Verify your email</Link>}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Your invitation link</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl bg-mist px-3 py-2.5 text-xs text-navy-900 sm:text-sm">{link}</code>
              <CopyBlock text={link} channel="copy" label="Copy link" />
            </div>
            <Link href="/dashboard/referrals" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">Share on WhatsApp, download your card &amp; QR <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat tone="navy" label="Verified referrals" value={ref.counts.verified.toLocaleString("en-NG")} hint={`${ref.counts.pending} pending`} icon={<BadgeCheck className="h-4 w-4 text-gold-300" />} />
            <Stat label="Level" value={<span className="text-xl">{lvl.current?.name ?? "—"}</span>} hint={lvl.next ? `${lvl.remaining} to ${lvl.next.name}` : "Top level"} icon={<Trophy className="h-4 w-4 text-gold-600" />} />
          </div>
        </section>
      )}

      <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-navy-500">Contribution preview <DemoTag /></h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total recorded" value={formatNaira(sum.total)} hint={<>{sum.count} simulated entries <DemoTag /></>} icon={<Wallet className="h-4 w-4 text-gold-600" />} />
        <Stat label="Places held (30d)" value={`${sum.activeDays30}/30`} hint="Days you secured a daily place" icon={<CalendarCheck className="h-4 w-4 text-gold-600" />} />
        <Stat label="Current streak" value={`${sum.streak} days`} hint={sum.last ? `Last entry ${fmtDate(sum.last)}` : "No entries yet"} icon={<Flame className="h-4 w-4 text-gold-600" />} />
        <Stat tone="navy" label="Entries this month" value={sum.monthEntries} hint="Proposed: one entry per day you hold a place · selection rules awaiting approval" icon={<Hourglass className="h-4 w-4 text-gold-300" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title={<span className="flex items-center gap-2">Contribution activity · last 30 days <DemoTag /></span>} action={<Link href="/dashboard/contributions" className="text-xs font-semibold text-navy-600 hover:text-navy-950">View statement →</Link>}>
          <BarChart title="Daily recorded contributions, last 30 days (simulated)" data={daily.map((d) => ({ label: d.date.getDate().toString(), value: d.value, detail: fmtDate(d.date) }))} format="naira" everyNthLabel={3} height={200} />
          <p className="mt-3 text-xs text-navy-500">Simulated ledger entries for demonstration. No real money has been collected.</p>
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-gold-600" aria-hidden /> Official announcements</span>}>
          <ul className="space-y-4">
            {ann.map((a) => (
              <li key={a.id} className="border-b border-navy-50 pb-4 last:border-0 last:pb-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold-700">{a.category} · {fmtDate(a.published_at)}</p>
                <p className="mt-1 text-sm font-medium text-navy-950">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-600">{a.body}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Community & employment opportunities" action={<Link href="/dashboard/opportunities" className="text-xs font-semibold text-navy-600 hover:text-navy-950">All opportunities →</Link>}>
          <ul className="divide-y divide-navy-50">
            {opps.slice(0, 4).map((o) => (
              <li key={o.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <div><p className="text-sm font-medium text-navy-950">{o.title}</p><p className="text-xs text-navy-500">{o.organisation} · {o.location}</p></div>
                <span className="flex items-center gap-1.5"><Pill value={o.kind === "employment" ? "open" : "pending"} />{o.is_demo && <DemoTag />}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Activity className="h-4 w-4 text-gold-600" aria-hidden /> Business development updates</span>}>
          <ul className="divide-y divide-navy-50">
            {vens.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <div><p className="text-sm font-medium text-navy-950">{v.name}</p><p className="text-xs text-navy-500">{v.sector} · {v.state}</p></div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-navy-700">{v.stage}{v.is_demo && <DemoTag />}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy-500">Illustrative pipeline. No ventures have been funded.</p>
        </Panel>
      </div>
    </>
  );
}
