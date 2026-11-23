import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Callout, LinkButton, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_IT_WORKS } from "@/lib/content/how";

export const metadata: Metadata = { title: "How it works", description: "Seven simple steps from joining the community to building businesses and jobs for everyone." };

export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="How it works" title={<>From ₦100 a day to a <span className="gold-text">nation of opportunity.</span></>} lead="A simple journey for members, governed by rules that are published, approved and independently checked. Steps marked “Awaiting approval” will not operate until the relevant regulator has approved them." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <ol className="relative mx-auto max-w-4xl">
            <div className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-gold-400 via-navy-200 to-gold-400 sm:left-8" aria-hidden />
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal as="li" key={s.title} className="relative pb-14 pl-16 last:pb-0 sm:pl-24">
                <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-gold-300 shadow-lg sm:h-16 sm:w-16">
                  <s.Icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-sm text-gold-600 tabular">Step {String(i + 1).padStart(2, "0")}</p>
                  <StatusBadge kind={s.status} />
                </div>
                <h2 className="mt-2 text-2xl font-medium text-navy-950 sm:text-3xl">{s.title}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-navy-600">{s.long}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                  {s.safeguards.map((g) => (
                    <li key={g} className="flex items-start gap-2 rounded-xl border border-navy-100 bg-mist px-3 py-2.5 text-sm text-navy-800">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{g}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <section className="bg-mist py-20">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionHeading eyebrow="Contribution design" title="Daily accounting. Practical payment." lead="Collecting ₦100 every single day is costly for members and the system. We propose flexible pre-funding — a day, a week or a month at a time — with every day recorded individually in your statement." />
          <Callout tone="warning" title="Not yet operating">
            No contribution, selection or award process is active. The contribution model, refund rights, eligibility rules and selection methodology will be
            finalised with regulators and published before launch.
            <div className="mt-4"><LinkButton href="/faq" variant="navy" arrow>Read the FAQ</LinkButton></div>
          </Callout>
        </div>
      </section>
    </>
  );
}
