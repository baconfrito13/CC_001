/**
 * Every failure the measurement engine can report. The executor (S-04) maps each code to the
 * localized message, the `sheet_*` analytics event and the ledger action (release the
 * reservation); the engine itself never talks to users, storage or the database.
 */
export const ENGINE_ERROR_CODES = [
  /** The bytes are not a readable PDF (also: damaged cross-reference table). */
  "invalid_pdf",
  /** The PDF is password protected. */
  "encrypted",
  /** The requested page does not exist. */
  "page_out_of_range",
  /** The scale ratio is outside 1:1 to 1:10000. */
  "invalid_scale",
  /** The sheet has more painted elements than `PROCESSING_MAX_ELEMENTS`. */
  "too_many_elements",
  /** The sheet has more path vertices than the memory budget allows. */
  "too_many_vertices",
  /** The wall-clock budget of the extraction ran out. */
  "timeout",
  /** A selection names an element that does not exist, or one element twice. */
  "invalid_selection",
  /** A geometry package is damaged or inconsistent. */
  "invalid_package",
  /** A geometry package was written by a newer format version. */
  "unsupported_package_version",
  /** pdfjs-dist returned data that this version of the engine does not understand. */
  "unsupported_pdfjs_data",
] as const;

export type EngineErrorCode = (typeof ENGINE_ERROR_CODES)[number];

export class EngineError extends Error {
  readonly code: EngineErrorCode;

  constructor(code: EngineErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "EngineError";
    this.code = code;
  }
}
