import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { PageHero, StatusBadge } from "@/components/ui/primitives";
import { FAQS } from "@/lib/content/faq";

export const metadata: Metadata = { title: "Frequently asked questions", description: "Honest answers about contributions, selection, fairness, funds, withdrawals and member protections." };

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <PageHero eyebrow="Questions & answers" title={<>Straight answers <span className="gold-text">to real questions.</span></>} lead="If something still needs a regulator’s approval, we say so — we never guess." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x max-w-4xl">
          <div className="divide-y divide-navy-100 rounded-3xl border border-navy-100">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group p-6 sm:p-7" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-medium text-navy-950">{f.q}</span>
                  <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="mt-4 space-y-3">
                  {f.status && <StatusBadge kind={f.status} />}
                  <p className="leading-relaxed text-navy-600">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
