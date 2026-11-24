import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, FlaskConical, Hourglass, Lightbulb, Target, ShieldCheck } from "lucide-react";

export function Eyebrow({ children, tone = "gold", className }: { children: ReactNode; tone?: "gold" | "navy" | "light"; className?: string }) {
  return (
    <p
      className={clsx(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
        tone === "gold" && "text-gold-700",
        tone === "navy" && "text-navy-500",
        tone === "light" && "text-gold-300",
        className,
      )}
    >
      <span className={clsx("h-px w-6", tone === "light" ? "bg-gold-300" : "bg-gold-500")} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={clsx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow tone={tone === "light" ? "light" : "gold"} className={align === "center" ? "justify-center" : ""}>{eyebrow}</Eyebrow>}
      <h2 className={clsx("mt-4 text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-[2.75rem]", tone === "light" ? "text-white" : "text-navy-950")}>{title}</h2>
      {lead && <p className={clsx("mt-5 text-base leading-relaxed sm:text-lg", tone === "light" ? "text-navy-200" : "text-navy-600")}>{lead}</p>}
    </div>
  );
}

type BtnVariant = "gold" | "navy" | "outline" | "outline-light" | "ghost";
const btn: Record<BtnVariant, string> = {
  gold: "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_8px_30px_-12px_rgba(200,154,36,0.8)]",
  navy: "bg-navy-900 text-white hover:bg-navy-800",
  outline: "border border-navy-200 text-navy-900 hover:border-navy-900 bg-white",
  "outline-light": "border border-white/25 text-white hover:bg-white/10",
  ghost: "text-navy-800 hover:text-navy-950 hover:bg-navy-50",
};

export function LinkButton({ href, variant = "gold", arrow, className, children, ...rest }: ComponentProps<typeof Link> & { variant?: BtnVariant; arrow?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx("group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300", btn[variant], className)}
      {...rest}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </Link>
  );
}

export function Button({ variant = "gold", className, ...rest }: ComponentProps<"button"> & { variant?: BtnVariant }) {
  return (
    <button
      className={clsx("inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60", btn[variant], className)}
      {...rest}
    />
  );
}

/**
 * Status labels used everywhere a figure or feature appears, so nobody can
 * mistake a target or demonstration for an achievement.
 */
export type StatusKind = "target" | "demo" | "proposed" | "pending" | "live" | "projection";
const status: Record<StatusKind, { label: string; cls: string; Icon: typeof Target }> = {
  target: { label: "Target — not yet reached", cls: "bg-gold-50 text-gold-800 ring-gold-200", Icon: Target },
  projection: { label: "Estimate", cls: "bg-gold-50 text-gold-800 ring-gold-200", Icon: Target },
  demo: { label: "Sample data", cls: "bg-violet-50 text-violet-800 ring-violet-200", Icon: FlaskConical },
  proposed: { label: "Planned", cls: "bg-sky-50 text-sky-800 ring-sky-200", Icon: Lightbulb },
  pending: { label: "Starts after approval", cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: Hourglass },
  live: { label: "Ready now", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: ShieldCheck },
};

export function StatusBadge({ kind, label, className }: { kind: StatusKind; label?: string; className?: string }) {
  const s = status[kind];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ring-1 ring-inset", s.cls, className)}>
      <s.Icon className="h-3 w-3" aria-hidden />
      {label ?? s.label}
    </span>
  );
}

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={clsx("rounded-2xl border border-navy-100 bg-white p-6 shadow-[0_1px_2px_rgba(11,24,52,0.04),0_12px_40px_-24px_rgba(11,24,52,0.18)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-20 pt-32 text-white sm:pb-24 sm:pt-40">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" aria-hidden />
      <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <div className="container-x relative">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl animate-fade-up text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-navy-200 [animation-delay:120ms]">{lead}</p>
        {children && <div className="mt-8 animate-fade-up [animation-delay:200ms]">{children}</div>}
      </div>
    </section>
  );
}

export function Callout({ tone = "info", title, children, className }: { tone?: "info" | "warning" | "gold"; title: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-5 sm:p-6",
        tone === "info" && "border-navy-200 bg-navy-50",
        tone === "warning" && "border-amber-200 bg-amber-50",
        tone === "gold" && "border-gold-200 bg-gold-50",
        className,
      )}
    >
      <p className={clsx("text-sm font-semibold", tone === "warning" ? "text-amber-900" : "text-navy-900")}>{title}</p>
      <div className={clsx("mt-2 text-sm leading-relaxed", tone === "warning" ? "text-amber-900/90" : "text-navy-700")}>{children}</div>
    </div>
  );
}
