import { EngineError } from "./errors";
import { compose, IDENTITY, type Matrix, scaleFactor } from "./matrix";
import { decodePath, type Subpath } from "./path";
import { type PdfDocument, pdfjs } from "./pdf";
import { buildRegions, type FillRule, makeRing, type Ring, ringLength } from "./regions";
import { metersPerPoint, parseScaleRatio } from "./scale";
import { colourFromArgs, dashFromArgs, NO_COLOUR, StyleTable } from "./style";
import { ElementTableBuilder } from "./table";
import { ElementKind, type ExtractedSheet, type ExtractStats } from "./types";

export const DEFAULT_MAX_ELEMENTS = 500_000;
export const DEFAULT_MAX_VERTICES = 20_000_000;
/** Maximum distance between a Bézier and its sampled polyline, in real-world metres (1 mm). */
export const DEFAULT_CURVE_TOLERANCE_M = 0.001;
/** Endpoints this close (real-world metres) close a polygon: the PRD's tolerance for metric M4. */
export const DEFAULT_CLOSE_TOLERANCE_M = 0.05;

export interface ExtractOptions {
  /** The N of the sheet's 1:N scale. */
  scaleRatio: number;
  maxElements?: number;
  maxVertices?: number;
  curveToleranceM?: number;
  closeToleranceM?: number;
  /** Wall-clock budget in milliseconds for the whole extraction, parsing included. */
  deadlineMs?: number;
  /** Clock in milliseconds; injectable so tests do not depend on real time. */
  now?: () => number;
}

interface PaintMode {
  stroke: boolean;
  fill: boolean;
  rule: FillRule;
}

const { OPS } = pdfjs;

const PAINT_MODES = new Map<number, PaintMode>([
  [OPS.stroke, { stroke: true, fill: false, rule: "nonzero" }],
  [OPS.closeStroke, { stroke: true, fill: false, rule: "nonzero" }],
  [OPS.fill, { stroke: false, fill: true, rule: "nonzero" }],
  [OPS.eoFill, { stroke: false, fill: true, rule: "evenodd" }],
  [OPS.fillStroke, { stroke: true, fill: true, rule: "nonzero" }],
  [OPS.eoFillStroke, { stroke: true, fill: true, rule: "evenodd" }],
  [OPS.closeFillStroke, { stroke: true, fill: true, rule: "nonzero" }],
  [OPS.closeEOFillStroke, { stroke: true, fill: true, rule: "evenodd" }],
]);

const IMAGE_OPS = new Set<number>([
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintImageMaskXObject,
  OPS.paintImageXObjectRepeat,
  OPS.paintImageMaskXObjectRepeat,
  OPS.paintImageMaskXObjectGroup,
  OPS.paintInlineImageXObjectGroup,
]);

/** Consecutive points closer than this (in page points) are one point. */
const DUPLICATE_EPS = 1e-6;
/** Rings and polylines under this area/length in page units are noise. */
const MIN_AREA_PT2 = 1e-9;

interface GState {
  ctm: Matrix;
  stroke: string;
  fill: string;
  lineWidth: number;
  dash: number[];
  dashPhase: number;
}

function isMatrix(value: unknown): value is ArrayLike<number> {
  return (
    value !== null &&
    typeof value === "object" &&
    (Array.isArray(value) || ArrayBuffer.isView(value)) &&
    (value as ArrayLike<number>).length === 6
  );
}

function toMatrix(value: ArrayLike<number>): Matrix {
  return [
    value[0] as number,
    value[1] as number,
    value[2] as number,
    value[3] as number,
    value[4] as number,
    value[5] as number,
  ];
}

function dropDuplicates(pts: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] as number;
    const y = pts[i + 1] as number;
    const n = out.length;
    if (
      n >= 2 &&
      Math.abs(x - (out[n - 2] as number)) < DUPLICATE_EPS &&
      Math.abs(y - (out[n - 1] as number)) < DUPLICATE_EPS
    ) {
      continue;
    }
    out.push(x, y);
  }
  return out;
}

/**
 * Walks the pdf.js operator list of one page and measures every painted path.
 *
 * What is measured: every stroked or filled path, in page space, in real-world metres. An
 * element is a polyline (open), a polygon (closed: explicit close, a fill, or endpoints within
 * `closeToleranceM`), or a polygon with holes (fill rules decide which subpaths are holes).
 * What is not: clipping (counted, not applied), text, images (counted: raster detection),
 * shadings and patterns beyond their label, transparency, and optional-content layers that are
 * hidden by default (skipped and counted).
 */
export async function extractPage(
  document: PdfDocument,
  pageNo: number,
  options: ExtractOptions,
): Promise<ExtractedSheet> {
  const now = options.now ?? (() => performance.now());
  const startedAt = now();
  const deadline =
    options.deadlineMs === undefined ? undefined : startedAt + options.deadlineMs;
  const checkDeadline = (): void => {
    if (deadline !== undefined && now() > deadline) {
      throw new EngineError("timeout", "Extraction exceeded its time budget");
    }
  };

  const ratio = parseScaleRatio(options.scaleRatio);
  if (!Number.isInteger(pageNo) || pageNo < 1 || pageNo > document.numPages) {
    throw new EngineError("page_out_of_range", `Page ${pageNo} does not exist`);
  }
  const maxElements = options.maxElements ?? DEFAULT_MAX_ELEMENTS;
  const maxVertices = options.maxVertices ?? DEFAULT_MAX_VERTICES;

  try {
    const page = await document.getPage(pageNo);
    const view = page.view;
    const [x0, y0, x1, y1] = [
      view[0] as number,
      view[1] as number,
      view[2] as number,
      view[3] as number,
    ];
    const widthPt = x1 - x0;
    const heightPt = y1 - y0;
    const userUnit =
      Number.isFinite(page.userUnit) && page.userUnit > 0 ? page.userUnit : 1;
    const mpp = metersPerPoint(ratio, userUnit);
    const areaScale = mpp * mpp;
    const curveTolPt = (options.curveToleranceM ?? DEFAULT_CURVE_TOLERANCE_M) / mpp;
    const closeTolPt = Math.max(
      (options.closeToleranceM ?? DEFAULT_CLOSE_TOLERANCE_M) / mpp,
      1e-6,
    );
    const touchEps = closeTolPt / 10;

    const config = await document.getOptionalContentConfig({ intent: "display" });
    const list = await page.getOperatorList({
      intent: "display",
      annotationMode: pdfjs.AnnotationMode.DISABLE,
    });
    checkDeadline();

    const styles = new StyleTable();
    const builder = new ElementTableBuilder([x0, y0]);
    const stats: ExtractStats = {
      operators: list.fnArray.length,
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
    const pageArea = widthPt * heightPt;

    let state: GState = {
      ctm: IDENTITY,
      stroke: "#000000",
      fill: "#000000",
      lineWidth: 1,
      dash: [],
      dashPhase: 0,
    };
    const stack: GState[] = [];
    const markedContent: boolean[] = [];
    let hiddenDepth = 0;

    const addElement = (
      kind: 0 | 1,
      style: number,
      areaPt2: number,
      lengthPt: number,
      rings: ReadonlyArray<ArrayLike<number>>,
    ): void => {
      builder.add({
        kind,
        style,
        area: areaPt2 * areaScale,
        length: lengthPt * mpp,
        rings,
      });
      if (kind === ElementKind.polygon) stats.polygons++;
      else stats.polylines++;
      if (builder.count > maxElements) {
        throw new EngineError(
          "too_many_elements",
          `The sheet has more than ${maxElements} elements`,
        );
      }
    };

    /**
     * Normalises a subpath: drops repeated points and decides whether it is closed. A subpath
     * that was closed explicitly (or is being filled) only loses a last point that repeats the
     * first; the 5 cm tolerance applies to open subpaths alone, so a small closed shape (a 4 cm
     * bolt head) keeps all its vertices.
     */
    const normalise = (
      sub: Subpath,
      forceClose: boolean,
    ): { pts: number[]; closed: boolean } | null => {
      let pts = dropDuplicates(sub.pts);
      if (pts.length < 4) return null;
      let closed = sub.closed || forceClose;
      const n = pts.length / 2;
      const gap = Math.hypot(
        (pts[0] as number) - (pts[2 * n - 2] as number),
        (pts[1] as number) - (pts[2 * n - 1] as number),
      );
      if (n >= 3 && gap <= (closed ? DUPLICATE_EPS : closeTolPt)) {
        closed = true;
        pts = pts.slice(0, 2 * n - 2);
      }
      return { pts, closed };
    };

    const handlePath = (mode: PaintMode, data: ArrayLike<number> | null): void => {
      stats.paths++;
      if (hiddenDepth > 0) {
        stats.hiddenPaths++;
        return;
      }
      const subpaths = decodePath(
        data,
        state.ctm,
        curveTolPt,
        maxVertices - builder.vertexCount,
      );
      if (subpaths.length === 0) return;
      const ctmScale = scaleFactor(state.ctm);
      const strokeColour = mode.stroke ? state.stroke : null;
      const fillColour = mode.fill ? state.fill : null;
      const widthPt = state.lineWidth * ctmScale;
      const dash = state.dash.map((d) => d * ctmScale);
      const dashPhase = state.dashPhase * ctmScale;
      const fullStyle = styles.intern(strokeColour, fillColour, widthPt, dash, dashPhase);
      const strokeOnlyStyle =
        mode.fill && mode.stroke
          ? styles.intern(strokeColour, null, widthPt, dash, dashPhase)
          : fullStyle;

      const polylineOf = (pts: number[], style: number): void => {
        const len = ringLength(pts, false);
        if (len <= 0) {
          stats.degenerateSubpaths++;
          return;
        }
        addElement(ElementKind.polyline, style, 0, len, [pts]);
      };

      if (mode.fill) {
        const rings: Ring[] = [];
        for (const sub of subpaths) {
          const norm = normalise(sub, true);
          if (norm === null) {
            stats.degenerateSubpaths++;
            continue;
          }
          if (norm.pts.length >= 6) {
            rings.push(makeRing(norm.pts));
          } else if (mode.stroke) {
            // Two points under a fill + stroke: nothing to fill, but the stroke still draws a line.
            polylineOf(norm.pts, strokeOnlyStyle);
          } else {
            stats.degenerateSubpaths++;
          }
        }
        const { regions, nestingSkipped } = buildRegions(rings, mode.rule, touchEps);
        if (nestingSkipped) stats.nestingSkippedPaths++;
        stats.degenerateSubpaths += rings.filter(
          (r) => Math.abs(r.area) <= MIN_AREA_PT2,
        ).length;
        for (const region of regions) {
          const outer = rings[region.outer] as Ring;
          let areaPt2 = Math.abs(outer.area);
          let lengthPt = ringLength(outer.pts, true);
          const ringPts: number[][] = [outer.pts];
          for (const h of region.holes) {
            const hole = rings[h] as Ring;
            areaPt2 -= Math.abs(hole.area);
            lengthPt += ringLength(hole.pts, true);
            ringPts.push(hole.pts);
          }
          stats.holes += region.holes.length;
          addElement(ElementKind.polygon, fullStyle, areaPt2, lengthPt, ringPts);
        }
        return;
      }

      // Stroke only: each subpath is its own element.
      for (const sub of subpaths) {
        const norm = normalise(sub, false);
        if (norm === null) {
          stats.degenerateSubpaths++;
          continue;
        }
        if (norm.closed && norm.pts.length >= 6) {
          const ring = makeRing(norm.pts);
          if (Math.abs(ring.area) > MIN_AREA_PT2) {
            addElement(
              ElementKind.polygon,
              fullStyle,
              Math.abs(ring.area),
              ringLength(norm.pts, true),
              [norm.pts],
            );
            continue;
          }
          stats.degenerateSubpaths++;
        }
        polylineOf(norm.pts, fullStyle);
      }
    };

    const fnArray = list.fnArray;
    const argsArray = list.argsArray as unknown[];
    for (let k = 0; k < fnArray.length; k++) {
      if ((k & 1023) === 0) checkDeadline();
      const fn = fnArray[k] as number;
      const args = argsArray[k] as unknown;
      if (fn === OPS.constructPath) {
        const a = args as unknown[];
        const mode = PAINT_MODES.get(a[0] as number);
        if (!mode) continue; // endPath: a path that only clips
        const pathData = Array.isArray(a[1])
          ? (a[1][0] as ArrayLike<number> | null | undefined)
          : null;
        handlePath(mode, pathData ?? null);
        continue;
      }
      switch (fn) {
        case OPS.save:
        case OPS.beginGroup:
          stack.push(state);
          break;
        case OPS.restore:
        case OPS.endGroup: {
          const saved = stack.pop();
          if (saved) state = saved;
          break;
        }
        case OPS.paintFormXObjectBegin: {
          stack.push(state);
          const m = Array.isArray(args) ? (args[0] as unknown) : null;
          if (isMatrix(m)) state = { ...state, ctm: compose(state.ctm, toMatrix(m)) };
          break;
        }
        case OPS.paintFormXObjectEnd: {
          const saved = stack.pop();
          if (saved) state = saved;
          break;
        }
        case OPS.transform:
          if (isMatrix(args))
            state = { ...state, ctm: compose(state.ctm, toMatrix(args)) };
          break;
        case OPS.setLineWidth:
          if (Array.isArray(args) && typeof args[0] === "number")
            state = { ...state, lineWidth: args[0] };
          break;
        case OPS.setDash:
          if (Array.isArray(args)) {
            const phase = typeof args[1] === "number" ? args[1] : 0;
            state = { ...state, dash: dashFromArgs(args[0]), dashPhase: phase };
          }
          break;
        case OPS.setGState:
          if (Array.isArray(args) && Array.isArray(args[0])) {
            for (const entry of args[0] as unknown[]) {
              if (!Array.isArray(entry)) continue;
              if (entry[0] === "LW" && typeof entry[1] === "number")
                state = { ...state, lineWidth: entry[1] };
              if (entry[0] === "D" && Array.isArray(entry[1])) {
                const phase = typeof entry[1][1] === "number" ? entry[1][1] : 0;
                state = { ...state, dash: dashFromArgs(entry[1][0]), dashPhase: phase };
              }
            }
          }
          break;
        case OPS.setStrokeRGBColor:
        case OPS.setStrokeColorN:
        case OPS.setStrokeColor:
          state = { ...state, stroke: colourFromArgs(args) };
          break;
        case OPS.setFillRGBColor:
        case OPS.setFillColorN:
        case OPS.setFillColor:
          state = { ...state, fill: colourFromArgs(args) };
          break;
        case OPS.setStrokeTransparent:
          state = { ...state, stroke: NO_COLOUR };
          break;
        case OPS.setFillTransparent:
          state = { ...state, fill: NO_COLOUR };
          break;
        case OPS.clip:
        case OPS.eoClip:
          stats.clipOperations++;
          break;
        case OPS.beginMarkedContent:
          markedContent.push(false);
          break;
        case OPS.beginMarkedContentProps: {
          const a = args as unknown[];
          const properties = Array.isArray(a) ? a[1] : null;
          const hide =
            Array.isArray(a) &&
            a[0] === "OC" &&
            typeof properties === "object" &&
            properties !== null &&
            !config.isVisible(properties);
          markedContent.push(hide);
          if (hide) hiddenDepth++;
          break;
        }
        case OPS.endMarkedContent:
          if (markedContent.pop()) hiddenDepth--;
          break;
        default:
          if (IMAGE_OPS.has(fn) && hiddenDepth === 0) {
            stats.images++;
            const det = Math.abs(
              state.ctm[0] * state.ctm[3] - state.ctm[1] * state.ctm[2],
            );
            if (pageArea > 0) stats.imageAreaShare += det / pageArea;
          }
      }
    }

    const elements = builder.finish();
    stats.elements = elements.count;
    stats.vertices = builder.vertexCount;
    page.cleanup();
    stats.durationMs = now() - startedAt;
    return {
      page: {
        pageNo,
        widthPt,
        heightPt,
        view: [x0, y0, x1, y1],
        rotate: page.rotate,
        userUnit,
      },
      scale: { ratio, metersPerPoint: mpp },
      styles: styles.list,
      elements,
      stats,
    };
  } catch (error) {
    if (error instanceof EngineError) throw error;
    throw new EngineError(
      "unsupported_pdfjs_data",
      "pdfjs-dist could not process the page",
      { cause: error },
    );
  }
}
