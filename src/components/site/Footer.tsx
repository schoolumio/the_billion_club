import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FOOTER } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug text-white">Small daily. Shared prosperity.</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
            A proposed community wealth creation initiative for Nigeria. Currently in pre-launch: no contributions are collected,
            no awards have been made and no licence has yet been granted.
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
          <p>© {new Date().getFullYear()} The Billion Club (working name). All figures are targets or projections unless labelled otherwise.</p>
          <p>Member contributions are not investments and carry no guaranteed return.</p>
        </div>
      </div>
    </footer>
  );
}
