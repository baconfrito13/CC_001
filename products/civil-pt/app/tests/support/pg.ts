import { randomUUID } from "node:crypto";
import pg from "pg";
import { readMigrations, SHIM_SQL } from "./pglite";

/**
 * A throwaway database on a real Postgres (PG_TEST_URL), with the Supabase shim and every
 * migration applied, and a pool of real connections to it. Used only by `npm run test:pg`.
 */
export interface PgTestDatabase {
  pool: pg.Pool;
  close(): Promise<void>;
}

export async function createPgDatabase(): Promise<PgTestDatabase> {
  const url = process.env.PG_TEST_URL;
  if (!url) {
    throw new Error(
      "PG_TEST_URL is required for `npm run test:pg` (for example " +
        "postgresql://postgres@127.0.0.1:54329/postgres). See the README, section Tests.",
    );
  }
  const name = `rastoplan_test_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`create database ${name}`);
  await admin.end();

  const target = new URL(url);
  target.pathname = `/${name}`;
  const pool = new pg.Pool({ connectionString: target.toString(), max: 24 });
  // An idle client can be told to go away while the database is dropped at teardown; any
  // such error before teardown starts is a real failure and is rethrown.
  let closing = false;
  pool.on("error", (error) => {
    if (!closing) throw error;
  });
  // Several statements per call: the simple query protocol (no parameters) allows it.
  await pool.query(SHIM_SQL);
  for (const migration of readMigrations()) await pool.query(migration.sql);

  return {
    pool,
    async close() {
      closing = true;
      await pool.end();
      const cleanup = new pg.Client({ connectionString: url });
      await cleanup.connect();
      await cleanup.query(`drop database if exists ${name} with (force)`);
      await cleanup.end();
    },
  };
}
