import { renderOg } from "@/lib/og";
import { normalizeCode, maskName } from "@/lib/referrals/codes";
import { one } from "@/lib/db";

export const runtime = "nodejs";

/** Personalised preview for referral links: "Amara O. invites you…". Shows only first name + initial. */
export async function GET(req: Request) {
  const code = normalizeCode(new URL(req.url).searchParams.get("ref"));
  let name: string | null = null;
  if (code) {
    try {
      const u = await one<{ full_name: string }>(`SELECT full_name FROM users WHERE referral_code = $1 AND status = 'active' AND role = 'member'`, [code]);
      name = u ? maskName(u.full_name) : null;
    } catch { /* fall back to generic preview */ }
  }
  const res = renderOg({
    eyebrow: "Founding community invitation",
    title: name ? `${name} invites you to join The Billionaire Circle.` : "You're invited to join The Billionaire Circle.",
    subtitle: "Be part of the movement that builds wealth together. Free to join — it takes about a minute.",
  });
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res;
}
