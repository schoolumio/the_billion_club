import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
const NAVY = "#0d1b2b";
const GOLD = "#d4af37";

/** Branded 1200×630 share image used by WhatsApp, Facebook, X, Telegram and LinkedIn previews. */
export function renderOg({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: NAVY, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", color: "white", position: "relative" }}>
        <div style={{ position: "absolute", right: -160, top: -160, width: 560, height: 560, borderRadius: 999, background: "#13263d", border: "2px solid rgba(212,175,55,0.35)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 86, height: 86, borderRadius: 999, border: `5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 30, fontWeight: 800, position: "relative" }}>
            TBC
            <div style={{ position: "absolute", top: -11, width: 16, height: 16, borderRadius: 999, background: "#f5d06a", display: "flex" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: GOLD, fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>THE BILLIONAIRE CIRCLE</div>
            <div style={{ marginTop: 6, borderTop: "2px solid #e7d192", paddingTop: 6, fontSize: 16, letterSpacing: 4 }}>TOGETHER, WE BUILD BILLIONAIRES.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#e5cf7e", fontSize: 22, letterSpacing: 5, textTransform: "uppercase", display: "flex" }}>{eyebrow}</div>
          <div style={{ marginTop: 16, fontSize: 64, lineHeight: 1.08, fontWeight: 700, maxWidth: 1000, display: "flex" }}>{title}</div>
          <div style={{ marginTop: 20, fontSize: 28, color: "#c6d0df", maxWidth: 960, display: "flex" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: "#98a8c1" }}>
          <div style={{ display: "flex" }}>Free to join · Not an investment · Pre-launch</div>
          <div style={{ display: "flex", background: GOLD, color: NAVY, borderRadius: 999, padding: "12px 28px", fontWeight: 700, fontSize: 22 }}>Join the waitlist →</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
