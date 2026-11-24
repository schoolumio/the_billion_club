import type { Metadata } from "next";
import { PageHero, SectionHeading, Card, Callout, LinkButton } from "@/components/ui/primitives";
import { EcosystemDiagram } from "@/components/home/EcosystemDiagram";

export const metadata: Metadata = { title: "How it all connects", description: "How members, winners, businesses, jobs and communities connect — and how everyone benefits, not just the winners." };

const flows = [
  { from: "Members", to: "Independent bank", what: "Daily payments, recorded and held separately from our own money." },
  { from: "Prize money (60%)", to: "30 winners", what: "Awards paid to verified members chosen in the monthly draw." },
  { from: "Winners", to: "Our business team", what: "Free, optional help to turn an award into a lasting business." },
  { from: "Business fund (12%)", to: "New businesses", what: "Investment in businesses that have been properly checked first." },
  { from: "New businesses", to: "Members", what: "Jobs, supplier contracts and training — members hear first." },
  { from: "Community fund (5%)", to: "Communities", what: "Grants for skills, local projects and helping local suppliers grow." },
];

export default function Ecosystem() {
  return (
    <>
      <PageHero eyebrow="How it all connects" title={<>One community. <span className="gold-text">Many ways to win.</span></>} lead="A few members win big every month. But the money also builds businesses, creates jobs and supports communities — so the whole circle grows." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading align="center" eyebrow="Tap to explore" title="Follow the money, step by step." className="mb-12" />
          <EcosystemDiagram tone="light" />
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Where it flows" title="Who gets what — and why." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-navy-100 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-navy-950 text-xs uppercase tracking-wider text-navy-200">
                <tr><th className="px-5 py-4 font-medium">From</th><th className="px-5 py-4 font-medium">To</th><th className="px-5 py-4 font-medium">What happens</th></tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.what} className="border-t border-navy-100">
                    <td className="px-5 py-4 font-medium text-navy-950">{f.from}</td>
                    <td className="px-5 py-4 text-navy-800">{f.to}</td>
                    <td className="px-5 py-4 text-navy-600">{f.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card><h3 className="text-lg font-medium text-navy-950">If you don&apos;t win</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">You hear first about jobs, supplier contracts and training from the businesses we back. You see where every naira goes. And community projects support the place you live.</p></Card>
            <Card><h3 className="text-lg font-medium text-navy-950">If you win</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">Your award is paid straight to your verified bank account. If you want, our business team helps you plan, register and run a business that lasts.</p></Card>
            <Card><h3 className="text-lg font-medium text-navy-950">For Nigeria</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">Money owned by Nigerians, invested in Nigerian businesses, creating Nigerian jobs — with every result published.</p></Card>
          </div>
          <Callout tone="warning" title="To be clear" className="mt-10">Jobs and contracts depend on the businesses doing well. They&apos;re goals we will work for, measure and report on — not something we can promise to any one person.</Callout>
          <div className="mt-10 text-center"><LinkButton href="/join" arrow>Join the founding community</LinkButton></div>
        </div>
      </section>
    </>
  );
}
