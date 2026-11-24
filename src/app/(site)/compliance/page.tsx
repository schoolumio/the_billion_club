import type { Metadata } from "next";
import { CheckCircle2, Circle, CircleDashed, Scale } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading } from "@/components/ui/primitives";
import { CHECKLIST, REG_AREAS } from "@/lib/content/compliance";

export const metadata: Metadata = { title: "Legal & regulatory readiness", description: "The legal and regulatory questions that must be resolved before launch in Nigeria, and our compliance readiness checklist." };

const icon = { done: CheckCircle2, in_progress: CircleDashed, todo: Circle } as const;
const label = { done: "Complete", in_progress: "In progress", todo: "Not started" } as const;
const color = { done: "text-good", in_progress: "text-warning", todo: "text-navy-300" } as const;

export default function Compliance() {
  const all = CHECKLIST.flatMap((g) => g.items);
  const done = all.filter((i) => i.status === "done").length;
  const prog = all.filter((i) => i.status === "in_progress").length;
  return (
    <>
      <PageHero eyebrow="Legal & licensing" title={<>We’re not licensed yet. <span className="gold-text">Here’s our plan.</span></>} lead="The Billionaire Circle has not yet been approved or licensed by any authority. This page shows the legal questions we must answer — and the approvals we need — before we accept a single naira." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <Callout tone="warning" title="Please note">
            This is our working list to brief Nigerian lawyers. It isn&apos;t legal advice and may not be complete. Laws change — including which authorities (federal or state)
            regulate lotteries — so every point here will be confirmed by qualified professionals.
          </Callout>
          <SectionHeading className="mt-16" eyebrow="The big questions" title="11 legal questions we must answer before launch." />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {REG_AREAS.map((r, i) => (
              <Card key={r.area} className="!p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950 font-display text-sm text-gold-300 tabular">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl font-medium text-navy-950">{r.area}</h3>
                </div>
                <p className="mt-4 font-medium text-navy-800">{r.question}</p>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">Who regulates this</dt><dd className="mt-1 text-navy-700">{r.authorities.join(" · ")}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">Laws to check</dt><dd className="mt-1 text-navy-700">{r.instruments.join(" · ")}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">What we’ll likely need</dt>
                    <dd className="mt-1"><ul className="list-disc space-y-1 pl-5 text-navy-700">{r.needed.map((n) => <li key={n}>{n}</li>)}</ul></dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Our progress" title="Where we honestly stand today." />
            <div className="flex gap-6 text-sm">
              <p><span className="font-display text-3xl text-navy-950 tabular">{done}</span> <span className="text-navy-500">complete</span></p>
              <p><span className="font-display text-3xl text-navy-950 tabular">{prog}</span> <span className="text-navy-500">in progress</span></p>
              <p><span className="font-display text-3xl text-navy-950 tabular">{all.length - done - prog}</span> <span className="text-navy-500">not started</span></p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CHECKLIST.map((g) => (
              <Card key={g.group}>
                <h3 className="text-lg font-medium text-navy-950">{g.group}</h3>
                <ul className="mt-4 space-y-3">
                  {g.items.map((it) => {
                    const I = icon[it.status];
                    return (
                      <li key={it.text} className="flex gap-3 text-sm text-navy-700">
                        <I className={`mt-0.5 h-4 w-4 shrink-0 ${color[it.status]}`} aria-hidden />
                        <span>{it.text} <span className="sr-only">({label[it.status]})</span><span className={`ml-1 text-xs font-semibold ${color[it.status]}`} aria-hidden>{it.status !== "todo" && `· ${label[it.status]}`}</span></span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}
          </div>
          <Card className="mt-10 !bg-navy-950 !p-8 text-white">
            <div className="flex items-start gap-4">
              <Scale className="h-8 w-8 shrink-0 text-gold-300" aria-hidden />
              <div>
                <h3 className="text-2xl font-medium">Our plan: keep each kind of money legally separate.</h3>
                <p className="mt-3 leading-relaxed text-navy-200">
                  We plan to set up four separate parts, for our lawyers to test: (1) a licensed body that runs the draw and pays winners; (2) a business fund run by an
                  SEC-registered manager, with an independent trustee; (3) a foundation for community grants; and (4) a company that runs TBC for a capped, published fee.
                  An independent bank holds all the money, and outside auditors check every part.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
