import type { Metadata } from "next";
import { AlertTriangle, ArrowRightLeft, Coins, DoorClosed, HandCoins, Landmark, Layers, PiggyBank, Receipt } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { Calculator } from "@/components/finance/Calculator";
import { ADOPTED, AWARD_TIERS, DAILY_PLACES, SCENARIOS, adoptedAwards, formatCount, formatNaira, formatOdds, runModel } from "@/lib/finance/model";

export const metadata: Metadata = {
  title: "Financial model & sustainability",
  description: "The adopted 60/40 model: 30 winners a month (3 × ₦1bn + 27 × ₦556m), 10 million daily places, and a fully funded business and jobs ecosystem.",
};

const verdictStyle: Record<string, string> = {
  "Not viable": "bg-red-50 text-red-800 ring-red-200",
  "Viable with conditions": "bg-sky-50 text-sky-800 ring-sky-200",
  Adopted: "bg-gold-50 text-gold-800 ring-gold-300",
};

const MONEY_TYPES = [
  { Icon: Coins, t: "Member contribution", b: "The ₦100 paid for a daily place. Not a deposit, loan, savings product or investment, and carries no promised return." },
  { Icon: HandCoins, t: "Prize or award", b: "Paid to members selected under the approved process — 60% of each month's verified inflow. Its legal treatment depends on the licensing route." },
  { Icon: Layers, t: "Business investment", b: "The 12% business fund. Risk-bearing capital in a separately regulated vehicle — never mixed with the award pool." },
  { Icon: Landmark, t: "Community development fund", b: "The 5% community fund. Non-repayable grants for skills and local projects. Not a return to members." },
  { Icon: Receipt, t: "Operating expense", b: "Bank charges, staff, technology, audit. Capped at 9% of inflow and published in full." },
];

const PARTICIPATION = [1, 0.8, 0.6];
const GROWTH = [1_000_000, 3_000_000, 5_000_000, 10_000_000];

export default function FinancialModel() {
  const r = runModel(ADOPTED.inputs);
  const full = adoptedAwards(r.grossMonthly);
  const teamShare = r.grossMonthly * 0.4;

  return (
    <>
      <PageHero
        eyebrow="Financial model & sustainability"
        title={<>60% to winners. 40% to <span className="gold-text">build what lasts.</span></>}
        lead="Thirty winners every month — three of them receiving ₦1 billion — funded only from money already collected, with a ring-fenced business fund that creates jobs whatever winners decide to do with their awards."
      >
        <StatusBadge kind="proposed" label="Adopted by founders · subject to legal, tax and regulatory review" />
      </PageHero>

      {/* HEADLINE */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="The model at full capacity" title="One month, every place sold." lead={`${formatCount(DAILY_PLACES)} daily places × ₦100 × 30 days = ${formatNaira(r.grossMonthly, { compact: true })}.`} />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="!border-gold-300 !bg-gold-50/50 !p-8">
              <div className="flex items-baseline justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-800">Winners · 60%</p><p className="font-display text-3xl tabular text-navy-950">{formatNaira(r.grossMonthly * 0.6, { compact: true })}</p></div>
              <table className="mt-6 w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-navy-500"><tr><th className="pb-2 text-left font-medium">Level</th><th className="pb-2 text-right font-medium">Winners</th><th className="pb-2 text-right font-medium">Each</th><th className="pb-2 text-right font-medium">Total</th></tr></thead>
                <tbody className="divide-y divide-gold-200/60">
                  <tr><td className="py-3 font-medium text-navy-950">Grand award</td><td className="py-3 text-right tabular">{full.grand.count}</td><td className="py-3 text-right tabular">{formatNaira(full.grand.amount, { compact: true })}</td><td className="py-3 text-right font-medium tabular">{formatNaira(full.grand.count * full.grand.amount, { compact: true })}</td></tr>
                  <tr><td className="py-3 font-medium text-navy-950">Enterprise award</td><td className="py-3 text-right tabular">{full.enterprise.count}</td><td className="py-3 text-right tabular">≈ {formatNaira(full.enterprise.amount, { compact: true, decimals: 0 })}</td><td className="py-3 text-right font-medium tabular">{formatNaira(full.enterprise.count * full.enterprise.amount, { compact: true })}</td></tr>
                  <tr><td className="py-3 font-semibold text-navy-950">Total</td><td className="py-3 text-right font-semibold tabular">30</td><td /><td className="py-3 text-right font-semibold tabular">{formatNaira(full.pool, { compact: true })}</td></tr>
                </tbody>
              </table>
            </Card>
            <Card className="!bg-navy-950 !p-8 text-white">
              <div className="flex items-baseline justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Team · 40%</p><p className="font-display text-3xl tabular">{formatNaira(teamShare, { compact: true })}</p></div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {[
                  ["Business development fund", 12, "Jobs whatever winners decide"],
                  ["Government levies & taxes", 8, "Estimate — pending tax opinion"],
                  ["Emergency reserve", 6, "Protects winners in slow months"],
                  ["Community development", 5, "Training & local projects"],
                  ["Staff, technology, support", 5, "Running the organisation"],
                  ["Bank & payment charges", 3, "On every payment"],
                  ["Auditors & oversight", 1, "Independent checks"],
                ].map(([l, p, n]) => (
                  <li key={l as string} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-3 border-b border-white/10 pb-2.5 last:border-0">
                    <span><span className="font-medium">{l}</span><span className="block text-xs text-navy-300">{n}</span></span>
                    <span className="text-xs text-navy-300 tabular">{p}%</span>
                    <span className="w-16 text-right font-medium tabular">{formatNaira((r.grossMonthly * (p as number)) / 100, { compact: true })}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card className="mt-6 !p-8">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-medium text-navy-950">Complete allocation of every naira</p><StatusBadge kind="projection" /></div>
            <div className="mt-6"><AllocationChart allocation={ADOPTED.allocation} gross={r.grossMonthly} /></div>
          </Card>
        </div>
      </section>

      {/* DAILY PLACES */}
      <section className="bg-navy-950 py-20 text-white sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading tone="light" eyebrow="Daily places" title="Unlimited members. 10 million places a day." lead="Anyone can register. Each day, the first 10 million verified members to take a place are in — then the day closes, and opens again tomorrow." />
            <ul className="mt-8 space-y-3 text-sm text-navy-200">
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />One place per verified person per day — no bulk buying, no agents.</li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />Each day you hold a place counts as one entry in that month&apos;s selection. <StatusBadge kind="pending" className="ml-1" /></li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />Monthly inflow can never exceed {formatNaira(r.grossMonthly, { compact: true })}, so the award pool is predictable and easy to audit.</li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />If demand exceeds 10 million, every place sells — removing the biggest risk to the model.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Today&apos;s places · illustration</p>
            <p className="mt-4 font-display text-4xl tabular">7,240,118 <span className="text-lg text-navy-300">/ 10,000,000</span></p>
            <div className="mt-4 h-3 rounded-full bg-white/10"><div className="h-3 w-[72.4%] rounded-full bg-gold-400" /></div>
            <p className="mt-3 text-sm text-navy-300">2,759,882 places remaining today</p>
            <p className="mt-6 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-navy-300">Illustration only — not live data. We will show factual availability, never countdown pressure or &ldquo;last chance&rdquo; messaging. Advertising and consumer-protection regulators scrutinise pressure selling, and members&apos; trust matters more than urgency.</p>
          </div>
        </div>
      </section>

      {/* AWARDS FOLLOW COLLECTIONS */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="The golden rule" title="Awards follow money already collected." lead="Winners receive 60% of what was actually collected that month — never a fixed promise. This keeps the initiative solvent and lawful." />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="font-medium text-navy-950">If not every place is sold</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="text-xs uppercase tracking-wider text-navy-500"><tr className="border-b border-navy-100"><th className="py-2 text-left font-medium">Places sold</th><th className="py-2 text-right font-medium">Collected</th><th className="py-2 text-right font-medium">Grand (×3)</th><th className="py-2 text-right font-medium">Enterprise (×27)</th></tr></thead>
                  <tbody>{PARTICIPATION.map((p) => { const g = runModel({ ...ADOPTED.inputs, participationRate: p }).grossMonthly; const a = adoptedAwards(g); return (
                    <tr key={p} className="border-b border-navy-50"><td className="py-2.5">{p * 100}%</td><td className="py-2.5 text-right tabular">{formatNaira(g, { compact: true })}</td><td className="py-2.5 text-right tabular">{a.tiered ? formatNaira(a.grand.amount, { compact: true }) : "—"}</td><td className="py-2.5 text-right font-medium tabular">{formatNaira(a.enterprise.amount, { compact: true, decimals: 0 })}</td></tr>
                  ); })}</tbody>
                </table>
              </div>
            </Card>
            <Card>
              <p className="font-medium text-navy-950">While the community is growing</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="text-xs uppercase tracking-wider text-navy-500"><tr className="border-b border-navy-100"><th className="py-2 text-left font-medium">Daily members</th><th className="py-2 text-right font-medium">Collected</th><th className="py-2 text-right font-medium">Award structure</th></tr></thead>
                  <tbody>{GROWTH.map((m) => { const g = runModel({ ...ADOPTED.inputs, members: m }).grossMonthly; const a = adoptedAwards(g); return (
                    <tr key={m} className="border-b border-navy-50"><td className="py-2.5 tabular">{formatCount(m, true)}</td><td className="py-2.5 text-right tabular">{formatNaira(g, { compact: true })}</td><td className="py-2.5 text-right font-medium tabular">{a.tiered ? `3 × ₦1bn + 27 × ${formatNaira(a.enterprise.amount, { compact: true, decimals: 0 })}` : `30 × ${formatNaira(a.enterprise.amount, { compact: true, decimals: 0 })}`}</td></tr>
                  ); })}</tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-navy-500">Grand awards begin once the monthly award pool reaches {formatNaira(AWARD_TIERS.minPoolForGrand, { compact: true })}; below that, the 30 awards are shared equally.</p>
            </Card>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Callout title="Chance of selection">With 30 winners among 10 million daily places, a member holding a place every day has roughly a <strong>{formatOdds(r.monthlySelectionOdds)}</strong> chance each month. We will state this plainly.</Callout>
            <Callout title="Why the business fund matters">Winners own their awards and cannot be forced to invest. The 12% fund (≈₦3.6bn/month) means businesses and jobs are created regardless.</Callout>
            <Callout tone="warning" title="Still to confirm">The 8% for levies and taxes is an estimate. If a tax opinion finds it higher, the team&apos;s 40% becomes tight — confirm early.</Callout>
          </div>
        </div>
      </section>

      {/* SCENARIOS */}
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="How we got here" title="Four models considered." lead="The original concept, and the alternatives tested before adopting the 60/40 model." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {SCENARIOS.map((s) => {
              const sr = runModel(s.inputs);
              return (
                <Card key={s.id} className={`!p-7 ${s.verdict === "Adopted" ? "ring-2 ring-gold-400" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h3 className="text-xl font-medium text-navy-950">{s.name}</h3><p className="mt-1 text-sm text-navy-500">{s.tagline}</p></div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${verdictStyle[s.verdict]}`}>{s.verdict}</span>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.awards.map((a) => <li key={a.label} className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs text-navy-800"><span className="font-semibold tabular">{a.count} × {formatNaira(a.amount, { compact: true, decimals: 0 })}</span> {a.label.toLowerCase()}</li>)}
                  </ul>
                  <div className="mt-6"><AllocationChart allocation={s.allocation} gross={sr.grossMonthly} compact /></div>
                  <ul className="mt-6 space-y-2 border-t border-navy-100 pt-5 text-sm text-navy-700">
                    {s.tradeOffs.map((t) => <li key={t} className="flex gap-2"><ArrowRightLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />{t}</li>)}
                  </ul>
                </Card>
              );
            })}
          </div>
          <Callout tone="warning" title="Why the original 30 × ₦1bn could not work" className="mt-8">
            <span className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />It needs 100% of inflow, leaving nothing for costs. Promising awards that exceed money actually collected means paying earlier promises with later money — the structure of a Ponzi scheme, which Nigerian law prohibits.</span>
          </Callout>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Interactive model" title="Test the assumptions yourself." lead="Change registrations, participation and contribution to see how the 60/40 model responds." />
          <div className="mt-12"><Calculator /></div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Clear definitions" title="Five kinds of money. Never blurred." lead="Confusing these categories is how well-meaning schemes become illegal ones. We keep them legally, operationally and in reporting completely separate." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {MONEY_TYPES.map((m) => (
              <Card key={m.t} className="!p-6"><m.Icon className="h-6 w-6 text-gold-600" aria-hidden /><h3 className="mt-4 text-lg font-medium text-navy-950">{m.t}</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">{m.b}</p></Card>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-navy-500"><PiggyBank className="h-4 w-4" aria-hidden /> All figures are projections from stated assumptions and are not forecasts of actual results.</p>
        </div>
      </section>
    </>
  );
}
