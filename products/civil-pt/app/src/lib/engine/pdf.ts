import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { EngineError } from "./errors";

/**
 * pdf.js runs its "worker" on the main thread in Node and looks the module up with a dynamic
 * `import(workerSrc)`, which neither a bundler nor Vercel's file tracing can follow (the first
 * production probe failed with "Setting up fake worker failed"). It first looks at
 * `globalThis.pdfjsWorker`, so importing the worker statically and handing it over makes the
 * dependency visible to the tracer and removes the run-time path lookup.
 */
Object.assign(globalThis, { pdfjsWorker });

/**
 * The only version of pdfjs-dist this engine is tested against (ADR 0005, rule 1). `package.json`
 * pins it exactly and `tests/engine/contract.test.ts` fails when the installed version, the
 * operator-list format or the path operation codes drift.
 */
export const PDFJS_VERSION = "6.5.438";

export type PdfDocument = Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>;

/**
 * Options for every document the product opens (SR-05: the PDF is untrusted input).
 *
 * pdfjs-dist 6 has no `isEvalSupported` option any more (the font code that used `eval` was
 * removed); the contract test scans the installed build for `eval(` and `new Function(` so a
 * future version that brings one back is caught. Nothing here asks for network, fonts or canvas.
 */
export const DOCUMENT_OPTIONS = {
  /** Never read fonts from the host: the engine measures geometry, it does not draw text. */
  useSystemFonts: false,
  disableFontFace: true,
  /** XFA forms run scripts in a sandbox the engine never needs. */
  enableXfa: false,
  /** Keep going on damaged streams: CAD exporters produce slightly off PDFs. */
  stopAtErrors: false,
  /** No fetching of cmaps, fonts or wasm from disk or the network. */
  useWorkerFetch: false,
  /** Errors only: pdf.js warnings would end up in the server logs with document internals. */
  verbosity: pdfjs.VerbosityLevel.ERRORS,
  /** Inline images above this many pixels are dropped before decoding. */
  maxImageSize: 100_000_000,
} as const;

export interface OpenedPdf {
  document: PdfDocument;
  numPages: number;
  destroy(): Promise<void>;
}

export function mapOpenError(error: unknown): EngineError {
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") {
    return new EngineError("encrypted", "The PDF is password protected", {
      cause: error,
    });
  }
  return new EngineError("invalid_pdf", "The file is not a readable PDF", {
    cause: error,
  });
}

/**
 * Opens a PDF held in memory. The bytes are copied first: pdf.js may take ownership of the
 * buffer it is given, and the caller keeps using theirs (for example to open it again).
 */
export async function openPdf(data: Uint8Array): Promise<OpenedPdf> {
  const task = pdfjs.getDocument({ ...DOCUMENT_OPTIONS, data: data.slice() });
  try {
    const document = await task.promise;
    return {
      document,
      numPages: document.numPages,
      destroy: () => task.destroy(),
    };
  } catch (error) {
    await task.destroy().catch(() => undefined);
    throw mapOpenError(error);
  }
}

export { pdfjs };
