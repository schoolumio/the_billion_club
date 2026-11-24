import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { Callout, Card, PageHero, SectionHeading, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "About us", description: "Who we are, what we believe, and the people and checks that keep us accountable." };

const LEADERS = ["Founder & Chief Executive", "Independent Chair of the Board", "Chief Financial Officer", "Head of Compliance & Risk", "Head of Business Support", "Chief Technology Officer"];
const GOV = [
  { t: "An independent board", b: "Most directors are independent experts in finance, law, business and technology — not insiders." },
  { t: "Audit & risk committee", b: "Works with the auditors, watches for fraud and protects the emergency reserve." },
  { t: "Investment committee", b: "Independent experts decide which businesses get funding, using published rules." },
  { t: "Draw observers", b: "Independent people who watch every draw and confirm it was fair." },
  { t: "Members’ council", b: "Members elected by members, who review our reports and can raise concerns directly with the board." },
  { t: "Independent bank & trustee", b: "Regulated outsiders who hold the money and protect members’ interests." },
];

export default function About() {
  return (
    <>
      <PageHero eyebrow="About us" title={<>Built by Nigerians. <span className="gold-text">For Nigerians.</span></>} lead="We believe ordinary Nigerians, working together, can build wealth that changes whole communities. Our job is to make that safe, fair and open for everyone to see." />
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          {[
            ["Our vision", "A Nigeria where every community builds — and shares in — its own wealth."],
            ["Our mission", "Bring millions of Nigerians together to fund life-changing awards, build lasting businesses and create jobs — openly, fairly, and only once we are fully approved."],
            ["What we believe", "Wealth should create more wealth. Winning shouldn’t be the only reason to join — when the community grows, you should grow too."],
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
            <SectionHeading eyebrow="Our leadership" title="The people answerable to you." />
            <StatusBadge kind="pending" label="To be announced soon" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERS.map((r) => (
              <Card key={r} className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-navy-200 bg-navy-50 text-navy-300"><UserRound className="h-7 w-7" aria-hidden /></div>
                <div>
                  <p className="font-medium text-navy-950">To be announced</p>
                  <p className="text-sm text-navy-500">{r}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-navy-500">Each profile will show the person’s experience and any personal interests they must declare. We’ll only show people who have agreed.</p>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="How we’re held accountable" title="Nobody marks their own homework." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GOV.map((g) => (
              <Card key={g.t}><div className="flex items-start justify-between gap-2"><h3 className="text-lg font-medium text-navy-950">{g.t}</h3><StatusBadge kind="proposed" /></div><p className="mt-2 text-sm leading-relaxed text-navy-600">{g.b}</p></Card>
            ))}
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Card className="!p-8">
              <h3 className="text-2xl font-medium text-navy-950">Our promise to be open</h3>
              <p className="mt-3 leading-relaxed text-navy-600">We tell you what we know, label what is only a plan, and admit what we haven’t decided yet. Every real figure will be backed by audited records.</p>
            </Card>
            <Card className="!p-8">
              <h3 className="text-2xl font-medium text-navy-950">Where we&apos;re heading</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-navy-600">
                <li>Well-run businesses in every region, creating jobs</li>
                <li>An organisation members trust and regulators respect</li>
                <li>Higher incomes in the communities our members live in</li>
                <li>A model other African countries can follow</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      <section id="partner" className="scroll-mt-28 bg-navy-950 py-20 text-white">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionHeading tone="light" eyebrow="Work with us" title="Banks, investors, governments and partners." lead="We’re looking for legal, banking, audit and development partners to help us build this the right way." />
          <Callout tone="gold" title="Contact" className="!border-white/10 !bg-white/5 [&_p]:!text-white [&_div]:!text-navy-200">
            Partnership enquiries: <strong className="text-white">email address coming soon</strong>. Please never send money to anyone claiming to represent us.
          </Callout>
        </div>
      </section>
    </>
  );
}
