/**
 * The measurement engine (S-02): pure functions from PDF bytes to measured, grouped geometry.
 * No database, storage, network or framework code lives here, so the executor (S-04), the
 * viewer (S-05, package decoding only) and the G-GEO scripts share one implementation.
 */
export {
  type AnalyzeOptions,
  analyzeSheet,
  DEFAULT_LOW_DIVERSITY_SHARE,
  interpretSheet,
  type SheetAnalysis,
  type SheetOutcome,
} from "./analyze";
export { ENGINE_ERROR_CODES, EngineError, type EngineErrorCode } from "./errors";
export {
  DEFAULT_CLOSE_TOLERANCE_M,
  DEFAULT_CURVE_TOLERANCE_M,
  DEFAULT_MAX_ELEMENTS,
  DEFAULT_MAX_VERTICES,
  type ExtractOptions,
  extractPage,
} from "./extract";
export {
  dominantShare,
  dominantStyleShare,
  type GroupingStrategy,
  type Selection,
  selectionStrategy,
  styleStrategy,
} from "./grouping";
export { type GateMetrics, gateMetrics } from "./metrics";
export {
  decodeGeometryPackage,
  encodeGeometryPackage,
  type GeometryPackage,
  gunzipPackage,
  gzipPackage,
  PACKAGE_VERSION,
} from "./package";
export { type OpenedPdf, openPdf, PDFJS_VERSION, type PdfDocument } from "./pdf";
export {
  MAX_SCALE_RATIO,
  MIN_SCALE_RATIO,
  metersPerPoint,
  parseScaleRatio,
} from "./scale";
export * from "./types";
