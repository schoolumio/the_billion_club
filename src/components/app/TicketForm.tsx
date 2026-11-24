"use client";
import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { createTicket, type TicketState } from "@/lib/actions";
import { keepValues } from "@/lib/forms";

const field = "mt-1.5 block w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-navy-900 focus:outline-none focus:ring-4 focus:ring-navy-100";

export function TicketForm() {
  const [state, action, pending] = useActionState<TicketState, FormData>(createTicket, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} onSubmit={keepValues(action)} className="space-y-4">
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-critical">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Your request has been received. Our team will respond here.</p>}
      <label className="block text-sm font-medium text-navy-800">Category
        <select name="category" className={field} defaultValue="Account">
          {["Account", "Verification", "Contributions", "Fraud report", "Opportunities", "Other"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy-800">Subject<input name="subject" required maxLength={140} className={field} /></label>
      <label className="block text-sm font-medium text-navy-800">Message<textarea name="body" required rows={5} maxLength={4000} className={field} /></label>
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}Submit request
      </button>
    </form>
  );
}
