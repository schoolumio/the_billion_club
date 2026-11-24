"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  Briefcase, Coins, Factory, FlaskConical, Gift, Headset, Landmark, LayoutDashboard, LifeBuoy, LogOut, Megaphone, Menu,
  MoreHorizontal, ReceiptText, ScrollText, Settings2, ShieldAlert, Sprout, UserRoundCheck, UserSearch, Users, X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";

const ICONS = { LayoutDashboard, ReceiptText, Briefcase, LifeBuoy, UserRoundCheck, Users, Landmark, Factory, ShieldAlert, ScrollText, Headset, Gift, Megaphone, Sprout, UserSearch, Settings2, Coins };

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** Group heading shown above the first item of each group. */
  section?: string;
  /** Count of items needing attention (shown as a gold pill). */
  badge?: number;
  /** Short label for the mobile bottom bar; items with it appear there (max 4). */
  short?: string;
}

const isActive = (path: string, href: string) => href === path || (href !== "/dashboard" && href !== "/admin" && path.startsWith(href));

function greeting() {
  const h = Number(new Date().toLocaleString("en-NG", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function AppShell({ nav, user, area, children, logout, switchLink, action }: {
  nav: NavItem[];
  user: { name: string; email: string; role: string };
  area: string;
  children: ReactNode;
  logout: () => Promise<void>;
  switchLink?: { href: string; label: string };
  /** Primary call to action in the top bar. */
  action?: { href: string; label: string };
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [hello, setHello] = useState("Welcome");
  useEffect(() => setHello(greeting()), []);
  useEffect(() => setOpen(false), [path]);
  const first = user.name.split(" ")[0];
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const bottom = nav.filter((n) => n.short).slice(0, 4);
  const current = [...nav].reverse().find((n) => isActive(path, n.href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <Link href="/" aria-label="The Billionaire Circle — home"><Logo tone="light" stacked /></Link>
        <button className="rounded-lg p-2 text-navy-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="mx-4 mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-300">{area}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={area}>
        {nav.map((n, i) => {
          const I = ICONS[n.icon];
          const active = isActive(path, n.href) && current?.href === n.href;
          const heading = n.section && n.section !== nav[i - 1]?.section;
          return (
            <div key={n.href}>
              {heading && <p className="px-3 pb-1.5 pt-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-navy-400">{n.section}</p>}
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-white/10 text-white" : "text-navy-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {active && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-gold-400" aria-hidden />}
                <I className={clsx("h-[1.05rem] w-[1.05rem] shrink-0", active ? "text-gold-300" : "text-navy-400 group-hover:text-navy-200")} aria-hidden />
                <span className="flex-1 truncate">{n.label}</span>
                {!!n.badge && <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[0.65rem] font-bold text-navy-950 tabular" aria-label={`${n.badge} need attention`}>{n.badge > 99 ? "99+" : n.badge}</span>}
              </Link>
            </div>
          );
        })}
      </nav>
      {switchLink && (
        <div className="px-4 pb-3"><Link href={switchLink.href} className="block rounded-xl border border-white/10 px-3 py-2.5 text-center text-xs font-semibold text-gold-200 transition hover:bg-white/5">{switchLink.label}</Link></div>
      )}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-xs font-bold text-navy-950">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-navy-400">{user.role}</p>
          </div>
          <form action={logout}><button className="rounded-lg p-2 text-navy-300 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out"><LogOut className="h-4 w-4" /></button></form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f4f6f9]">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[17rem] bg-navy-950 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-0 w-[17rem] bg-navy-950 shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-30 border-b border-navy-100/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
            <button className={clsx("rounded-lg p-2 text-navy-800 hover:bg-navy-50 lg:hidden", bottom.length && "hidden")} onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <Link href="/" className={clsx("lg:hidden", !bottom.length && "hidden")} aria-label="Home"><LogoMark className="h-9 w-9" /></Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-950">{hello}, {first}</p>
              <p className="hidden truncate text-xs text-navy-500 sm:block">{current?.label ?? area}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-200 sm:inline-flex" title="Sample data — no real money is processed">
              <FlaskConical className="h-3 w-3" aria-hidden /> Demo version
            </span>
            {action && (
              <Link href={action.href} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 shadow-[0_6px_18px_-10px_rgba(212,175,55,0.9)] transition hover:bg-gold-400">
                <Gift className="h-4 w-4" aria-hidden />{action.label}
              </Link>
            )}
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-gold-300 lg:flex" title={user.email}>{initials}</span>
          </div>
        </header>

        <main id="main" className={clsx("mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8 sm:py-8", bottom.length && "pb-28 lg:pb-8")}>{children}</main>
      </div>

      {bottom.length > 0 && (
        <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <ul className="grid grid-cols-5">
            {bottom.map((n) => {
              const I = ICONS[n.icon];
              const active = current?.href === n.href;
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={clsx("flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold", active ? "text-navy-950" : "text-navy-400")}>
                    <span className={clsx("flex h-8 w-12 items-center justify-center rounded-full transition", active && "bg-gold-100")}><I className={clsx("h-5 w-5", active && "text-gold-700")} aria-hidden /></span>
                    {n.short}
                  </Link>
                </li>
              );
            })}
            <li>
              <button type="button" onClick={() => setOpen(true)} className="flex w-full flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold text-navy-400">
                <span className="flex h-8 w-12 items-center justify-center"><MoreHorizontal className="h-5 w-5" aria-hidden /></span>More
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
