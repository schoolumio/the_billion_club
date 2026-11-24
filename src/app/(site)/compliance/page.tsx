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
      <PageHero eyebrow="Legal & regulatory readiness" title={<>Not licensed. <span className="gold-text">Not yet.</span> Here is the path.</>} lead="The Billionaire Circle is not approved, licensed or certified as compliant by any authority. This page sets out the questions that must be answered and the approvals likely required before we accept a single naira." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <Callout tone="warning" title="Important notice">
            This is a scoping document prepared to brief qualified Nigerian counsel. It is not legal advice and may be incomplete. Laws, jurisdiction and regulator
            practice change — in particular, the division of lottery regulation between federal and state authorities. Every item must be confirmed by professional opinion.
          </Callout>
          <SectionHeading className="mt-16" eyebrow="Regulatory map" title="Eleven questions that decide whether — and how — we launch." />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {REG_AREAS.map((r, i) => (
              <Card key={r.area} className="!p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950 font-display text-sm text-gold-300 tabular">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl font-medium text-navy-950">{r.area}</h3>
                </div>
                <p className="mt-4 font-medium text-navy-800">{r.question}</p>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">Relevant authorities</dt><dd className="mt-1 text-navy-700">{r.authorities.join(" · ")}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">Key instruments to review</dt><dd className="mt-1 text-navy-700">{r.instruments.join(" · ")}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-700">Approvals / opinions likely needed</dt>
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
            <SectionHeading eyebrow="Compliance readiness checklist" title="Where we actually are." />
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
                <h3 className="text-2xl font-medium">Our proposed solution: separate the money by law, not just by label.</h3>
                <p className="mt-3 leading-relaxed text-navy-200">
                  We propose a multi-entity structure for counsel to test: (1) a licensed award vehicle (or licensed-operator partnership) that runs selection and pays awards;
                  (2) a separately regulated business development fund managed by an SEC-registered manager with an independent trustee; (3) a foundation (incorporated trustees)
                  for community development grants; and (4) an operating company paid a capped, published fee. An independent custodian holds all funds; an external auditor reports on each.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
