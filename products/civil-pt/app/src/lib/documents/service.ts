import { errorCode, type Logger } from "@/lib/core/logger";
import type { DataStore, DocumentRecord } from "@/lib/data/types";
import type { Tracker } from "@/lib/events";
import { objectPath, projectPrefix } from "@/lib/storage/paths";
import {
  FINALIZE_WINDOW_SECONDS,
  type ObjectStorage,
  type UploadRejectReason,
} from "@/lib/storage/types";
import { inspectPdf } from "./inspect";

/**
 * Projects, uploads and sheets (US-02), independent of HTTP. A PDF never passes through the
 * application on its way in: `registerUpload` hands out a signed URL for the private bucket,
 * the browser sends the file there, and `finalizeUpload` then reads it from storage to check
 * it (SR-04), count its pages and create the sheets.
 *
 * Rejected, interrupted and stale uploads leave nothing behind: the object is removed and the
 * pending row deleted, so a failed upload never shows up as a half-made project.
 */

export interface DocumentsDeps {
  store: DataStore;
  storage: ObjectStorage;
  events: Tracker;
  log: Logger;
  now: () => Date;
  newId: () => string;
  limits: {
    maxPdfBytes: number;
    maxPages: number;
    uploadsPerHour: number;
    projectsPerHour: number;
  };
}

const HOUR = 3600;
const BYTES_PER_MB = 1024 * 1024;

/** The extension of a file name, lower case and safe to put in an event ("" when it has none). */
export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0 || dot === fileName.length - 1) return "";
  const extension = fileName.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,10}$/.test(extension) ? extension : "";
}

export type RateLimited = {
  ok: false;
  reason: "rate_limited";
  retryAfterSeconds: number;
};
export type NotFound = { ok: false; reason: "not_found" };

export function createDocumentsService(deps: DocumentsDeps) {
  const { store, storage, events, log, limits } = deps;

  async function allowed(key: string, limit: number): Promise<number | null> {
    const now = deps.now();
    const hit = await store.security.rateLimitHit({
      key,
      limit,
      windowSeconds: HOUR,
      now,
    });
    if (hit.allowed) return null;
    return Math.max(1, Math.ceil((hit.resetAt.getTime() - now.getTime()) / 1000));
  }

  /** Remove the object of a document that will not become a sheet set. Never throws. */
  async function discardObject(path: string) {
    try {
      await storage.remove({ bucket: "uploads", paths: [path] });
    } catch (error) {
      log.error("upload_object_removal_failed", { error_code: errorCode(error) });
    }
  }

  /** Abandon the pending row and its object; one `upload_rejected` event with `reason`. */
  async function reject(
    userId: string,
    document: Pick<DocumentRecord, "id" | "fileName">,
    reason: UploadRejectReason,
  ) {
    const abandoned = await store.workspace.abandonDocument({
      userId,
      documentId: document.id,
    });
    if (abandoned.ok) await discardObject(abandoned.storagePath);
    events.track("upload_rejected", {
      reason,
      extension: extensionOf(document.fileName),
    });
  }

  return {
    async createProject(input: { userId: string; name: string }) {
      const retry = await allowed(`project:${input.userId}`, limits.projectsPerHour);
      if (retry !== null)
        return { ok: false, reason: "rate_limited", retryAfterSeconds: retry } as const;
      const project = await store.workspace.createProject({
        userId: input.userId,
        name: input.name,
        now: deps.now(),
      });
      const total = (await store.workspace.listProjects({ userId: input.userId })).length;
      events.track("project_created", { projects_total: total });
      return { ok: true, project } as const;
    },

    /** Files first, rows second: if storage fails the project is still there to retry (5.4). */
    async deleteProject(input: { userId: string; projectId: string }) {
      const project = await store.workspace.getProject(input);
      if (!project) return { ok: false, reason: "not_found" } as const;
      const prefix = projectPrefix(input.userId, input.projectId);
      await storage.removePrefix({ bucket: "uploads", prefix });
      await storage.removePrefix({ bucket: "geometry", prefix });
      await store.workspace.deleteProject(input);
      events.track("project_deleted", {});
      return { ok: true } as const;
    },

    /**
     * Step 1 of an upload: check the name and size the browser announces and hand out the
     * signed URL. The size is checked again, on the real object, in `finalizeUpload`.
     */
    async registerUpload(input: {
      userId: string;
      projectId: string;
      fileName: string;
      sizeBytes: number;
    }) {
      const retry = await allowed(`upload:${input.userId}`, limits.uploadsPerHour);
      if (retry !== null)
        return { ok: false, reason: "rate_limited", retryAfterSeconds: retry } as const;

      const extension = extensionOf(input.fileName);
      const refused =
        extension !== "pdf"
          ? "type"
          : input.sizeBytes > limits.maxPdfBytes
            ? "size"
            : null;
      if (refused) {
        events.track("upload_rejected", { reason: refused, extension });
        return { ok: false, reason: "rejected", rejection: refused } as const;
      }

      const now = deps.now();
      const documentId = deps.newId();
      const storagePath = objectPath({
        userId: input.userId,
        projectId: input.projectId,
        objectId: documentId,
        kind: "pdf",
      });
      const registered = await store.workspace.registerDocument({
        userId: input.userId,
        projectId: input.projectId,
        documentId,
        storagePath,
        fileName: input.fileName,
        sizeBytes: input.sizeBytes,
        now,
      });
      if (!registered.ok) return { ok: false, reason: "not_found" } as const;

      const signed = await storage.createSignedUploadUrl({
        bucket: "uploads",
        path: storagePath,
        now,
      });
      return {
        ok: true,
        documentId,
        uploadUrl: signed.url,
        finalizeBy: new Date(now.getTime() + FINALIZE_WINDOW_SECONDS * 1000),
      } as const;
    },

    /**
     * Step 2: the file is in storage. Read it, check it and create the sheets. Idempotent: a
     * second call for a finished document returns the same sheets.
     */
    async finalizeUpload(input: { userId: string; documentId: string }) {
      const retry = await allowed(`finalize:${input.userId}`, limits.uploadsPerHour);
      if (retry !== null)
        return { ok: false, reason: "rate_limited", retryAfterSeconds: retry } as const;

      const document = await store.workspace.getDocument(input);
      if (!document) return { ok: false, reason: "not_found" } as const;
      if (document.status === "ready") return { ok: true, document } as const;

      const now = deps.now();
      // SR-11: Supabase upload URLs last 2 hours and cannot be shortened, so the application
      // enforces the 10 minutes itself.
      const late =
        now.getTime() - document.createdAt.getTime() > FINALIZE_WINDOW_SECONDS * 1000;
      if (late) {
        await reject(input.userId, document, "interrupted");
        return { ok: false, reason: "rejected", rejection: "interrupted" } as const;
      }

      const bytes = await storage.get({ bucket: "uploads", path: document.storagePath });
      if (!bytes) {
        await reject(input.userId, document, "interrupted");
        return { ok: false, reason: "rejected", rejection: "interrupted" } as const;
      }
      if (bytes.byteLength > limits.maxPdfBytes) {
        await reject(input.userId, document, "size");
        return { ok: false, reason: "rejected", rejection: "size" } as const;
      }

      const inspected = await inspectPdf(bytes, { maxPages: limits.maxPages });
      if (!inspected.ok) {
        await reject(input.userId, document, inspected.reason);
        return { ok: false, reason: "rejected", rejection: inspected.reason } as const;
      }

      const result = await store.workspace.finalizeDocument({
        userId: input.userId,
        documentId: input.documentId,
        pageCount: inspected.pageCount,
        sheets: inspected.sheets,
        now,
      });
      if (!result.ok) return { ok: false, reason: "not_found" } as const;
      if (!result.already) {
        events.track("sheet_uploaded", {
          pages: inspected.pageCount,
          size_mb: Math.round((bytes.byteLength / BYTES_PER_MB) * 10) / 10,
        });
      }
      return { ok: true, document: result.document } as const;
    },

    /** The browser lost the upload (US-02 criterion 4): drop the partial object right away. */
    async abortUpload(input: { userId: string; documentId: string }) {
      const document = await store.workspace.getDocument(input);
      if (!document || document.status !== "pending_upload") return { ok: true } as const;
      await reject(input.userId, document, "interrupted");
      return { ok: true } as const;
    },

    /**
     * Uploads of one project that were never finalized and are older than the 10 minute window
     * can only be dead ones: remove them and tell the caller how many there were, so the page
     * can say "the upload was interrupted" once.
     */
    async reapInterrupted(input: { userId: string; projectId: string }): Promise<number> {
      const documents = await store.workspace.listDocuments(input);
      const limit = deps.now().getTime() - FINALIZE_WINDOW_SECONDS * 1000;
      let reaped = 0;
      for (const document of documents) {
        if (
          document.status === "pending_upload" &&
          document.createdAt.getTime() <= limit
        ) {
          await reject(input.userId, document, "interrupted");
          reaped += 1;
        }
      }
      return reaped;
    },

    /** Maintenance for every account (the cron): dead pending uploads, up to `limit`. */
    async reapAllStale(input: { limit: number }): Promise<number> {
      const before = new Date(deps.now().getTime() - FINALIZE_WINDOW_SECONDS * 1000);
      const stale = await store.workspace.listStalePendingDocuments({
        before,
        limit: input.limit,
      });
      let reaped = 0;
      for (const entry of stale) {
        const abandoned = await store.workspace.abandonDocument({
          userId: entry.userId,
          documentId: entry.id,
        });
        if (abandoned.ok) {
          await discardObject(abandoned.storagePath);
          events.track("upload_rejected", { reason: "interrupted", extension: "pdf" });
          reaped += 1;
        }
      }
      return reaped;
    },

    /** A signed download URL (10 minutes at most) for the pdf.js viewer and the thumbnails. */
    async downloadUrl(input: { userId: string; documentId: string }) {
      const retry = await allowed(`download:${input.userId}`, 120);
      if (retry !== null)
        return { ok: false, reason: "rate_limited", retryAfterSeconds: retry } as const;
      const document = await store.workspace.getDocument(input);
      if (!document || document.status !== "ready")
        return { ok: false, reason: "not_found" } as const;
      const signed = await storage.createSignedDownloadUrl({
        bucket: "uploads",
        path: document.storagePath,
        expiresInSeconds: 600,
        now: deps.now(),
      });
      return { ok: true, url: signed.url, expiresAt: signed.expiresAt } as const;
    },

    /** US-03: set the scale of a sheet (confirming the detected one, or choosing another). */
    async setScale(input: { userId: string; sheetId: string; ratio: number }) {
      const retry = await allowed(`scale:${input.userId}`, 60);
      if (retry !== null)
        return { ok: false, reason: "rate_limited", retryAfterSeconds: retry } as const;
      const result = await store.workspace.setSheetScale({ ...input, now: deps.now() });
      if (!result.ok) return { ok: false, reason: "not_found" } as const;
      events.track("scale_set", {
        source: result.sheet.scaleSource ?? "manual",
        ratio: input.ratio,
      });
      return { ok: true, sheet: result.sheet } as const;
    },
  };
}

export type DocumentsService = ReturnType<typeof createDocumentsService>;
