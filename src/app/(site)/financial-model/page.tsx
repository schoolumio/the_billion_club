import type { Metadata } from "next";
import { AlertTriangle, ArrowRightLeft, Coins, HandCoins, Landmark, Layers, PiggyBank, Receipt } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { Calculator } from "@/components/finance/Calculator";
import { SCENARIOS, formatCount, formatNaira, formatOdds, runModel } from "@/lib/finance/model";

export const metadata: Metadata = {
  title: "Financial model & sustainability",
  description: "A transparent, critical examination of the 10 million × ₦100 daily model, award scenarios and a sustainable allocation policy.",
};

const verdictStyle: Record<string, string> = {
  "Not viable": "bg-red-50 text-red-800 ring-red-200",
  "Viable with conditions": "bg-sky-50 text-sky-800 ring-sky-200",
  Recommended: "bg-gold-50 text-gold-800 ring-gold-300",
  "Requires growth": "bg-violet-50 text-violet-800 ring-violet-200",
};

const MONEY_TYPES = [
  { Icon: Coins, t: "Member contribution", b: "A payment a member makes to participate. It is not a deposit, a loan, a savings product or an investment, and carries no promised return. Refund and withdrawal rights must be set out in approved terms." },
  { Icon: HandCoins, t: "Prize or award", b: "A sum paid to a member selected under the approved process. Legally regulated as a lottery prize, promotional prize or other award depending on the licensing route — this is the single most important legal question." },
  { Icon: Layers, t: "Business investment", b: "Capital placed into a venture in exchange for equity, debt or revenue share, with risk of loss. Must sit in a separately regulated vehicle with independent management, never mixed with the award pool." },
  { Icon: Landmark, t: "Community development fund", b: "Non-repayable grants for skills, infrastructure and supplier development, governed like a foundation with published criteria. Not a return to members." },
  { Icon: Receipt, t: "Operating expense", b: "The costs of running the organisation: staff, technology, payments, audit, compliance. Capped as a share of inflow and published in full." },
];

export default function FinancialModel() {
  const concept = runModel(SCENARIOS[0].inputs);
  const at80 = runModel({ ...SCENARIOS[0].inputs, participationRate: 0.8 });

  return (
    <>
      <PageHero
        eyebrow="Financial model & sustainability"
        title={<>Ambition, tested against <span className="gold-text">arithmetic.</span></>}
        lead="Before anyone contributes a naira, the numbers must work for every party: members, beneficiaries, regulators and the businesses we intend to build. This page shows our working — including where the original concept breaks."
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="The critical finding" title="30 awards of ₦1 billion cannot coexist with anything else." />
            <div className="prose-tbc">
              <p>At 10 million members contributing ₦100 every day for 30 days, gross inflow is <strong>{formatNaira(concept.grossMonthly, { compact: true })}</strong>. Thirty awards of ₦1 billion cost exactly <strong>{formatNaira(concept.awardCost, { compact: true })}</strong> — <strong>100%</strong> of inflow.</p>
              <p>That leaves zero for payment processing (unavoidable on every transaction), statutory levies and tax, independent audit, staff and technology, reserves, business development capital and community investment.</p>
              <p>It also assumes perfect participation. At a more realistic 80% daily participation, inflow is {formatNaira(at80.grossMonthly, { compact: true })} and the awards alone would exceed it by {formatNaira(-at80.nonAwardFunds, { compact: true })} every month — an unfunded obligation from day one.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Callout tone="warning" title="Why this matters legally, not just financially">
              A scheme that promises payouts it cannot fund from its own inflow depends on new money to pay earlier promises.
              That is the defining feature of a Ponzi-type scheme, which Nigerian law prohibits. Award commitments must therefore always be
              <strong> funded from verified, already-collected inflow</strong>, never from projected growth.
            </Callout>
            <Card>
              <p className="flex items-center gap-2 font-medium text-navy-950"><AlertTriangle className="h-4 w-4 text-gold-600" aria-hidden /> Other risks in the original model</p>
              <ul className="mt-4 space-y-3 text-sm text-navy-700">
                <li><strong>Micro-payment costs.</strong> Collecting ₦100 three hundred and sixty-five times a year per member multiplies transaction fees, failures and reconciliation work. <em>Proposal:</em> allow weekly or monthly pre-funding recorded daily, or mandate-based direct debit.</li>
                <li><strong>Participation volatility.</strong> Inflow will vary with salaries, festive seasons and economic shocks. <em>Proposal:</em> award tiers scale automatically to verified inflow; a reserve absorbs shortfalls.</li>
                <li><strong>Selection odds.</strong> With 30 selections among 10 million, monthly odds are about {formatOdds(concept.monthlySelectionOdds)}. <em>Proposal:</em> communicate odds plainly; make the ecosystem benefit real for everyone.</li>
                <li><strong>Concentration risk.</strong> ₦1 billion to an individual without support can fail. <em>Proposal:</em> optional business development support and financial-literacy onboarding for every beneficiary.</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Scenarios" title="Four ways forward — and their trade-offs." lead="We have not silently changed the ₦1 billion award or the 30-beneficiary target. Each scenario below shows what it takes to keep one or both." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {SCENARIOS.map((s) => {
              const r = runModel(s.inputs);
              return (
                <Card key={s.id} className={`!p-7 ${s.verdict === "Recommended" ? "ring-2 ring-gold-400" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-medium text-navy-950">{s.name}</h3>
                      <p className="mt-1 text-sm text-navy-500">{s.tagline}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${verdictStyle[s.verdict]}`}>{s.verdict}</span>
                  </div>
                  <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div><dt className="text-xs text-navy-500">Members</dt><dd className="mt-1 font-semibold tabular">{formatCount(s.inputs.members, true)}</dd></div>
                    <div><dt className="text-xs text-navy-500">Monthly inflow</dt><dd className="mt-1 font-semibold tabular">{formatNaira(r.grossMonthly, { compact: true })}</dd></div>
                    <div><dt className="text-xs text-navy-500">Award pool</dt><dd className="mt-1 font-semibold tabular">{s.allocation.awards}%</dd></div>
                  </dl>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.awards.map((a) => (
                      <li key={a.label} className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs text-navy-800"><span className="font-semibold tabular">{a.count} × {formatNaira(a.amount, { compact: true, decimals: 0 })}</span> {a.label.toLowerCase()}</li>
                    ))}
                  </ul>
                  <div className="mt-6"><AllocationChart allocation={s.allocation} gross={r.grossMonthly} compact /></div>
                  <ul className="mt-6 space-y-2 border-t border-navy-100 pt-5 text-sm text-navy-700">
                    {s.tradeOffs.map((t) => <li key={t} className="flex gap-2"><ArrowRightLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />{t}</li>)}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Recommended allocation policy" title="Every naira has a job — published in advance." />
            <StatusBadge kind="proposed" label="Proposed — subject to legal, tax and actuarial review" />
          </div>
          <Card className="mt-10 !p-8"><AllocationChart allocation={SCENARIOS[2].allocation} gross={runModel(SCENARIOS[2].inputs).grossMonthly} /></Card>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Callout title="Awards float with reality">Each month&apos;s award tiers are set from the previous month&apos;s verified, reconciled inflow — never from projections.</Callout>
            <Callout title="Hard cap on operating costs">Operations, processing and assurance are capped at 14% combined. Any underspend flows to the reserve.</Callout>
            <Callout title="Reserve target">The reserve builds to three months of award obligations, then surplus moves to community development.</Callout>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Interactive model" title="Test the assumptions yourself." lead="Move the sliders to see how membership, contribution, participation and award design interact." />
          <div className="mt-12"><Calculator /></div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Clear definitions" title="Five kinds of money. Never blurred." lead="Confusing these categories is how well-meaning schemes become illegal ones. We keep them legally, operationally and in reporting completely separate." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {MONEY_TYPES.map((m) => (
              <Card key={m.t} className="!p-6">
                <m.Icon className="h-6 w-6 text-gold-600" aria-hidden />
                <h3 className="mt-4 text-lg font-medium text-navy-950">{m.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{m.b}</p>
              </Card>
            ))}
          </div>
          <Callout tone="gold" title="What would make 30 × ₦1 billion possible" className="mt-10">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>25 million</strong> daily contributors at ₦100 (Scenario D), or</li>
              <li><strong>₦250 per day</strong> from 10 million members, or</li>
              <li><strong>≈ ₦18 billion per month</strong> in disclosed, non-conditional sponsor or partner co-funding of the award pool, or</li>
              <li>A combination — introduced as <em>milestones unlocked by verified growth</em>, never as a launch promise.</li>
            </ul>
          </Callout>
          <p className="mt-6 flex items-center gap-2 text-xs text-navy-500"><PiggyBank className="h-4 w-4" aria-hidden /> All figures are projections from stated assumptions and are not forecasts of actual results.</p>
        </div>
      </section>
    </>
  );
}
