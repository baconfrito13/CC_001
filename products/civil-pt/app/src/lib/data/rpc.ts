import type { z } from "zod";
import {
  attemptFailureSchema,
  attemptStatusSchema,
  balanceSchema,
  commitResultSchema,
  type DataStore,
  founderResultSchema,
  grantLotResultSchema,
  rateLimitSchema,
  releaseResultSchema,
  reserveResultSchema,
  revokeResultSchema,
  trialResultSchema,
} from "./types";

/**
 * Calls one SQL function of supabase/migrations and returns what it returned (jsonb).
 * Supabase: `supabase.rpc(name, args)`. Tests: a PGlite or Postgres connection.
 */
export type RpcCaller = (fn: string, args: Record<string, unknown>) => Promise<unknown>;

/** A failed call. Carries only the function name and a code, never arguments or messages. */
export class DataStoreError extends Error {
  constructor(
    public readonly fn: string,
    public readonly code: string,
  ) {
    super(`data store call ${fn} failed (${code})`);
    this.name = "DataStoreError";
  }
}

/**
 * The data contract on top of the ledger and security SQL functions. Every response is parsed
 * with zod: a database that answers with an unexpected shape fails loudly instead of
 * silently handing out sheets.
 */
export function createRpcDataStore(call: RpcCaller, name: DataStore["name"]): DataStore {
  const run = async <T extends z.ZodType>(
    fn: string,
    args: Record<string, unknown>,
    schema: T,
  ): Promise<z.output<T>> => {
    const raw = await call(fn, args);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new DataStoreError(fn, "unexpected_response");
    return parsed.data;
  };
  const iso = (date: Date) => date.toISOString();

  return {
    name,
    async ping() {
      const result = await call("db_ping", {});
      if (result !== true) throw new DataStoreError("db_ping", "unexpected_response");
    },
    ledger: {
      grantLot: (i) =>
        run(
          "grant_lot",
          {
            p_user: i.userId,
            p_origin: i.origin,
            p_sheets: i.sheets,
            p_expires_at: iso(i.expiresAt),
            p_purchase: i.purchaseId ?? null,
            p_now: iso(i.now),
          },
          grantLotResultSchema,
        ),
      grantTrial: (i) =>
        run(
          "grant_trial",
          {
            p_user: i.userId,
            p_email: i.email,
            p_sheets: i.sheets,
            p_days: i.days,
            p_now: iso(i.now),
          },
          trialResultSchema,
        ),
      reserveSheet: (i) =>
        run(
          "reserve_sheet",
          { p_user: i.userId, p_sheet: i.sheetId, p_now: iso(i.now) },
          reserveResultSchema,
        ),
      commitSheet: (i) =>
        run(
          "commit_sheet",
          { p_sheet: i.sheetId, p_now: iso(i.now) },
          commitResultSchema,
        ),
      releaseSheet: (i) =>
        run(
          "release_sheet",
          { p_sheet: i.sheetId, p_reason: i.reason, p_now: iso(i.now) },
          releaseResultSchema,
        ),
      revokeLot: (i) =>
        run("revoke_lot", { p_lot: i.lotId, p_now: iso(i.now) }, revokeResultSchema),
      balance: (i) =>
        run("ledger_balance", { p_user: i.userId, p_now: iso(i.now) }, balanceSchema),
      tryFounderPrice: (i) =>
        run(
          "try_founder_price",
          { p_user: i.userId, p_slots: i.slots },
          founderResultSchema,
        ),
    },
    security: {
      rateLimitHit: (i) =>
        run(
          "rl_hit",
          {
            p_key: i.key,
            p_limit: i.limit,
            p_window_seconds: i.windowSeconds,
            p_now: iso(i.now),
          },
          rateLimitSchema,
        ),
      attemptStatus: (i) =>
        run(
          "auth_attempt_status",
          { p_email_hash: i.emailHash, p_now: iso(i.now) },
          attemptStatusSchema,
        ),
      attemptFailed: (i) =>
        run(
          "auth_attempt_failed",
          {
            p_email_hash: i.emailHash,
            p_now: iso(i.now),
            ...(i.maxFailures === undefined ? {} : { p_max: i.maxFailures }),
            ...(i.lockSeconds === undefined ? {} : { p_lock_seconds: i.lockSeconds }),
          },
          attemptFailureSchema,
        ),
      async attemptReset(i) {
        await call("auth_attempt_reset", { p_email_hash: i.emailHash });
      },
    },
  };
}
