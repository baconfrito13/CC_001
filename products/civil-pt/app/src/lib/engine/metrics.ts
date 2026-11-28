import { dominantStyleShare } from "./grouping";
import { ElementKind, type ExtractedSheet, type GroupAssignment } from "./types";

/** The per-sheet metrics of the G-GEO gate (PRD §5.2, M1 to M4 and M6) in one place. */
export interface GateMetrics {
  /** M1: painted elements. */
  elements: number;
  /** M1: distinct styles actually used by at least one element. */
  styles: number;
  /** M2: share of the elements in the most common style (C2 passes at 0.5 or less). */
  topStyleShare: number;
  /** M3: how many groups cover 90 % of the elements (C3 passes at 30 or fewer). */
  groupsFor90: number;
  /** M4: share of the elements that are closed polygons (C4 passes at 0.1 or more). */
  closedShare: number;
  /** M6: image paint operations (a sheet with images and no elements is raster). */
  images: number;
}

export function gateMetrics(
  sheet: ExtractedSheet,
  assignment: GroupAssignment,
): GateMetrics {
  const table = sheet.elements;
  const used = new Set<number>();
  let closed = 0;
  for (let e = 0; e < table.count; e++) {
    used.add(table.style[e] as number);
    if (table.kind[e] === ElementKind.polygon) closed++;
  }
  const counts = assignment.groups.map((g) => g.count).sort((a, b) => b - a);
  const total = counts.reduce((sum, n) => sum + n, 0);
  let covered = 0;
  let groupsFor90 = 0;
  for (const n of counts) {
    if (covered >= 0.9 * total) break;
    covered += n;
    groupsFor90++;
  }
  return {
    elements: table.count,
    styles: used.size,
    topStyleShare: dominantStyleShare(table),
    groupsFor90,
    closedShare: table.count === 0 ? 0 : closed / table.count,
    images: sheet.stats.images,
  };
}
