import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, Award, BadgeCheck, Briefcase, Building2, Eye, FileSearch, Landmark, Scale, ShieldCheck, Sprout, Users } from "lucide-react";
import { Card, Eyebrow, LinkButton, SectionHeading, StatusBadge, Callout } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { EcosystemDiagram } from "@/components/home/EcosystemDiagram";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ADOPTED, runModel, formatNaira, formatOdds } from "@/lib/finance/model";
import { ROADMAP } from "@/lib/content/roadmap";
import { HOW_IT_WORKS } from "@/lib/content/how";

export const metadata: Metadata = { title: { absolute: "The Billionaire Circle — 10 million people. One shared vision." } };

const targets = [
  { value: "10,000,000", label: "Daily places", note: "Unlimited registration" },
  { value: "₦100", label: "Per daily place", note: "Proposed contribution" },
  { value: "30", label: "Winners every month", note: "3 × ₦1bn + 27 × ₦556m" },
  { value: "60%", label: "Of every naira to winners", note: "40% builds the ecosystem" },
];

export default function Home() {
  const r = runModel(ADOPTED.inputs);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 pt-32 text-white sm:pt-40">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden />
        <div className="absolute left-1/2 top-[-20rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-navy-600/30 blur-3xl" aria-hidden />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />

        <div className="container-x relative grid gap-14 pb-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pb-28">
          <div>
            <div className="animate-fade-up">
              <Eyebrow tone="light">A movement for shared prosperity</Eyebrow>
            </div>
            <h1 className="mt-6 animate-fade-up text-[2.6rem] font-medium leading-[1.02] [animation-delay:80ms] sm:text-6xl lg:text-[4.6rem]">
              10 million people.
              <br />
              One shared vision.
              <br />
              <span className="gold-text">A new generation of wealth.</span>
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-navy-200 [animation-delay:160ms]">
              Imagine a community where a small daily contribution helps build extraordinary opportunities, supports new
              businesses, creates jobs and transforms lives.
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <LinkButton href="#movement" variant="gold" arrow>Discover the Movement</LinkButton>
              <LinkButton href="/how-it-works" variant="outline-light">Explore How It Works</LinkButton>
            </div>
            <p className="mt-8 flex max-w-xl animate-fade-up items-start gap-2 text-xs leading-relaxed text-navy-300 [animation-delay:320ms]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
              Pre-launch. We are not collecting money, have not made any awards and do not yet hold the licences required to operate.
            </p>
          </div>

          {/* Ambition panel */}
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold-400/20 via-transparent to-navy-400/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">The ambition</p>
                <StatusBadge kind="target" label="Targets — not achievements" />
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
              <div className="mt-6 rounded-2xl border border-gold-400/20 bg-gold-500/[0.07] p-4">
                <p className="text-sm text-gold-100">
                  <span className="font-semibold">Members today: 0.</span> Every number above is a target. We will publish real,
                  audited figures only once we are licensed and live.
                </p>
              </div>
              <svg viewBox="0 0 300 70" className="mt-6 h-16 w-full" aria-hidden>
                <defs>
                  <linearGradient id="hero-g" x1="0" x2="1">
                    <stop offset="0" stopColor="#c89a24" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#e3c46a" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 30 }, (_, i) => {
                  const h = 6 + Math.pow(i / 29, 1.6) * 58;
                  return <rect key={i} x={i * 10 + 1} y={70 - h} width="6" height={h} rx="2" fill="url(#hero-g)" opacity={0.35 + i / 45} />;
                })}
              </svg>
              <p className="text-[0.7rem] text-navy-400">Illustrative: a community growing towards its target — not real data.</p>
            </div>
          </div>
        </div>

        <div className="container-x relative pb-10">
          <a href="#movement" className="mx-auto flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-navy-300 hover:text-white">
            Scroll to explore <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
          </a>
        </div>
      </section>

      {/* PRINCIPLES STRIP */}
      <section className="border-b border-navy-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 text-sm text-navy-700 lg:grid-cols-4">
          {[
            { Icon: Landmark, t: "Independent custody of funds" },
            { Icon: FileSearch, t: "Independent annual audit" },
            { Icon: Eye, t: "Published selection methodology" },
            { Icon: Scale, t: "Launch only after regulatory approval" },
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
            eyebrow="The big idea"
            title={<>Small, affordable, daily. <span className="text-gold-600">Together, extraordinary.</span></>}
            lead="₦100 is within reach of most Nigerian adults. Multiplied across a community of ten million, it becomes one of the largest pools of locally owned development capital in Africa — if it is governed with absolute integrity."
          />
          <Reveal className="mt-14">
            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.2fr]">
              {[
                { k: "10,000,000", l: "daily places" },
                { k: "×", l: "" },
                { k: "₦100", l: "per day" },
                { k: "=", l: "" },
                { k: "₦1,000,000,000", l: "potential daily inflow" },
              ].map((x, i) =>
                x.l ? (
                  <Card key={i} className="flex flex-col justify-center !p-8">
                    <p className="font-display text-4xl text-navy-950 tabular sm:text-5xl">{x.k}</p>
                    <p className="mt-2 text-sm uppercase tracking-wider text-navy-500">{x.l}</p>
                  </Card>
                ) : (
                  <p key={i} className="flex items-center justify-center font-display text-4xl text-gold-500" aria-hidden>{x.k}</p>
                ),
              )}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-navy-500"><StatusBadge kind="projection" /> Maximum daily inflow when every place is sold, before any costs. Registration is unlimited; places are capped at 10 million a day.</p>
          </Reveal>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why it is different"
            title="Being selected should not be the only reason to join."
            lead="Most schemes reward a lucky few and leave everyone else with nothing. We are designing the opposite: an ecosystem in which the economic growth created by the community flows back to its members."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Award, title: "Life-changing awards", body: "Members selected under an approved, independently observed process receive substantial awards — with a headline ambition of ₦1 billion.", tag: "Award" },
              { Icon: Building2, title: "Enterprises that last", body: "Our investment and business development arm helps beneficiaries turn awards into well-governed businesses rather than one-off spending.", tag: "Business investment" },
              { Icon: Briefcase, title: "Jobs and contracts for members", body: "Those businesses hire, buy and contract locally. Members get first notice of jobs, supplier opportunities and training.", tag: "Community benefit" },
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
                “Your opportunity to become wealthy should not be the only reason you join. The economic growth of the community should benefit you too.”
              </p>
              <footer className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Founding philosophy</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS PREVIEW */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="How it works" title="Seven clear steps from member to movement." />
            <LinkButton href="/how-it-works" variant="outline" arrow>See the full journey</LinkButton>
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
              <p className="font-display text-xl leading-snug">And the cycle begins again — with a stronger community each time.</p>
              <Link href="/ecosystem" className="mt-6 inline-block text-sm font-semibold text-gold-300 hover:text-gold-200">Explore the ecosystem →</Link>
            </li>
          </ol>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white sm:py-32">
        <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
        <div className="container-x relative">
          <SectionHeading tone="light" eyebrow="The community wealth ecosystem" title="Wealth creation that creates more wealth creation." lead="Select any part of the flywheel to see what happens at each stage — and what kind of money is involved." />
          <div className="mt-14"><EcosystemDiagram /></div>
        </div>
      </section>

      {/* FINANCIAL HONESTY */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Financial integrity"
              title="We did the maths. In public."
              lead="Sixty percent of every month's collections goes to thirty winners. Forty percent pays the costs of running honestly — and funds businesses, jobs and community projects so members benefit even if they are never selected. Awards always follow money already collected, never promises."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="border-gold-300 !bg-gold-50/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-800">Winners · 60%</p>
                <p className="mt-3 font-display text-3xl text-navy-950">₦18bn</p>
                <p className="mt-1 text-sm text-navy-600">3 × ₦1bn grand awards + 27 × ₦556m enterprise awards.</p>
              </Card>
              <Card className="!border-navy-900 !bg-navy-950 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Team · 40%</p>
                <p className="mt-3 font-display text-3xl">₦12bn</p>
                <p className="mt-1 text-sm text-navy-200">Including a ₦3.6bn business fund that creates jobs whatever winners decide.</p>
              </Card>
            </div>
            <p className="mt-6 text-sm text-navy-600">
              With every daily place sold, a member who holds a place every day has about a <strong className="tabular">{formatOdds(r.monthlySelectionOdds)}</strong> chance of selection each month.
              That is exactly why the ecosystem — jobs, contracts, community investment — must benefit the members who are never selected.
            </p>
            <LinkButton href="/financial-model" variant="navy" arrow className="mt-8">Explore the financial model</LinkButton>
          </div>
          <Reveal>
            <Card className="!p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-navy-950">Monthly allocation · 60/40 model</p>
                <StatusBadge kind="proposed" label="Adopted · pending approval" />
              </div>
              <p className="mt-1 text-sm text-navy-500">Of a projected {formatNaira(r.grossMonthly, { compact: true })} monthly inflow when all 10 million daily places are sold</p>
              <div className="mt-6"><AllocationChart allocation={ADOPTED.allocation} gross={r.grossMonthly} /></div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading align="center" eyebrow="Transparency & accountability" title="Trust is designed in, not promised." lead="Every safeguard below is a design commitment for launch. None is in operation yet, and we label them that way." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Landmark, t: "Independent custody", b: "Contributions held by a regulated custodian in segregated accounts, never by the operating company." },
              { Icon: FileSearch, t: "Independent audit", b: "Annual audited financial statements and quarterly reconciliation reports, published in full." },
              { Icon: Eye, t: "Observed selection", b: "Methodology published in advance; each selection independently observed and verifiable." },
              { Icon: BadgeCheck, t: "Verified awards", b: "Every award paid only after identity verification, with anonymised payment confirmation published." },
              { Icon: Users, t: "Member governance", b: "Member representatives on an advisory council; conflicts of interest declared and published." },
              { Icon: Sprout, t: "Impact reporting", b: "Jobs, businesses and suppliers measured with a published methodology and external review." },
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
          <div className="mt-10 text-center"><LinkButton href="/transparency" variant="outline" arrow>Visit the transparency centre</LinkButton></div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="Roadmap" title="Approval first. Scale second." lead="We will not collect a single naira before the legal structure, licences and custodial arrangements are in place." />
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
            <Eyebrow tone="light">Be part of the founding community</Eyebrow>
            <h2 className="mt-5 text-4xl font-medium leading-tight sm:text-5xl">Together, we build wealth. <span className="gold-text">Together, we change lives.</span></h2>
          </div>
          <div className="space-y-5">
            <p className="text-lg text-navy-200">Register your interest to receive verified updates as we progress through approvals. Registration is free and involves no payment.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/register" arrow>Register interest</LinkButton>
              <LinkButton href="/about#partner" variant="outline-light">Partner with us</LinkButton>
            </div>
            <Callout tone="gold" title="Protect yourself" className="!border-gold-400/30 !bg-white/5 [&_p]:!text-gold-100 [&_div]:!text-navy-200">
              We are not collecting money. Anyone asking you to pay to join The Billionaire Circle is not acting for us.
            </Callout>
          </div>
        </div>
      </section>
    </>
  );
}
