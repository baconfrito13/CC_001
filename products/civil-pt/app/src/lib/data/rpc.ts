import { z } from "zod";
import {
  abandonDocumentSchema,
  attemptFailureSchema,
  attemptStatusSchema,
  balanceSchema,
  commitResultSchema,
  type DataStore,
  documentSchema,
  documentsSchema,
  finalizeDocumentSchema,
  founderResultSchema,
  grantLotResultSchema,
  projectListSchema,
  projectSchema,
  rateLimitSchema,
  registerDocumentSchema,
  releaseResultSchema,
  reserveResultSchema,
  revokeResultSchema,
  setScaleSchema,
  sheetSchema,
  stalePendingSchema,
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
  /** Functions that answer "the row or nothing": SQL null becomes null here. */
  const maybe = <T extends z.ZodType>(schema: T) => z.nullable(schema);
  const deleted = z.object({ ok: z.boolean() }).transform((result) => result.ok);

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
    workspace: {
      createProject: (i) =>
        run(
          "create_project",
          { p_user: i.userId, p_name: i.name, p_now: iso(i.now) },
          projectSchema,
        ),
      listProjects: (i) => run("list_projects", { p_user: i.userId }, projectListSchema),
      getProject: (i) =>
        run(
          "get_project",
          { p_user: i.userId, p_project: i.projectId },
          maybe(projectSchema),
        ),
      deleteProject: (i) =>
        run("delete_project", { p_user: i.userId, p_project: i.projectId }, deleted),
      registerDocument: (i) =>
        run(
          "register_document",
          {
            p_user: i.userId,
            p_project: i.projectId,
            p_document: i.documentId,
            p_path: i.storagePath,
            p_file_name: i.fileName,
            p_size: i.sizeBytes,
            p_now: iso(i.now),
          },
          registerDocumentSchema,
        ),
      getDocument: (i) =>
        run(
          "get_document",
          { p_user: i.userId, p_document: i.documentId },
          maybe(documentSchema),
        ),
      listDocuments: (i) =>
        run(
          "list_documents",
          { p_user: i.userId, p_project: i.projectId },
          documentsSchema,
        ),
      finalizeDocument: (i) =>
        run(
          "finalize_document",
          {
            p_user: i.userId,
            p_document: i.documentId,
            p_page_count: i.pageCount,
            p_sheets: i.sheets.map((sheet) => ({
              page_no: sheet.pageNo,
              width_pt: sheet.widthPt,
              height_pt: sheet.heightPt,
              scale_ratio: sheet.scaleRatio,
              scale_source: sheet.scaleSource,
            })),
            p_now: iso(i.now),
          },
          finalizeDocumentSchema,
        ),
      abandonDocument: (i) =>
        run(
          "abandon_document",
          { p_user: i.userId, p_document: i.documentId },
          abandonDocumentSchema,
        ),
      listStalePendingDocuments: (i) =>
        run(
          "list_stale_pending_documents",
          { p_before: iso(i.before), p_limit: i.limit },
          stalePendingSchema,
        ),
      getSheet: (i) =>
        run("get_sheet", { p_user: i.userId, p_sheet: i.sheetId }, maybe(sheetSchema)),
      setSheetScale: (i) =>
        run(
          "set_sheet_scale",
          { p_user: i.userId, p_sheet: i.sheetId, p_ratio: i.ratio, p_now: iso(i.now) },
          setScaleSchema,
        ),
      userExists: (email) => run("auth_user_exists", { p_email: email }, z.boolean()),
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
