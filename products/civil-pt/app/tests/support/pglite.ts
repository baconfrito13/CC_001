import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";

const root = path.join(import.meta.dirname, "../..");

export const MIGRATIONS_DIR = path.join(root, "supabase/migrations");
export const SHIM_SQL = readFileSync(path.join(root, "supabase/tests/shim.sql"), "utf8");
export const SEED_SQL_PATH = path.join(root, "supabase/seed.sql");

/** Every migration, in file-name order, as the Supabase CLI applies them. */
export function readMigrations(): { name: string; sql: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"),
    }));
}

/** A fresh in-process Postgres with the Supabase shim and every migration applied. */
export async function createMigratedDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SHIM_SQL);
  for (const migration of readMigrations()) await db.exec(migration.sql);
  return db;
}

export type ApiRole = "anon" | "authenticated" | "service_role";

/**
 * Run `fn` the way PostgREST would: one transaction, `SET LOCAL ROLE`, and the JWT claims
 * that `auth.uid()` reads. The transaction is rolled back, so tests cannot leak state.
 */
export async function asRole<T>(
  db: PGlite,
  role: ApiRole,
  userId: string | null,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    const claims = JSON.stringify(userId ? { sub: userId, role } : { role });
    await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    const result = await fn(tx);
    await tx.rollback();
    return result;
  });
}
