import type { Metadata } from "next";
import { BadgeCheck, BookOpen, Briefcase, FileBarChart, FileSearch, Gavel, Landmark, PieChart, Shuffle } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ADOPTED, runModel, formatNaira } from "@/lib/finance/model";

export const metadata: Metadata = { title: "Transparency & accountability", description: "Contribution accounting, fund allocation, audits, selection methodology, award verification and governance." };

const SECTIONS = [
  { Icon: BookOpen, t: "Contribution accounting", b: "Append-only ledger; daily reconciliation against custodian statements; personal statements for every member.", publish: "Monthly reconciliation summary" },
  { Icon: PieChart, t: "Fund allocation", b: "Published allocation policy; actual monthly allocation by fund versus policy, with explanations for any variance.", publish: "Monthly allocation report" },
  { Icon: FileSearch, t: "Independent audits", b: "External auditor appointed by the board's audit committee; full audit report and management letter published.", publish: "Annual audit report" },
  { Icon: Shuffle, t: "Beneficiary selection methodology", b: "Eligibility rules, certified random process, independent observers and a verifiable record of each selection.", publish: "Before first selection" },
  { Icon: BadgeCheck, t: "Verified award payments", b: "Anonymised confirmation of each award paid (amount, date, state, verification reference), with beneficiary consent for any publicity.", publish: "After each selection" },
  { Icon: Briefcase, t: "Business investment reports", b: "Each venture's sector, stage, capital committed, performance and write-downs.", publish: "Quarterly" },
  { Icon: FileBarChart, t: "Employment impact", b: "Jobs created and sustained, wages, member hires and supplier spend — methodology externally reviewed.", publish: "Quarterly" },
  { Icon: Landmark, t: "Annual financial statements", b: "Statements for each entity: operating company, award vehicle, business fund and foundation.", publish: "Annually" },
  { Icon: Gavel, t: "Governance & oversight", b: "Board composition, committee charters, member advisory council, conflicts register and whistle-blowing channel.", publish: "Ongoing" },
];

export default function Transparency() {
  const s = ADOPTED;
  const r = runModel(s.inputs);
  return (
    <>
      <PageHero eyebrow="Transparency centre" title={<>If it touches member money, <span className="gold-text">you will see it.</span></>} lead="This is where audited figures, allocation reports, selection records and impact data will be published once we are licensed and live. Until then, we show you exactly what will be published — and nothing we have not earned." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Members", "0"],
              ["Contributions received", "₦0"],
              ["Awards paid", "0"],
              ["Audits completed", "0"],
            ].map(([k, v]) => (
              <Card key={k} className="!p-5">
                <p className="text-xs uppercase tracking-wider text-navy-500">{k}</p>
                <p className="mt-2 font-display text-3xl text-navy-950 tabular">{v}</p>
                <p className="mt-1 text-xs text-navy-500">Actual · pre-launch</p>
              </Card>
            ))}
          </div>
          <SectionHeading className="mt-16" eyebrow="Reporting commitments" title="Nine things we will publish." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((x) => (
              <Card key={x.t} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3"><x.Icon className="h-6 w-6 text-gold-600" aria-hidden /><StatusBadge kind="proposed" /></div>
                <h3 className="mt-4 text-lg font-medium text-navy-950">{x.t}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{x.b}</p>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-xs">
                  <span className="text-navy-500">Cadence: <strong className="text-navy-800">{x.publish}</strong></span>
                  <span className="text-navy-400">No report yet</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Report preview" title="What a monthly allocation report will look like." />
            <StatusBadge kind="demo" label="Demonstration — based on the 60/40 model projection" />
          </div>
          <Card className="mt-10 !p-8">
            <div className="flex flex-wrap justify-between gap-4 border-b border-navy-100 pb-6">
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Report period</p><p className="mt-1 font-medium text-navy-950">Month 0 (illustrative)</p></div>
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Gross inflow (projected)</p><p className="mt-1 font-medium text-navy-950 tabular">{formatNaira(r.grossMonthly)}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-navy-500">Auditor</p><p className="mt-1 font-medium text-navy-950">To be appointed</p></div>
            </div>
            <div className="mt-6"><AllocationChart allocation={s.allocation} gross={r.grossMonthly} /></div>
          </Card>
          <Callout tone="warning" title="We will never fabricate" className="mt-8">No audit, winner, member count or financial result on this site is real until it is labelled “Actual” and accompanied by its source document.</Callout>
        </div>
      </section>
    </>
  );
}
