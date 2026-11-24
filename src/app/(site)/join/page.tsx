import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowDown, BadgeCheck, Gift, Link2, Lock, Share2, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";
import { Callout, Card, Eyebrow, LinkButton, SectionHeading, StatusBadge } from "@/components/ui/primitives";
import { JoinForm } from "@/components/waitlist/JoinForm";
import { ClickBeacon } from "@/components/waitlist/ClickBeacon";
import { prefillCode } from "@/lib/referrals/attribution";
import { maskName, normalizeCode } from "@/lib/referrals/codes";
import { getConfig, waitlistProgress } from "@/lib/referrals/server";
import { one } from "@/lib/db";
import { formatCount } from "@/lib/finance/model";
import { WAITLIST_FAQ } from "@/lib/content/waitlist-faq";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ ref?: string }> }): Promise<Metadata> {
  const code = normalizeCode((await searchParams).ref);
  const image = code ? `/api/og/invite?ref=${code}` : "/opengraph-image";
  const title = "Be part of the movement that builds wealth together.";
  const description = "Join The Billionaire Circle founding community — free, not an investment, with your own referral link.";
  return {
    title: "Join the waitlist",
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
export const dynamic = "force-dynamic";

const TARGET = 10_000_000;

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export default async function Join({ searchParams }: { searchParams: Promise<{ ref?: string; c?: string }> }) {
  const sp = await searchParams;
  const jar = await cookies();
  const linkRef = normalizeCode(sp.ref) ?? "";
  const prefill = prefillCode(sp.ref, jar.get("tbc_ref")?.value) ?? "";
  const campaign = sp.c && /^[a-z0-9-]{2,40}$/.test(sp.c) ? sp.c : jar.get("tbc_c")?.value ?? "";
  const [progress, inviter, cfg] = await Promise.all([
    safe(() => waitlistProgress(), null),
    prefill ? safe(() => one<{ full_name: string }>(`SELECT full_name FROM users WHERE referral_code = $1 AND status = 'active' AND role = 'member'`, [prefill]), null) : Promise.resolve(null),
    safe(() => getConfig(), null),
  ]);
  const verified = progress?.verified ?? null;
  const pct = verified !== null ? Math.min(100, (verified / TARGET) * 100) : 0;
  const referralsPaused = cfg ? !cfg.config.referralsEnabled : false;

  return (
    <>
      {linkRef && <ClickBeacon code={linkRef} channel={campaign || "link"} />}

      {/* HERO + FORM */}
      <section className="relative overflow-hidden bg-[#0d1b2b] pb-16 pt-28 text-white sm:pt-36">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" aria-hidden />
        <div className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-[#d4af37]/10 blur-3xl" aria-hidden />
        <div className="container-x relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Eyebrow tone="light">Founding community · Pre-launch waitlist</Eyebrow>
            <h1 className="mt-5 animate-fade-up text-[2.4rem] font-medium uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              Be part of the movement that <span className="gold-text">builds wealth together.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
              Join The Billionaire Circle founding community. Invite others, grow the movement and help build a future where opportunities create lasting impact.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="#join" arrow>Join the waitlist</LinkButton>
              <LinkButton href="#invite" variant="outline-light">Invite your circle</LinkButton>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Verified waitlist members</p>
                <StatusBadge kind="target" label="Target: 10,000,000" />
              </div>
              <p className="mt-3 font-display text-4xl tabular">{verified === null ? "—" : formatCount(verified)}</p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={TARGET} aria-valuenow={verified ?? 0} aria-label="Progress towards 10 million verified members">
                <div className="h-full rounded-full bg-gradient-to-r from-[#b8942c] to-[#f5d06a]" style={{ width: `${Math.max(pct, verified ? 0.6 : 0)}%` }} />
              </div>
              <p className="mt-3 text-xs text-navy-300">
                {verified === null ? "Live count unavailable right now." : <>Live count of real members who have verified their email{progress?.asOf ? ` · updated ${new Date(progress.asOf).toLocaleString("en-NG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}` : ""}. Unverified sign-ups and sample data are never included.</>}
              </p>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-navy-200 sm:grid-cols-2">
              {[[ShieldCheck, "Free to join — no payment, ever, on the waitlist"], [Lock, "Not an investment. No guaranteed returns."], [BadgeCheck, "Your own referral link the moment you join"], [Users, "Only verified people count — fair for everyone"]].map(([I, t]) => {
                const Icon = I as typeof ShieldCheck;
                return <li key={t as string} className="flex gap-2.5"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />{t as string}</li>;
              })}
            </ul>
          </div>

          <div id="join" className="scroll-mt-28 rounded-[1.75rem] bg-white p-6 text-navy-950 shadow-2xl shadow-black/30 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Secure your place</p>
            <h2 className="mt-2 text-2xl font-medium">Join the founding community</h2>
            <p className="mt-1 text-sm text-navy-500">Takes about a minute. You&apos;ll get your referral link straight away.</p>
            {referralsPaused && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Referral credit is temporarily paused. You can still join; any code entered will not be credited.</p>}
            <div className="mt-6"><JoinForm prefill={prefill} linkRef={linkRef} campaign={campaign} inviter={inviter ? maskName(inviter.full_name) : null} /></div>
          </div>
        </div>
        <div className="container-x relative mt-12 hidden lg:block">
          <a href="#how" className="mx-auto flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-navy-300 hover:text-white">How it works <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden /></a>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-white py-20 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          {[
            ["Our vision", "A Nigeria where every community can build and share in its own prosperity."],
            ["Our mission", "Unite millions of Nigerians in a transparent, well-governed community wealth system that funds awards, builds enduring businesses and creates jobs — launching only once lawfully approved."],
            ["How wealth is shared", "When TBC launches, small daily contributions fund 30 awards a month, a business fund that creates jobs, and community projects — every naira published and audited."],
          ].map(([t, b]) => (
            <div key={t}><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t}</p><p className="mt-3 font-display text-2xl leading-snug text-navy-950">{b}</p></div>
          ))}
        </div>
      </section>

      {/* HOW REFERRALS WORK */}
      <section id="how" className="scroll-mt-24 bg-mist py-20 sm:py-28">
        <div id="invite" className="container-x scroll-mt-24">
          <SectionHeading eyebrow="Invite your circle" title="Register. Get your link. Share it. Track verified referrals." lead="Every member becomes a founding promoter with a personal link, QR code and ready-made messages." />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [UserPlus, "Join free", "Register in a minute and verify your email."],
              [Link2, "Get your link", "Your unique code, link and QR code appear instantly in your dashboard."],
              [Share2, "Share it", "One tap to WhatsApp, Facebook, X, Telegram or email — or print your QR flyer."],
              [BadgeCheck, "Track verified referrals", "A referral counts once the person you invited verifies their account."],
            ].map(([I, t, b], i) => {
              const Icon = I as typeof UserPlus;
              return (
                <li key={t as string}><Card className="h-full">
                  <div className="flex items-center justify-between"><Icon className="h-6 w-6 text-gold-600" aria-hidden /><span className="font-display text-sm text-gold-600 tabular">0{i + 1}</span></div>
                  <h3 className="mt-4 text-lg font-medium text-navy-950">{t as string}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{b as string}</p>
                </Card></li>
              );
            })}
          </ol>
          <div className="mt-8 text-center"><LinkButton href="/leaderboard" variant="outline" arrow>See the community leaderboard</LinkButton></div>
        </div>
      </section>

      {/* PROPOSED REWARDS */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Proposed referral rewards" title="1% of each day's contributions, shared by verified referrals." />
            <StatusBadge kind="pending" label="Proposed — inactive until legally approved and funded" className="mt-5" />
            <div className="prose-tbc">
              <p>After TBC launches, we propose setting aside <strong>1% of each day&apos;s actual contribution pool</strong> for referral rewards. Each member&apos;s share equals their percentage of all eligible members that day, counting only people they personally referred who are verified and eligible.</p>
              <p>Before launch there is <strong>no contribution pool</strong>, so there is <strong>nothing to distribute</strong>. Verified referrals you build now will count from launch, if the programme is approved.</p>
              <p>There are <strong>no commissions on your referrals&apos; referrals</strong>. Only people you invite directly ever count.</p>
            </div>
          </div>
          <Card className="!p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">The formula</p>
            <dl className="mt-4 space-y-3 font-mono text-[0.8rem] leading-relaxed text-navy-800">
              <div className="rounded-xl bg-mist p-3"><dt className="font-sans text-xs text-navy-500">Daily referral allocation</dt><dd>= daily contribution pool × 1%</dd></div>
              <div className="rounded-xl bg-mist p-3"><dt className="font-sans text-xs text-navy-500">Your referral percentage</dt><dd>= your eligible direct referrals ÷ total eligible members</dd></div>
              <div className="rounded-xl bg-mist p-3"><dt className="font-sans text-xs text-navy-500">Your daily referral share</dt><dd>= your percentage × daily referral allocation</dd></div>
            </dl>
            <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 text-sm text-navy-800">
              <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-gold-700" aria-hidden /> Illustration only — not a promise</p>
              <p className="mt-2">If 10,000,000 eligible members each contributed ₦100 in a day, the pool would be ₦1bn and the referral allocation ₦10m. A member whose verified, eligible direct referrals made up 10% of eligible members (1,000,000 people) would receive 10% — ₦1,000,000 — for that day.</p>
              <p className="mt-2 text-navy-600">Put simply: at ₦100 a day, <strong>each verified referral who contributes on a day is worth ₦1 for that day</strong>.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-x max-w-4xl">
          <SectionHeading eyebrow="Questions" title="Waitlist & referral FAQ" />
          <div className="mt-10 divide-y divide-navy-100 rounded-3xl border border-navy-100 bg-white">
            {WAITLIST_FAQ.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-medium text-navy-950 [&::-webkit-details-marker]:hidden">{f.q}<span className="text-navy-400 transition group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="mt-3 leading-relaxed text-navy-600">{f.a}</p>
              </details>
            ))}
          </div>
          <Callout tone="warning" title="Pre-launch disclaimer" className="mt-10">
            The Billionaire Circle has not launched and is not yet licensed. Joining the waitlist is free, is not an investment, does not guarantee any financial return and does not enrol you in any future paid programme.
            The referral rewards model is a proposal that will only operate if approved by the relevant authorities and funded from actual contributions. Read the <Link href="/referral-policy" className="underline">referral policy</Link>, <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy notice</Link>.
          </Callout>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <LinkButton href="#join" arrow>Join the waitlist</LinkButton>
            <LinkButton href="/referral-policy" variant="outline"><Gift className="h-4 w-4" aria-hidden /> Read the referral policy</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
