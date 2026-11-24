import type { Metadata } from "next";
import { Check, Hourglass, Lightbulb } from "lucide-react";
import { Callout, LinkButton, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_IT_WORKS } from "@/lib/content/how";

export const metadata: Metadata = { title: "How it works", description: "Join free, take a ₦100 daily place, and every month 30 members win — while a business fund creates jobs for everyone else. Seven simple steps." };

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={<>Seven simple steps. <span className="gold-text">One big idea.</span></>}
        lead="Join for free. Take a ₦100 daily place. Every month, 30 members win — and part of the money builds businesses that create jobs for everyone else."
      >
        <LinkButton href="/join" arrow>Join the waitlist — free</LinkButton>
      </PageHero>

      <section className="border-b border-navy-100 bg-mist">
        <div className="container-x grid gap-4 py-8 sm:grid-cols-2">
          <div className="flex gap-3 text-sm text-navy-700"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden /><p><StatusBadge kind="proposed" /> <span className="mt-1 block">How we plan to do it. Details may change before launch.</span></p></div>
          <div className="flex gap-3 text-sm text-navy-700"><Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden /><p><StatusBadge kind="pending" /> <span className="mt-1 block">Needs a regulator&apos;s approval first. It won&apos;t happen until we have it.</span></p></div>
        </div>
      </section>

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
                  <p className="font-display text-sm text-gold-700 tabular">Step {i + 1}</p>
                  <StatusBadge kind={s.status} />
                </div>
                <h2 className="mt-2 text-2xl font-medium text-navy-950 sm:text-3xl">{s.title}</h2>
                <p className="mt-1 font-medium text-navy-800">{s.short}</p>
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
          <SectionHeading eyebrow="Paying made easy" title="Pay daily, weekly or monthly." lead="Paying ₦100 every single day costs you time and bank charges. So we plan to let you pay for a day, a week or a month at a time — and every day still shows up separately on your statement." />
          <Callout tone="warning" title="Nothing is running yet">
            We are not taking payments or running draws yet. Before we do, we&apos;ll publish the full rules — how to pay, how refunds work, who can win and how winners are chosen — once a regulator has approved them.
            <div className="mt-4"><LinkButton href="/faq" variant="navy" arrow>Read the FAQ</LinkButton></div>
          </Callout>
        </div>
      </section>
    </>
  );
}
