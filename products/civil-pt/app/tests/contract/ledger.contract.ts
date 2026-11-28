import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacRef } from "@/lib/core/hash";
import type { Harness } from "./harness";

export const T0 = new Date("2026-03-01T10:00:00.000Z");
export const days = (n: number, from: Date = T0) =>
  new Date(from.getTime() + n * 86_400_000);
export const minutes = (n: number, from: Date = T0) =>
  new Date(from.getTime() + n * 60_000);

/**
 * The ledger and security contract. The same scenarios run against the in-memory store and
 * against the SQL functions of the migration (see memory.test.ts and sql.test.ts): that is
 * what keeps test mode honest. Story ids in the names point at docs/02-product.md.
 */
export function defineStoreContract(label: string, create: () => Promise<Harness>) {
  describe(`data store contract: ${label}`, () => {
    let h: Harness;
    beforeAll(async () => {
      h = await create();
    });
    afterAll(async () => {
      await h.close();
    });

    const grantPass = async (userId: string, sheets: number, now = T0, validity = 90) =>
      h.store.ledger.grantLot({
        userId,
        origin: "pass",
        sheets,
        expiresAt: days(validity, now),
        now,
      });

    const reserve = async (userId: string, sheetId: string, now = T0) =>
      h.store.ledger.reserveSheet({ userId, sheetId, now });

    const balance = async (userId: string, now = T0) =>
      h.store.ledger.balance({ userId, now });

    /** Reserve and commit `n` fresh sheets. */
    const consume = async (userId: string, n: number, now = T0) => {
      const ids: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const sheetId = await h.newSheet(userId);
        const result = await reserve(userId, sheetId, now);
        expect(result.ok).toBe(true);
        await h.store.ledger.commitSheet({ sheetId, now });
        ids.push(sheetId);
      }
      return ids;
    };

    describe("lots and expiry", () => {
      it("US-12.6 / US-08.4: lot unused sheets expire on day 91 with an injected clock", async () => {
        const user = await h.newUser();
        await grantPass(user, 8);
        expect((await balance(user, days(89))).available).toBe(8);
        expect((await balance(user, minutes(90 * 1440 - 1))).available).toBe(8);
        // the lot is valid for 90 days: from the instant it ends, nothing is usable
        expect((await balance(user, days(90))).available).toBe(0);
        const late = await balance(user, days(91));
        expect(late).toMatchObject({ available: 0, lots: [] });
        const sheet = await h.newSheet(user);
        expect(await reserve(user, sheet, days(91))).toEqual({
          ok: false,
          reason: "no_balance",
        });
      });

      it("US-08.4: a month-2 renewal adds a lot and month-1 leftovers expire on day 91", async () => {
        const user = await h.newUser();
        await grantPass(user, 5, T0); // month 1: expires day 90
        await consume(user, 3, T0); // 2 left
        const month2 = days(30);
        await h.store.ledger.grantLot({
          userId: user,
          origin: "subscription",
          sheets: 5,
          expiresAt: days(90, month2),
          now: month2,
        });
        expect((await balance(user, month2)).available).toBe(7); // 2 + 5
        expect((await balance(user, days(91))).available).toBe(5); // month-1 leftovers gone
      });

      it("US-12.5: earlier-expiring lots are consumed first (ties: the oldest lot)", async () => {
        const user = await h.newUser();
        const late = await grantPass(user, 3, T0, 90); // expires day 90
        const early = await grantPass(user, 3, days(1), 30); // granted later, expires day 31
        const first = await reserve(user, await h.newSheet(user), days(2));
        expect(first).toMatchObject({ ok: true, lotId: early.lotId });
        const view = await balance(user, days(2));
        expect(view.lots.map((l) => l.lotId)).toEqual([early.lotId, late.lotId]);

        // same expiry, different creation time: the older lot goes first
        const user2 = await h.newUser();
        const a = await h.store.ledger.grantLot({
          userId: user2,
          origin: "pass",
          sheets: 2,
          expiresAt: days(60),
          now: T0,
        });
        await h.store.ledger.grantLot({
          userId: user2,
          origin: "pass",
          sheets: 2,
          expiresAt: days(60),
          now: days(1),
        });
        expect(await reserve(user2, await h.newSheet(user2), days(2))).toMatchObject({
          ok: true,
          lotId: a.lotId,
        });
      });

      it("US-12.5: the balance is the sum of the usable lots and drains lot by lot", async () => {
        const user = await h.newUser();
        await grantPass(user, 2, T0, 30);
        await grantPass(user, 2, T0, 60);
        expect((await balance(user)).available).toBe(4);
        await consume(user, 3);
        const view = await balance(user);
        expect(view.available).toBe(1);
        expect(view.lots).toHaveLength(1);
        expect(view.lots[0]).toMatchObject({ remaining: 1, origin: "pass" });
      });

      it("T-02: the same purchase never creates a second lot", async () => {
        const user = await h.newUser();
        const purchase = await h.newPurchase(user);
        const input = {
          userId: user,
          origin: "pass" as const,
          sheets: 60,
          expiresAt: days(90),
          purchaseId: purchase,
          now: T0,
        };
        const first = await h.store.ledger.grantLot(input);
        const second = await h.store.ledger.grantLot(input);
        expect(first.created).toBe(true);
        expect(second).toEqual({ lotId: first.lotId, created: false });
        expect((await balance(user)).available).toBe(60);
      });

      it("rejects a lot with no sheets", async () => {
        const user = await h.newUser();
        await expect(grantPass(user, 0)).rejects.toThrow();
        await expect(grantPass(user, -3)).rejects.toThrow();
      });
    });

    describe("reserve, commit, release", () => {
      it("US-08.7: reserving a sheet already reserved is idempotent and charges once", async () => {
        const user = await h.newUser();
        await grantPass(user, 5);
        const sheet = await h.newSheet(user);
        const first = await reserve(user, sheet);
        const second = await reserve(user, sheet);
        expect(first).toMatchObject({ ok: true, already: false });
        expect(second).toMatchObject({ ok: true, already: true });
        expect((await balance(user)).available).toBe(4);

        await h.store.ledger.commitSheet({ sheetId: sheet, now: T0 });
        // reprocessing a processed sheet costs nothing
        expect(await reserve(user, sheet)).toMatchObject({ ok: true, already: true });
        expect((await balance(user)).available).toBe(4);
      });

      it("SR-02: reserve never exceeds the balance under concurrent requests", async () => {
        const user = await h.newUser();
        await grantPass(user, 5);
        const sheets = await Promise.all(
          Array.from({ length: 20 }, () => h.newSheet(user)),
        );
        const results = await Promise.all(sheets.map((s) => reserve(user, s)));
        expect(results.filter((r) => r.ok)).toHaveLength(5);
        expect(results.filter((r) => !r.ok && r.reason === "no_balance")).toHaveLength(
          15,
        );
        expect((await balance(user)).available).toBe(0);
      });

      it("T-06: parallel requests for one sheet charge it once", async () => {
        const user = await h.newUser();
        await grantPass(user, 1);
        const sheet = await h.newSheet(user);
        const results = await Promise.all(
          Array.from({ length: 6 }, () => reserve(user, sheet)),
        );
        expect(results.every((r) => r.ok)).toBe(true);
        expect(results.filter((r) => r.ok && !r.already)).toHaveLength(1);
        expect((await balance(user)).available).toBe(0);
      });

      it("US-04.2: failed, raster and low-diversity sheets release the reservation", async () => {
        const user = await h.newUser();
        await grantPass(user, 3);
        for (const reason of ["failed", "raster", "low_diversity"] as const) {
          const sheet = await h.newSheet(user);
          await reserve(user, sheet);
          expect((await balance(user)).available).toBe(2);
          expect(
            await h.store.ledger.releaseSheet({ sheetId: sheet, reason, now: T0 }),
          ).toEqual({
            ok: true,
            already: false,
          });
          expect((await balance(user)).available).toBe(3);
        }
      });

      it("release is idempotent, and a released sheet can be reserved (and charged) again", async () => {
        const user = await h.newUser();
        await grantPass(user, 1);
        const sheet = await h.newSheet(user);
        await reserve(user, sheet);
        await h.store.ledger.releaseSheet({ sheetId: sheet, reason: "failed", now: T0 });
        expect(
          await h.store.ledger.releaseSheet({
            sheetId: sheet,
            reason: "failed",
            now: T0,
          }),
        ).toEqual({
          ok: true,
          already: true,
        });
        expect(await reserve(user, sheet)).toMatchObject({ ok: true, already: false });
        expect((await balance(user)).available).toBe(0);
      });

      it("a committed sheet cannot be released as a failure, and an unreserved one cannot commit", async () => {
        const user = await h.newUser();
        await grantPass(user, 2);
        const sheet = await h.newSheet(user);
        expect(await h.store.ledger.commitSheet({ sheetId: sheet, now: T0 })).toEqual({
          ok: false,
          reason: "not_reserved",
        });
        expect(
          await h.store.ledger.releaseSheet({
            sheetId: sheet,
            reason: "failed",
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "not_reserved" });
        await reserve(user, sheet);
        expect(await h.store.ledger.commitSheet({ sheetId: sheet, now: T0 })).toEqual({
          ok: true,
          already: false,
        });
        expect(await h.store.ledger.commitSheet({ sheetId: sheet, now: T0 })).toEqual({
          ok: true,
          already: true,
        });
        expect(
          await h.store.ledger.releaseSheet({
            sheetId: sheet,
            reason: "failed",
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "already_committed" });
        expect((await balance(user)).available).toBe(1);
      });

      it("US-05.7: a lot allows at most 3 returned sheets", async () => {
        const user = await h.newUser();
        await grantPass(user, 4);
        const sheets = await consume(user, 4);
        expect((await balance(user)).available).toBe(0);
        for (const sheet of sheets.slice(0, 3)) {
          expect(
            await h.store.ledger.releaseSheet({
              sheetId: sheet,
              reason: "returned",
              now: T0,
            }),
          ).toEqual({ ok: true, already: false });
        }
        expect((await balance(user)).available).toBe(3);
        const fourth = sheets[3] as string;
        expect(
          await h.store.ledger.releaseSheet({
            sheetId: fourth,
            reason: "returned",
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "return_limit" });
        expect((await balance(user)).available).toBe(3);
      });

      it("US-05.7: only a committed sheet can be returned", async () => {
        const user = await h.newUser();
        await grantPass(user, 1);
        const sheet = await h.newSheet(user);
        await reserve(user, sheet);
        expect(
          await h.store.ledger.releaseSheet({
            sheetId: sheet,
            reason: "returned",
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "not_committed" });
      });

      it("rejects an unknown release reason", async () => {
        const user = await h.newUser();
        await grantPass(user, 1);
        const sheet = await h.newSheet(user);
        await reserve(user, sheet);
        await expect(
          h.store.ledger.releaseSheet({
            sheetId: sheet,
            // reason: deliberately outside the type to prove the store refuses it
            reason: "refund" as unknown as "failed",
            now: T0,
          }),
        ).rejects.toThrow();
      });

      it("a reservation is consumption history: deleting the sheet does not refund it", async () => {
        const user = await h.newUser();
        await grantPass(user, 3);
        const [sheet] = await consume(user, 1);
        expect((await balance(user)).available).toBe(2);
        await h.deleteSheet(sheet as string);
        expect((await balance(user)).available).toBe(2);
      });
    });

    describe("ownership", () => {
      it("SR-01: a user cannot reserve another user's sheet, and nothing is charged", async () => {
        const owner = await h.newUser();
        const other = await h.newUser();
        await grantPass(other, 3);
        const sheet = await h.newSheet(owner);
        expect(await reserve(other, sheet)).toEqual({ ok: false, reason: "not_found" });
        expect((await balance(other)).available).toBe(3);
      });

      it("an unknown sheet or user is not found", async () => {
        const user = await h.newUser();
        await grantPass(user, 1);
        const unknown = "00000000-0000-4000-8000-00000000dead";
        expect(await reserve(user, unknown)).toEqual({ ok: false, reason: "not_found" });
        expect(await reserve(unknown, await h.newSheet(user))).toEqual({
          ok: false,
          reason: "not_found",
        });
      });

      it("US-08.12: a frozen account cannot reserve, and the balance says so", async () => {
        const user = await h.newUser();
        await grantPass(user, 3);
        const first = await h.newSheet(user);
        await reserve(user, first);
        await h.setFrozen(user, true);
        expect(await reserve(user, await h.newSheet(user))).toEqual({
          ok: false,
          reason: "frozen",
        });
        // a sheet already reserved is not affected
        expect(await reserve(user, first)).toMatchObject({ ok: true, already: true });
        expect(await balance(user)).toMatchObject({ frozen: true, available: 2 });
        await h.setFrozen(user, false);
        expect(await reserve(user, await h.newSheet(user))).toMatchObject({ ok: true });
      });
    });

    describe("trial and founder price", () => {
      it("US-08.6: the trial grants 5 sheets for 14 days, once per normalised email", async () => {
        const first = await h.newUser({ email: "Ana.B+concurso@gmail.com" });
        const result = await h.store.ledger.grantTrial({
          userId: first,
          email: "Ana.B+concurso@gmail.com",
          sheets: 5,
          days: 14,
          now: T0,
        });
        expect(result.granted).toBe(true);
        const view = await balance(first, days(1));
        expect(view).toMatchObject({ available: 5 });
        expect(view.lots[0]).toMatchObject({ origin: "trial", remaining: 5 });
        expect(view.lots[0]?.expiresAt).toEqual(days(14));

        // another account, same person: no +tag, Gmail dots, googlemail.com
        for (const email of [
          "anab@gmail.com",
          "a.n.a.b@googlemail.com",
          "ANAB+x@gmail.com",
        ]) {
          const user = await h.newUser({ email });
          expect(
            await h.store.ledger.grantTrial({
              userId: user,
              email,
              sheets: 5,
              days: 14,
              now: T0,
            }),
          ).toEqual({ granted: false, reason: "already_used" });
          expect((await balance(user)).available).toBe(0);
        }
        // a different person is unaffected
        const other = await h.newUser({ email: "bruno@example.pt" });
        expect(
          (
            await h.store.ledger.grantTrial({
              userId: other,
              email: "bruno@example.pt",
              sheets: 5,
              days: 14,
              now: T0,
            })
          ).granted,
        ).toBe(true);
      });

      it("US-08.6: trial sheets left unused expire on day 15", async () => {
        const user = await h.newUser({ email: "trial-expiry@example.pt" });
        await h.store.ledger.grantTrial({
          userId: user,
          email: "trial-expiry@example.pt",
          sheets: 5,
          days: 14,
          now: T0,
        });
        expect((await balance(user, days(13))).available).toBe(5);
        expect((await balance(user, days(15))).available).toBe(0);
        expect(await reserve(user, await h.newSheet(user), days(15))).toEqual({
          ok: false,
          reason: "no_balance",
        });
      });

      it("US-08.6: the 6th sheet of a trial finds no balance", async () => {
        const user = await h.newUser({ email: "trial-six@example.pt" });
        await h.store.ledger.grantTrial({
          userId: user,
          email: "trial-six@example.pt",
          sheets: 5,
          days: 14,
          now: T0,
        });
        await consume(user, 5, days(1));
        expect(await reserve(user, await h.newSheet(user), days(1))).toEqual({
          ok: false,
          reason: "no_balance",
        });
      });

      it("US-08.2: the founder price is atomic and capped", async () => {
        const slots = 3;
        const users = await Promise.all(Array.from({ length: 8 }, () => h.newUser()));
        const results = await Promise.all(
          users.map((userId) => h.store.ledger.tryFounderPrice({ userId, slots })),
        );
        expect(results.filter((r) => r.granted)).toHaveLength(slots);

        // idempotent for a user who already holds a slot, and it never opens a new one
        const winner = users[results.findIndex((r) => r.granted)] as string;
        expect(await h.store.ledger.tryFounderPrice({ userId: winner, slots })).toEqual({
          granted: true,
          already: true,
        });
        const late = await h.newUser();
        expect(await h.store.ledger.tryFounderPrice({ userId: late, slots })).toEqual({
          granted: false,
          already: false,
        });
      });
    });

    describe("refunds", () => {
      it("US-12.4 / US-08.11: revoking a lot keeps used sheets and the balance never goes negative", async () => {
        const user = await h.newUser();
        const lot = await grantPass(user, 6);
        await consume(user, 2);
        const inFlight = await h.newSheet(user);
        await reserve(user, inFlight);
        expect(await h.store.ledger.revokeLot({ lotId: lot.lotId, now: T0 })).toEqual({
          ok: true,
          already: false,
          keptUsed: 3,
        });
        expect(await balance(user)).toMatchObject({ available: 0, lots: [] });
        // revoking again changes nothing
        expect(
          await h.store.ledger.revokeLot({ lotId: lot.lotId, now: T0 }),
        ).toMatchObject({
          ok: true,
          already: true,
        });
        // the sheet that was already in flight can still finish...
        expect(
          await h.store.ledger.commitSheet({ sheetId: inFlight, now: T0 }),
        ).toMatchObject({
          ok: true,
        });
        // ...and nothing new can be reserved from the revoked lot
        expect(await reserve(user, await h.newSheet(user))).toEqual({
          ok: false,
          reason: "no_balance",
        });
        expect((await balance(user)).available).toBe(0);
      });

      it("revoking an unknown lot is reported, not thrown", async () => {
        expect(
          await h.store.ledger.revokeLot({
            lotId: "00000000-0000-4000-8000-00000000dead",
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "not_found" });
      });
    });

    describe("security counters", () => {
      const hash = (email: string) => hmacRef(email, "contract-salt");

      it("rl_hit counts per window and resets in the next one", async () => {
        const key = `contract:${Math.random()}`;
        const hit = (now: Date) =>
          h.store.security.rateLimitHit({ key, limit: 3, windowSeconds: 60, now });
        const t = new Date("2026-03-01T10:00:10.000Z");
        const results = [await hit(t), await hit(t), await hit(t), await hit(t)];
        expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
        expect(results.map((r) => r.count)).toEqual([1, 2, 3, 4]);
        expect(results.map((r) => r.remaining)).toEqual([2, 1, 0, 0]);
        expect(results[0]?.resetAt).toEqual(new Date("2026-03-01T10:01:00.000Z"));
        // next window: the count starts again
        expect(await hit(new Date("2026-03-01T10:01:00.000Z"))).toMatchObject({
          allowed: true,
          count: 1,
        });
        // another key is independent
        expect(
          await h.store.security.rateLimitHit({
            key: `${key}:b`,
            limit: 3,
            windowSeconds: 60,
            now: t,
          }),
        ).toMatchObject({ count: 1 });
      });

      it("rl_hit counts every parallel hit exactly once", async () => {
        const key = `contract-parallel:${Math.random()}`;
        const results = await Promise.all(
          Array.from({ length: 10 }, () =>
            h.store.security.rateLimitHit({ key, limit: 4, windowSeconds: 60, now: T0 }),
          ),
        );
        expect(results.filter((r) => r.allowed)).toHaveLength(4);
        expect(results.map((r) => r.count).sort((a, b) => a - b)).toEqual([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        ]);
      });

      it("SR-06: five wrong codes lock the email for 15 minutes and report the lock once", async () => {
        const emailHash = hash(`lock-${Math.random()}@example.pt`);
        const fail = (now: Date) => h.store.security.attemptFailed({ emailHash, now });
        const before = await h.store.security.attemptStatus({ emailHash, now: T0 });
        expect(before).toEqual({ locked: false, failed: 0, lockedUntil: null });

        const four = [];
        for (let i = 0; i < 4; i += 1) four.push(await fail(minutes(i)));
        expect(four.map((r) => r.failed)).toEqual([1, 2, 3, 4]);
        expect(four.some((r) => r.locked)).toBe(false);

        const fifth = await fail(minutes(4));
        expect(fifth).toMatchObject({ locked: true, justLocked: true, failed: 5 });
        expect(fifth.lockedUntil).toEqual(minutes(4 + 15));

        // while locked: still locked, not "just locked" again, and the lock is not extended
        const during = await fail(minutes(10));
        expect(during).toMatchObject({ locked: true, justLocked: false, failed: 5 });
        expect(during.lockedUntil).toEqual(minutes(4 + 15));
        expect(
          await h.store.security.attemptStatus({ emailHash, now: minutes(10) }),
        ).toMatchObject({
          locked: true,
        });

        // after 15 minutes the email is free and the count starts again
        expect(
          await h.store.security.attemptStatus({ emailHash, now: minutes(19) }),
        ).toEqual({
          locked: false,
          failed: 0,
          lockedUntil: null,
        });
        expect(await fail(minutes(20))).toMatchObject({
          locked: false,
          justLocked: false,
          failed: 1,
        });
      });

      it("SR-06: a right code resets the counter, and emails are counted separately", async () => {
        const a = hash(`reset-a-${Math.random()}@example.pt`);
        const b = hash(`reset-b-${Math.random()}@example.pt`);
        for (let i = 0; i < 3; i += 1) {
          await h.store.security.attemptFailed({ emailHash: a, now: minutes(i) });
        }
        expect(
          (await h.store.security.attemptFailed({ emailHash: b, now: minutes(1) }))
            .failed,
        ).toBe(1);
        await h.store.security.attemptReset({ emailHash: a });
        expect(
          await h.store.security.attemptStatus({ emailHash: a, now: minutes(5) }),
        ).toEqual({
          locked: false,
          failed: 0,
          lockedUntil: null,
        });
        expect(
          (await h.store.security.attemptFailed({ emailHash: a, now: minutes(6) }))
            .failed,
        ).toBe(1);
      });

      it("SR-06: the limit and the lock time can be tuned", async () => {
        const emailHash = hash(`tuned-${Math.random()}@example.pt`);
        const first = await h.store.security.attemptFailed({
          emailHash,
          now: T0,
          maxFailures: 2,
          lockSeconds: 60,
        });
        expect(first.locked).toBe(false);
        const second = await h.store.security.attemptFailed({
          emailHash,
          now: T0,
          maxFailures: 2,
          lockSeconds: 60,
        });
        expect(second).toMatchObject({ locked: true, justLocked: true });
        expect(second.lockedUntil).toEqual(minutes(1));
      });
    });
  });
}
