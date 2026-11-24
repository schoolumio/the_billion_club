import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main" className="grid min-h-dvh lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_bottom_left,black,transparent_70%)]" aria-hidden />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
          <Link href="/" className="relative"><Logo tone="light" /></Link>
          <div className="relative">
            <p className="font-display text-4xl leading-tight">Together, we build<br /><span className="gold-text">billionaires.</span></p>
            <p className="mt-4 max-w-md text-navy-200">Your invite link, your referrals, your updates and your opportunities — all in one safe place.</p>
          </div>
          <p className="relative text-xs text-navy-400">We haven&apos;t launched yet. No real money is taken.</p>
        </aside>
        <div className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-block lg:hidden"><Logo /></Link>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
