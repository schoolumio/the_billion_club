import Link from "next/link";
import { clsx } from "clsx";
import {
  ArrowRight, BadgeCheck, Briefcase, CalendarCheck, Check, Download, Flame, Hourglass, MailWarning, Megaphone, Share2, Sprout, Wallet,
} from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { announcements, getMember, memberDaily, memberSummary, opportunities, ventures } from "@/lib/db/queries";
import { DemoTag, EmptyState, Panel, Stat, fmtDate } from "@/components/app/ui";
import { BarChart } from "@/components/charts/BarChart";
import { formatNaira } from "@/lib/finance/model";
import { getConfig, memberReferralView } from "@/lib/referrals/server";
import { levelFor } from "@/lib/referrals/config";
import { referralUrl } from "@/lib/referrals/codes";
import { CopyBlock } from "@/components/waitlist/CopyBlock";

const KIND_LABEL: Record<string, string> = { employment: "Job", supplier: "Supplier", training: "Training", business: "Business" };

export default async function MemberHome({ searchParams }: { searchParams: Promise<{ welcome?: string; denied?: string }> }) {
  const sp = await searchParams;
  const s = await requirePermission("member:dashboard");
  const [m, sum, daily, ann, opps, vens, ref, { config }] = await Promise.all([
    getMember(s.sub), memberSummary(s.sub), memberDaily(s.sub, 30), announcements(4), opportunities(), ventures(), memberReferralView(s.sub), getConfig(),
  ]);
  if (!m || !ref) return null;

  const link = referralUrl(config.baseUrl, ref.user.referral_code);
  const lvl = levelFor(ref.counts.verified, config.levels);
  const verified = !!ref.user.email_verified_at;
  const shared = (ref.stats?.shares ?? 0) > 0 || ref.channels.some((c) => c.kind === "share");
  const steps = [
    { done: true, title: "Join the founding community", body: "You're in. Welcome!" },
    { done: verified, title: "Confirm your email", body: "This secures your place.", href: "/dashboard/referrals" },
    { done: shared, title: "Share your invite link", body: "WhatsApp works best.", href: "/dashboard/referrals" },
    { done: ref.counts.verified > 0, title: "Get your first referral", body: "When a friend joins and confirms their email.", href: "/dashboard/referrals" },
    { done: ref.user.leaderboard_opt_in, title: "Join the leaderboard (optional)", body: "Show your first name to the community.", href: "/dashboard/referrals" },
  ];
  const doneCount = steps.filter((x) => x.done).length;

  return (
    <>
      {sp.denied && <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">You don&apos;t have permission to view that area.</p>}
      {sp.welcome && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Welcome to The Billionaire Circle! You&apos;re in. We&apos;ll never ask you to pay anything before launch.</p>}

      {!verified && (
        <Link href="/dashboard/referrals" className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 transition hover:bg-amber-100/60">
          <MailWarning className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1"><strong>One more step:</strong> confirm your email ({ref.user.email}) to secure your place.</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      )}

      {/* HERO */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-navy-950 text-white">
        <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-300">Member {m.member_no}</p>
            <h1 className="mt-2 text-[1.75rem] font-medium leading-tight sm:text-4xl">Your place in the circle{verified ? " is secured." : "."}</h1>
            <p className="mt-2 text-sm text-navy-200">Joined {fmtDate(m.created_at, { day: "numeric", month: "long", year: "numeric" })}{m.state ? ` · ${m.state}` : ""}</p>
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-gold-200">{lvl.current?.name ?? "Getting started"}</span>
                <span className="text-xs text-navy-300">{lvl.next ? `${lvl.remaining} more to ${lvl.next.name}` : "Highest level reached"}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lvl.progress * 100)} aria-label="Progress to your next level">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${Math.max(3, lvl.progress * 100)}%` }} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/dashboard/referrals" className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"><Share2 className="h-4 w-4" aria-hidden />Invite friends</Link>
              <a href="/api/referral-card" download className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><Download className="h-4 w-4" aria-hidden />My invite card</a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-300">Your invite link</p>
            <p className="mt-2 break-all rounded-xl bg-navy-950/60 px-3 py-2.5 font-mono text-xs text-navy-100">{link}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-navy-300">Code <span className="font-mono font-semibold tracking-wider text-gold-200">{ref.user.referral_code}</span></span>
              <CopyBlock text={link} channel="copy" label="Copy link" />
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
              <div><dt className="text-[0.65rem] uppercase tracking-wider text-navy-300">Joined</dt><dd className="mt-1 font-display text-xl tabular">{ref.counts.verified}</dd></div>
              <div><dt className="text-[0.65rem] uppercase tracking-wider text-navy-300">Waiting</dt><dd className="mt-1 font-display text-xl tabular">{ref.counts.pending + ref.counts.under_review}</dd></div>
              <div><dt className="text-[0.65rem] uppercase tracking-wider text-navy-300">Rank</dt><dd className="mt-1 font-display text-xl tabular">{ref.stats?.rank ? `#${ref.stats.rank}` : "—"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* NEXT STEPS + ANNOUNCEMENTS */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <Panel title="Your next steps" description={`${doneCount} of ${steps.length} done`} action={<span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-800 tabular">{Math.round((doneCount / steps.length) * 100)}%</span>}>
          <ol className="space-y-2">
            {steps.map((st) => {
              const inner = (
                <>
                  <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2", st.done ? "border-good bg-good text-white" : "border-navy-200 text-navy-300")}>{st.done ? <Check className="h-4 w-4" aria-hidden /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <span className={clsx("block text-sm font-medium", st.done ? "text-navy-500 line-through decoration-navy-300" : "text-navy-950")}>{st.title}</span>
                    {!st.done && <span className="block text-xs text-navy-500">{st.body}</span>}
                  </span>
                  {!st.done && st.href && <ArrowRight className="h-4 w-4 shrink-0 text-navy-400" aria-hidden />}
                  <span className="sr-only">{st.done ? "(done)" : "(to do)"}</span>
                </>
              );
              return (
                <li key={st.title}>
                  {!st.done && st.href
                    ? <Link href={st.href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-mist">{inner}</Link>
                    : <div className="flex items-center gap-3 px-2 py-2.5">{inner}</div>}
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-gold-600" aria-hidden />News from TBC</span>}>
          {ann.length === 0 ? <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No news yet" body="Official updates from TBC will appear here." /> : (
            <ul className="divide-y divide-navy-50">
              {ann.map((a) => (
                <li key={a.id} className="py-3.5 first:pt-0 last:pb-0">
                  <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-wider text-gold-700">{a.category}<span className="font-normal normal-case tracking-normal text-navy-400">· {fmtDate(a.published_at)}</span></p>
                  <p className="mt-1 text-sm font-semibold text-navy-950">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-600">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* OPPORTUNITIES + BUSINESSES */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gold-600" aria-hidden />Opportunities for members</span>} action={<Link href="/dashboard/opportunities" className="text-xs font-semibold text-navy-700 hover:text-navy-950">See all →</Link>}>
          {opps.length === 0 ? <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No opportunities yet" body="Jobs, supplier contracts and training from TBC-backed businesses will appear here first." /> : (
            <ul className="space-y-2">
              {opps.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center gap-3 rounded-xl border border-navy-100 p-3">
                  <span className="rounded-lg bg-navy-50 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-navy-700">{KIND_LABEL[o.kind] ?? o.kind}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-navy-950">{o.title}</span><span className="block truncate text-xs text-navy-500">{o.organisation} · {o.location}</span></span>
                  {o.is_demo && <DemoTag />}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Sprout className="h-4 w-4 text-gold-600" aria-hidden />Businesses in the pipeline</span>} description="Example businesses — none has been funded yet.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {vens.map((v) => (
              <li key={v.id} className="rounded-xl bg-mist p-3">
                <p className="truncate text-sm font-medium text-navy-950">{v.name.replace("Demo Venture · ", "")}</p>
                <p className="text-xs text-navy-500">{v.sector} · {v.state}</p>
                <p className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-semibold text-gold-800 ring-1 ring-gold-200">{v.stage}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* PAYMENT PREVIEW */}
      <section className="mt-10" aria-labelledby="pay-preview">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="pay-preview" className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-navy-500">Payment preview <DemoTag /></h2>
          <p className="text-xs text-navy-500">How your statement will look after launch. Sample data — no real money has been taken.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Stat label="Total paid" value={formatNaira(sum.total)} hint={`${sum.count} sample payments`} icon={<Wallet className="h-4 w-4 text-gold-700" />} />
          <Stat label="Places (30 days)" value={`${sum.activeDays30}/30`} hint="Days you held a place" icon={<CalendarCheck className="h-4 w-4 text-gold-700" />} />
          <Stat label="Current streak" value={`${sum.streak} days`} hint={sum.last ? `Last on ${fmtDate(sum.last)}` : "No payments yet"} icon={<Flame className="h-4 w-4 text-gold-700" />} />
          <Stat tone="navy" label="Draw entries" value={sum.monthEntries} hint="This month · starts after approval" icon={<Hourglass className="h-4 w-4 text-gold-300" />} />
        </div>
        <Panel className="mt-4" title="Daily places · last 30 days" action={<Link href="/dashboard/contributions" className="text-xs font-semibold text-navy-700 hover:text-navy-950">Full statement →</Link>}>
          <BarChart title="Sample daily payments, last 30 days" data={daily.map((d) => ({ label: d.date.getDate().toString(), value: d.value, detail: fmtDate(d.date) }))} format="naira" everyNthLabel={3} height={130} />
        </Panel>
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-navy-400"><BadgeCheck className="h-3.5 w-3.5" aria-hidden />We will never ask for your PIN, OTP or password — or ask you to pay into a personal account.</p>
    </>
  );
}
