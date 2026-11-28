import "server-only";
import { randomUUID } from "node:crypto";
import { logger } from "@/lib/core/logger";
import { getDataStore } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { getEvents } from "@/lib/events";
import { getObjectStorage } from "@/lib/storage";
import { createDocumentsService, type DocumentsService } from "./service";

const BYTES_PER_MB = 1024 * 1024;
const PROJECTS_PER_HOUR = 60;

/** The documents service wired to the process-wide adapters and the validated limits. */
export async function getDocumentsService(): Promise<DocumentsService> {
  const env = getEnv();
  return createDocumentsService({
    store: await getDataStore(),
    storage: await getObjectStorage(),
    events: getEvents().tracker,
    log: logger,
    now: () => new Date(),
    newId: randomUUID,
    limits: {
      maxPdfBytes: env.MAX_PDF_MB * BYTES_PER_MB,
      maxPages: env.MAX_PDF_PAGES,
      uploadsPerHour: env.UPLOADS_PER_HOUR,
      projectsPerHour: PROJECTS_PER_HOUR,
    },
  });
}
