import { clsx } from "clsx";
import type { ReactNode } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, Info, XCircle } from "lucide-react";

export function PageTitle({ title, lead, actions, eyebrow }: { title: string; lead?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-700">{eyebrow}</p>}
        <h1 className="text-2xl font-medium text-navy-950 sm:text-[2rem] sm:leading-tight">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-500">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, action, children, className }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-navy-100/80 bg-white p-5 shadow-[0_1px_2px_rgba(13,27,43,0.04)] sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-[0.95rem] font-semibold tracking-normal text-navy-950">{title}</h2>}
            {description && <p className="mt-0.5 text-xs leading-relaxed text-navy-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone = "default", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "navy" | "gold"; icon?: ReactNode }) {
  return (
    <div
      className={clsx(
        "flex min-h-[7.5rem] flex-col rounded-2xl border p-4 shadow-[0_1px_2px_rgba(13,27,43,0.04)] sm:p-5",
        tone === "navy" && "border-navy-900 bg-gradient-to-br from-navy-900 to-navy-950 text-white",
        tone === "gold" && "border-gold-200 bg-gradient-to-br from-gold-50 to-white",
        tone === "default" && "border-navy-100/80 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={clsx("text-[0.7rem] font-semibold uppercase tracking-wider", tone === "navy" ? "text-navy-300" : "text-navy-500")}>{label}</p>
        {icon && <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone === "navy" ? "bg-white/10" : "bg-gold-50")}>{icon}</span>}
      </div>
      <p className={clsx("mt-auto pt-3 font-display text-2xl tabular sm:text-[1.75rem]", tone === "navy" ? "text-white" : "text-navy-950")}>{value}</p>
      {hint && <p className={clsx("mt-1 text-xs leading-snug", tone === "navy" ? "text-navy-300" : "text-navy-500")}>{hint}</p>}
    </div>
  );
}

/** Friendly placeholder for lists with nothing in them yet. */
export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      {icon && <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">{icon}</span>}
      <p className="mt-4 font-medium text-navy-950">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm leading-relaxed text-navy-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Highlighted "needs attention" link card. */
export function AttentionCard({ href, label, count, hint, tone = "gold", icon }: { href: string; label: string; count: number; hint: string; tone?: "gold" | "red" | "navy"; icon: ReactNode }) {
  const quiet = count === 0;
  return (
    <a
      href={href}
      className={clsx(
        "group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md",
        quiet ? "border-navy-100 bg-white" : tone === "red" ? "border-red-200 bg-red-50/60" : tone === "navy" ? "border-navy-200 bg-navy-50" : "border-gold-200 bg-gold-50/70",
      )}
    >
      <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", quiet ? "bg-mist text-navy-400" : tone === "red" ? "bg-white text-critical" : "bg-white text-gold-700")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-navy-950">{label}</span>
        <span className="block truncate text-xs text-navy-500">{quiet ? "All clear" : hint}</span>
      </span>
      <span className={clsx("font-display text-2xl tabular", quiet ? "text-navy-300" : "text-navy-950")}>{count}</span>
    </a>
  );
}

const pill: Record<string, { cls: string; Icon: typeof Info; label?: string }> = {
  verified: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  reconciled: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  resolved: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  complete: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  active: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  pending: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: Clock },
  in_progress: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: Clock, label: "In progress" },
  investigating: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: Clock },
  awaiting_regulator: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: Clock, label: "Awaiting regulator" },
  simulated: { cls: "bg-violet-50 text-violet-800 ring-violet-200", Icon: Info, label: "Simulated" },
  open: { cls: "bg-sky-50 text-sky-800 ring-sky-200", Icon: Info },
  unverified: { cls: "bg-navy-50 text-navy-700 ring-navy-200", Icon: Info },
  not_started: { cls: "bg-navy-50 text-navy-700 ring-navy-200", Icon: Info, label: "Not started" },
  closed: { cls: "bg-navy-50 text-navy-700 ring-navy-200", Icon: Info },
  dismissed: { cls: "bg-navy-50 text-navy-700 ring-navy-200", Icon: Info },
  failed: { cls: "bg-red-50 text-red-800 ring-red-200", Icon: XCircle },
  rejected: { cls: "bg-red-50 text-red-800 ring-red-200", Icon: XCircle },
  suspended: { cls: "bg-red-50 text-red-800 ring-red-200", Icon: XCircle },
  escalated: { cls: "bg-red-50 text-red-800 ring-red-200", Icon: AlertOctagon },
  low: { cls: "bg-navy-50 text-navy-700 ring-navy-200", Icon: Info },
  medium: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: AlertTriangle },
  high: { cls: "bg-orange-50 text-orange-800 ring-orange-200", Icon: AlertTriangle },
  critical: { cls: "bg-red-50 text-red-800 ring-red-200", Icon: AlertOctagon },
};

/** Status pill — always icon + text, never colour alone. */
export function Pill({ value }: { value: string }) {
  const p = pill[value] ?? pill.open;
  const text = p.label ?? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
  return (
    <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset", p.cls)}>
      <p.Icon className="h-3 w-3" aria-hidden />{text}
    </span>
  );
}

export function DemoTag() {
  return <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-violet-700">Demo</span>;
}

export function Table({ head, children, minWidth = 640 }: { head: ReactNode[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead><tr className="border-y border-navy-100 bg-[#f8f9fb] text-[0.68rem] uppercase tracking-wider text-navy-500">{head.map((h, i) => <th key={i} scope="col" className="whitespace-nowrap px-5 py-2.5 font-semibold sm:px-6">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-navy-50 [&>tr:hover]:bg-[#fafbfc]">{children}</tbody>
      </table>
    </div>
  );
}

export const td = "px-5 py-3 sm:px-6";

export const fmtDate = (d: Date | string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-NG", opts) : "—";
export const fmtDateTime = (d: Date | string) => new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
