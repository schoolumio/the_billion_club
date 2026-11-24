import { NextResponse } from "next/server";
import { getConfig, refreshReferralStats, runReferralRewards } from "@/lib/referrals/server";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Scheduled job (Vercel Cron → see vercel.json). Requires `Authorization: Bearer $CRON_SECRET`.
 *  1. Refreshes referral aggregates, ranks and the public snapshot.
 *  2. If the rewards engine is ACTIVE, calculates yesterday's live run (refused automatically otherwise).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const stats = await refreshReferralStats();
  const { config } = await getConfig();
  let rewards: unknown = "skipped (rewards engine not active)";
  if (config.rewardsState === "active") {
    const y = new Date(Date.now() + 60 * 60 * 1000 - 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // Lagos is UTC+1
    rewards = await runReferralRewards({ runDate: y, mode: "live", actor: { id: null, email: "system:cron" }, note: "Scheduled daily run" }).then((r) => ("error" in r ? r.error : { runId: r.runId }));
  }
  return NextResponse.json({ ok: true, stats, rewards });
}
