import type { Metadata } from "next";
import { BarChart3, Briefcase, Building, ClipboardCheck, FileSignature, Gauge, GraduationCap, LineChart, Search, ShieldCheck } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Investment & business development arm", description: "How beneficiaries are supported to build sustainable, well-governed businesses that create jobs." };

const SERVICES = [
  { Icon: Search, t: "Feasibility studies", b: "Market, operational and financial feasibility before any capital is committed. Ideas that do not pass are not funded — protecting the beneficiary." },
  { Icon: LineChart, t: "Investment advisory", b: "Independent, conflict-declared advice on allocation, risk and diversification, including options that do not involve our fund." },
  { Icon: Building, t: "Registration & structuring", b: "CAC registration, shareholder agreements, tax registration and the right legal form for each venture." },
  { Icon: ShieldCheck, t: "Corporate governance", b: "Boards or advisory boards, controls, signatory rules and conflict-of-interest policies proportionate to the business." },
  { Icon: BarChart3, t: "Financial management", b: "Bookkeeping, budgeting, banking controls and quarterly management accounts." },
  { Icon: GraduationCap, t: "Mentorship", b: "Sector mentors and peer networks of business leaders committed to the community." },
  { Icon: Briefcase, t: "Recruitment & employment", b: "Member-first job advertising, fair hiring practices and skills pathways." },
  { Icon: Gauge, t: "Performance monitoring", b: "Agreed KPIs, quarterly reviews and early-warning support when a venture struggles." },
  { Icon: ClipboardCheck, t: "Impact measurement", b: "Jobs, wages, suppliers and community outcomes measured against a published methodology." },
];

const STAGES = ["Onboarding & financial literacy", "Opportunity discovery", "Feasibility study", "Investment committee", "Structuring & agreements", "Launch or expansion", "Monitoring & reporting"];

export default function BusinessDevelopment() {
  return (
    <>
      <PageHero eyebrow="Investment & business development arm" title={<>Turning awards into <span className="gold-text">enterprises that last.</span></>} lead="A substantial award can change one life. A well-built business can change hundreds. Our professional team will work with beneficiaries who choose support, to identify, build and grow viable businesses." >
        <StatusBadge kind="proposed" label="Proposed service — team and partners not yet appointed" />
      </PageHero>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="What we will provide" title="Institutional-grade support, sized for Nigerian entrepreneurs." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.t} delay={(i % 3) * 80}>
                <Card className="h-full">
                  <s.Icon className="h-6 w-6 text-gold-600" aria-hidden />
                  <h3 className="mt-4 text-lg font-medium text-navy-950">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.b}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-navy-950 py-20 text-white sm:py-28">
        <div className="container-x">
          <SectionHeading tone="light" eyebrow="The venture pathway" title="Seven disciplined stages." />
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {STAGES.map((s, i) => (
              <li key={s} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="font-display text-2xl text-gold-300 tabular">{i + 1}</p>
                <p className="mt-3 text-sm font-medium leading-snug">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Beneficiary rights" title="Support is offered. Never imposed." />
            <ul className="mt-8 space-y-4 text-navy-700">
              {[
                "An award belongs to the beneficiary under the approved rules. Using our business support is voluntary.",
                "Every engagement is governed by a written agreement, with fees, equity, profit-share or co-investment terms disclosed in full before signing.",
                "Beneficiaries are encouraged — and where appropriate funded — to obtain independent legal and financial advice.",
                "Conflicts of interest of advisers, staff and directors are declared and recorded.",
                "Beneficiaries may exit support arrangements under clear, pre-agreed terms.",
              ].map((t) => (
                <li key={t} className="flex gap-3"><FileSignature className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <Callout title="Business investment is risky">Businesses can fail. Any co-investment from the business development fund carries risk of loss and will be managed through a separately regulated vehicle — never presented to members as a guaranteed return.</Callout>
            <Callout tone="gold" title="Target sectors under consideration">Agro-processing · logistics & cold chain · renewable energy · light manufacturing · healthcare services · construction materials · digital services. Final sector strategy will be set by an independent investment committee.</Callout>
          </div>
        </div>
      </section>
    </>
  );
}
