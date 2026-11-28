import { ElementTableBuilder } from "@/lib/engine/table";
import {
  ElementKind,
  type ElementKindCode,
  type ExtractedSheet,
  type ExtractStats,
  type StyleDescriptor,
} from "@/lib/engine/types";

export const EMPTY_STATS: ExtractStats = {
  operators: 0,
  paths: 0,
  elements: 0,
  polygons: 0,
  polylines: 0,
  holes: 0,
  vertices: 0,
  images: 0,
  imageAreaShare: 0,
  clipOperations: 0,
  hiddenPaths: 0,
  degenerateSubpaths: 0,
  nestingSkippedPaths: 0,
  durationMs: 0,
};

export function style(
  stroke: string | null,
  fill: string | null = null,
  widthPt = 1,
): StyleDescriptor {
  return { stroke, fill, widthPt, dash: [], dashPhase: 0 };
}

export interface TestElement {
  kind: ElementKindCode;
  style: number;
  area?: number;
  length?: number;
  /** Flat x, y pairs of the outer ring (and optionally hole rings). */
  rings: number[][];
}

/** A square polygon element with a known area, in table coordinates. */
export function square(x: number, y: number, side: number, styleId: number): TestElement {
  return {
    kind: ElementKind.polygon,
    style: styleId,
    area: side * side,
    length: side * 4,
    rings: [[x, y, x + side, y, x + side, y + side, x, y + side]],
  };
}

/** An open two-point line element. */
export function line(
  x: number,
  y: number,
  dx: number,
  dy: number,
  styleId: number,
): TestElement {
  return {
    kind: ElementKind.polyline,
    style: styleId,
    area: 0,
    length: Math.hypot(dx, dy),
    rings: [[x, y, x + dx, y + dy]],
  };
}

export function sheetFrom(
  elements: readonly TestElement[],
  styles: readonly StyleDescriptor[],
  origin: readonly [number, number] = [0, 0],
): ExtractedSheet {
  const builder = new ElementTableBuilder(origin);
  for (const e of elements) {
    builder.add({
      kind: e.kind,
      style: e.style,
      area: e.area ?? 0,
      length: e.length ?? 0,
      rings: e.rings,
    });
  }
  const table = builder.finish();
  return {
    page: {
      pageNo: 1,
      widthPt: 1190.55,
      heightPt: 1683.78,
      view: [origin[0], origin[1], origin[0] + 1190.55, origin[1] + 1683.78],
      rotate: 0,
      userUnit: 1,
    },
    scale: { ratio: 100, metersPerPoint: (25.4 / 72 / 1000) * 100 },
    styles: [...styles],
    elements: table,
    stats: { ...EMPTY_STATS, elements: table.count },
  };
}

import type { SheetAnalysis } from "@/lib/engine/analyze";

export interface ElementView {
  kind: "polygon" | "polyline";
  stroke: string | null;
  fill: string | null;
  area: number;
  length: number;
  rings: number;
}

/** The elements of an analysis as plain objects, in drawing order (small sheets only). */
export function elementsOf(analysis: Pick<SheetAnalysis, "sheet">): ElementView[] {
  const { elements: t, styles } = analysis.sheet;
  return Array.from({ length: t.count }, (_, e) => {
    const s = styles[t.style[e] as number];
    return {
      kind: t.kind[e] === ElementKind.polygon ? "polygon" : "polyline",
      stroke: s?.stroke ?? null,
      fill: s?.fill ?? null,
      area: t.area[e] as number,
      length: t.length[e] as number,
      rings: (t.ringStart[e + 1] as number) - (t.ringStart[e] as number),
    };
  });
}

/** A fixed clock: the package then holds no run-dependent timing (reprocessing is byte-identical). */
export const FIXED_CLOCK = (): number => 0;
