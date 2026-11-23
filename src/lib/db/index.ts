import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  var __tbcPool: Pool | undefined;
}

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new DatabaseUnavailableError("DATABASE_URL is not configured");
  if (!global.__tbcPool) {
    global.__tbcPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return global.__tbcPool;
}

export class DatabaseUnavailableError extends Error {}

/** Parameterised query helper — never interpolate user input into SQL. */
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  try {
    const res = await pool().query<T>(text, params);
    return res.rows;
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (e instanceof DatabaseUnavailableError || code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "3D000") {
      throw new DatabaseUnavailableError((e as Error).message);
    }
    throw e;
  }
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Kobo (bigint as string from pg) → naira number. */
export const koboToNaira = (k: string | number | null | undefined) => Number(k ?? 0) / 100;
