import { describe, expect, it } from "vitest";
import { analyzeSheet } from "@/lib/engine/analyze";
import { decodeGeometryPackage, encodeGeometryPackage } from "@/lib/engine/package";
import {
  blankPage,
  poorStyleSheet38k,
  rasterOnly,
  rotatedScaledRectangle,
  VECTOR_A2,
  vectorA2,
} from "../../fixtures/sheets";
import { elementsOf, FIXED_CLOCK } from "./support";

const within = (actual: number, expected: number, relative: number): boolean =>
  Math.abs(actual - expected) <= relative * expected;

describe("US-04 (engine level)", () => {
  it("US-04.1: vector-a2 gives area 102.30 m² (±0.1%), length 40.00 m (±0.1%), circle perimeter 9.42 m (±0.5%)", async () => {
    const result = await analyzeSheet(vectorA2(), {
      pageNo: 1,
      scaleRatio: VECTOR_A2.ratio,
    });
    expect(result.outcome).toBe("ready");
    const byColour = new Map(elementsOf(result).map((e) => [e.stroke, e]));

    const rectangle = byColour.get(VECTOR_A2.colours.rectangle);
    expect(rectangle?.kind).toBe("polygon");
    expect(within(rectangle?.area ?? 0, 102.3, 0.001)).toBe(true);
    expect(within(rectangle?.length ?? 0, VECTOR_A2.rectangle.perimeter, 0.001)).toBe(
      true,
    );

    const polyline = byColour.get(VECTOR_A2.colours.polyline);
    expect(polyline?.kind).toBe("polyline");
    expect(within(polyline?.length ?? 0, 40, 0.001)).toBe(true);
    expect(polyline?.area).toBe(0);

    const circle = byColour.get(VECTOR_A2.colours.circle);
    expect(circle?.kind).toBe("polygon");
    expect(within(circle?.length ?? 0, 9.42, 0.005)).toBe(true);
    expect(within(circle?.length ?? 0, VECTOR_A2.circle.perimeter, 0.0005)).toBe(true);
    expect(within(circle?.area ?? 0, VECTOR_A2.circle.area, 0.001)).toBe(true);

    // The same numbers reach the groups, which is what the user sees (one element per group here).
    const totals = result.assignment.groups.map((g) => [g.kind, g.count]);
    expect(totals).toEqual([
      ["polygon", 1],
      ["polygon", 1],
      ["polyline", 1],
    ]);
  });

  it("US-04.1: the sheet finishes far inside the 90 s budget", async () => {
    const result = await analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100 });
    expect(result.sheet.stats.durationMs).toBeLessThan(90_000);
  });

  it("US-04.1: rotated and scaled CTM gives the same area (spike S2)", async () => {
    const plain = elementsOf(
      await analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100 }),
    ).find((e) => e.stroke === VECTOR_A2.colours.rectangle);
    const nested = elementsOf(
      await analyzeSheet(rotatedScaledRectangle(), { pageNo: 1, scaleRatio: 100 }),
    )[0];
    expect(nested?.kind).toBe("polygon");
    expect(within(nested?.area ?? 0, 102.3, 0.001)).toBe(true);
    expect(within(nested?.area ?? 0, plain?.area ?? 0, 0.0005)).toBe(true);
    expect(within(nested?.length ?? 0, plain?.length ?? 0, 0.0005)).toBe(true);
  });

  it("US-04.1: the same drawing at 1:50 measures half the length and a quarter of the area", async () => {
    const at100 = elementsOf(
      await analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100 }),
    )[0];
    const at50 = elementsOf(
      await analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 50 }),
    )[0];
    expect(at50?.area).toBeCloseTo((at100?.area ?? 0) / 4, 8);
    expect(at50?.length).toBeCloseTo((at100?.length ?? 0) / 2, 8);
  });

  it("US-04.2: an image-only PDF is reported as unsupported raster with 0 elements", async () => {
    const result = await analyzeSheet(rasterOnly(), { pageNo: 1, scaleRatio: 100 });
    expect(result.outcome).toBe("unsupported_raster");
    expect(result.sheet.elements.count).toBe(0);
    expect(result.assignment.groups).toEqual([]);
    expect(result.sheet.stats.images).toBe(1);
    // The image covers the whole page: the share is informative for T4, it never decides.
    expect(result.sheet.stats.imageAreaShare).toBeGreaterThan(0.99);
  });

  it("US-04.2: a page with neither vectors nor images is reported as no geometry, not as raster", async () => {
    const result = await analyzeSheet(blankPage(), { pageNo: 1, scaleRatio: 100 });
    expect(result.outcome).toBe("no_geometry");
    expect(result.sheet.stats.images).toBe(0);
  });

  it("US-04.6: 95% of elements in one style reports low diversity with dominant_share 0.95", async () => {
    const result = await analyzeSheet(poorStyleSheet38k(), {
      pageNo: 1,
      scaleRatio: 100,
    });
    expect(result.sheet.elements.count).toBe(38_000);
    expect(result.outcome).toBe("low_diversity");
    expect(result.dominantShare).toBe(0.95);
  });

  it("US-04.6: the threshold is LOW_DIVERSITY_SHARE: 0.95 passes at 0.96, and an even sheet is ready", async () => {
    const poor = await analyzeSheet(poorStyleSheet38k(), {
      pageNo: 1,
      scaleRatio: 100,
      lowDiversityShare: 0.96,
    });
    expect(poor.outcome).toBe("ready");
    const exact = await analyzeSheet(poorStyleSheet38k(), {
      pageNo: 1,
      scaleRatio: 100,
      lowDiversityShare: 0.95,
    });
    expect(exact.outcome).toBe("low_diversity");
    const even = await analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100 });
    expect(even.dominantShare).toBeCloseTo(1 / 3, 10);
    expect(even.outcome).toBe("ready");
  });

  it("US-04.1: the measured sheet survives the geometry package unchanged (what the viewer will read)", async () => {
    const result = await analyzeSheet(vectorA2(), {
      pageNo: 1,
      scaleRatio: 100,
      now: FIXED_CLOCK,
    });
    const decoded = decodeGeometryPackage(
      encodeGeometryPackage(result.sheet, result.assignment),
    );
    expect(elementsOf(decoded)).toEqual(elementsOf(result));
    expect(decoded.assignment.groups).toEqual(result.assignment.groups);
  });
});
