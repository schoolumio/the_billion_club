"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({ text, channel, label = "Copy" }: { text: string; channel: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
        fetch("/api/referrals/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "share", channel }), keepalive: true }).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-mist"
    >
      {done ? <Check className="h-3.5 w-3.5 text-good" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}
