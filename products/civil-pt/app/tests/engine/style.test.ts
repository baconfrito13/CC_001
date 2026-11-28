import { describe, expect, it } from "vitest";
import { interpretSheet } from "@/lib/engine/analyze";
import { selectionStrategy } from "@/lib/engine/grouping";
import { gateMetrics } from "@/lib/engine/metrics";
import {
  colourFromArgs,
  dashFromArgs,
  NO_COLOUR,
  round2,
  StyleTable,
  UNKNOWN_COLOUR,
} from "@/lib/engine/style";
import { EMPTY_STATS, sheetFrom, square, style } from "./support";

describe("engine/style", () => {
  it("engine: plain colours come as lower-case #rrggbb", () => {
    expect(colourFromArgs(["#FF8000"])).toBe("#ff8000");
  });

  it("engine: tiling patterns and shadings are labelled so hatches stay apart from plain fills", () => {
    expect(
      colourFromArgs([
        "TilingPattern",
        "#00ff00",
        [],
        [1, 0, 0, 1, 0, 0],
        [0, 0, 8, 8],
        8,
        8,
        1,
        1,
      ]),
    ).toBe("pattern:tiling:#00ff00:8x8");
    expect(colourFromArgs(["TilingPattern", null, [], [], [], 4, 2])).toBe(
      "pattern:tiling::4x2",
    );
    expect(colourFromArgs(["Shading", "sh_p0_1", [1, 0, 0, 1, 0, 0]])).toBe(
      "pattern:shading:sh_p0_1",
    );
    expect(NO_COLOUR).toBe("none");
  });

  it("engine: anything else is labelled unknown instead of guessed", () => {
    expect(colourFromArgs([])).toBe(UNKNOWN_COLOUR);
    expect(colourFromArgs(["red"])).toBe(UNKNOWN_COLOUR);
    expect(colourFromArgs(null)).toBe(UNKNOWN_COLOUR);
  });

  it("engine: dash arrays are cleaned, and an all-zero array is a solid line", () => {
    expect(dashFromArgs([3, 1])).toEqual([3, 1]);
    expect(dashFromArgs(new Float32Array([2, 2]))).toEqual([2, 2]);
    expect(dashFromArgs([0, 0])).toEqual([]);
    expect(dashFromArgs(null)).toEqual([]);
    expect(dashFromArgs([1, Number.NaN, "x"])).toEqual([1]);
  });

  it("engine: round2 rounds to hundredths", () => {
    expect(round2(0.3503)).toBe(0.35);
    expect(round2(0.356)).toBe(0.36);
  });

  it("engine: the style table interns equal styles and ignores the pen of a fill-only style", () => {
    const table = new StyleTable();
    const a = table.intern("#ff0000", null, 0.35, [], 0);
    const b = table.intern("#ff0000", null, 0.3501, [], 0);
    const c = table.intern(null, "#ffff00", 5, [3, 1], 2);
    const d = table.intern(null, "#ffff00", 0.1, [], 0);
    expect([a, b]).toEqual([0, 0]);
    expect([c, d]).toEqual([1, 1]);
    expect(table.list).toHaveLength(2);
    expect(table.list[1]).toEqual({
      stroke: null,
      fill: "#ffff00",
      widthPt: 0,
      dash: [],
      dashPhase: 0,
    });
  });
});

describe("engine/analyze: interpretSheet", () => {
  const styles = [style("#ff0000"), style("#0000ff")];

  it("engine: a sheet of one style is refused by the style strategy but not by a hand-made selection", () => {
    const sheet = sheetFrom(
      [square(0, 0, 1, 0), square(5, 0, 1, 0), square(9, 0, 1, 0)],
      styles,
    );
    expect(interpretSheet(sheet).outcome).toBe("low_diversity");
    const chosen = interpretSheet(sheet, {
      strategy: selectionStrategy([{ elements: [0, 1] }]),
    });
    expect(chosen.outcome).toBe("ready");
    expect(chosen.dominantShare).toBe(1);
  });

  it("engine: no elements and an image is raster, no elements and no image is no geometry", () => {
    const empty = sheetFrom([], styles);
    expect(interpretSheet(empty).outcome).toBe("no_geometry");
    const scan = { ...empty, stats: { ...EMPTY_STATS, images: 2 } };
    expect(interpretSheet(scan).outcome).toBe("unsupported_raster");
  });

  it("engine: the gate metrics report styles, top share, groups for 90 % and the closed share", () => {
    const sheet = sheetFrom(
      [
        ...Array.from({ length: 8 }, (_, i) => square(i * 3, 0, 1, 0)),
        square(0, 9, 1, 1),
        square(3, 9, 1, 1),
      ],
      styles,
    );
    const result = interpretSheet(sheet);
    expect(gateMetrics(sheet, result.assignment)).toEqual({
      elements: 10,
      styles: 2,
      topStyleShare: 0.8,
      groupsFor90: 2,
      closedShare: 1,
      images: 0,
    });
  });
});
