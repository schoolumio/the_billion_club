"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query, one } from "@/lib/db";
import { audit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export interface TicketState { ok?: boolean; error?: string }

const ticketSchema = z.object({
  subject: z.string().trim().min(4, "Subject is too short").max(140),
  category: z.enum(["Account", "Verification", "Contributions", "Fraud report", "Opportunities", "Other"]),
  body: z.string().trim().min(10, "Please describe your request").max(4000),
});

export async function createTicket(_: TicketState, form: FormData): Promise<TicketState> {
  const s = await requirePermission("member:dashboard");
  if (!rateLimit(`ticket:${s.sub}`, 5, 60 * 60_000).ok) return { error: "You have opened several tickets recently. Please wait before opening another." };
  const parsed = ticketSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const priority = parsed.data.category === "Fraud report" ? "high" : "low";
  const t = await one<{ id: string }>(
    `INSERT INTO support_tickets(user_id, subject, category, body, priority) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [s.sub, parsed.data.subject, parsed.data.category, parsed.data.body, priority]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "TICKET_CREATED", entity: "support_ticket", entityId: t?.id, ip: await clientIp() });
  revalidatePath("/dashboard/support");
  return { ok: true };
}

export async function updateTicketStatus(form: FormData) {
  const s = await requirePermission("admin:support:write");
  const id = z.string().uuid().parse(form.get("id"));
  const status = z.enum(["open", "in_progress", "resolved", "closed"]).parse(form.get("status"));
  await query(`UPDATE support_tickets SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "TICKET_STATUS_CHANGED", entity: "support_ticket", entityId: id, metadata: { status }, ip: await clientIp() });
  revalidatePath("/admin/support");
}

export async function resolveAlert(form: FormData) {
  const s = await requirePermission("admin:risk");
  if (s.role !== "admin") return; // auditors are read-only
  const id = z.string().uuid().parse(form.get("id"));
  const status = z.enum(["open", "investigating", "dismissed", "escalated"]).parse(form.get("status"));
  await query(`UPDATE fraud_alerts SET status = $2 WHERE id = $1`, [id, status]);
  await audit({ actorId: s.sub, actorEmail: s.email, action: "FRAUD_ALERT_UPDATED", entity: "fraud_alert", entityId: id, metadata: { status }, ip: await clientIp() });
  revalidatePath("/admin/risk");
}
