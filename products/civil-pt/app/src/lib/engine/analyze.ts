import { type ExtractOptions, extractPage } from "./extract";
import { dominantStyleShare, type GroupingStrategy, styleStrategy } from "./grouping";
import { type GateMetrics, gateMetrics } from "./metrics";
import { openPdf } from "./pdf";
import type { ExtractedSheet, GroupAssignment } from "./types";

/** The share of elements in one style from which a sheet is refused (`LOW_DIVERSITY_SHARE`). */
export const DEFAULT_LOW_DIVERSITY_SHARE = 0.9;

/**
 * What the executor does with the sheet:
 * - `ready`: groups exist, the user can review them;
 * - `unsupported_raster`: no vector elements and at least one image (US-04 criterion 2);
 * - `no_geometry`: no vector elements and no images (a blank or text-only page);
 * - `low_diversity`: one style holds `lowDiversityShare` or more of the elements (criterion 6).
 * The last three release the reservation: the sheet costs nothing.
 */
export type SheetOutcome =
  | "ready"
  | "unsupported_raster"
  | "no_geometry"
  | "low_diversity";

export interface SheetAnalysis {
  outcome: SheetOutcome;
  /** Share of the elements in the most common style (0 when there are none): `dominant_share`. */
  dominantShare: number;
  sheet: ExtractedSheet;
  assignment: GroupAssignment;
  metrics: GateMetrics;
}

export interface AnalyzeOptions extends ExtractOptions {
  /** 1-based page of the PDF (a sheet is one page). */
  pageNo: number;
  /** Defaults to the style strategy (path A of ADR 0006). */
  strategy?: GroupingStrategy;
  /** Defaults to {@link DEFAULT_LOW_DIVERSITY_SHARE}. */
  lowDiversityShare?: number;
}

/** Groups an extracted sheet and decides its outcome. Pure: no PDF, no I/O. */
export function interpretSheet(
  sheet: ExtractedSheet,
  options: { strategy?: GroupingStrategy; lowDiversityShare?: number } = {},
): SheetAnalysis {
  const strategy = options.strategy ?? styleStrategy;
  const threshold = options.lowDiversityShare ?? DEFAULT_LOW_DIVERSITY_SHARE;
  const assignment = strategy.assign(sheet.elements, sheet.styles);
  const dominantShare = dominantStyleShare(sheet.elements);
  let outcome: SheetOutcome = "ready";
  if (sheet.elements.count === 0) {
    outcome = sheet.stats.images > 0 ? "unsupported_raster" : "no_geometry";
  } else if (strategy.id === "style" && dominantShare >= threshold) {
    // A hand-made selection is the user's own grouping: the style gate does not apply to it.
    outcome = "low_diversity";
  }
  return {
    outcome,
    dominantShare,
    sheet,
    assignment,
    metrics: gateMetrics(sheet, assignment),
  };
}

/** Opens the PDF, measures one page and groups the result. The one call the executor needs. */
export async function analyzeSheet(
  data: Uint8Array,
  options: AnalyzeOptions,
): Promise<SheetAnalysis> {
  const opened = await openPdf(data);
  try {
    const sheet = await extractPage(opened.document, options.pageNo, options);
    return interpretSheet(sheet, options);
  } finally {
    await opened.destroy();
  }
}
