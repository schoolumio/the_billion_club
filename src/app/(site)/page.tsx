import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, Award, BadgeCheck, Briefcase, Building2, Eye, FileSearch, Landmark, Link2, Scale, Share2, ShieldCheck, Sprout, Trophy, UserPlus, Users } from "lucide-react";
import { Card, Eyebrow, LinkButton, SectionHeading, StatusBadge, Callout } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { EcosystemDiagram } from "@/components/home/EcosystemDiagram";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ADOPTED, runModel, formatCount, formatNaira, formatOdds } from "@/lib/finance/model";
import { ROADMAP } from "@/lib/content/roadmap";
import { HOW_IT_WORKS } from "@/lib/content/how";
import { waitlistProgress } from "@/lib/referrals/server";

export const metadata: Metadata = { title: { absolute: "The Billionaire Circle — 10 million people. One shared vision." } };

const targets = [
  { value: "10,000,000", label: "Places every day", note: "Anyone can join" },
  { value: "₦100", label: "For a daily place", note: "Planned price" },
  { value: "30", label: "Winners every month", note: "3 of them win ₦1bn" },
  { value: "60%", label: "Goes to winners", note: "40% builds jobs & runs TBC" },
];

export const revalidate = 300; // live waitlist counter refreshes every 5 minutes

const TARGET = 10_000_000;

export default async function Home() {
  const r = runModel(ADOPTED.inputs);
  const progress = await waitlistProgress().catch(() => null);
  const verified = progress?.verified ?? null;
  const pct = verified !== null ? Math.min(100, (verified / TARGET) * 100) : 0;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 pt-28 text-white sm:pt-36">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden />
        <div className="absolute left-1/2 top-[-20rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-navy-600/30 blur-3xl" aria-hidden />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />

        <div className="container-x relative grid gap-14 pb-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pb-28">
          <div>
            <div className="animate-fade-up">
              <Eyebrow tone="light">Nigeria&apos;s community wealth movement</Eyebrow>
            </div>
            <h1 className="mt-6 animate-fade-up text-[2.6rem] font-medium leading-[1.02] [animation-delay:80ms] sm:text-6xl lg:text-[4.6rem]">
              10 million people.
              <br />
              One shared vision.
              <br />
              <span className="gold-text">A new generation of wealth.</span>
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-navy-200 [animation-delay:160ms]">
              ₦100 a day. 10 million people. 30 life-changing winners every month — and new businesses that create jobs for
              everyone else. Join the founding community free, today.
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <LinkButton href="/join" variant="gold" arrow>Join the waitlist — free</LinkButton>
              <LinkButton href="#movement" variant="outline-light">See how it works</LinkButton>
            </div>
            <p className="mt-8 flex max-w-xl animate-fade-up items-start gap-2 text-xs leading-relaxed text-navy-300 [animation-delay:320ms]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
              We haven&apos;t launched yet. We are not taking any money, no one has won anything yet, and we won&apos;t start until we are fully licensed.
            </p>
          </div>

          {/* Ambition panel */}
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold-400/20 via-transparent to-navy-400/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">The plan at full size</p>
                <StatusBadge kind="target" label="Targets — not yet reached" />
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
                {targets.map((t) => (
                  <div key={t.label} className="bg-navy-950/80 p-4 sm:p-5">
                    <dt className="text-[0.7rem] uppercase tracking-wider text-navy-300">{t.label}</dt>
                    <dd className="mt-2 font-display text-2xl text-white tabular sm:text-3xl">{t.value}</dd>
                    <dd className="mt-1 text-[0.7rem] text-navy-400">{t.note}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-2xl border border-gold-400/25 bg-gold-500/[0.07] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Joined so far · live</p>
                  <Link href="/join" className="text-xs font-semibold text-gold-200 underline-offset-2 hover:underline">Join →</Link>
                </div>
                <p className="mt-2 font-display text-3xl text-white tabular">
                  {verified === null ? "—" : formatCount(verified)} <span className="text-base text-navy-300">verified people</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={TARGET} aria-valuenow={verified ?? 0} aria-label="Progress towards 10 million verified waitlist members">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${Math.max(pct, verified ? 0.8 : 0)}%` }} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-300">Only real people who have confirmed their email are counted. The numbers above are goals — we&apos;ll publish real, audited results once we launch.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-x relative pb-10">
          <a href="#movement" className="mx-auto flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-navy-300 hover:text-white">
            Scroll to learn more <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
          </a>
        </div>
      </section>

      {/* PRINCIPLES STRIP */}
      <section className="border-b border-navy-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 text-sm text-navy-700 lg:grid-cols-4">
          {[
            { Icon: Landmark, t: "Money held by an independent bank" },
            { Icon: FileSearch, t: "Checked by outside auditors" },
            { Icon: Eye, t: "Draw rules published in advance" },
            { Icon: Scale, t: "No launch without approval" },
          ].map(({ Icon, t }) => (
            <div key={t} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
              <span className="font-medium">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* THE IDEA */}
      <section id="movement" className="scroll-mt-28 bg-white py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="The idea"
            title={<>Small on your own. <span className="text-gold-600">Unstoppable together.</span></>}
            lead="Almost anyone can spare ₦100. When 10 million people do it together, it adds up to ₦1 billion a day — owned by Nigerians, working for Nigerians, and run in the open."
          />
          <Reveal className="mt-14">
            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.2fr]">
              {[
                { k: "10,000,000", l: "daily places" },
                { k: "×", l: "" },
                { k: "₦100", l: "per day" },
                { k: "=", l: "" },
                { k: "₦1,000,000,000", l: "every single day" },
              ].map((x, i) =>
                x.l ? (
                  <Card key={i} className="flex flex-col justify-center !p-8">
                    <p className="font-display text-4xl text-navy-950 tabular sm:text-5xl lg:text-[2.05rem] xl:text-5xl">{x.k}</p>
                    <p className="mt-2 text-sm uppercase tracking-wider text-navy-500">{x.l}</p>
                  </Card>
                ) : (
                  <p key={i} className="flex items-center justify-center font-display text-4xl text-gold-500" aria-hidden>{x.k}</p>
                ),
              )}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-navy-500"><StatusBadge kind="projection" /> When all 10 million daily places are taken, before costs. Anyone can join; places are limited to 10 million a day.</p>
          </Reveal>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="What makes us different"
            title="You don’t have to win to benefit."
            lead="Most schemes reward a lucky few and leave everyone else with nothing. We’re building the opposite: when the community grows, members grow with it."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Award, title: "Life-changing awards", body: "30 winners every month, chosen fairly in a public draw. Three of them receive ₦1 billion each.", tag: "For winners" },
              { Icon: Building2, title: "Businesses that last", body: "Our business team helps winners turn their money into real, well-run businesses — not one-off spending.", tag: "For the economy" },
              { Icon: Briefcase, title: "Jobs for members", body: "Those businesses hire and buy locally — and members hear about jobs, contracts and training first.", tag: "For everyone" },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <Card className="h-full !p-8 transition-transform duration-500 hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-gold-300"><p.Icon className="h-6 w-6" aria-hidden /></div>
                  <h3 className="mt-6 text-2xl font-medium text-navy-950">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-navy-600">{p.body}</p>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gold-700">{p.tag}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <blockquote className="rounded-3xl bg-navy-950 px-8 py-10 text-center sm:px-16">
              <p className="mx-auto max-w-3xl font-display text-2xl leading-snug text-white sm:text-3xl">
                “Winning shouldn’t be the only reason to join. When the community grows, you should grow too.”
              </p>
              <footer className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">What we believe</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* FOUNDING COMMUNITY */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white sm:py-28">
        <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden />
        <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading tone="light" eyebrow="Join the founding community" title={<>10 million people. <span className="gold-text">One invitation at a time.</span></>} lead="Right now, we’re building the community. Join free, get your own invite link, and bring the people you trust. Every real person counts." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/join" arrow>Join the waitlist</LinkButton>
              <LinkButton href="/leaderboard" variant="outline-light">See the leaderboard</LinkButton>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-navy-300">Free to join. Not an investment. Only people you invite yourself count — never their invites. Referral rewards are planned, but won’t start until we’re approved and launched.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              { Icon: UserPlus, t: "Join in a minute", b: "It’s free. Confirm your email and your place is secured." },
              { Icon: Link2, t: "Get your invite link", b: "Plus your own QR code and a ready-made invitation card." },
              { Icon: Share2, t: "Share with your circle", b: "Send it on WhatsApp, Facebook, X, Telegram or email in one tap." },
              { Icon: Trophy, t: "Climb the levels", b: "From Circle Starter to TBC Growth Legend. Only real, confirmed people count." },
            ].map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 80} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between"><x.Icon className="h-6 w-6 text-gold-300" aria-hidden /><span className="font-display text-sm text-gold-400 tabular">0{i + 1}</span></div>
                <h3 className="mt-4 text-lg font-medium">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-300">{x.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* HOW IT WORKS PREVIEW */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="How it works" title="Seven simple steps." lead="From joining to building businesses that create jobs." />
            <LinkButton href="/how-it-works" variant="outline" arrow>See every step</LinkButton>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 60} className={`bg-white p-7 ${i === 6 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <p className="font-display text-sm text-gold-600 tabular">0{i + 1}</p>
                <s.Icon className="mt-4 h-6 w-6 text-navy-800" aria-hidden />
                <h3 className="mt-4 text-lg font-medium text-navy-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.short}</p>
              </Reveal>
            ))}
            <li className="hidden bg-navy-950 p-7 text-white lg:block">
              <p className="font-display text-xl leading-snug">Then it starts again — with a stronger community every month.</p>
              <Link href="/ecosystem" className="mt-6 inline-block text-sm font-semibold text-gold-300 hover:text-gold-200">See how it all connects →</Link>
            </li>
          </ol>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white sm:py-32">
        <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
        <div className="container-x relative">
          <SectionHeading tone="light" eyebrow="How it all connects" title="Wealth that keeps creating wealth." lead="Tap any step to see what happens — and where the money goes." />
          <div className="mt-14"><EcosystemDiagram /></div>
        </div>
      </section>

      {/* FINANCIAL HONESTY */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Where the money goes"
              title="Clear numbers. Nothing hidden."
              lead="60% of every month’s money goes to the 30 winners. The other 40% runs the organisation properly and pays for businesses, jobs and community projects. We only pay out money we have actually received."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="border-gold-300 !bg-gold-50/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-800">Winners · 60%</p>
                <p className="mt-3 font-display text-3xl text-navy-950">₦18bn</p>
                <p className="mt-1 text-sm text-navy-600">3 winners get ₦1bn each. 27 winners get about ₦556m each.</p>
              </Card>
              <Card className="!border-navy-900 !bg-navy-950 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Everything else · 40%</p>
                <p className="mt-3 font-display text-3xl">₦12bn</p>
                <p className="mt-1 text-sm text-navy-200">Including ₦3.6bn a month to back businesses that create jobs.</p>
              </Card>
            </div>
            <p className="mt-6 text-sm text-navy-600">
              Let&apos;s be honest: if you take a place every day, your chance of winning in a month is about <strong className="tabular">{formatOdds(r.monthlySelectionOdds)}</strong>.
              That&apos;s exactly why the jobs, contracts and community projects matter so much.
            </p>
            <LinkButton href="/financial-model" variant="navy" arrow className="mt-8">See the full numbers</LinkButton>
          </div>
          <Reveal>
            <Card className="!p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-navy-950">How each month’s money is shared</p>
                <StatusBadge kind="pending" />
              </div>
              <p className="mt-1 text-sm text-navy-500">Based on {formatNaira(r.grossMonthly, { compact: true })} a month — every daily place taken</p>
              <div className="mt-6"><AllocationChart allocation={ADOPTED.allocation} gross={r.grossMonthly} /></div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading align="center" eyebrow="Built on trust" title="Don’t just trust us. Check us." lead="These protections are planned for launch. None is running yet — and we’ll always tell you which is which." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Landmark, t: "Your money, held safely", b: "An independent, regulated bank holds members’ money in a separate account — not us." },
              { Icon: FileSearch, t: "Checked by outsiders", b: "Outside auditors check our accounts every year. We publish their full report." },
              { Icon: Eye, t: "A draw you can check", b: "Rules published in advance. Independent observers at every draw. Results anyone can verify." },
              { Icon: BadgeCheck, t: "Real winners, real payments", b: "Awards go only to verified bank accounts, and every payment is confirmed publicly." },
              { Icon: Users, t: "Members have a voice", b: "Elected members sit on an advisory council and can raise concerns directly with the board." },
              { Icon: Sprout, t: "Results you can see", b: "We count the jobs and businesses created — and an outside reviewer checks our numbers." },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 60}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <x.Icon className="h-6 w-6 text-gold-600" aria-hidden />
                    <StatusBadge kind="proposed" />
                  </div>
                  <h3 className="mt-5 text-xl font-medium text-navy-950">{x.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{x.b}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><LinkButton href="/transparency" variant="outline" arrow>See what we’ll publish</LinkButton></div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="Our roadmap" title="Approval first. Then we grow." lead="We won’t collect a single naira until we’re licensed and an independent bank is in place to hold the money." />
          <ol className="relative mt-14 grid gap-6 lg:grid-cols-5">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-gold-500 via-navy-200 to-navy-100 lg:block" aria-hidden />
            {ROADMAP.map((p, i) => (
              <Reveal as="li" key={p.phase} delay={i * 80} className="relative">
                <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold ${i === 0 ? "border-gold-500 bg-gold-500 text-navy-950" : "border-navy-200 bg-white text-navy-500"}`}>{i}</span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-navy-500">{p.phase} · {p.when}</p>
                <h3 className="mt-2 text-xl font-medium text-navy-950">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{p.body}</p>
                <p className={`mt-3 text-xs font-semibold ${i === 0 ? "text-gold-700" : "text-navy-400"}`}>{p.status}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white sm:py-28">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
        <div className="container-x relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow tone="light">Your place is waiting</Eyebrow>
            <h2 className="mt-5 text-4xl font-medium leading-tight sm:text-5xl">Together, we build wealth. <span className="gold-text">Together, we change lives.</span></h2>
          </div>
          <div className="space-y-5">
            <p className="text-lg text-navy-200">Join the founding community today. It’s free, it takes a minute, and you’ll get your own link to invite the people you care about.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/join" arrow>Join the waitlist</LinkButton>
              <LinkButton href="/how-it-works" variant="outline-light">How it works</LinkButton>
            </div>
            <Callout tone="gold" title="Protect yourself" className="!border-gold-400/30 !bg-white/5 [&_p]:!text-gold-100 [&_div]:!text-navy-200">
              We are not taking any money. If anyone asks you to pay to join The Billionaire Circle, it’s a scam — please report it.
            </Callout>
          </div>
        </div>
      </section>
    </>
  );
}
