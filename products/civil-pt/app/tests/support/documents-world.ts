import { randomUUID } from "node:crypto";
import { createLogger } from "@/lib/core/logger";
import { MemoryDataStore } from "@/lib/data/memory";
import { createDocumentsService, type DocumentsDeps } from "@/lib/documents/service";
import { createTracker, MemoryEventSink } from "@/lib/events";
import { MemoryObjectStorage } from "@/lib/storage/memory";
import { Content, MM, PdfBuilder } from "../../fixtures/pdf-builder";

export const T0 = new Date("2026-03-01T10:00:00.000Z");
export const MINUTE = 60_000;

const A3 = { width: 420 * MM, height: 297 * MM };

/** A PDF of `texts.length` pages; each page carries its text (null: none). */
export function sheetSet(texts: (string | null)[], padding = 0): Uint8Array {
  const builder = new PdfBuilder();
  const font = builder.addFont();
  if (padding > 0) builder.addPadding(padding);
  for (const text of texts) {
    const content = new Content()
      .strokeGray(0)
      .lineWidth(0.5)
      .rect(20, 20, 200, 100)
      .stroke();
    if (text !== null) content.text(30, 40, 10, text);
    builder.addPage(A3, content, { fonts: { F1: font } });
  }
  return builder.build();
}

/** The upload and download flow with the memory adapters and a clock the test moves. */
export function documentsWorld(
  overrides: Partial<DocumentsDeps["limits"]> = {},
  start: Date = T0,
) {
  let clock = start;
  const store = new MemoryDataStore();
  const storage = new MemoryObjectStorage("test-storage-secret-0123456789");
  const events = new MemoryEventSink();
  const service = createDocumentsService({
    store,
    storage,
    events: createTracker([events], { now: () => clock }),
    log: createLogger(() => {}),
    now: () => clock,
    newId: () => randomUUID(),
    limits: {
      maxPdfBytes: 50 * 1024 * 1024,
      maxPages: 40,
      uploadsPerHour: 30,
      projectsPerHour: 60,
      ...overrides,
    },
  });

  const newUser = (email = `${randomUUID()}@empresa-exemplo.pt`) => {
    const id = randomUUID();
    store.addUser(id, { email });
    return id;
  };

  /** Register an upload and put the bytes where the signed URL points (what the browser does). */
  const upload = async (
    userId: string,
    projectId: string,
    file: { fileName: string; bytes: Uint8Array },
  ) => {
    const registered = await service.registerUpload({
      userId,
      projectId,
      fileName: file.fileName,
      sizeBytes: file.bytes.byteLength,
    });
    if (!registered.ok) return { registered };
    const path = new URL(registered.uploadUrl, "http://x").pathname.replace(
      "/api/dev/storage/uploads/",
      "",
    );
    await storage.put({
      bucket: "uploads",
      path,
      body: file.bytes,
      contentType: "application/pdf",
    });
    return { registered, path };
  };

  return {
    store,
    storage,
    events,
    service,
    newUser,
    upload,
    get now() {
      return clock;
    },
    advance(ms: number) {
      clock = new Date(clock.getTime() + ms);
    },
  };
}

export type DocumentsWorld = ReturnType<typeof documentsWorld>;
