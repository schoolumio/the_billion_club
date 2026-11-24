"use client";
import { useActionState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { AdminState } from "@/lib/referrals/admin-actions";
import { keepValues } from "@/lib/forms";

type Action = (s: AdminState, f: FormData) => Promise<AdminState>;

/** Generic client wrapper so server-rendered admin forms get pending + result states. */
export function ActionForm({ action, children, submit, className, reset }: { action: Action; children?: React.ReactNode; submit: string; className?: string; reset?: boolean }) {
  const [state, run, pending] = useActionState<AdminState, FormData>(action, {});
  return (
    <form action={run} onSubmit={reset ? undefined : keepValues(run)} className={className}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-[#0d1b2b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{submit}
        </button>
        {state.message && <p role="status" className="text-sm text-good">{state.message}</p>}
        {state.ok && !state.message && <p role="status" className="text-sm text-good">Saved.</p>}
        {state.error && <p role="alert" className="text-sm text-critical">{state.error}</p>}
      </div>
    </form>
  );
}

export function RefreshButton({ action }: { action: () => Promise<AdminState> }) {
  const [state, run, pending] = useActionState(async () => action(), {} as AdminState);
  return (
    <form action={run} className="flex items-center gap-3">
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 hover:bg-mist disabled:opacity-60">
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden />Recalculate now
      </button>
      {state.message && <span className="text-xs text-good">{state.message}</span>}
    </form>
  );
}
