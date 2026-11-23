import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "About us", description: "Our vision, mission, philosophy, leadership and governance." };

const LEADERS = ["Founder & Chief Executive", "Chair of the Board (independent)", "Chief Financial Officer", "Chief Compliance & Risk Officer", "Head of Investment & Business Development", "Chief Technology Officer"];
const GOV = [
  { t: "Independent board", b: "Majority independent non-executive directors with finance, law, development and technology expertise." },
  { t: "Audit & risk committee", b: "Oversees auditors, internal controls, fraud risk and the reserve policy." },
  { t: "Investment committee", b: "Approves business development capital with independent members and published criteria." },
  { t: "Selection oversight panel", b: "Independent observers who verify every selection." },
  { t: "Member advisory council", b: "Elected member representatives who review reports and raise concerns directly with the board." },
  { t: "Trustee & custodian", b: "Regulated third parties holding funds and protecting member interests." },
];

export default function About() {
  return (
    <>
      <PageHero eyebrow="About us" title={<>An economic empowerment institution, <span className="gold-text">owned in spirit by its community.</span></>} lead="We believe ordinary Nigerians, acting together with discipline and transparency, can build capital that transforms communities. Our job is to make that collective effort safe, fair and productive." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          {[
            ["Our vision", "A Nigeria where every community can build and share in its own prosperity."],
            ["Our mission", "To unite millions of Nigerians in a transparent, well-governed community wealth system that funds awards, builds enduring businesses and creates jobs — beginning only once it is lawfully approved."],
            ["Our philosophy", "Wealth that creates more wealth. Your opportunity to become wealthy should not be the only reason you join; the growth of the community should benefit you too."],
          ].map(([t, b]) => (
            <Card key={t} className="!p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t}</p>
              <p className="mt-4 font-display text-2xl leading-snug text-navy-950">{b}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Leadership" title="The people accountable to you." />
            <StatusBadge kind="pending" label="Appointments to be announced" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERS.map((r) => (
              <Card key={r} className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-navy-200 bg-navy-50 text-navy-300"><UserRound className="h-7 w-7" aria-hidden /></div>
                <div>
                  <p className="font-medium text-navy-950">[Name to be confirmed]</p>
                  <p className="text-sm text-navy-500">{r}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-navy-500">Profiles will include qualifications, prior roles and declared interests. We will not display any person here without their verified consent.</p>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Governance structure" title="Checks and balances by design." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GOV.map((g) => (
              <Card key={g.t}><div className="flex items-start justify-between gap-2"><h3 className="text-lg font-medium text-navy-950">{g.t}</h3><StatusBadge kind="proposed" /></div><p className="mt-2 text-sm leading-relaxed text-navy-600">{g.b}</p></Card>
            ))}
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Card className="!p-8">
              <h3 className="text-2xl font-medium text-navy-950">Commitment to transparency</h3>
              <p className="mt-3 leading-relaxed text-navy-600">We publish what we know, label what we project and admit what we have not yet decided. Every financial figure will trace back to an audited record.</p>
            </Card>
            <Card className="!p-8">
              <h3 className="text-2xl font-medium text-navy-950">Long-term development goals</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-navy-600">
                <li>A national portfolio of well-governed, job-creating enterprises</li>
                <li>A trusted, member-governed institution recognised by regulators</li>
                <li>Measurable improvement in incomes in member communities</li>
                <li>A model that can responsibly expand across Africa</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      <section id="partner" className="scroll-mt-28 bg-navy-950 py-20 text-white">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionHeading tone="light" eyebrow="Partner with us" title="Institutions, investors and governments." lead="We are seeking legal, banking, custodial, audit, impact and development partners to help build this responsibly." />
          <Callout tone="gold" title="Contact" className="!border-white/10 !bg-white/5 [&_p]:!text-white [&_div]:!text-navy-200">
            Partnership enquiries: <strong className="text-white">[partnerships email to be confirmed]</strong>. Please do not send funds of any kind.
          </Callout>
        </div>
      </section>
    </>
  );
}
