import "server-only";
import { query } from "@/lib/db";

/**
 * Email delivery. Uses Resend when RESEND_API_KEY is set; otherwise records the
 * message in `email_outbox` only, and the UI shows the link directly (clearly
 * marked) so the pre-launch demo remains usable.
 */
export const emailDeliveryConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(to: string, subject: string, body: string) {
  let status = "logged";
  let error: string | null = null;
  const provider = emailDeliveryConfigured() ? "resend" : "outbox";
  if (provider === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "The Billionaire Circle <no-reply@thebillionairecircle.club>", to, subject, text: body }),
      });
      status = res.ok ? "sent" : "failed";
      if (!res.ok) error = `HTTP ${res.status}`;
    } catch (e) {
      status = "failed";
      error = (e as Error).message;
    }
  }
  await query(`INSERT INTO email_outbox(to_email, subject, body, provider, status, error) VALUES ($1,$2,$3,$4,$5,$6)`, [to, subject, body, provider, status, error]);
  return { status };
}
