"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV, NAV_MORE } from "@/lib/nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);
  const path = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); setMore(false); }, [path]);
  useEffect(() => {
    if (!more) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !moreRef.current?.contains(e.target as Node)) setMore(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [more]);

  const solid = scrolled || open;
  const link = (active: boolean) =>
    clsx(
      "whitespace-nowrap rounded-full px-3 py-2 text-[0.85rem] font-medium transition-colors",
      solid ? "text-navy-700 hover:bg-navy-50 hover:text-navy-950" : "text-white/80 hover:bg-white/10 hover:text-white",
      active && (solid ? "text-navy-950" : "text-white"),
    );
  const moreActive = NAV_MORE.some((n) => n.href === path);

  return (
    <header className={clsx("fixed inset-x-0 top-0 z-50 transition-all duration-500", solid ? "bg-white/95 shadow-[0_1px_0_rgba(11,24,52,0.08)] backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="The Billionaire Circle — home" className="min-w-0 shrink">
          <Logo tone={solid ? "dark" : "light"} compactOnMobile />
        </Link>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={path === n.href ? "page" : undefined} className={link(path === n.href)}>{n.label}</Link>
              </li>
            ))}
            <li ref={moreRef} className="relative">
              <button type="button" aria-expanded={more} aria-haspopup="true" onClick={() => setMore((m) => !m)} className={clsx(link(moreActive), "inline-flex items-center gap-1")}>
                More <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", more && "rotate-180")} aria-hidden />
              </button>
              {more && (
                <ul className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-navy-100 bg-white p-1.5 shadow-xl shadow-navy-900/10">
                  {NAV_MORE.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} aria-current={path === n.href ? "page" : undefined} className={clsx("block rounded-xl px-3 py-2.5 text-sm font-medium text-navy-800 hover:bg-navy-50", path === n.href && "bg-navy-50 text-navy-950")}>{n.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/login" className={clsx("hidden whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition md:inline-flex", solid ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10")}>
            Sign in
          </Link>
          <Link href="/join" className="inline-flex items-center whitespace-nowrap rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 shadow-[0_6px_20px_-10px_rgba(200,154,36,0.9)] transition hover:bg-gold-400 sm:px-5">
            <span className="sm:hidden">Join</span><span className="hidden sm:inline">Join the waitlist</span>
          </Link>
          <button
            type="button"
            className={clsx("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full xl:hidden", solid ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10")}
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
          <ul className="mx-auto grid w-full max-w-[88rem] gap-1 px-4 py-4 sm:px-6">
            {[...NAV, ...NAV_MORE].map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={path === n.href ? "page" : undefined} className={clsx("block rounded-xl px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50", path === n.href && "bg-navy-50")}>{n.label}</Link>
              </li>
            ))}
            <li className="mt-3 grid grid-cols-2 gap-2 border-t border-navy-100 pt-4">
              <Link href="/login" className="whitespace-nowrap rounded-full border border-navy-200 px-4 py-3 text-center text-sm font-semibold text-navy-900">Sign in</Link>
              <Link href="/join" className="whitespace-nowrap rounded-full bg-gold-500 px-4 py-3 text-center text-sm font-semibold text-navy-950">Join the waitlist</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
