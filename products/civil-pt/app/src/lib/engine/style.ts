import type { StyleDescriptor } from "./types";

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;

/** Label for a paint source this version cannot reduce to a colour. */
export const UNKNOWN_COLOUR = "unknown";
/** Label for `setStrokeTransparent` / `setFillTransparent`. */
export const NO_COLOUR = "none";

/**
 * Colour of a pdf.js colour operator. pdf.js already converts gray, CMYK and ICC colours to
 * `#rrggbb` strings, so a plain colour arrives as `["#rrggbb"]`; patterns and shadings arrive as
 * an intermediate representation that starts with the pattern kind.
 */
export function colourFromArgs(args: unknown): string {
  if (!Array.isArray(args)) return UNKNOWN_COLOUR;
  const first: unknown = args[0];
  if (typeof first === "string") {
    if (HEX_COLOUR.test(first)) return first.toLowerCase();
    if (first === "TilingPattern") {
      // ["TilingPattern", colour, operatorList, matrix, bbox, xstep, ystep, ...]
      const colour =
        typeof args[1] === "string" && HEX_COLOUR.test(args[1])
          ? args[1].toLowerCase()
          : "";
      const xstep = typeof args[5] === "number" ? round2(args[5]) : 0;
      const ystep = typeof args[6] === "number" ? round2(args[6]) : 0;
      return `pattern:tiling:${colour}:${xstep}x${ystep}`;
    }
    if (first === "Shading") return `pattern:shading:${String(args[1] ?? "")}`;
  }
  return UNKNOWN_COLOUR;
}

/** Rounds to two decimals: CAD pen widths and dashes differ in the noise, not in the design. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** A dash array from pdf.js (plain or typed) as clean numbers. */
export function dashFromArgs(value: unknown): number[] {
  if (value === null || value === undefined || typeof value === "string") return [];
  const out: number[] = [];
  const source = value as ArrayLike<unknown>;
  for (let i = 0; i < (source.length ?? 0); i++) {
    const n = source[i];
    if (typeof n === "number" && Number.isFinite(n)) out.push(n);
  }
  // An all-zero array is a solid line in PDF.
  return out.every((n) => n === 0) ? [] : out;
}

/** Interns style descriptors: identical styles share an index in the sheet's style list. */
export class StyleTable {
  private readonly ids = new Map<string, number>();
  readonly list: StyleDescriptor[] = [];

  /**
   * @param stroke colour of the stroke, or null when the path is not stroked
   * @param fill colour of the fill, or null when the path is not filled
   * @param widthPt line width in page points (already scaled by the CTM)
   * @param dash dash array in page points (already scaled by the CTM)
   */
  intern(
    stroke: string | null,
    fill: string | null,
    widthPt: number,
    dash: readonly number[],
    dashPhase: number,
  ): number {
    const width = stroke === null ? 0 : round2(widthPt);
    const dashes = stroke === null ? [] : dash.map(round2);
    const phase = stroke === null || dashes.length === 0 ? 0 : round2(dashPhase);
    const key = `${stroke ?? "-"}|${fill ?? "-"}|${width}|${dashes.join(",")}@${phase}`;
    let id = this.ids.get(key);
    if (id === undefined) {
      id = this.list.length;
      this.ids.set(key, id);
      this.list.push({ stroke, fill, widthPt: width, dash: dashes, dashPhase: phase });
    }
    return id;
  }
}
