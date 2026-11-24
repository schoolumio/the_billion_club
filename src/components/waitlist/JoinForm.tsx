"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { joinAction, type FormState } from "@/lib/auth/actions";
import { FieldError, Password, Submit, input } from "@/components/auth/forms";
import { NG_STATES } from "@/lib/content/states";
import { keepValues } from "@/lib/forms";

export function JoinForm({ prefill, linkRef, campaign, inviter }: { prefill: string; linkRef: string; campaign: string; inviter: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(joinAction, {});
  const [startedAt, setStartedAt] = useState(0);
  const [code, setCode] = useState(prefill);
  useEffect(() => setStartedAt(Date.now()), []);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} onSubmit={keepValues(action)} className="space-y-4" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="linkRef" value={linkRef} />
      <input type="hidden" name="campaign" value={campaign} />
      {/* Honeypot: hidden from people, irresistible to simple bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-critical">{state.error}</p>}

      <label className="block text-sm font-medium text-navy-800">Full name<input name="fullName" autoComplete="name" required className={input} /><FieldError e={fe.fullName} /></label>
      <label className="block text-sm font-medium text-navy-800">Email address<input name="email" type="email" autoComplete="email" inputMode="email" required className={input} /><FieldError e={fe.email} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy-800">Phone number<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="0803 123 4567" required className={input} /><FieldError e={fe.phone} /></label>
        <label className="block text-sm font-medium text-navy-800">State
          <select name="state" required defaultValue="" className={input}><option value="" disabled>Select…</option>{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select>
          <FieldError e={fe.state} />
        </label>
      </div>
      <label className="block text-sm font-medium text-navy-800" htmlFor="password">Create a password <span className="font-normal text-navy-500">(10+ characters, a capital letter and a number)</span></label>
      <div className="!mt-1"><Password name="password" autoComplete="new-password" /><FieldError e={fe.password} /></div>

      <div>
        <label className="block text-sm font-medium text-navy-800">Referral code <span className="font-normal text-navy-500">(optional)</span>
          <input name="ref" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="TBC…" autoComplete="off" className={input + " font-mono uppercase tracking-wider"} />
        </label>
        {inviter && code === prefill && prefill && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-good"><BadgeCheck className="h-3.5 w-3.5" aria-hidden />Invited by {inviter}. You can change or clear this code before joining.</p>
        )}
        <FieldError e={fe.ref} />
      </div>

      <fieldset className="space-y-2.5 rounded-2xl bg-mist p-4 text-sm text-navy-800">
        <legend className="sr-only">Confirmations</legend>
        <label className="flex gap-3"><input type="checkbox" name="adult" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0d1b2b]" /><span>I am 18 years or older.</span></label>
        <label className="flex gap-3"><input type="checkbox" name="consentNotInvestment" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0d1b2b]" /><span>I understand joining is <strong>free</strong>, is <strong>not an investment</strong>, guarantees <strong>no financial return</strong> and does not enrol me in any future paid programme.</span></label>
        <label className="flex gap-3"><input type="checkbox" name="consentTerms" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0d1b2b]" /><span>I accept the <Link href="/terms" className="underline" target="_blank">terms</Link>, <Link href="/privacy" className="underline" target="_blank">privacy notice</Link> and <Link href="/referral-policy" className="underline" target="_blank">referral policy</Link>.</span></label>
        <label className="flex gap-3 text-navy-600"><input type="checkbox" name="leaderboardOptIn" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0d1b2b]" /><span>Optional: show my first name on the public referral leaderboard.</span></label>
        <label className="flex gap-3 text-navy-600"><input type="checkbox" name="marketingConsent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0d1b2b]" /><span>Optional: send me updates about TBC by email or SMS.</span></label>
      </fieldset>
      {(fe.adult || fe.consentNotInvestment || fe.consentTerms) && <FieldError e={fe.adult ?? fe.consentNotInvestment ?? fe.consentTerms} />}

      <Submit pending={pending}>Join the waitlist — it&apos;s free</Submit>
      <p className="text-center text-sm text-navy-600">Already joined? <Link href="/login" className="font-semibold text-navy-950 underline-offset-2 hover:underline">Sign in</Link></p>
    </form>
  );
}
