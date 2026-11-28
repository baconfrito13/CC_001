import { readFileSync } from "node:fs";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { normalizeEmail } from "@/lib/core/email";
import { loadDemoData } from "@/lib/data/demo";
import { demoFixtures } from "@/lib/data/fixtures";
import { MemoryDataStore } from "@/lib/data/memory";
import { createMigratedDb, SEED_SQL_PATH } from "../support/pglite";

/** What only the SQL side has: signup triggers, constraints, cascades, the seed. */

let db: PGlite;
beforeAll(async () => {
  db = await createMigratedDb();
});
afterAll(async () => {
  await db.close();
});

const one = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  (await db.query<T>(sql, params)).rows[0] as T;
const n = async (sql: string, params: unknown[] = []) =>
  Number((await one<{ n: string }>(sql, params)).n);
const uuid = () => crypto.randomUUID();

describe("normalize_email stays identical to the TypeScript version", () => {
  it.each([
    "Ana@Example.PT",
    "  ana@example.pt ",
    "ana+x@example.pt",
    "ana.silva@example.pt",
    "Ana.Silva+x@gmail.com",
    "ana.silva@googlemail.com",
    "+tag@example.pt",
    "a.b.c+d+e@gmail.com",
  ])("%s", async (input) => {
    const { result } = await one<{ result: string }>(
      "select public.normalize_email($1) as result",
      [input],
    );
    expect(result).toBe(normalizeEmail(input));
  });
});

describe("US-08.6: the signup triggers", () => {
  it("create a profile and a trial of 5 sheets valid 14 days", async () => {
    const id = uuid();
    await db.query(
      "insert into auth.users (id, email) values ($1, 'novo.cliente@example.pt')",
      [id],
    );
    expect(await n("select count(*) as n from public.profiles where id = $1", [id])).toBe(
      1,
    );
    const lot = await one<{ origin: string; sheets_total: number; days: string }>(
      `select origin, sheets_total,
              extract(epoch from (expires_at - created_at)) / 86400 as days
       from public.sheet_lots where user_id = $1`,
      [id],
    );
    expect(lot).toMatchObject({ origin: "trial", sheets_total: 5 });
    expect(Number(lot.days)).toBe(14);
  });

  it("grant one trial per normalised email: a second account gets a profile and no sheets", async () => {
    const first = uuid();
    const second = uuid();
    await db.query(
      "insert into auth.users (id, email) values ($1, 'Pessoa.Um+a@gmail.com')",
      [first],
    );
    await db.query(
      "insert into auth.users (id, email) values ($1, 'pessoaum@googlemail.com')",
      [second],
    );
    expect(
      await n("select count(*) as n from public.sheet_lots where user_id = $1", [first]),
    ).toBe(1);
    expect(
      await n("select count(*) as n from public.sheet_lots where user_id = $1", [second]),
    ).toBe(0);
    expect(
      await n("select count(*) as n from public.profiles where id = $1", [second]),
    ).toBe(1);
  });

  it("skip the trial for an account without an email", async () => {
    const id = uuid();
    await db.query("insert into auth.users (id, email) values ($1, null)", [id]);
    expect(await n("select count(*) as n from public.profiles where id = $1", [id])).toBe(
      1,
    );
    expect(
      await n("select count(*) as n from public.sheet_lots where user_id = $1", [id]),
    ).toBe(0);
  });

  it("follow the database settings app.trial_sheets and app.trial_days", async () => {
    await db.exec(
      "select set_config('app.trial_sheets', '3', false), set_config('app.trial_days', '7', false)",
    );
    const id = uuid();
    await db.query(
      "insert into auth.users (id, email) values ($1, 'configurado@example.pt')",
      [id],
    );
    await db.exec(
      "select set_config('app.trial_sheets', '', false), set_config('app.trial_days', '', false)",
    );
    const lot = await one<{ sheets_total: number; days: string }>(
      "select sheets_total, extract(epoch from (expires_at - created_at)) / 86400 as days from public.sheet_lots where user_id = $1",
      [id],
    );
    expect(lot.sheets_total).toBe(3);
    expect(Number(lot.days)).toBe(7);
  });

  it("never hold more than one trial lot per account", async () => {
    const id = uuid();
    await db.query("insert into auth.users (id, email) values ($1, 'unico@example.pt')", [
      id,
    ]);
    await expect(
      db.query(
        "insert into public.sheet_lots (user_id, origin, sheets_total, expires_at) values ($1, 'trial', 5, now() + interval '14 days')",
        [id],
      ),
    ).rejects.toThrow(/duplicate key/);
  });
});

describe("integrity of the schema", () => {
  const user = async (email: string) => {
    const id = uuid();
    await db.query("insert into auth.users (id, email) values ($1, $2)", [id, email]);
    return id;
  };

  it("a row can never point at another user's parent (composite keys)", async () => {
    const a = await user("integrity-a@example.pt");
    const b = await user("integrity-b@example.pt");
    const project = uuid();
    await db.query(
      "insert into public.projects (id, user_id, name) values ($1, $2, 'A')",
      [project, a],
    );
    await expect(
      db.query(
        "insert into public.documents (project_id, user_id, storage_path, file_name, size_bytes) values ($1, $2, 'p', 'f.pdf', 10)",
        [project, b],
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("rejects values outside the domain: unit, state, scale, return count, ledger size", async () => {
    const a = await user("domain@example.pt");
    const project = uuid();
    await db.query(
      "insert into public.projects (id, user_id, name) values ($1, $2, 'D')",
      [project, a],
    );
    await expect(
      db.query(
        "insert into public.map_nodes (project_id, user_id, kind, unit) values ($1, $2, 'article', 'km')",
        [project, a],
      ),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.query("insert into public.projects (user_id, name) values ($1, '')", [a]),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.query(
        "insert into public.sheet_lots (user_id, origin, sheets_total, expires_at, returns_used) values ($1, 'pass', 5, now(), 4)",
        [a],
      ),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.query("select public.grant_lot($1, 'trial', 5, now() + interval '1 day')", [a]),
    ).rejects.toThrow(/invalid_lot_origin/);
    await expect(
      db.query("select public.grant_lot($1, 'pass', 0, now() + interval '1 day')", [a]),
    ).rejects.toThrow(/invalid_lot_size/);
  });

  it("deleting an account removes its data but keeps its purchases for fiscal retention", async () => {
    const a = await user("erase@example.pt");
    const project = uuid();
    await db.query(
      "insert into public.projects (id, user_id, name) values ($1, $2, 'Apagar')",
      [project, a],
    );
    await db.query(
      "insert into public.purchases (user_id, kind, pass_size, amount_minor, stripe_ref) values ($1, 'pass', 20, 5900, 'pi_erase')",
      [a],
    );
    await db.query("select public.try_founder_price($1, 10)", [a]);
    await db.query("delete from auth.users where id = $1", [a]);
    expect(
      await n("select count(*) as n from public.projects where user_id = $1", [a]),
    ).toBe(0);
    expect(await n("select count(*) as n from public.profiles where id = $1", [a])).toBe(
      0,
    );
    expect(
      await n("select count(*) as n from public.sheet_lots where user_id = $1", [a]),
    ).toBe(0);
    expect(
      await n("select count(*) as n from public.founder_claims where user_id = $1", [a]),
    ).toBe(0);
    const kept = await one<{ user_id: string | null }>(
      "select user_id from public.purchases where stripe_ref = 'pi_erase'",
    );
    expect(kept.user_id).toBeNull();
    // the trial record stays (so deleting and re-registering is not a free trial) without the link
    expect(
      await n(
        "select count(*) as n from public.trial_grants where email_hash is not null and user_id is null",
      ),
    ).toBeGreaterThan(0);
  });

  it("db_ping answers true", async () => {
    expect(
      (await one<{ result: boolean }>("select public.db_ping() as result")).result,
    ).toBe(true);
  });
});

describe("the demo seed", () => {
  it("applies twice without error and without duplicating anything", async () => {
    const seeded = await createMigratedDb();
    try {
      const sql = readFileSync(SEED_SQL_PATH, "utf8");
      await seeded.exec(sql);
      const first = await seeded.query<{ n: string }>(
        "select (select count(*) from public.sheet_lots) + (select count(*) from public.sheets) + (select count(*) from public.projects) as n",
      );
      await seeded.exec(sql);
      const second = await seeded.query<{ n: string }>(
        "select (select count(*) from public.sheet_lots) + (select count(*) from public.sheets) + (select count(*) from public.projects) as n",
      );
      expect(second.rows[0]?.n).toBe(first.rows[0]?.n);
      expect(
        Number(
          (await seeded.query<{ n: string }>("select count(*) as n from public.profiles"))
            .rows[0]?.n,
        ),
      ).toBe(5);
    } finally {
      await seeded.close();
    }
  });

  it("gives every demo account the same balance as the in-memory demo data", async () => {
    const seeded = await createMigratedDb();
    try {
      await seeded.exec(readFileSync(SEED_SQL_PATH, "utf8"));
      const memory = new MemoryDataStore();
      const now = new Date();
      await loadDemoData(memory, now);
      const expected: Record<string, number> = {};
      for (const user of demoFixtures.users) {
        const fromMemory = await memory.ledger.balance({ userId: user.id, now });
        const { rows } = await seeded.query<{ b: { available: number } }>(
          "select public.ledger_balance($1) as b",
          [user.id],
        );
        expect(rows[0]?.b.available, user.email).toBe(fromMemory.available);
        expected[user.email.split("@")[0] as string] = fromMemory.available;
      }
      // Ana 1 of 5 used, Bruno 59 of 60, Carla 100, Daniel's trial expired, Eva's is fresh.
      expect(expected).toEqual({ ana: 4, bruno: 59, carla: 100, daniel: 0, eva: 5 });
    } finally {
      await seeded.close();
    }
  });
});
