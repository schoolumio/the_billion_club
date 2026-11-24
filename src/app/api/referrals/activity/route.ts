import { NextResponse } from "next/server";
import { z } from "zod";
import { recordActivity } from "@/lib/referrals/server";
import { normalizeCode } from "@/lib/referrals/codes";
import { getSession, clientIp } from "@/lib/auth/session";
import { one } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const body = z.object({ code: z.string().max(20).optional(), kind: z.enum(["click", "share"]), channel: z.string().max(24) });

/** Click (public) and share (signed-in owner only) counters. Aggregated per day — no per-event personal data stored. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const ip = await clientIp();
  if (!rateLimit(`activity:${ip}`, 60, 60_000).ok) return NextResponse.json({ ok: false }, { status: 429 });
  let code = normalizeCode(parsed.data.code);
  if (parsed.data.kind === "share") {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false }, { status: 401 });
    code = (await one<{ referral_code: string }>(`SELECT referral_code FROM users WHERE id = $1`, [s.sub]))?.referral_code ?? null;
  }
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });
  try { await recordActivity(code, parsed.data.kind, parsed.data.channel); } catch { /* counters are best-effort */ }
  return NextResponse.json({ ok: true });
}
