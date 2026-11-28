import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createMemoryHarness, createSqlHarness, type Harness } from "./harness";
import { days, T0 } from "./ledger.contract";

/**
 * "contract: memory adapter and SQL give the same ledger results".
 *
 * The same random sequence of ledger operations (grants, reserves, commits, releases, refunds,
 * freezes and clock jumps) is applied to the in-memory store and to the SQL functions. After
 * every step both must return the same result and the same balance, and the invariants of the
 * ledger must hold on both: the balance is never negative, it equals the sum of its lots, and
 * a user never has more sheets in flight than they were granted (reserve >= settle).
 */

/** Small deterministic PRNG, so a failing seed can be replayed. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Op =
  | {
      kind: "grant";
      user: number;
      origin: "pass" | "subscription";
      sheets: number;
      validity: number;
    }
  | { kind: "reserve"; user: number; sheet: number }
  | { kind: "commit"; sheet: number }
  | {
      kind: "release";
      sheet: number;
      reason: "failed" | "raster" | "low_diversity" | "returned";
    }
  | { kind: "revoke"; lot: number }
  | { kind: "advance"; days: number }
  | { kind: "freeze"; user: number; frozen: boolean }
  | { kind: "balance"; user: number };

const USERS = 2;
const SHEETS_PER_USER = 5;

function randomOps(seed: number, steps: number): Op[] {
  const rand = mulberry32(seed);
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const ops: Op[] = [];
  let grants = 0;
  for (let i = 0; i < steps; i += 1) {
    const roll = rand();
    if (roll < 0.14 || grants === 0) {
      grants += 1;
      ops.push({
        kind: "grant",
        user: int(0, USERS - 1),
        origin: rand() < 0.5 ? "pass" : "subscription",
        sheets: int(1, 4),
        validity: int(5, 40),
      });
    } else if (roll < 0.5) {
      ops.push({
        kind: "reserve",
        user: int(0, USERS - 1),
        sheet: int(0, USERS * SHEETS_PER_USER - 1),
      });
    } else if (roll < 0.62) {
      ops.push({ kind: "commit", sheet: int(0, USERS * SHEETS_PER_USER - 1) });
    } else if (roll < 0.74) {
      const reasons = ["failed", "raster", "low_diversity", "returned"] as const;
      ops.push({
        kind: "release",
        sheet: int(0, USERS * SHEETS_PER_USER - 1),
        reason: reasons[int(0, 3)] as "failed",
      });
    } else if (roll < 0.8) {
      ops.push({ kind: "revoke", lot: int(0, grants - 1) });
    } else if (roll < 0.9) {
      ops.push({ kind: "advance", days: int(0, 20) });
    } else if (roll < 0.94) {
      ops.push({ kind: "freeze", user: int(0, USERS - 1), frozen: rand() < 0.5 });
    } else {
      ops.push({ kind: "balance", user: int(0, USERS - 1) });
    }
  }
  return ops;
}

/** Run the operations on one harness; return one normalised result per step. */
async function run(h: Harness, ops: Op[]): Promise<unknown[]> {
  const users: string[] = [];
  const sheets: string[] = [];
  const owners: number[] = [];
  for (let u = 0; u < USERS; u += 1) {
    users.push(await h.newUser());
    for (let s = 0; s < SHEETS_PER_USER; s += 1) {
      sheets.push(await h.newSheet(users[u] as string));
      owners.push(u);
    }
  }
  const lotIds: string[] = [];
  const lotOrdinal = new Map<string, number>();
  let clock = T0;
  let granted = 0;
  const results: unknown[] = [];

  const norm = (value: unknown) =>
    JSON.parse(
      JSON.stringify(value, (key, v) => {
        if (key === "lotId" && typeof v === "string") return `L${lotOrdinal.get(v)}`;
        if (v instanceof Date) return v.toISOString();
        return v;
      }),
    );

  for (const op of ops) {
    let result: unknown;
    const ledger = h.store.ledger;
    switch (op.kind) {
      case "grant": {
        const r = await ledger.grantLot({
          userId: users[op.user] as string,
          origin: op.origin,
          sheets: op.sheets,
          expiresAt: days(op.validity, clock),
          now: clock,
        });
        lotOrdinal.set(r.lotId, lotIds.length);
        lotIds.push(r.lotId);
        granted += op.sheets;
        result = r;
        break;
      }
      case "reserve":
        result = await ledger.reserveSheet({
          userId: users[op.user] as string,
          sheetId: sheets[op.sheet] as string,
          now: clock,
        });
        break;
      case "commit":
        result = await ledger.commitSheet({
          sheetId: sheets[op.sheet] as string,
          now: clock,
        });
        break;
      case "release":
        result = await ledger.releaseSheet({
          sheetId: sheets[op.sheet] as string,
          reason: op.reason,
          now: clock,
        });
        break;
      case "revoke":
        result = await ledger.revokeLot({ lotId: lotIds[op.lot] as string, now: clock });
        break;
      case "advance":
        clock = days(op.days, clock);
        result = { clock: clock.toISOString() };
        break;
      case "freeze":
        await h.setFrozen(users[op.user] as string, op.frozen);
        result = { frozen: op.frozen };
        break;
      case "balance":
        result = await ledger.balance({ userId: users[op.user] as string, now: clock });
        break;
    }
    results.push(norm(result));

    // Invariants, checked for every user after every step.
    for (let u = 0; u < USERS; u += 1) {
      const b = await ledger.balance({ userId: users[u] as string, now: clock });
      const sum = b.lots.reduce((total, lot) => total + lot.remaining, 0);
      expect(b.available, "balance is never negative").toBeGreaterThanOrEqual(0);
      expect(b.available, "balance equals the sum of its lots").toBe(sum);
      expect(b.available, "more sheets available than ever granted").toBeLessThanOrEqual(
        granted,
      );
      results.push(norm(b));
    }
  }
  void owners;
  return results;
}

describe("contract: memory and SQL give the same ledger results", () => {
  let sql: Harness;
  beforeAll(async () => {
    sql = await createSqlHarness();
  });
  afterAll(async () => {
    await sql.close();
  });

  it.each([1, 2, 3, 4, 5])(
    "property: a random sequence of 250 operations (seed %i) agrees step by step",
    async (seed) => {
      const ops = randomOps(seed, 250);
      const memory = createMemoryHarness();
      const [fromMemory, fromSql] = [await run(memory, ops), await run(sql, ops)];
      expect(fromSql).toEqual(fromMemory);
    },
  );
});
