import { z } from "zod";

/**
 * The data layer's contract (docs/04-architecture.md sections 5 and 8).
 *
 * Two implementations satisfy it: `memory` (tests, development, the e2e suite) and the SQL
 * functions of supabase/migrations behind the `supabase` adapter. A shared contract suite
 * (tests/contract) runs the same scenarios against both, so test mode cannot drift from the
 * real ledger. Time is always passed in (`now`), never read inside: tests move the clock.
 */

export type LotOrigin = "trial" | "subscription" | "pass";
export type PaidLotOrigin = Exclude<LotOrigin, "trial">;
export type ReleaseReason = "failed" | "raster" | "low_diversity" | "returned";

export interface BalanceLot {
  lotId: string;
  origin: LotOrigin;
  remaining: number;
  expiresAt: Date;
}

export interface Balance {
  /** Sheets that can be reserved right now (usable lots only). */
  available: number;
  /** A payment dispute is open: nothing can be reserved (US-08 criterion 12). */
  frozen: boolean;
  /** Usable lots, earliest expiry first. */
  lots: BalanceLot[];
}

export type ReserveResult =
  | { ok: true; lotId: string; already: boolean }
  | { ok: false; reason: "no_balance" | "not_found" | "frozen" };

export type CommitResult =
  | { ok: true; already: boolean }
  | { ok: false; reason: "not_reserved" };

export type ReleaseResult =
  | { ok: true; already: boolean }
  | {
      ok: false;
      reason: "not_reserved" | "not_committed" | "already_committed" | "return_limit";
    };

export type GrantLotResult = { lotId: string; created: boolean };
export type TrialResult =
  | { granted: true; lotId: string }
  | { granted: false; reason: "already_used" };
export type RevokeResult =
  | { ok: true; already: boolean; keptUsed: number }
  | { ok: false; reason: "not_found" };
export type FounderResult = { granted: boolean; already: boolean };

export interface Ledger {
  /** Lot for a subscription period or a pass. Idempotent per `purchaseId`. */
  grantLot(input: {
    userId: string;
    origin: PaidLotOrigin;
    sheets: number;
    expiresAt: Date;
    purchaseId?: string;
    now: Date;
  }): Promise<GrantLotResult>;
  /** The free trial: `sheets` sheets for `days` days, once per normalised email. */
  grantTrial(input: {
    userId: string;
    email: string;
    sheets: number;
    days: number;
    now: Date;
  }): Promise<TrialResult>;
  /** Reserve a sheet from the lot that expires first. Idempotent per sheet. */
  reserveSheet(input: {
    userId: string;
    sheetId: string;
    now: Date;
  }): Promise<ReserveResult>;
  commitSheet(input: { sheetId: string; now: Date }): Promise<CommitResult>;
  releaseSheet(input: {
    sheetId: string;
    reason: ReleaseReason;
    now: Date;
  }): Promise<ReleaseResult>;
  /** Refund: the lot shrinks to the sheets already used. */
  revokeLot(input: { lotId: string; now: Date }): Promise<RevokeResult>;
  balance(input: { userId: string; now: Date }): Promise<Balance>;
  /** Atomic: at most `slots` users ever get the founder price. */
  tryFounderPrice(input: { userId: string; slots: number }): Promise<FounderResult>;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: Date;
}

export interface AttemptStatus {
  locked: boolean;
  failed: number;
  lockedUntil: Date | null;
}

export interface AttemptFailure extends AttemptStatus {
  /** True on the very failure that locks the email: the caller rotates the active code. */
  justLocked: boolean;
}

/** Counters that protect sign-in and the API (SR-06, T-07). Keys are hashes, never emails. */
export interface SecurityStore {
  /** Fixed-window counter: counts one hit and says whether it is within `limit`. */
  rateLimitHit(input: {
    key: string;
    limit: number;
    windowSeconds: number;
    now: Date;
  }): Promise<RateLimitResult>;
  attemptStatus(input: { emailHash: string; now: Date }): Promise<AttemptStatus>;
  /** Count a wrong code. The 5th failure locks for 15 minutes. */
  attemptFailed(input: {
    emailHash: string;
    now: Date;
    maxFailures?: number;
    lockSeconds?: number;
  }): Promise<AttemptFailure>;
  attemptReset(input: { emailHash: string }): Promise<void>;
}

export const ATTEMPT_MAX_FAILURES = 5;
export const ATTEMPT_LOCK_SECONDS = 15 * 60;

// ---------------------------------------------------------------------------------------
// Workspace: projects, documents and sheets (slice S-03, US-02 and US-03)
// ---------------------------------------------------------------------------------------

export type DocumentStatus = "pending_upload" | "ready" | "rejected";
export type SheetStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "unsupported_raster"
  | "low_diversity";
export type ScaleSource = "detected" | "manual";

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ProjectSummary extends ProjectRecord {
  /** Documents that finished uploading. */
  documentCount: number;
  sheetCount: number;
}

export interface SheetRecord {
  id: string;
  documentId: string;
  projectId: string;
  pageNo: number;
  widthPt: number;
  heightPt: number;
  scaleRatio: number | null;
  scaleSource: ScaleSource | null;
  status: SheetStatus;
  /** The scale changed after the quantities were computed (US-03 criterion 3). */
  needsRecalc: boolean;
}

export interface DocumentRecord {
  id: string;
  projectId: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number | null;
  status: DocumentStatus;
  storagePath: string;
  createdAt: Date;
  sheets: SheetRecord[];
}

/** What the server learned about one page of a freshly uploaded PDF. */
export interface NewSheet {
  pageNo: number;
  widthPt: number;
  heightPt: number;
  scaleRatio: number | null;
  scaleSource: "detected" | null;
}

export type RegisterDocumentResult =
  | { ok: true; document: DocumentRecord }
  | { ok: false; reason: "not_found" };

export type FinalizeDocumentResult =
  | { ok: true; already: boolean; document: DocumentRecord }
  | { ok: false; reason: "not_found" | "bad_state" };

export type AbandonDocumentResult =
  | { ok: true; storagePath: string }
  | { ok: false; reason: "not_found" | "not_pending" };

export type SetScaleResult =
  | {
      ok: true;
      sheet: SheetRecord;
      previousRatio: number | null;
      previousSource: ScaleSource | null;
    }
  | { ok: false; reason: "not_found" };

export interface StalePendingDocument {
  id: string;
  userId: string;
  storagePath: string;
}

/**
 * Projects, documents and sheets. Every method takes the user it acts for and answers "not
 * found" for rows that belong to somebody else (US-02 criterion 6): the caller never needs a
 * separate ownership check and can never leak the existence of another account's project.
 */
export interface Workspace {
  createProject(input: {
    userId: string;
    name: string;
    now: Date;
  }): Promise<ProjectRecord>;
  listProjects(input: { userId: string }): Promise<ProjectSummary[]>;
  getProject(input: { userId: string; projectId: string }): Promise<ProjectRecord | null>;
  /** Removes the project, its documents and its sheets. False when it is not the user's. */
  deleteProject(input: { userId: string; projectId: string }): Promise<boolean>;
  registerDocument(input: {
    userId: string;
    projectId: string;
    documentId: string;
    storagePath: string;
    fileName: string;
    sizeBytes: number;
    now: Date;
  }): Promise<RegisterDocumentResult>;
  getDocument(input: {
    userId: string;
    documentId: string;
  }): Promise<DocumentRecord | null>;
  listDocuments(input: { userId: string; projectId: string }): Promise<DocumentRecord[]>;
  /** Creates the sheets and marks the document ready in one step. Idempotent. */
  finalizeDocument(input: {
    userId: string;
    documentId: string;
    pageCount: number;
    sheets: NewSheet[];
    now: Date;
  }): Promise<FinalizeDocumentResult>;
  /** Removes a document that never became ready; returns the object the caller must delete. */
  abandonDocument(input: {
    userId: string;
    documentId: string;
  }): Promise<AbandonDocumentResult>;
  /** Maintenance, all users: uploads registered before `before` and never finalized. */
  listStalePendingDocuments(input: {
    before: Date;
    limit: number;
  }): Promise<StalePendingDocument[]>;
  getSheet(input: { userId: string; sheetId: string }): Promise<SheetRecord | null>;
  setSheetScale(input: {
    userId: string;
    sheetId: string;
    ratio: number;
    now: Date;
  }): Promise<SetScaleResult>;
  /** Is there an account with this email? Only the sign-in limits use the answer. */
  userExists(email: string): Promise<boolean>;
}

export interface DataStore {
  readonly name: "memory" | "supabase";
  /** Throws when the store cannot answer: the health check turns that into a 503. */
  ping(): Promise<void>;
  readonly ledger: Ledger;
  readonly security: SecurityStore;
  readonly workspace: Workspace;
}

// ---------------------------------------------------------------------------------------
// Validation of what the database returns (third-party boundary: never trust a response)
// ---------------------------------------------------------------------------------------

const timestamp = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "invalid timestamp")
  .transform((value) => new Date(value));

/** Ids come from the database; only their presence is checked (formats differ per adapter). */
const id = z.string().min(1);

export const reserveResultSchema = z.union([
  z
    .object({ ok: z.literal(true), already: z.boolean(), lot_id: id })
    .transform((r): ReserveResult => ({ ok: true, lotId: r.lot_id, already: r.already })),
  z
    .object({
      ok: z.literal(false),
      reason: z.enum(["no_balance", "not_found", "frozen"]),
    })
    .transform((r): ReserveResult => r),
]);

export const commitResultSchema = z.union([
  z
    .object({ ok: z.literal(true), already: z.boolean() })
    .transform((r): CommitResult => r),
  z
    .object({ ok: z.literal(false), reason: z.literal("not_reserved") })
    .transform((r): CommitResult => r),
]);

export const releaseResultSchema = z.union([
  z
    .object({ ok: z.literal(true), already: z.boolean() })
    .transform((r): ReleaseResult => r),
  z
    .object({
      ok: z.literal(false),
      reason: z.enum([
        "not_reserved",
        "not_committed",
        "already_committed",
        "return_limit",
      ]),
    })
    .transform((r): ReleaseResult => r),
]);

export const grantLotResultSchema = z
  .object({ lot_id: id, created: z.boolean() })
  .transform((r): GrantLotResult => ({ lotId: r.lot_id, created: r.created }));

export const trialResultSchema = z.union([
  z
    .object({ granted: z.literal(true), lot_id: id })
    .transform((r): TrialResult => ({ granted: true, lotId: r.lot_id })),
  z
    .object({ granted: z.literal(false), reason: z.literal("already_used") })
    .transform((r): TrialResult => r),
]);

export const revokeResultSchema = z.union([
  z
    .object({ ok: z.literal(true), already: z.boolean(), kept_used: z.number().int() })
    .transform(
      (r): RevokeResult => ({ ok: true, already: r.already, keptUsed: r.kept_used }),
    ),
  z
    .object({ ok: z.literal(false), reason: z.literal("not_found") })
    .transform((r): RevokeResult => r),
]);

export const balanceSchema = z
  .object({
    available: z.number().int().nonnegative(),
    frozen: z.boolean(),
    lots: z.array(
      z.object({
        lot_id: id,
        origin: z.enum(["trial", "subscription", "pass"]),
        remaining: z.number().int().positive(),
        expires_at: timestamp,
      }),
    ),
  })
  .transform(
    (r): Balance => ({
      available: r.available,
      frozen: r.frozen,
      lots: r.lots.map((lot) => ({
        lotId: lot.lot_id,
        origin: lot.origin,
        remaining: lot.remaining,
        expiresAt: lot.expires_at,
      })),
    }),
  );

export const founderResultSchema = z.object({
  granted: z.boolean(),
  already: z.boolean(),
});

export const rateLimitSchema = z
  .object({
    allowed: z.boolean(),
    count: z.number().int(),
    remaining: z.number().int(),
    reset_at: timestamp,
  })
  .transform(
    (r): RateLimitResult => ({
      allowed: r.allowed,
      count: r.count,
      remaining: r.remaining,
      resetAt: r.reset_at,
    }),
  );

export const attemptStatusSchema = z
  .object({
    locked: z.boolean(),
    failed: z.number().int(),
    locked_until: timestamp.nullable(),
  })
  .transform(
    (r): AttemptStatus => ({
      locked: r.locked,
      failed: r.failed,
      lockedUntil: r.locked_until,
    }),
  );

export const attemptFailureSchema = z
  .object({
    locked: z.boolean(),
    just_locked: z.boolean(),
    failed: z.number().int(),
    locked_until: timestamp.nullable(),
  })
  .transform(
    (r): AttemptFailure => ({
      locked: r.locked,
      justLocked: r.just_locked,
      failed: r.failed,
      lockedUntil: r.locked_until,
    }),
  );

const sheetStatus = z.enum([
  "uploaded",
  "queued",
  "processing",
  "ready",
  "failed",
  "unsupported_raster",
  "low_diversity",
]);

const sheetJson = z.object({
  id,
  document_id: id,
  project_id: id,
  page_no: z.number().int().positive(),
  width_pt: z.number().positive(),
  height_pt: z.number().positive(),
  scale_ratio: z.number().int().nullable(),
  scale_source: z.enum(["detected", "manual"]).nullable(),
  status: sheetStatus,
  needs_recalc: z.boolean(),
});

const toSheet = (r: z.output<typeof sheetJson>): SheetRecord => ({
  id: r.id,
  documentId: r.document_id,
  projectId: r.project_id,
  pageNo: r.page_no,
  widthPt: r.width_pt,
  heightPt: r.height_pt,
  scaleRatio: r.scale_ratio,
  scaleSource: r.scale_source,
  status: r.status,
  needsRecalc: r.needs_recalc,
});

export const sheetSchema = sheetJson.transform(toSheet);

const documentJson = z.object({
  id,
  project_id: id,
  file_name: z.string(),
  size_bytes: z.number().int().nonnegative(),
  page_count: z.number().int().positive().nullable(),
  status: z.enum(["pending_upload", "ready", "rejected"]),
  storage_path: z.string(),
  created_at: timestamp,
  sheets: z.array(sheetJson),
});

const toDocument = (r: z.output<typeof documentJson>): DocumentRecord => ({
  id: r.id,
  projectId: r.project_id,
  fileName: r.file_name,
  sizeBytes: r.size_bytes,
  pageCount: r.page_count,
  status: r.status,
  storagePath: r.storage_path,
  createdAt: r.created_at,
  sheets: r.sheets.map(toSheet),
});

export const documentSchema = documentJson.transform(toDocument);

export const documentsSchema = z.array(documentSchema);

export const projectSchema = z
  .object({ id, name: z.string(), created_at: timestamp })
  .transform((r): ProjectRecord => ({ id: r.id, name: r.name, createdAt: r.created_at }));

export const projectListSchema = z.array(
  z
    .object({
      id,
      name: z.string(),
      created_at: timestamp,
      document_count: z.number().int().nonnegative(),
      sheet_count: z.number().int().nonnegative(),
    })
    .transform(
      (r): ProjectSummary => ({
        id: r.id,
        name: r.name,
        createdAt: r.created_at,
        documentCount: r.document_count,
        sheetCount: r.sheet_count,
      }),
    ),
);

export const registerDocumentSchema = z.union([
  z
    .object({ ok: z.literal(true), document: documentJson })
    .transform(
      (r): RegisterDocumentResult => ({ ok: true, document: toDocument(r.document) }),
    ),
  z
    .object({ ok: z.literal(false), reason: z.literal("not_found") })
    .transform((r): RegisterDocumentResult => r),
]);

export const finalizeDocumentSchema = z.union([
  z
    .object({ ok: z.literal(true), already: z.boolean(), document: documentJson })
    .transform(
      (r): FinalizeDocumentResult => ({
        ok: true,
        already: r.already,
        document: toDocument(r.document),
      }),
    ),
  z
    .object({ ok: z.literal(false), reason: z.enum(["not_found", "bad_state"]) })
    .transform((r): FinalizeDocumentResult => r),
]);

export const abandonDocumentSchema = z.union([
  z
    .object({ ok: z.literal(true), storage_path: z.string() })
    .transform((r): AbandonDocumentResult => ({ ok: true, storagePath: r.storage_path })),
  z
    .object({ ok: z.literal(false), reason: z.enum(["not_found", "not_pending"]) })
    .transform((r): AbandonDocumentResult => r),
]);

export const stalePendingSchema = z.array(
  z.object({ id, user_id: id, storage_path: z.string() }).transform(
    (r): StalePendingDocument => ({
      id: r.id,
      userId: r.user_id,
      storagePath: r.storage_path,
    }),
  ),
);

export const setScaleSchema = z.union([
  z
    .object({
      ok: z.literal(true),
      sheet: sheetJson,
      previous_ratio: z.number().int().nullable(),
      previous_source: z.enum(["detected", "manual"]).nullable(),
    })
    .transform(
      (r): SetScaleResult => ({
        ok: true,
        sheet: toSheet(r.sheet),
        previousRatio: r.previous_ratio,
        previousSource: r.previous_source,
      }),
    ),
  z
    .object({ ok: z.literal(false), reason: z.literal("not_found") })
    .transform((r): SetScaleResult => r),
]);
