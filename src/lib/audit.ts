import "server-only";
import { query } from "./db";

export async function audit(entry: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await query(
      `INSERT INTO audit_logs(actor_id, actor_email, action, entity, entity_id, metadata, ip) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [entry.actorId ?? null, entry.actorEmail ?? null, entry.action, entry.entity ?? null, entry.entityId ?? null, JSON.stringify(entry.metadata ?? {}), entry.ip ?? null],
    );
  } catch (e) {
    // Audit failures must never be silent in production — surface to logs/alerting.
    console.error("[audit] failed to write audit log", e);
  }
}
