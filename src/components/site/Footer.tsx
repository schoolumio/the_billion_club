import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FOOTER } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug text-white">Be part of the movement that builds wealth together.</p>
          <Link href="/join" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400">Join the waitlist — free</Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
            A community wealth movement for Nigeria. We haven&apos;t launched yet: we aren&apos;t taking any money,
            no one has won anything yet, and we&apos;re not licensed yet.
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {Object.entries(FOOTER).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{group}</p>
              <ul className="mt-4 space-y-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-navy-200 transition hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs leading-relaxed text-navy-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} The Billionaire Circle. All figures are targets or projections unless labelled otherwise.</p>
          <p>Payments to TBC are not investments and earn no return.</p>
        </div>
      </div>
    </footer>
  );
}
