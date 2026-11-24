import type { Metadata } from "next";
import { AlertTriangle, ArrowRightLeft, Coins, DoorClosed, HandCoins, Landmark, Layers, PiggyBank, Receipt } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { Calculator } from "@/components/finance/Calculator";
import { ADOPTED, AWARD_TIERS, DAILY_PLACES, SCENARIOS, adoptedAwards, formatCount, formatNaira, formatOdds, runModel } from "@/lib/finance/model";

export const metadata: Metadata = {
  title: "Where the money goes",
  description: "The adopted 60/40 model: 30 winners a month (3 × ₦1bn + 27 × ₦556m), 10 million daily places, and a fully funded business and jobs ecosystem.",
};

const verdictStyle: Record<string, string> = {
  "Doesn’t work": "bg-red-50 text-red-800 ring-red-200",
  "Works, but": "bg-sky-50 text-sky-800 ring-sky-200",
  "Our choice": "bg-gold-50 text-gold-800 ring-gold-300",
};

const MONEY_TYPES = [
  { Icon: Coins, t: "Your daily payment", b: "The ₦100 you pay for a daily place. It is not a deposit, a loan, savings or an investment, and it earns no return." },
  { Icon: HandCoins, t: "Winners’ awards", b: "60% of each month’s money, paid to the 30 winners chosen in the approved draw." },
  { Icon: Layers, t: "Business fund", b: "12% that backs new businesses. It can lose money, so it is managed separately by regulated professionals." },
  { Icon: Landmark, t: "Community fund", b: "5% for training and local projects. These are grants — not loans, and not returns to members." },
  { Icon: Coins, t: "Referral rewards", b: "1% of each day’s money, shared by members based on the real people they personally invited. Only one level. Starts only after approval." },
  { Icon: Receipt, t: "Running costs", b: "Bank charges, staff, technology and auditors. Capped at 9% and published in full." },
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
        eyebrow="Where the money goes"
        title={<>60% to winners. 40% to <span className="gold-text">build what lasts.</span></>}
        lead="30 winners every month — three of them win ₦1 billion each. Paid only from money we have actually received. Plus a business fund that creates jobs for everyone else."
      >
        <StatusBadge kind="proposed" label="Adopted by founders · subject to legal, tax and regulatory review" />
      </PageHero>

      {/* HEADLINE */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="A full month" title="What happens when every place is taken." lead={`${formatCount(DAILY_PLACES)} daily places × ₦100 × 30 days = ${formatNaira(r.grossMonthly, { compact: true })}.`} />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="!border-gold-300 !bg-gold-50/50 !p-8">
              <div className="flex items-baseline justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-800">For winners · 60%</p><p className="font-display text-3xl tabular text-navy-950">{formatNaira(r.grossMonthly * 0.6, { compact: true })}</p></div>
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
              <div className="flex items-baseline justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Everything else · 40%</p><p className="font-display text-3xl tabular">{formatNaira(teamShare, { compact: true })}</p></div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {[
                  ["Business fund", 12, "Backs businesses that create jobs"],
                  ["Taxes & government levies", 8, "Our estimate — to be confirmed"],
                  ["Emergency reserve", 5, "Savings for slow months"],
                  ["Referral rewards", 1, "For members who invite others"],
                  ["Community projects", 5, "Training & local projects"],
                  ["Staff & technology", 5, "Running TBC"],
                  ["Bank & payment charges", 3, "On every payment"],
                  ["Auditors & oversight", 1, "Outside checks"],
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
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-medium text-navy-950">Every naira, accounted for</p><StatusBadge kind="projection" /></div>
            <div className="mt-6"><AllocationChart allocation={ADOPTED.allocation} gross={r.grossMonthly} /></div>
          </Card>
        </div>
      </section>

      {/* DAILY PLACES */}
      <section className="bg-navy-950 py-20 text-white sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading tone="light" eyebrow="Daily places" title="Anyone can join. 10 million places a day." lead="Each day, the first 10 million members to take a place are in. When they’re gone, the day closes — and opens again tomorrow." />
            <ul className="mt-8 space-y-3 text-sm text-navy-200">
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />One place per person per day. No bulk buying. No agents.</li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />Every day you hold a place is one entry into that month&apos;s draw. <StatusBadge kind="pending" className="ml-1" /></li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />The month can never collect more than {formatNaira(r.grossMonthly, { compact: true })}, so the prize money is predictable and easy to check.</li>
              <li className="flex gap-3"><DoorClosed className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />If more than 10 million people want a place, every place is taken — which keeps the awards at full size.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Today&apos;s places · example only</p>
            <p className="mt-4 font-display text-4xl tabular">7,240,118 <span className="text-lg text-navy-300">/ 10,000,000</span></p>
            <div className="mt-4 h-3 rounded-full bg-white/10"><div className="h-3 w-[72.4%] rounded-full bg-gold-400" /></div>
            <p className="mt-3 text-sm text-navy-300">2,759,882 places remaining today</p>
            <p className="mt-6 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-navy-300">Example only — not live data. We&apos;ll show you honestly how many places are left. No countdown clocks, no &ldquo;last chance&rdquo; pressure.</p>
          </div>
        </div>
      </section>

      {/* AWARDS FOLLOW COLLECTIONS */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Our golden rule" title="We only pay out money we’ve actually received." lead="Winners share 60% of what was really collected that month — never a fixed promise. That keeps TBC safe, fair and legal." />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="font-medium text-navy-950">If not every place is taken</p>
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
              <p className="font-medium text-navy-950">While we’re still growing</p>
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
            <Callout title="Your chance of winning">With 30 winners and 10 million daily places, if you take a place every day your chance is about <strong>{formatOdds(r.monthlySelectionOdds)}</strong> a month. We&apos;ll always say so plainly.</Callout>
            <Callout title="Why the business fund matters">Winners can spend their awards however they like. The business fund (about ₦3.6bn a month) makes sure new businesses and jobs happen anyway.</Callout>
            <Callout tone="warning" title="Still being confirmed">The 8% for taxes and government levies is our best estimate. We&apos;ll update it once tax experts give their formal ruling.</Callout>
          </div>
        </div>
      </section>

      {/* SCENARIOS */}
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="How we chose this model" title="We tested four options." lead="Here’s what we looked at — and why we chose 60/40." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {SCENARIOS.map((s) => {
              const sr = runModel(s.inputs);
              return (
                <Card key={s.id} className={`!p-7 ${s.verdict === "Our choice" ? "ring-2 ring-gold-400" : ""}`}>
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
          <Callout tone="warning" title="Why 30 winners of ₦1 billion each didn’t work" className="mt-8">
            <span className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />It would take every naira collected, leaving nothing for bank charges, taxes or staff. And promising more than we collect would mean paying old promises with new members’ money — that’s how Ponzi schemes work, and it’s illegal.</span>
          </Callout>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Try it yourself" title="Play with the numbers." lead="Change how many people join and how often they take a place, and see what happens to the awards." />
          <div className="mt-12"><Calculator /></div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Kept separate" title="Six kinds of money. Never mixed." lead="Mixing these up is how good ideas turn into bad schemes. We keep each one separate — in law, in our accounts and in our reports." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MONEY_TYPES.map((m) => (
              <Card key={m.t} className="!p-6"><m.Icon className="h-6 w-6 text-gold-600" aria-hidden /><h3 className="mt-4 text-lg font-medium text-navy-950">{m.t}</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">{m.b}</p></Card>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-navy-500"><PiggyBank className="h-4 w-4" aria-hidden /> All figures are estimates based on the assumptions shown. They are not forecasts of actual results.</p>
        </div>
      </section>
    </>
  );
}
