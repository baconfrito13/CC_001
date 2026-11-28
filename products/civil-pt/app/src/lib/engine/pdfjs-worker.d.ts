/** pdfjs-dist ships types for `pdf.mjs` only; the worker module is imported for its handler. */
declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: unknown;
}
