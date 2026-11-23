import { clsx } from "clsx";
import type { ReactNode } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, Info, XCircle } from "lucide-react";

export function PageTitle({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-medium text-navy-950">{title}</h1>
        {lead && <p className="mt-1.5 text-sm text-navy-500">{lead}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-navy-100 bg-white p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-sans text-base font-semibold tracking-normal text-navy-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone = "default", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "navy"; icon?: ReactNode }) {
  return (
    <div className={clsx("rounded-2xl border p-5", tone === "navy" ? "border-navy-900 bg-navy-950 text-white" : "border-navy-100 bg-white")}>
      <div className="flex items-center justify-between">
        <p className={clsx("text-xs font-medium uppercase tracking-wider", tone === "navy" ? "text-navy-300" : "text-navy-500")}>{label}</p>
        {icon}
      </div>
      <p className={clsx("mt-3 font-display text-3xl tabular", tone === "navy" ? "text-white" : "text-navy-950")}>{value}</p>
      {hint && <p className={clsx("mt-1 text-xs", tone === "navy" ? "text-navy-300" : "text-navy-500")}>{hint}</p>}
    </div>
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
        <thead><tr className="border-b border-navy-100 text-xs uppercase tracking-wider text-navy-500">{head.map((h, i) => <th key={i} className="whitespace-nowrap px-5 py-3 font-medium sm:px-6">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-navy-50">{children}</tbody>
      </table>
    </div>
  );
}

export const td = "px-5 py-3 sm:px-6";

export const fmtDate = (d: Date | string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-NG", opts) : "—";
export const fmtDateTime = (d: Date | string) => new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
