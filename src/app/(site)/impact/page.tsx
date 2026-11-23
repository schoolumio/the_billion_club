import type { Metadata } from "next";
import { Briefcase, Building2, Expand, HandHeart, MapPin, Truck, Users } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { ImpactDemo } from "@/components/charts/ImpactDemo";

export const metadata: Metadata = { title: "Community impact", description: "The long-term economic empowerment vision and how impact will be measured." };

const INDICATORS = [
  { Icon: Briefcase, t: "Jobs created", d: "Direct, full-time-equivalent roles in ecosystem businesses, sustained for at least 6 months." },
  { Icon: Building2, t: "Businesses established", d: "New, registered enterprises supported through the business development arm." },
  { Icon: Expand, t: "Businesses expanded", d: "Existing enterprises that grew revenue or headcount with ecosystem support." },
  { Icon: Users, t: "Members reached", d: "Verified members with access to opportunities, training or reporting." },
  { Icon: Truck, t: "Local suppliers engaged", d: "Nigerian suppliers with paid contracts from ecosystem businesses." },
  { Icon: MapPin, t: "Communities supported", d: "LGAs receiving community development fund grants." },
  { Icon: HandHeart, t: "Beneficiaries supported", d: "Award recipients who opted into business development support." },
];

export default function Impact() {
  return (
    <>
      <PageHero eyebrow="Community impact" title={<>Measured in jobs, enterprises <span className="gold-text">and lives changed.</span></>} lead="Our success will not be measured by how much we collect, but by the businesses built, the people employed and the communities strengthened. Here is how we will measure it." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Impact indicators" title="Seven numbers that matter." />
            <p className="text-sm text-navy-500">Actual values · pre-launch</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDICATORS.map((x) => (
              <Card key={x.t} className="!p-6">
                <x.Icon className="h-5 w-5 text-gold-600" aria-hidden />
                <p className="mt-4 font-display text-4xl text-navy-950 tabular">0</p>
                <p className="mt-1 font-medium text-navy-900">{x.t}</p>
                <p className="mt-2 text-xs leading-relaxed text-navy-500">{x.d}</p>
                <p className="mt-4 text-xs text-navy-400">Target: to be set with independent impact advisers</p>
              </Card>
            ))}
            <Card className="flex flex-col justify-between !bg-navy-950 !p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Community target</p>
              <p className="mt-4 font-display text-4xl tabular">10,000,000</p>
              <p className="mt-1 text-sm text-navy-200">members</p>
              <StatusBadge kind="target" className="mt-4 w-fit" />
            </Card>
          </div>
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Dashboard preview" title="How impact will be reported." lead="A working preview of the impact dashboard, populated with clearly labelled demonstration data." />
            <StatusBadge kind="demo" />
          </div>
          <div className="mt-10"><ImpactDemo /></div>
          <Callout title="Methodology" className="mt-8">Impact data will be collected from venture management accounts and payroll records, verified by sampling, and reviewed by an independent evaluator. Definitions will follow recognised impact-measurement standards.</Callout>
        </div>
      </section>
    </>
  );
}
