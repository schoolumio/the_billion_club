import type { ReactNode } from "react";
import { PageHero, StatusBadge } from "@/components/ui/primitives";

export function PolicyLayout({ eyebrow, title, lead, version, sections }: { eyebrow: string; title: string; lead: string; version: string; sections: { h: string; body: ReactNode }[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={lead}>
        <div className="flex flex-wrap gap-2"><StatusBadge kind="pending" label="Draft — pending review by Nigerian counsel" /><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-navy-200">{version}</span></div>
      </PageHero>
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <ol className="sticky top-28 space-y-2 text-sm text-navy-600">
              {sections.map((s, i) => <li key={s.h}><a href={`#s${i + 1}`} className="hover:text-navy-950">{i + 1}. {s.h}</a></li>)}
            </ol>
          </nav>
          <div className="max-w-3xl space-y-10">
            {sections.map((s, i) => (
              <section key={s.h} id={`s${i + 1}`} className="scroll-mt-28">
                <h2 className="text-2xl font-medium text-navy-950">{i + 1}. {s.h}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-navy-700 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-navy-950">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
