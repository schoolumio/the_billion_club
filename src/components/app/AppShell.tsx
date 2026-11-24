"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { Briefcase, Factory, FlaskConical, Headset, Landmark, LayoutDashboard, LifeBuoy, LogOut, Menu, ReceiptText, ScrollText, ShieldAlert, UserRoundCheck, Users } from "lucide-react";

const ICONS = { LayoutDashboard, ReceiptText, Briefcase, LifeBuoy, UserRoundCheck, Users, Landmark, Factory, ShieldAlert, ScrollText, Headset };
import { Logo } from "@/components/ui/Logo";

export interface NavItem { href: string; label: string; icon: keyof typeof ICONS }

export function AppShell({ nav, user, area, children, logout, switchLink }: {
  nav: NavItem[];
  user: { name: string; email: string; role: string };
  area: string;
  children: ReactNode;
  logout: () => Promise<void>;
  switchLink?: { href: string; label: string };
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6"><Link href="/"><Logo tone="light" stacked /></Link></div>
      <p className="px-6 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-navy-400">{area}</p>
      <nav className="flex-1 space-y-0.5 px-3" aria-label={area}>
        {nav.map((n) => {
          const I = ICONS[n.icon];
          const active = n.href === path || (n.href !== "/dashboard" && n.href !== "/admin" && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
              className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-white/10 text-white" : "text-navy-300 hover:bg-white/5 hover:text-white")}>
              <I className={clsx("h-4 w-4", active && "text-gold-300")} aria-hidden />
              {n.label}
            </Link>
          );
        })}
      </nav>
      {switchLink && (
        <div className="px-3 pb-3"><Link href={switchLink.href} className="block rounded-xl border border-white/10 px-3 py-2.5 text-center text-xs font-semibold text-gold-200 hover:bg-white/5">{switchLink.label}</Link></div>
      )}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-navy-400">{user.role}</p>
          </div>
          <form action={logout}><button className="rounded-lg p-2 text-navy-300 hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-mist">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 bg-navy-950 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-navy-950/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-0 w-72 bg-navy-950">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-100 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button className="rounded-lg p-2 text-navy-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <p className="hidden text-sm text-navy-500 lg:block">Signed in as <span className="font-medium text-navy-900">{user.email}</span></p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-200">
            <FlaskConical className="h-3 w-3" aria-hidden /> Demonstration environment
          </span>
        </header>
        <main id="main" className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
