import { describe, expect, it } from "vitest";
import {
  buildRegions,
  makeRing,
  pointInRing,
  type Ring,
  ringLength,
  signedArea,
} from "@/lib/engine/regions";

/** Axis-aligned rectangle ring from corner and size; `ccw` flips the winding. */
function rect(x: number, y: number, w: number, h: number, ccw = true): Ring {
  const pts = [x, y, x + w, y, x + w, y + h, x, y + h];
  if (!ccw) {
    // Reverse the vertex order to flip the winding.
    const rev: number[] = [];
    for (let i = pts.length - 2; i >= 0; i -= 2)
      rev.push(pts[i] as number, pts[i + 1] as number);
    return makeRing(rev);
  }
  return makeRing(pts);
}

const area = (regions: ReturnType<typeof buildRegions>["regions"], rings: Ring[]) =>
  regions.map(
    (region) =>
      Math.abs(rings[region.outer]?.area ?? 0) -
      region.holes.reduce((sum, h) => sum + Math.abs(rings[h]?.area ?? 0), 0),
  );

describe("engine/regions", () => {
  it("engine: the shoelace formula is positive counter-clockwise and negative clockwise", () => {
    expect(signedArea([0, 0, 4, 0, 4, 3, 0, 3])).toBe(12);
    expect(signedArea([0, 3, 4, 3, 4, 0, 0, 0])).toBe(-12);
  });

  it("engine: ring length adds the closing edge", () => {
    expect(ringLength([0, 0, 4, 0, 4, 3, 0, 3], true)).toBe(14);
    expect(ringLength([0, 0, 4, 0, 4, 3, 0, 3], false)).toBe(11);
  });

  it("engine: pointInRing tells inside, outside and boundary apart", () => {
    const square = [0, 0, 10, 0, 10, 10, 0, 10];
    expect(pointInRing(5, 5, square, 1e-9)).toBe(1);
    expect(pointInRing(15, 5, square, 1e-9)).toBe(0);
    expect(pointInRing(10, 5, square, 1e-9)).toBe(-1);
    expect(pointInRing(0, 0, square, 1e-9)).toBe(-1);
  });

  it("engine: even-odd subpaths with holes subtract the hole area (spike S6)", () => {
    // A 10 x 10 slab with a 4 x 4 void drawn in the same path.
    const rings = [rect(0, 0, 10, 10), rect(3, 3, 4, 4)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toEqual([{ outer: 0, holes: [1] }]);
    expect(area(regions, rings)).toEqual([84]);
  });

  it("engine: a non-zero fill with the same winding fills the inner ring (no hole)", () => {
    const rings = [rect(0, 0, 10, 10), rect(3, 3, 4, 4)];
    const { regions } = buildRegions(rings, "nonzero", 1e-9);
    expect(regions).toEqual([{ outer: 0, holes: [] }]);
    expect(area(regions, rings)).toEqual([100]);
  });

  it("engine: a non-zero fill with opposite winding makes a hole", () => {
    const rings = [rect(0, 0, 10, 10), rect(3, 3, 4, 4, false)];
    const { regions } = buildRegions(rings, "nonzero", 1e-9);
    expect(regions).toEqual([{ outer: 0, holes: [1] }]);
    expect(area(regions, rings)).toEqual([84]);
  });

  it("engine: an island inside a hole is a region of its own (even-odd, depth 2)", () => {
    const rings = [rect(0, 0, 10, 10), rect(2, 2, 6, 6), rect(4, 4, 2, 2)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toEqual([
      { outer: 0, holes: [1] },
      { outer: 2, holes: [] },
    ]);
    expect(area(regions, rings)).toEqual([64, 4]);
  });

  it("engine: disjoint rings in one path are independent regions", () => {
    const rings = [rect(0, 0, 5, 5), rect(20, 20, 3, 3)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toEqual([
      { outer: 0, holes: [] },
      { outer: 1, holes: [] },
    ]);
  });

  it("engine: two rooms that share a wall are neighbours, not a hole inside the other", () => {
    // Adjacent rectangles touching along x = 10: the second has two vertices on the first's edge.
    const rings = [rect(0, 0, 10, 10), rect(10, 0, 8, 10)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toHaveLength(2);
    expect(regions.every((r) => r.holes.length === 0)).toBe(true);
  });

  it("engine: a hole that touches the outer edge is still a hole", () => {
    const rings = [rect(0, 0, 10, 10), rect(0, 0, 4, 4)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toEqual([{ outer: 0, holes: [1] }]);
  });

  it("engine: the order of the rings in the path does not change the regions", () => {
    const rings = [rect(3, 3, 4, 4), rect(0, 0, 10, 10)];
    const { regions } = buildRegions(rings, "evenodd", 1e-9);
    expect(regions).toEqual([{ outer: 1, holes: [0] }]);
  });

  it("engine: a single ring is one region (fast path) and a zero-area ring is dropped", () => {
    expect(buildRegions([rect(0, 0, 2, 2)], "evenodd", 1e-9).regions).toEqual([
      { outer: 0, holes: [] },
    ]);
    expect(
      buildRegions([makeRing([0, 0, 5, 0, 10, 0])], "evenodd", 1e-9).regions,
    ).toEqual([]);
  });

  it("engine: more rings than the nesting budget are treated as independent and reported", () => {
    const rings = Array.from({ length: 12 }, (_, i) => rect(i * 3, 0, 2, 2));
    const result = buildRegions(rings, "evenodd", 1e-9, { maxRingsForNesting: 10 });
    expect(result.nestingSkipped).toBe(true);
    expect(result.regions).toHaveLength(12);
  });
});
