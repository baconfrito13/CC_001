import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacRef } from "@/lib/core/hash";
import { createSqlHarness, type Harness } from "../contract/harness";
import { days, T0 } from "../contract/ledger.contract";
import { createPgDatabase, type PgTestDatabase } from "../support/pg";

/**
 * SR-02 and T-06 on a real Postgres: many connections hit the ledger at the same instant and
 * the invariants must still hold. Each test fires its requests with Promise.all over a pool
 * of 24 connections, so the statements really interleave inside the server.
 */

let database: PgTestDatabase;
let h: Harness;

beforeAll(async () => {
  database = await createPgDatabase();
  h = await createSqlHarness(database.pool);
});

afterAll(async () => {
  await database.close();
});

const grant = (userId: string, sheets: number, purchaseId?: string) =>
  h.store.ledger.grantLot({
    userId,
    origin: "pass",
    sheets,
    expiresAt: days(90),
    ...(purchaseId ? { purchaseId } : {}),
    now: T0,
  });

const count = async (sql: string, params: unknown[] = []) =>
  Number((await database.pool.query<{ n: string }>(sql, params)).rows[0]?.n);

describe("SR-02: the ledger under real concurrency", () => {
  it("40 parallel reserves against a balance of 5 charge exactly 5 sheets", async () => {
    const user = await h.newUser();
    await grant(user, 5);
    const sheets = await Promise.all(Array.from({ length: 40 }, () => h.newSheet(user)));
    const results = await Promise.all(
      sheets.map((sheetId) =>
        h.store.ledger.reserveSheet({ userId: user, sheetId, now: T0 }),
      ),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(5);
    expect(results.filter((r) => !r.ok && r.reason === "no_balance")).toHaveLength(35);
    expect(
      await count(
        "select count(*) as n from public.sheet_reservations where user_id = $1",
        [user],
      ),
    ).toBe(5);
    expect((await h.store.ledger.balance({ userId: user, now: T0 })).available).toBe(0);
  });

  it("T-06: 25 parallel requests for one sheet with a balance of one charge it once", async () => {
    const user = await h.newUser();
    await grant(user, 1);
    const sheetId = await h.newSheet(user);
    const results = await Promise.all(
      Array.from({ length: 25 }, () =>
        h.store.ledger.reserveSheet({ userId: user, sheetId, now: T0 }),
      ),
    );
    expect(results.every((r) => r.ok)).toBe(true);
    expect(results.filter((r) => r.ok && !r.already)).toHaveLength(1);
    expect(
      await count(
        "select count(*) as n from public.sheet_reservations where sheet_id = $1",
        [sheetId],
      ),
    ).toBe(1);
  });

  it("two users reserving at once are limited by their own balances only, with no deadlock", async () => {
    const [a, b] = [await h.newUser(), await h.newUser()];
    await grant(a, 4);
    await grant(b, 7);
    const sheetsA = await Promise.all(Array.from({ length: 15 }, () => h.newSheet(a)));
    const sheetsB = await Promise.all(Array.from({ length: 15 }, () => h.newSheet(b)));
    const requests = [
      ...sheetsA.map((sheetId) =>
        h.store.ledger.reserveSheet({ userId: a, sheetId, now: T0 }),
      ),
      ...sheetsB.map((sheetId) =>
        h.store.ledger.reserveSheet({ userId: b, sheetId, now: T0 }),
      ),
    ];
    const results = await Promise.all(requests);
    expect(results.slice(0, 15).filter((r) => r.ok)).toHaveLength(4);
    expect(results.slice(15).filter((r) => r.ok)).toHaveLength(7);
  });

  it("US-05.7: 8 parallel returns of one lot succeed at most 3 times", async () => {
    const user = await h.newUser();
    await grant(user, 8);
    const sheets = await Promise.all(Array.from({ length: 8 }, () => h.newSheet(user)));
    for (const sheetId of sheets) {
      await h.store.ledger.reserveSheet({ userId: user, sheetId, now: T0 });
      await h.store.ledger.commitSheet({ sheetId, now: T0 });
    }
    const results = await Promise.all(
      sheets.map((sheetId) =>
        h.store.ledger.releaseSheet({ sheetId, reason: "returned", now: T0 }),
      ),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(3);
    expect(results.filter((r) => !r.ok && r.reason === "return_limit")).toHaveLength(5);
    expect((await h.store.ledger.balance({ userId: user, now: T0 })).available).toBe(3);
  });

  it("a refund racing with reserves never leaves more sheets in flight than the lot holds", async () => {
    const user = await h.newUser();
    const lot = await grant(user, 6);
    const sheets = await Promise.all(Array.from({ length: 12 }, () => h.newSheet(user)));
    const [revoke, ...reserves] = await Promise.all([
      h.store.ledger.revokeLot({ lotId: lot.lotId, now: T0 }),
      ...sheets.map((sheetId) =>
        h.store.ledger.reserveSheet({ userId: user, sheetId, now: T0 }),
      ),
    ]);
    expect(revoke).toMatchObject({ ok: true });
    const charged = reserves.filter((r) => r.ok).length;
    const row = (
      await database.pool.query<{ total: number; used: string }>(
        `select l.sheets_total as total,
                (select count(*) from public.sheet_reservations r
                  where r.lot_id = l.id and r.state in ('reserved', 'committed')) as used
         from public.sheet_lots l where l.id = $1`,
        [lot.lotId],
      )
    ).rows[0];
    expect(Number(row?.used)).toBe(charged);
    expect(row?.total).toBeGreaterThanOrEqual(Number(row?.used));
    expect((await h.store.ledger.balance({ userId: user, now: T0 })).available).toBe(0);
  });

  it("T-02: 12 parallel grants for one purchase create one lot", async () => {
    const user = await h.newUser();
    const purchase = await h.newPurchase(user);
    const results = await Promise.all(
      Array.from({ length: 12 }, () => grant(user, 20, purchase)),
    );
    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(new Set(results.map((r) => r.lotId)).size).toBe(1);
    expect((await h.store.ledger.balance({ userId: user, now: T0 })).available).toBe(20);
  });

  it("US-08.2: 30 parallel founder-price claims grant exactly 10 slots", async () => {
    const users = await Promise.all(Array.from({ length: 30 }, () => h.newUser()));
    const results = await Promise.all(
      users.map((userId) => h.store.ledger.tryFounderPrice({ userId, slots: 10 })),
    );
    expect(results.filter((r) => r.granted)).toHaveLength(10);
    expect(await count("select count(*) as n from public.founder_claims")).toBe(10);
  });

  it("rl_hit: 60 parallel hits are counted exactly once each", async () => {
    const key = `pg-parallel-${Math.random()}`;
    const results = await Promise.all(
      Array.from({ length: 60 }, () =>
        h.store.security.rateLimitHit({ key, limit: 25, windowSeconds: 60, now: T0 }),
      ),
    );
    expect(results.filter((r) => r.allowed)).toHaveLength(25);
    expect(new Set(results.map((r) => r.count)).size).toBe(60);
    expect(Math.max(...results.map((r) => r.count))).toBe(60);
  });

  it("SR-06: 14 parallel wrong codes lock the email once and report the lock once", async () => {
    const emailHash = hmacRef(`race-${Math.random()}@example.pt`, "pg-salt");
    const results = await Promise.all(
      Array.from({ length: 14 }, () =>
        h.store.security.attemptFailed({ emailHash, now: T0 }),
      ),
    );
    expect(results.filter((r) => r.justLocked)).toHaveLength(1);
    expect(results.filter((r) => !r.locked)).toHaveLength(4);
    expect(await h.store.security.attemptStatus({ emailHash, now: T0 })).toMatchObject({
      locked: true,
      failed: 5,
    });
  });

  it("a mixed storm of 200 operations over 3 users keeps every balance consistent", async () => {
    const users = await Promise.all(Array.from({ length: 3 }, () => h.newUser()));
    for (const user of users) await grant(user, 6);
    const sheets = await Promise.all(
      users.flatMap((user) =>
        Array.from({ length: 10 }, () => h.newSheet(user).then((id) => ({ user, id }))),
      ),
    );
    const ops = Array.from({ length: 200 }, (_, i) => {
      const { user, id } = sheets[i % sheets.length] as { user: string; id: string };
      switch (i % 4) {
        case 0:
        case 1:
          return h.store.ledger.reserveSheet({ userId: user, sheetId: id, now: T0 });
        case 2:
          return h.store.ledger.commitSheet({ sheetId: id, now: T0 });
        default:
          return h.store.ledger.releaseSheet({ sheetId: id, reason: "failed", now: T0 });
      }
    });
    await Promise.all(ops);
    for (const user of users) {
      const used = await count(
        "select count(*) as n from public.sheet_reservations where user_id = $1 and state in ('reserved', 'committed')",
        [user],
      );
      const balance = await h.store.ledger.balance({ userId: user, now: T0 });
      expect(used).toBeLessThanOrEqual(6);
      expect(balance.available).toBe(6 - used);
    }
  });
});
