import type { Metadata } from "next";
import { Briefcase, Building2, Expand, HandHeart, MapPin, Truck, Users } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { ImpactDemo } from "@/components/charts/ImpactDemo";

export const metadata: Metadata = { title: "Community impact", description: "The long-term economic empowerment vision and how impact will be measured." };

const INDICATORS = [
  { Icon: Briefcase, t: "Jobs created", d: "Full-time jobs in TBC-backed businesses that last at least six months." },
  { Icon: Building2, t: "New businesses", d: "Registered businesses started with help from our business team." },
  { Icon: Expand, t: "Businesses grown", d: "Existing businesses that grew their sales or hired more people with our help." },
  { Icon: Users, t: "Members reached", d: "Verified members who received opportunities, training or updates." },
  { Icon: Truck, t: "Local suppliers paid", d: "Nigerian suppliers with paid contracts from TBC-backed businesses." },
  { Icon: MapPin, t: "Communities supported", d: "Local government areas that received community project grants." },
  { Icon: HandHeart, t: "Winners supported", d: "Winners who chose help from our business team." },
];

export default function Impact() {
  return (
    <>
      <PageHero eyebrow="Our impact" title={<>Success means jobs, <span className="gold-text">not just winners.</span></>} lead="We won’t judge ourselves by how much money we collect. We’ll judge ourselves by the businesses built, the jobs created and the communities made stronger." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="What we’ll count" title="Seven numbers that matter." />
            <p className="text-sm text-navy-500">Real figures today — we haven’t launched yet</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDICATORS.map((x) => (
              <Card key={x.t} className="!p-6">
                <x.Icon className="h-5 w-5 text-gold-600" aria-hidden />
                <p className="mt-4 font-display text-4xl text-navy-950 tabular">0</p>
                <p className="mt-1 font-medium text-navy-900">{x.t}</p>
                <p className="mt-2 text-xs leading-relaxed text-navy-500">{x.d}</p>
                <p className="mt-4 text-xs text-navy-400">Target: to be set with independent experts</p>
              </Card>
            ))}
            <Card className="flex flex-col justify-between !bg-navy-950 !p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Our goal</p>
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
            <SectionHeading eyebrow="Sneak preview" title="How we’ll show our impact." lead="A working preview, filled with example numbers so you can see how it will look." />
            <StatusBadge kind="demo" />
          </div>
          <div className="mt-10"><ImpactDemo /></div>
          <Callout title="How we&apos;ll count" className="mt-8">We&apos;ll use each business&apos;s accounts and payroll records, spot-check them, and have an independent reviewer confirm the numbers using recognised standards.</Callout>
        </div>
      </section>
    </>
  );
}
