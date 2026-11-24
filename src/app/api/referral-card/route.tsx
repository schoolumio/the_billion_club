import { ImageResponse } from "next/og";
import { getSession } from "@/lib/auth/session";
import { one } from "@/lib/db";
import { getConfig } from "@/lib/referrals/server";
import { referralUrl } from "@/lib/referrals/codes";
import { qrSvg } from "@/lib/referrals/qr";

export const runtime = "nodejs";

const NAVY = "#0d1b2b";
const GOLD = "#d4af37";

/** Branded, personalised referral card (1080×1350) or printable A4 flyer (1240×1754). */
export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return new Response("Sign in to download your card", { status: 401 });
  const u = await one<{ referral_code: string; full_name: string }>(`SELECT referral_code, full_name FROM users WHERE id = $1`, [s.sub]);
  if (!u) return new Response("Not found", { status: 404 });
  const { config } = await getConfig();
  const url = referralUrl(config.baseUrl, u.referral_code);
  const flyer = new URL(req.url).searchParams.get("format") === "flyer";
  const svg = await qrSvg(url);
  const qrData = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const [W, H] = flyer ? [1240, 1754] : [1080, 1350];
  const first = u.full_name.split(" ")[0];

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: flyer ? 110 : 80, color: "white", fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: 999, border: `7px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 44, fontWeight: 800, position: "relative" }}>
            TBC
            <div style={{ position: "absolute", top: -14, width: 22, height: 22, borderRadius: 999, background: "#f5d06a" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: GOLD, fontSize: 52, fontWeight: 800, letterSpacing: 2 }}>THE BILLIONAIRE</div>
            <div style={{ color: GOLD, fontSize: 52, fontWeight: 800, letterSpacing: 2 }}>CIRCLE</div>
            <div style={{ marginTop: 10, borderTop: "2px solid #e7d192", paddingTop: 10, fontSize: 22, letterSpacing: 3, fontFamily: "sans-serif" }}>TOGETHER, WE BUILD BILLIONAIRES.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: flyer ? 76 : 64, lineHeight: 1.1, fontWeight: 700, maxWidth: W - 200, display: "flex", textAlign: "center" }}>{`${first} invites you to join the founding community.`}</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#c3cfe6", fontFamily: "sans-serif", maxWidth: W - 260, display: "flex", textAlign: "center" }}>Be part of the movement that builds wealth together.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "white", padding: 22, borderRadius: 28, display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrData} width={flyer ? 520 : 380} height={flyer ? 520 : 380} alt="" />
          </div>
          <div style={{ marginTop: 26, fontSize: 30, fontFamily: "sans-serif", color: "#e7d192", display: "flex" }}>{url.replace(/^https?:\/\//, "")}</div>
          <div style={{ marginTop: 8, fontSize: 34, fontFamily: "monospace", letterSpacing: 6, color: GOLD, display: "flex" }}>{u.referral_code}</div>
        </div>
        <div style={{ fontSize: 22, color: "#94a7cd", fontFamily: "sans-serif", display: "flex", textAlign: "center", maxWidth: W - 160 }}>
          Free to join. Not an investment. No guaranteed returns. Pre-launch waitlist — TBC is not yet licensed.
        </div>
      </div>
    ),
    { width: W, height: H, headers: { "Cache-Control": "private, no-store" } },
  );
}
