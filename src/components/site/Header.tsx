"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV } from "@/lib/nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const solid = scrolled || open;

  return (
    <header className={clsx("fixed inset-x-0 top-0 z-50 transition-all duration-500", solid ? "bg-white/90 shadow-[0_1px_0_rgba(11,24,52,0.08)] backdrop-blur-xl" : "bg-transparent")}>
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" aria-label="The Billionaire Circle — home" className="shrink-0">
          <Logo tone={solid ? "dark" : "light"} />
        </Link>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href} className={"secondary" in n ? "hidden 2xl:block" : undefined}>
                <Link
                  href={n.href}
                  aria-current={path === n.href ? "page" : undefined}
                  className={clsx(
                    "whitespace-nowrap rounded-full px-2.5 py-2 text-[0.82rem] font-medium transition-colors",
                    solid ? "text-navy-700 hover:text-navy-950" : "text-white/80 hover:text-white",
                    path === n.href && (solid ? "text-navy-950" : "text-white"),
                  )}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={clsx("hidden rounded-full px-4 py-2 text-sm font-semibold sm:inline-flex", solid ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10")}>
            Sign in
          </Link>
          <Link href="/register" className="hidden rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 sm:inline-flex">
            Register interest
          </Link>
          <button
            type="button"
            className={clsx("inline-flex h-10 w-10 items-center justify-center rounded-full xl:hidden", solid ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-navy-100 bg-white xl:hidden">
          <ul className="container-x grid gap-1 py-4">
            {[...NAV, { href: "/compliance", label: "Regulatory readiness" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-xl px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50">
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/login" className="rounded-full border border-navy-200 px-4 py-3 text-center text-sm font-semibold text-navy-900">Sign in</Link>
              <Link href="/register" className="rounded-full bg-gold-500 px-4 py-3 text-center text-sm font-semibold text-navy-950">Register interest</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
