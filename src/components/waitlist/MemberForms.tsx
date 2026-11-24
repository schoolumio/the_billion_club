"use client";
import { useActionState, useState } from "react";
import { submitAppeal, updateLeaderboardPrefs, type ActionState } from "@/lib/referrals/actions";
import { resendVerification } from "@/lib/auth/actions";
import { keepValues } from "@/lib/forms";

export function LeaderboardPrefs({ optIn, alias, preview }: { optIn: boolean; alias: string; preview: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateLeaderboardPrefs, {});
  return (
    <form action={action} onSubmit={keepValues(action)} className="space-y-3 text-sm">
      <label className="flex items-start gap-3"><input type="checkbox" name="optIn" defaultChecked={optIn} className="mt-0.5 h-4 w-4 accent-[#0d1b2b]" /><span>Show me on the public leaderboard</span></label>
      <label className="block text-navy-700">Display name (optional)
        <input name="alias" defaultValue={alias} maxLength={30} placeholder={preview} className="mt-1 block w-full rounded-xl border border-navy-200 px-3 py-2 text-sm" />
      </label>
      <p className="text-xs text-navy-500">If you don&apos;t opt in, you appear as an anonymous member. We never show your email, phone or full surname.</p>
      <button disabled={pending} className="rounded-full bg-[#0d1b2b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">Save privacy settings</button>
      {state.ok && <span role="status" className="ml-3 text-xs text-good">Saved</span>}
      {state.error && <p role="alert" className="text-xs text-critical">{state.error}</p>}
    </form>
  );
}

export function AppealForm({ referralId }: { referralId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(submitAppeal, {});
  if (state.ok) return <span className="text-xs font-semibold text-good">Appeal submitted</span>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-navy-700 underline-offset-2 hover:underline">Appeal</button>;
  return (
    <form action={action} onSubmit={keepValues(action)} className="mt-2 space-y-2">
      <input type="hidden" name="referralId" value={referralId} />
      <textarea name="reason" required minLength={15} rows={3} placeholder="Explain why this referral is genuine (e.g. a family member using the same phone)." className="w-full rounded-lg border border-navy-200 px-3 py-2 text-xs" />
      <div className="flex gap-2">
        <button disabled={pending} className="rounded-full bg-[#0d1b2b] px-3 py-1.5 text-xs font-semibold text-white">Submit appeal</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-navy-500">Cancel</button>
      </div>
      {state.error && <p role="alert" className="text-xs text-critical">{state.error}</p>}
    </form>
  );
}

export function ResendVerification() {
  const [state, action, pending] = useActionState(async () => { const r = await resendVerification(); return { ...r, done: !r.error }; }, { done: false } as { done: boolean; error?: string });
  return (
    <form action={action}>
      <button disabled={pending || state.done} className="rounded-full bg-[#0d1b2b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{state.done ? "Email sent" : "Resend verification email"}</button>
      {state.error && <p role="alert" className="mt-1 text-xs text-critical">{state.error}</p>}
    </form>
  );
}
