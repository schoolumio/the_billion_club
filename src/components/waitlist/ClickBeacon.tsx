"use client";
import { useEffect } from "react";

/** Counts one visit per referral code per browser session. No personal data is sent. */
export function ClickBeacon({ code, channel }: { code: string; channel: string }) {
  useEffect(() => {
    const key = `tbc_click_${code}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* private mode */ }
    fetch("/api/referrals/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, kind: "click", channel }), keepalive: true }).catch(() => {});
  }, [code, channel]);
  return null;
}
