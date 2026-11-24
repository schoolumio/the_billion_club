"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "tbc_privacy_notice_v1";

/** Short, honest cookie notice. We only use essential and functional cookies — no advertising trackers. */
export function PrivacyNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem(KEY)); } catch { setShow(false); }
  }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Privacy notice" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-2xl shadow-navy-900/15 backdrop-blur sm:inset-x-auto sm:right-5 sm:bottom-5">
      <div className="flex gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden />
        <p className="text-sm leading-relaxed text-navy-700">
          We use only essential cookies — to keep you signed in, protect accounts from fraud and credit referral links. No advertising trackers. <Link href="/privacy" className="font-semibold text-navy-950 underline underline-offset-2">Privacy notice</Link>
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={() => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setShow(false); }} className="rounded-full bg-navy-950 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800">Got it</button>
      </div>
    </div>
  );
}
