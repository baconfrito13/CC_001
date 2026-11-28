import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createDataStore, getDataStore, resetDataStoreForTests } from "@/lib/data";
import { loadDemoData } from "@/lib/data/demo";
import { DEMO_TRIAL_DAYS, DEMO_TRIAL_SHEETS, demoFixtures } from "@/lib/data/fixtures";
import { MemoryDataStore } from "@/lib/data/memory";
import { createRpcDataStore, DataStoreError } from "@/lib/data/rpc";
import { supabaseRpc } from "@/lib/data/supabase";
import { renderSeedSql } from "@/lib/db/seed-sql";
import { parseEnv } from "@/lib/env";

const NOW = new Date("2026-03-01T10:00:00.000Z");
const USER = "a1000000-0000-4000-8000-000000000001";

describe("rpc data store: the database's answers are validated (third-party boundary)", () => {
  it("accepts the documented shapes and converts timestamps to Dates", async () => {
    const store = createRpcDataStore(
      async (fn) =>
        fn === "ledger_balance"
          ? {
              available: 5,
              frozen: false,
              lots: [
                {
                  lot_id: "l1",
                  origin: "trial",
                  remaining: 5,
                  expires_at: "2026-03-15T10:00:00+00:00",
                },
              ],
            }
          : null,
      "supabase",
    );
    const balance = await store.ledger.balance({ userId: USER, now: NOW });
    expect(balance.lots[0]?.expiresAt).toEqual(new Date("2026-03-15T10:00:00.000Z"));
  });

  it.each([
    ["an unknown reserve reason", "reserve_sheet", { ok: false, reason: "teapot" }],
    ["a missing field", "reserve_sheet", { ok: true }],
    ["a negative balance", "ledger_balance", { available: -1, frozen: false, lots: [] }],
    ["null", "reserve_sheet", null],
    [
      "a bad timestamp",
      "rl_hit",
      { allowed: true, count: 1, remaining: 0, reset_at: "later" },
    ],
  ])("refuses %s instead of handing out sheets", async (_label, fn, answer) => {
    const store = createRpcDataStore(async () => answer, "supabase");
    const call =
      fn === "reserve_sheet"
        ? store.ledger.reserveSheet({ userId: USER, sheetId: "s", now: NOW })
        : fn === "ledger_balance"
          ? store.ledger.balance({ userId: USER, now: NOW })
          : store.security.rateLimitHit({
              key: "k",
              limit: 1,
              windowSeconds: 60,
              now: NOW,
            });
    const error = await call.catch((e) => e);
    expect(error).toBeInstanceOf(DataStoreError);
    expect(error.message).not.toContain(USER);
  });

  it("ping requires the database to answer true", async () => {
    await expect(
      createRpcDataStore(async () => true, "supabase").ping(),
    ).resolves.toBeUndefined();
    await expect(
      createRpcDataStore(async () => false, "supabase").ping(),
    ).rejects.toThrow(DataStoreError);
  });

  it("sends the clock and named arguments the SQL functions expect", async () => {
    const calls: { fn: string; args: Record<string, unknown> }[] = [];
    const store = createRpcDataStore(async (fn, args) => {
      calls.push({ fn, args });
      return { ok: true, already: false, lot_id: "l1" };
    }, "supabase");
    await store.ledger.reserveSheet({ userId: USER, sheetId: "s1", now: NOW });
    expect(calls).toEqual([
      {
        fn: "reserve_sheet",
        args: { p_user: USER, p_sheet: "s1", p_now: NOW.toISOString() },
      },
    ]);
  });
});

describe("supabaseRpc", () => {
  it("returns the data, and on an error throws the code only", async () => {
    const ok = supabaseRpc({ rpc: async () => ({ data: { ok: 1 }, error: null }) });
    expect(await ok("f", {})).toEqual({ ok: 1 });
    const bad = supabaseRpc({
      rpc: async () => ({
        data: null,
        error: { code: "42501", message: `denied for ${USER}` },
      }),
    });
    const error: unknown = await bad("reserve_sheet", { p_user: USER }).catch((e) => e);
    expect(error).toBeInstanceOf(DataStoreError);
    expect((error as DataStoreError).code).toBe("42501");
    expect((error as DataStoreError).message).not.toContain(USER);
  });
});

describe("data store selection", () => {
  it("builds the in-memory store with the demo accounts by default", async () => {
    const store = await createDataStore(parseEnv({}), NOW);
    expect(store.name).toBe("memory");
    await expect(store.ping()).resolves.toBeUndefined();
    const ana = demoFixtures.users[0];
    expect(
      (await store.ledger.balance({ userId: ana?.id ?? "", now: NOW })).available,
    ).toBe(4);
  });

  it("shares one store per process", async () => {
    resetDataStoreForTests();
    const [a, b] = await Promise.all([getDataStore(), getDataStore()]);
    expect(a).toBe(b);
    resetDataStoreForTests();
  });
});

describe("demo data", () => {
  it("loads the same balances the seed gives a Supabase project", async () => {
    const store = new MemoryDataStore();
    await loadDemoData(store, NOW);
    const balances = Object.fromEntries(
      await Promise.all(
        demoFixtures.users.map(async (user) => [
          user.email.split("@")[0],
          (await store.ledger.balance({ userId: user.id, now: NOW })).available,
        ]),
      ),
    );
    expect(balances).toEqual({ ana: 4, bruno: 59, carla: 100, daniel: 0, eva: 5 });
  });

  it("charges Bruno's processed sheet to his Passe, not to an expired trial", async () => {
    const store = new MemoryDataStore();
    await loadDemoData(store, NOW);
    const bruno = demoFixtures.users[1]?.id ?? "";
    const balance = await store.ledger.balance({ userId: bruno, now: NOW });
    expect(balance.lots.map((l) => [l.origin, l.remaining])).toEqual([["pass", 59]]);
  });

  it("the committed supabase/seed.sql is generated from the fixtures", () => {
    const committed = readFileSync(
      path.join(import.meta.dirname, "../../supabase/seed.sql"),
      "utf8",
    );
    expect(committed).toBe(
      renderSeedSql(demoFixtures, { sheets: DEMO_TRIAL_SHEETS, days: DEMO_TRIAL_DAYS }),
    );
  });

  it("has five accounts with unique ids and emails", () => {
    expect(demoFixtures.users).toHaveLength(5);
    expect(new Set(demoFixtures.users.map((u) => u.id)).size).toBe(5);
    expect(new Set(demoFixtures.users.map((u) => u.email)).size).toBe(5);
    expect(demoFixtures.users.every((u) => u.email.endsWith(".test"))).toBe(true);
  });
});
