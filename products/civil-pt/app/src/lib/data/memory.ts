import { randomUUID } from "node:crypto";
import { trialEmailHash } from "@/lib/core/email";
import {
  ATTEMPT_LOCK_SECONDS,
  ATTEMPT_MAX_FAILURES,
  type AttemptFailure,
  type AttemptStatus,
  type Balance,
  type CommitResult,
  type DataStore,
  type FounderResult,
  type GrantLotResult,
  type Ledger,
  type LotOrigin,
  type PaidLotOrigin,
  type RateLimitResult,
  type ReleaseReason,
  type ReleaseResult,
  type ReserveResult,
  type RevokeResult,
  type SecurityStore,
  type TrialResult,
} from "./types";

/**
 * In-memory implementation of the data contract, for development, unit tests and the e2e
 * suite. It mirrors the SQL functions of supabase/migrations/*_init.sql rule for rule; the
 * contract suite (tests/contract) proves they agree. Every method runs to completion without
 * awaiting, so each operation is atomic exactly like the SQL functions (SR-02).
 */

const DAY_MS = 86_400_000;
const MAX_RETURNS_PER_LOT = 3;

interface Lot {
  id: string;
  userId: string;
  purchaseId: string | null;
  origin: LotOrigin;
  sheetsTotal: number;
  returnsUsed: number;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  seq: number;
}

interface Reservation {
  sheetId: string;
  lotId: string;
  userId: string;
  state: "reserved" | "committed" | "released";
  reason: ReleaseReason | null;
}

interface AttemptRow {
  failed: number;
  lockedUntil: Date | null;
}

class MemoryLedger implements Ledger {
  readonly lots = new Map<string, Lot>();
  readonly reservations = new Map<string, Reservation>();
  private readonly trialHashes = new Set<string>();
  private readonly founders = new Set<string>();
  private seq = 0;

  constructor(
    private readonly world: {
      users: Map<string, { frozen: boolean }>;
      sheets: Map<string, { userId: string }>;
    },
  ) {}

  private used(lotId: string): number {
    let count = 0;
    for (const r of this.reservations.values()) {
      if (r.lotId === lotId && r.state !== "released") count += 1;
    }
    return count;
  }

  private usableLots(userId: string, now: Date): { lot: Lot; remaining: number }[] {
    return [...this.lots.values()]
      .filter((l) => l.userId === userId && l.revokedAt === null && l.expiresAt > now)
      .map((lot) => ({ lot, remaining: lot.sheetsTotal - this.used(lot.id) }))
      .filter((entry) => entry.remaining > 0)
      .sort(
        (a, b) =>
          a.lot.expiresAt.getTime() - b.lot.expiresAt.getTime() ||
          a.lot.createdAt.getTime() - b.lot.createdAt.getTime() ||
          a.lot.seq - b.lot.seq,
      );
  }

  private addLot(input: {
    userId: string;
    origin: LotOrigin;
    sheets: number;
    expiresAt: Date;
    purchaseId?: string;
    now: Date;
  }): Lot {
    const lot: Lot = {
      id: randomUUID(),
      userId: input.userId,
      purchaseId: input.purchaseId ?? null,
      origin: input.origin,
      sheetsTotal: input.sheets,
      returnsUsed: 0,
      expiresAt: input.expiresAt,
      revokedAt: null,
      createdAt: input.now,
      seq: ++this.seq,
    };
    this.lots.set(lot.id, lot);
    return lot;
  }

  async grantLot(input: {
    userId: string;
    origin: PaidLotOrigin;
    sheets: number;
    expiresAt: Date;
    purchaseId?: string;
    now: Date;
  }): Promise<GrantLotResult> {
    if (!Number.isInteger(input.sheets) || input.sheets <= 0) {
      throw new RangeError("invalid_lot_size");
    }
    if (input.purchaseId) {
      for (const lot of this.lots.values()) {
        if (lot.purchaseId === input.purchaseId) return { lotId: lot.id, created: false };
      }
    }
    return { lotId: this.addLot(input).id, created: true };
  }

  async grantTrial(input: {
    userId: string;
    email: string;
    sheets: number;
    days: number;
    now: Date;
  }): Promise<TrialResult> {
    const hash = trialEmailHash(input.email);
    if (this.trialHashes.has(hash)) return { granted: false, reason: "already_used" };
    this.trialHashes.add(hash);
    const lot = this.addLot({
      userId: input.userId,
      origin: "trial",
      sheets: input.sheets,
      expiresAt: new Date(input.now.getTime() + input.days * DAY_MS),
      now: input.now,
    });
    return { granted: true, lotId: lot.id };
  }

  async reserveSheet(input: {
    userId: string;
    sheetId: string;
    now: Date;
  }): Promise<ReserveResult> {
    const user = this.world.users.get(input.userId);
    if (!user) return { ok: false, reason: "not_found" };
    if (this.world.sheets.get(input.sheetId)?.userId !== input.userId) {
      return { ok: false, reason: "not_found" };
    }
    const existing = this.reservations.get(input.sheetId);
    if (existing && existing.state !== "released") {
      return { ok: true, already: true, lotId: existing.lotId };
    }
    if (user.frozen) return { ok: false, reason: "frozen" };

    const first = this.usableLots(input.userId, input.now)[0];
    if (!first) return { ok: false, reason: "no_balance" };
    this.reservations.set(input.sheetId, {
      sheetId: input.sheetId,
      lotId: first.lot.id,
      userId: input.userId,
      state: "reserved",
      reason: null,
    });
    return { ok: true, already: false, lotId: first.lot.id };
  }

  async commitSheet(input: { sheetId: string; now: Date }): Promise<CommitResult> {
    const reservation = this.reservations.get(input.sheetId);
    if (reservation?.state === "reserved") {
      reservation.state = "committed";
      return { ok: true, already: false };
    }
    if (reservation?.state === "committed") return { ok: true, already: true };
    return { ok: false, reason: "not_reserved" };
  }

  async releaseSheet(input: {
    sheetId: string;
    reason: ReleaseReason;
    now: Date;
  }): Promise<ReleaseResult> {
    if (!["failed", "raster", "low_diversity", "returned"].includes(input.reason)) {
      throw new RangeError("invalid_release_reason");
    }
    const reservation = this.reservations.get(input.sheetId);
    if (!reservation) return { ok: false, reason: "not_reserved" };
    if (reservation.state === "released") return { ok: true, already: true };

    if (input.reason === "returned") {
      if (reservation.state !== "committed")
        return { ok: false, reason: "not_committed" };
      const lot = this.lots.get(reservation.lotId);
      if (!lot || lot.returnsUsed >= MAX_RETURNS_PER_LOT) {
        return { ok: false, reason: "return_limit" };
      }
      lot.returnsUsed += 1;
    } else if (reservation.state !== "reserved") {
      return { ok: false, reason: "already_committed" };
    }
    reservation.state = "released";
    reservation.reason = input.reason;
    return { ok: true, already: false };
  }

  async revokeLot(input: { lotId: string; now: Date }): Promise<RevokeResult> {
    const lot = this.lots.get(input.lotId);
    if (!lot) return { ok: false, reason: "not_found" };
    if (lot.revokedAt) return { ok: true, already: true, keptUsed: lot.sheetsTotal };
    const keptUsed = this.used(lot.id);
    lot.sheetsTotal = keptUsed;
    lot.revokedAt = input.now;
    return { ok: true, already: false, keptUsed };
  }

  async balance(input: { userId: string; now: Date }): Promise<Balance> {
    const usable = this.usableLots(input.userId, input.now);
    return {
      available: usable.reduce((sum, entry) => sum + entry.remaining, 0),
      frozen: this.world.users.get(input.userId)?.frozen ?? false,
      lots: usable.map(({ lot, remaining }) => ({
        lotId: lot.id,
        origin: lot.origin,
        remaining,
        expiresAt: lot.expiresAt,
      })),
    };
  }

  async tryFounderPrice(input: {
    userId: string;
    slots: number;
  }): Promise<FounderResult> {
    if (this.founders.has(input.userId)) return { granted: true, already: true };
    if (this.founders.size > input.slots) return { granted: false, already: false };
    this.founders.add(input.userId);
    return { granted: true, already: false };
  }
}

class MemorySecurity implements SecurityStore {
  private readonly windows = new Map<string, number>();
  private readonly attempts = new Map<string, AttemptRow>();

  async rateLimitHit(input: {
    key: string;
    limit: number;
    windowSeconds: number;
    now: Date;
  }): Promise<RateLimitResult> {
    if (input.windowSeconds <= 0 || input.limit < 0) {
      throw new RangeError("invalid_rate_limit");
    }
    const windowMs = input.windowSeconds * 1000;
    const start = Math.floor(input.now.getTime() / windowMs) * windowMs;
    const id = `${input.key}\u0000${start}`;
    const count = (this.windows.get(id) ?? 0) + 1;
    this.windows.set(id, count);
    return {
      allowed: count <= input.limit,
      count,
      remaining: Math.max(input.limit - count, 0),
      resetAt: new Date(start + windowMs),
    };
  }

  async attemptStatus(input: { emailHash: string; now: Date }): Promise<AttemptStatus> {
    const row = this.attempts.get(input.emailHash);
    if (!row) return { locked: false, failed: 0, lockedUntil: null };
    if (row.lockedUntil && row.lockedUntil > input.now) {
      return { locked: true, failed: row.failed, lockedUntil: row.lockedUntil };
    }
    if (row.lockedUntil) return { locked: false, failed: 0, lockedUntil: null };
    return { locked: false, failed: row.failed, lockedUntil: null };
  }

  async attemptFailed(input: {
    emailHash: string;
    now: Date;
    maxFailures?: number;
    lockSeconds?: number;
  }): Promise<AttemptFailure> {
    const max = input.maxFailures ?? ATTEMPT_MAX_FAILURES;
    const lockSeconds = input.lockSeconds ?? ATTEMPT_LOCK_SECONDS;
    const row = this.attempts.get(input.emailHash) ?? { failed: 0, lockedUntil: null };
    if (row.lockedUntil && row.lockedUntil > input.now) {
      return {
        locked: true,
        justLocked: false,
        failed: row.failed,
        lockedUntil: row.lockedUntil,
      };
    }
    const failed = row.lockedUntil ? 1 : row.failed + 1;
    const lockedUntil =
      failed >= max ? new Date(input.now.getTime() + lockSeconds * 1000) : null;
    this.attempts.set(input.emailHash, { failed, lockedUntil });
    return {
      locked: lockedUntil !== null,
      justLocked: lockedUntil !== null,
      failed,
      lockedUntil,
    };
  }

  async attemptReset(input: { emailHash: string }): Promise<void> {
    this.attempts.delete(input.emailHash);
  }
}

export class MemoryDataStore implements DataStore {
  readonly name = "memory" as const;
  readonly ledger: MemoryLedger;
  readonly security: MemorySecurity = new MemorySecurity();
  private readonly users = new Map<string, { frozen: boolean }>();
  private readonly sheets = new Map<string, { userId: string }>();

  constructor() {
    this.ledger = new MemoryLedger({ users: this.users, sheets: this.sheets });
  }

  async ping(): Promise<void> {}

  // Test-support: what the SQL side gets from `auth.users`, `profiles` and `sheets`. The
  // repositories for projects, documents and sheets arrive with slices S-03 and S-04, which
  // will own these registries.

  addUser(userId: string, options: { frozen?: boolean } = {}): void {
    this.users.set(userId, { frozen: options.frozen ?? false });
  }

  setFrozen(userId: string, frozen: boolean): void {
    const user = this.users.get(userId);
    if (user) user.frozen = frozen;
  }

  addSheet(sheetId: string, userId: string): void {
    this.sheets.set(sheetId, { userId });
  }

  removeSheet(sheetId: string): void {
    this.sheets.delete(sheetId);
  }
}
