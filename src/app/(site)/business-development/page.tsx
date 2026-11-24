import type { Metadata } from "next";
import { BarChart3, Briefcase, Building, ClipboardCheck, FileSignature, Gauge, GraduationCap, LineChart, Search, ShieldCheck } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Business support for winners", description: "How our business team helps winners turn their awards into businesses that last and create jobs." };

const SERVICES = [
  { Icon: Search, t: "Test the idea first", b: "Before you spend a naira, we check whether the idea can really work — the market, the costs and the risks." },
  { Icon: LineChart, t: "Honest money advice", b: "Independent advice on how to use your award wisely — including options that have nothing to do with us." },
  { Icon: Building, t: "Set up properly", b: "Company registration with CAC, tax registration and the right legal agreements from day one." },
  { Icon: ShieldCheck, t: "Good management", b: "Simple, sensible controls — who signs for what, who checks the books — sized to the business." },
  { Icon: BarChart3, t: "Keep the books", b: "Bookkeeping, budgets and regular accounts, so you always know where the business stands." },
  { Icon: GraduationCap, t: "Mentors who’ve done it", b: "Experienced business leaders in your sector, plus a network of other TBC business owners." },
  { Icon: Briefcase, t: "Hire well", b: "Fair hiring, with jobs advertised to TBC members first." },
  { Icon: Gauge, t: "Regular check-ins", b: "Quarterly reviews, and early help if the business starts to struggle." },
  { Icon: ClipboardCheck, t: "Count the impact", b: "We track the jobs, wages and local suppliers each business creates — and publish them." },
];

const STAGES = ["Money basics for winners", "Find the right opportunity", "Test the idea", "Independent review", "Agree terms in writing", "Launch or grow", "Track and report"];

export default function BusinessDevelopment() {
  return (
    <>
      <PageHero eyebrow="Business support" title={<>Turn a win into a business <span className="gold-text">that lasts.</span></>} lead="A big award can change one life. A well-run business can change hundreds. Our team will help winners who want it to start or grow a business that creates jobs." >
        <StatusBadge kind="proposed" label="Planned — team not yet hired" />
      </PageHero>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="What winners get" title="World-class support, built for Nigerian business." />
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
          <SectionHeading tone="light" eyebrow="From idea to business" title="Seven careful steps." />
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
            <SectionHeading eyebrow="Your rights as a winner" title="Our help is offered. Never forced." />
            <ul className="mt-8 space-y-4 text-navy-700">
              {[
                "Your award is yours. Using our business help is completely up to you.",
                "Everything is agreed in writing. You see every fee and every term before you sign.",
                "We encourage you to get your own lawyer and adviser — and may pay for it.",
                "If any of our people has a personal interest, they must declare it.",
                "You can step away from our support on terms agreed at the start.",
              ].map((t) => (
                <li key={t} className="flex gap-3"><FileSignature className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <Callout title="Businesses can fail">Not every business succeeds. Money from our business fund can be lost, so it is managed separately, by regulated professionals — and it is never promised to members as a return.</Callout>
            <Callout tone="gold" title="Sectors we&apos;re looking at">Food processing · logistics &amp; cold storage · solar energy · manufacturing · healthcare · building materials · digital services. An independent committee will make the final choice.</Callout>
          </div>
        </div>
      </section>
    </>
  );
}
