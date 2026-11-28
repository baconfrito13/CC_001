/** Shared types of the measurement engine. Pure data: no I/O, no framework imports. */

/** Element kind codes as stored in the geometry package (`elementKind`, one byte each). */
export const ElementKind = { polyline: 0, polygon: 1 } as const;
export type ElementKindCode = (typeof ElementKind)[keyof typeof ElementKind];

/** `groupOf` value of an element that no group claimed (selection strategy only). */
export const NO_GROUP = 0xffffffff;

/** The visible style of a painted element, as the user sees it on the sheet. */
export interface StyleDescriptor {
  /** `#rrggbb` stroke colour, a pattern/shading label, or null when the path is not stroked. */
  stroke: string | null;
  /** Same for the fill. */
  fill: string | null;
  /** Stroke width in page points, after the CTM (null-stroke styles carry 0). */
  widthPt: number;
  /** Dash array in page points after the CTM; empty for a solid line. */
  dash: readonly number[];
  dashPhase: number;
}

/**
 * Painted elements in columns, so 500 000 of them cost a handful of typed arrays instead of
 * half a million objects. An element is one polyline, one polygon, or one polygon with holes.
 */
export interface ElementTable {
  count: number;
  /** {@link ElementKind} per element. */
  kind: Uint8Array;
  /** Index into `ExtractedSheet.styles`. */
  style: Uint32Array;
  /** Net area in m² (outer ring minus holes); 0 for polylines. */
  area: Float64Array;
  /** Polyline length, or the polygon perimeter including the hole boundaries, in metres. */
  length: Float64Array;
  /** `count + 1` offsets into the rings; element i owns rings `ringStart[i] .. ringStart[i+1]`, outer ring first. */
  ringStart: Uint32Array;
  /** `ringCount + 1` offsets into the vertices; ring r owns vertices `vertexStart[r] .. vertexStart[r+1]`. */
  vertexStart: Uint32Array;
  /** Flat x, y of every vertex in page points, relative to the page origin (see `PageInfo.view`). */
  coords: Float32Array;
}

export interface PageInfo {
  /** 1-based page number inside the PDF. */
  pageNo: number;
  /** Size of the visible box (`view`) in page points, before `/Rotate`. */
  widthPt: number;
  heightPt: number;
  /** pdf.js `page.view`: `[x0, y0, x1, y1]` in user space. Stored coordinates are minus (x0, y0). */
  view: [number, number, number, number];
  rotate: number;
  userUnit: number;
}

export interface ExtractStats {
  /** Operators in the pdf.js operator list. */
  operators: number;
  /** Painted paths seen (before splitting into elements). */
  paths: number;
  elements: number;
  polygons: number;
  polylines: number;
  /** Hole rings subtracted from polygons. */
  holes: number;
  vertices: number;
  /** Image paint operations (raster content). */
  images: number;
  /** Sum of the image areas over the page area (may exceed 1; informs T4, never changes the outcome). */
  imageAreaShare: number;
  /** `W n` clip operators: geometry is measured whole, not clipped (see docs/05-build.md §9). */
  clipOperations: number;
  /** Painted paths skipped because they sit in a hidden optional-content layer. */
  hiddenPaths: number;
  /** Subpaths with fewer than two distinct points or no area. */
  degenerateSubpaths: number;
  /** Painted paths whose rings were too many for the hole analysis. */
  nestingSkippedPaths: number;
  durationMs: number;
}

export interface ExtractedSheet {
  page: PageInfo;
  scale: { ratio: number; metersPerPoint: number };
  styles: StyleDescriptor[];
  elements: ElementTable;
  stats: ExtractStats;
}

export type GroupKind = "polygon" | "polyline" | "mixed";
export type GroupingStrategyId = "style" | "selection";

export interface GroupInfo {
  /** Index of the group; equals its position in `GroupAssignment.groups`. */
  id: number;
  kind: GroupKind;
  /** Style shared by the elements (style strategy); null for a hand-made selection. */
  styleId: number | null;
  label: string | null;
  count: number;
  /** Sum of the element areas, m². */
  areaM2: number;
  /** Sum of the element lengths (polyline length, polygon perimeter), m. */
  lengthM: number;
  /** `[minX, minY, maxX, maxY]` in table coordinates; null for an empty group. */
  bbox: [number, number, number, number] | null;
}

/** The element to group map every strategy fills; the package stores exactly this. */
export interface GroupAssignment {
  strategy: GroupingStrategyId;
  /** Group index per element, or {@link NO_GROUP}. */
  groupOf: Uint32Array;
  groups: GroupInfo[];
}
