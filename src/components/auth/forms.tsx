"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, registerAction, type FormState } from "@/lib/auth/actions";

const input = "mt-1.5 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-navy-300 focus:border-navy-900 focus:outline-none focus:ring-4 focus:ring-navy-100";

function FieldError({ e }: { e?: string[] }) {
  return e?.length ? <p className="mt-1.5 text-xs font-medium text-critical">{e[0]}</p> : null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

function Password({ name, autoComplete, error }: { name: string; autoComplete: string; error?: string[] }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={name} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required className={input + " pr-12"} aria-invalid={!!error} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-[calc(50%+3px)] -translate-y-1/2 text-navy-400 hover:text-navy-800" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-critical">{state.error}</p>}
      <label className="block text-sm font-medium text-navy-800">Email address
        <input name="email" type="email" autoComplete="email" required className={input} aria-invalid={!!state.fieldErrors?.email} />
        <FieldError e={state.fieldErrors?.email} />
      </label>
      <label className="block text-sm font-medium text-navy-800" htmlFor="password">Password</label>
      <div className="!mt-0"><Password name="password" autoComplete="current-password" error={state.fieldErrors?.password} /><FieldError e={state.fieldErrors?.password} /></div>
      <Submit pending={pending}>Sign in securely</Submit>
      <p className="text-center text-sm text-navy-600">New here? <Link href="/register" className="font-semibold text-navy-950 underline-offset-2 hover:underline">Register your interest</Link></p>
    </form>
  );
}

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","Outside Nigeria"];

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-critical">{state.error}</p>}
      <label className="block text-sm font-medium text-navy-800">Full name<input name="fullName" autoComplete="name" required className={input} /><FieldError e={fe.fullName} /></label>
      <label className="block text-sm font-medium text-navy-800">Email address<input name="email" type="email" autoComplete="email" required className={input} /><FieldError e={fe.email} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy-800">Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+234 …" required className={input} /><FieldError e={fe.phone} /></label>
        <label className="block text-sm font-medium text-navy-800">State
          <select name="state" required defaultValue="" className={input}><option value="" disabled>Select…</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
          <FieldError e={fe.state} />
        </label>
      </div>
      <label className="block text-sm font-medium text-navy-800" htmlFor="password">Password <span className="font-normal text-navy-500">(10+ characters, an uppercase letter and a number)</span></label>
      <div className="!mt-1"><Password name="password" autoComplete="new-password" /><FieldError e={fe.password} /></div>
      <label className="flex gap-3 rounded-xl bg-gold-50 p-4 text-sm text-navy-800">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#0b1834]" />
        <span>I understand this is a <strong>pre-launch registration of interest</strong>. No payment is requested or accepted, and registration does not make me eligible for any award.</span>
      </label>
      <FieldError e={fe.consent} />
      <Submit pending={pending}>Create my account</Submit>
      <p className="text-center text-sm text-navy-600">Already registered? <Link href="/login" className="font-semibold text-navy-950 underline-offset-2 hover:underline">Sign in</Link></p>
    </form>
  );
}
