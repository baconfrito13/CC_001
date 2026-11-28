import { describe, expect, it } from "vitest";
import {
  cubicSegments,
  flattenCubic,
  flattenQuadratic,
  quadraticSegments,
} from "@/lib/engine/curves";

const KAPPA = 0.5522847498307936;

type Pt = readonly [number, number];

function cubicAt(p: readonly Pt[], t: number): Pt {
  const [p0, p1, p2, p3] = p as [Pt, Pt, Pt, Pt];
  const u = 1 - t;
  const f = (a: number, b: number, c: number, d: number) =>
    u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

function distanceToPolyline(point: Pt, poly: readonly number[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i + 3 < poly.length; i += 2) {
    const ax = poly[i] as number;
    const ay = poly[i + 1] as number;
    const bx = poly[i + 2] as number;
    const by = poly[i + 3] as number;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 === 0
        ? 0
        : Math.max(0, Math.min(1, ((point[0] - ax) * dx + (point[1] - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(point[0] - (ax + t * dx), point[1] - (ay + t * dy)));
  }
  return best;
}

describe("engine/curves", () => {
  it("engine: Bézier and arcs are sampled within tolerance", () => {
    // A quarter circle of radius 100 as one cubic, the way CAD exports arcs.
    const r = 100;
    const curve: Pt[] = [
      [r, 0],
      [r, KAPPA * r],
      [KAPPA * r, r],
      [0, r],
    ];
    for (const tolerance of [1, 0.1, 0.01]) {
      const poly: number[] = [r, 0];
      flattenCubic(
        poly,
        ...(curve.flat() as [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ]),
        tolerance,
      );
      let worst = 0;
      for (let k = 0; k <= 2000; k++) {
        worst = Math.max(worst, distanceToPolyline(cubicAt(curve, k / 2000), poly));
      }
      expect(worst).toBeLessThanOrEqual(tolerance);
      // The last point is exactly the end point.
      expect(poly.slice(-2)).toEqual([0, r]);
    }
  });

  it("engine: a finer tolerance never produces fewer segments", () => {
    const args = [0, 0, 10, 40, 30, 40, 40, 0] as const;
    const counts = [1, 0.1, 0.01, 0.001].map((tol) => cubicSegments(...args, tol));
    for (let i = 1; i < counts.length; i++)
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1] as number);
  });

  it("engine: a straight cubic and a straight quadratic need one segment", () => {
    expect(cubicSegments(0, 0, 10, 0, 20, 0, 30, 0, 0.001)).toBe(1);
    expect(quadraticSegments(0, 0, 5, 0, 10, 0, 0.001)).toBe(1);
  });

  it("engine: the segment count is capped, so a huge curve cannot exhaust memory", () => {
    expect(cubicSegments(0, 0, 1e9, 1e9, -1e9, 1e9, 0, 0, 1e-6, 64)).toBe(64);
    const poly: number[] = [];
    flattenCubic(poly, 0, 0, 1e9, 1e9, -1e9, 1e9, 0, 0, 1e-6, 64);
    expect(poly.length).toBe(64 * 2);
  });

  it("engine: quadratic curves are sampled within tolerance", () => {
    const poly: number[] = [0, 0];
    flattenQuadratic(poly, 0, 0, 50, 100, 100, 0, 0.05);
    let worst = 0;
    for (let k = 0; k <= 2000; k++) {
      const t = k / 2000;
      const u = 1 - t;
      const p: Pt = [
        u * u * 0 + 2 * u * t * 50 + t * t * 100,
        u * u * 0 + 2 * u * t * 100 + t * t * 0,
      ];
      worst = Math.max(worst, distanceToPolyline(p, poly));
    }
    expect(worst).toBeLessThanOrEqual(0.05);
  });

  it("engine: sampling a circle of r = 1.5 m at 1 mm keeps the perimeter within 0.05 %", () => {
    // Work in millimetres: r = 1500 mm, tolerance 1 mm, four cubic arcs.
    const r = 1500;
    const poly: number[] = [r, 0];
    const quarter = (
      a: number,
    ): [number, number, number, number, number, number, number, number] => {
      const c = Math.cos(a);
      const s = Math.sin(a);
      const p = (x: number, y: number): [number, number] => [
        x * c - y * s,
        x * s + y * c,
      ];
      const [p0x, p0y] = p(r, 0);
      const [p1x, p1y] = p(r, KAPPA * r);
      const [p2x, p2y] = p(KAPPA * r, r);
      const [p3x, p3y] = p(0, r);
      return [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y];
    };
    for (let q = 0; q < 4; q++) {
      const a = quarter((q * Math.PI) / 2);
      flattenCubic(poly, ...a, 1);
    }
    let perimeter = 0;
    for (let i = 0; i + 3 < poly.length; i += 2) {
      perimeter += Math.hypot(
        (poly[i + 2] as number) - (poly[i] as number),
        (poly[i + 3] as number) - (poly[i + 1] as number),
      );
    }
    expect(Math.abs(perimeter / (2 * Math.PI * r) - 1)).toBeLessThan(0.0005);
  });
});
