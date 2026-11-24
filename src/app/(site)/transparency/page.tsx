import type { Metadata } from "next";
import { BadgeCheck, BookOpen, Briefcase, FileBarChart, FileSearch, Gavel, Landmark, PieChart, Shuffle } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ADOPTED, runModel, formatNaira } from "@/lib/finance/model";

export const metadata: Metadata = { title: "Transparency", description: "Everything we will publish: where the money goes, independent audits, how winners are chosen, payments and jobs created." };

const SECTIONS = [
  { Icon: BookOpen, t: "Every payment recorded", b: "Every payment is recorded permanently, checked against the bank every day, and shown on your own statement.", publish: "Monthly" },
  { Icon: PieChart, t: "Where the money went", b: "How each month’s money was actually shared — and an explanation if anything differs from the plan.", publish: "Monthly" },
  { Icon: FileSearch, t: "Independent audit", b: "An outside auditing firm checks all our accounts. We publish their full report.", publish: "Every year" },
  { Icon: Shuffle, t: "How winners are chosen", b: "Who can win, how the random draw works, who watches it, and a record anyone can check.", publish: "Before the first draw" },
  { Icon: BadgeCheck, t: "Proof every winner was paid", b: "The amount, date and state of every award paid. Winners are only named if they agree.", publish: "After every draw" },
  { Icon: Briefcase, t: "How the businesses are doing", b: "What each business does, how much was invested, and how it’s performing — good news and bad.", publish: "Every 3 months" },
  { Icon: FileBarChart, t: "Jobs created", b: "Jobs created, wages paid, members hired and local suppliers used — checked by an outside reviewer.", publish: "Every 3 months" },
  { Icon: Landmark, t: "Full yearly accounts", b: "Complete accounts for every part of TBC — the prize fund, the business fund, the community fund and the company.", publish: "Every year" },
  { Icon: Gavel, t: "Who’s in charge", b: "Our board, the members’ council, any conflicts of interest and a safe way to report wrongdoing.", publish: "Always available" },
];

export default function Transparency() {
  const s = ADOPTED;
  const r = runModel(s.inputs);
  return (
    <>
      <PageHero eyebrow="Transparency" title={<>If it touches your money, <span className="gold-text">you’ll see it.</span></>} lead="Once we launch, this is where we’ll publish audited accounts, where the money went, draw results and jobs created. Until then, here’s exactly what you can expect." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Members", "0"],
              ["Money received", "₦0"],
              ["Awards paid", "0"],
              ["Audits completed", "0"],
            ].map(([k, v]) => (
              <Card key={k} className="!p-5">
                <p className="text-xs uppercase tracking-wider text-navy-500">{k}</p>
                <p className="mt-2 font-display text-3xl text-navy-950 tabular">{v}</p>
                <p className="mt-1 text-xs text-navy-500">Real figure today</p>
              </Card>
            ))}
          </div>
          <SectionHeading className="mt-16" eyebrow="Our promise" title="Nine things we will always publish." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((x) => (
              <Card key={x.t} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3"><x.Icon className="h-6 w-6 text-gold-600" aria-hidden /><StatusBadge kind="proposed" /></div>
                <h3 className="mt-4 text-lg font-medium text-navy-950">{x.t}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{x.b}</p>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-xs">
                  <span className="text-navy-500">How often: <strong className="text-navy-800">{x.publish}</strong></span>
                  <span className="text-navy-400">Starts after launch</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Sneak preview" title="What a monthly report will look like." />
            <StatusBadge kind="demo" label="Example — not real figures" />
          </div>
          <Card className="mt-10 !p-8">
            <div className="flex flex-wrap justify-between gap-4 border-b border-navy-100 pb-6">
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Report period</p><p className="mt-1 font-medium text-navy-950">Example month</p></div>
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Money received (example)</p><p className="mt-1 font-medium text-navy-950 tabular">{formatNaira(r.grossMonthly)}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Auditor</p><p className="mt-1 font-medium text-navy-950">Not yet appointed</p></div>
            </div>
            <div className="mt-6"><AllocationChart allocation={s.allocation} gross={r.grossMonthly} /></div>
          </Card>
          <Callout tone="warning" title="We will never make up numbers" className="mt-8">Until we launch, there are no real audits, winners or results to show. When there are, each one will come with its source document.</Callout>
        </div>
      </section>
    </>
  );
}
