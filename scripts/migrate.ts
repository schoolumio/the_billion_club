/* Minimal, dependency-light migration runner. Applies db/migrations/*.sql in order, once. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import { loadEnv } from "./env.ts";

loadEnv();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(`CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
const dir = join(process.cwd(), "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const { rows } = await client.query<{ name: string }>("SELECT name FROM _migrations");
const done = new Set(rows.map((r) => r.name));
for (const f of files) {
  if (done.has(f)) continue;
  console.log(`→ applying ${f}`);
  await client.query("BEGIN");
  try {
    await client.query(readFileSync(join(dir, f), "utf8"));
    await client.query("INSERT INTO _migrations(name) VALUES ($1)", [f]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}
console.log("✓ migrations up to date");
await client.end();
