import type { Metadata } from "next";
import { PageHero, SectionHeading, Card, Callout } from "@/components/ui/primitives";
import { EcosystemDiagram } from "@/components/home/EcosystemDiagram";

export const metadata: Metadata = { title: "The community wealth ecosystem", description: "How contributions, awards, business development, jobs, suppliers and community investment connect." };

const flows = [
  { from: "Members", to: "Ring-fenced funds", what: "Daily contributions, recorded and held by an independent custodian." },
  { from: "Award pool", to: "Beneficiaries", what: "Awards paid to verified members selected under the approved process." },
  { from: "Beneficiaries", to: "Business arm", what: "Optional professional support under written, transparent agreements." },
  { from: "Business development fund", to: "Enterprises", what: "Co-investment in feasibility-tested ventures, through a separately regulated vehicle." },
  { from: "Enterprises", to: "Members", what: "Jobs, supplier contracts, franchise and service opportunities — member-first notice." },
  { from: "Community fund", to: "Communities", what: "Grants for skills, local infrastructure and supplier readiness." },
];

export default function Ecosystem() {
  return (
    <>
      <PageHero eyebrow="The community wealth ecosystem" title={<>One community. <span className="gold-text">Many ways to benefit.</span></>} lead="The ecosystem is designed so that value created by a few awards multiplies across the wider membership through businesses, jobs, supply chains and community investment." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x"><EcosystemDiagram tone="light" /></div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Value flows" title="Who benefits, and how." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-navy-100 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-navy-950 text-xs uppercase tracking-wider text-navy-200">
                <tr><th className="px-5 py-4 font-medium">From</th><th className="px-5 py-4 font-medium">To</th><th className="px-5 py-4 font-medium">What flows</th></tr>
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
            <Card><h3 className="text-lg font-medium text-navy-950">For members never selected</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">Priority access to jobs, supplier registration, training and franchise opportunities from ecosystem businesses; transparent reporting; community investment where you live.</p></Card>
            <Card><h3 className="text-lg font-medium text-navy-950">For beneficiaries</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">A legally approved award, plus optional access to feasibility studies, structuring, governance and mentorship to build something that lasts.</p></Card>
            <Card><h3 className="text-lg font-medium text-navy-950">For Nigeria</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">Locally owned capital formation, new enterprises, measurable job creation and stronger local supply chains.</p></Card>
          </div>
          <Callout tone="warning" title="An honest caveat" className="mt-10">Ecosystem benefits such as jobs and contracts depend on businesses being successfully established. They are goals we will measure and report — not entitlements or guaranteed returns.</Callout>
        </div>
      </section>
    </>
  );
}
