import type { Metadata } from "next";
import { Card, PageHero, SectionHeading } from "@/components/ui/primitives";
import Image from "next/image";
import { LogoMark, Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Brand & presentation kit", description: "Brand identity, voice, colours, typography and presentation principles." };

const COLORS = [
  ["Logo navy", "#0d1b2b", "Logo background, primary"], ["Logo gold", "#d4af37", "Ring, monogram, wordmark"], ["Highlight", "#f5d06a", "The dot at twelve o'clock"],
  ["Navy 700", "#1f3050", "Interface accents"], ["Gold 700", "#8c7020", "Gold text on white (AA)"], ["Mist", "#f6f7f9", "Section backgrounds"],
];

export default function Brand() {
  return (
    <>
      <PageHero eyebrow="Brand & presentation kit" title={<>A movement for <span className="gold-text">shared prosperity.</span></>} lead="Not a lottery. Not a charity. A serious, ambitious movement that speaks warmly, simply and honestly." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Brand story" title="Why we exist." />
            <div className="prose-tbc">
              <p>Across Nigeria, millions of people save in small amounts through esusu, ajo and cooperative groups — a proud tradition of collective discipline. What has been missing is scale, professional management and transparency that everyone can trust.</p>
              <p>The Billionaire Circle brings that tradition into the digital age at national scale: a small daily contribution, pooled transparently, producing life-changing awards and — just as importantly — enterprises that hire, buy and invest locally.</p>
              <p>We are named for the ambition of the billion-naira award, but defined by something larger: a circle of members in which wealth creates more wealth.</p>
            </div>
          </div>
          <div className="space-y-5">
            <Card className="!p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Logo tagline</p><p className="mt-3 font-display text-3xl text-navy-950">Together, we build billionaires.</p><p className="mt-3 text-xs text-navy-500">Supporting line: <span className="font-medium text-navy-700">Small daily. Shared prosperity.</span></p></Card>
            <Card className="!p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Campaign line</p><p className="mt-3 font-display text-2xl text-navy-950">Together, we build wealth. Together, we change lives.</p></Card>
            <Card className="!p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Alternatives considered</p><ul className="mt-3 space-y-1 text-navy-700"><li>“Wealth that creates wealth.”</li><li>“₦100 a day. A nation of opportunity.”</li><li>“Ten million owners of the future.”</li></ul></Card>
          </div>
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Identity" title="Mark, colour and type." />
          <Card className="mt-10 overflow-hidden !p-0">
            <Image src="/brand/tbc-logo-supplied.webp" alt="The Billionaire Circle logo: the TBC roundel beside the wordmark and the tagline Together, we build billionaires." width={2000} height={583} className="h-auto w-full" priority={false} />
            <p className="border-t border-navy-100 px-6 py-3 text-xs text-navy-500">Master artwork as supplied. On the website the logo is redrawn as a vector so it stays sharp at every size.</p>
          </Card>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center gap-6 !p-10"><LogoMark className="h-24 w-24" /><Logo /><p className="text-xs text-navy-500">On white — navy wordmark for legibility</p></Card>
            <Card className="flex flex-col items-center justify-center gap-6 !bg-[#0d1b2b] !p-10"><LogoMark className="h-24 w-24" /><Logo tone="light" /><p className="text-xs text-white/60">On navy — gold wordmark, as supplied</p></Card>
            <Card className="!p-8"><p className="text-sm text-navy-600">The mark: the TBC monogram held inside a gold circle, with a single highlight at twelve o&apos;clock — the circle of members, and the one place at the top that each month&apos;s grand winners reach. The favicon uses the roundel alone.</p>
              <p className="mt-6 font-display text-4xl text-navy-950">Fraunces</p><p className="text-sm text-navy-500">Display — headlines, numbers of significance</p>
              <p className="mt-4 text-3xl font-semibold text-navy-950">Inter</p><p className="text-sm text-navy-500">Interface & body — clarity, tabular figures</p></Card>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {COLORS.map(([n, h, u]) => (
              <div key={n} className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
                <div className="h-24" style={{ background: h }} />
                <div className="p-4"><p className="text-sm font-medium text-navy-950">{n}</p><p className="text-xs text-navy-500 tabular">{h}</p><p className="mt-1 text-xs text-navy-500">{u}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <Card className="!p-8"><h3 className="text-xl font-medium text-navy-950">We say</h3><ul className="mt-4 space-y-2 text-navy-700"><li>✓ “Target”, “estimate”, “planned”, “starts after approval”</li><li>✓ “Award”, “community”, “enterprise”, “opportunity”</li><li>✓ Plain odds, plain risks, plain English</li><li>✓ “We have not decided this yet.”</li></ul></Card>
          <Card className="!p-8"><h3 className="text-xl font-medium text-navy-950">We never say</h3><ul className="mt-4 space-y-2 text-navy-700"><li>✗ “Guaranteed”, “get rich”, “jackpot”, “win big”</li><li>✗ “Investment returns” for member contributions</li><li>✗ Unlabelled figures, invented testimonials, stock “winners”</li><li>✗ Casino imagery: coins, slots, confetti, dice</li></ul></Card>
        </div>
      </section>
    </>
  );
}
