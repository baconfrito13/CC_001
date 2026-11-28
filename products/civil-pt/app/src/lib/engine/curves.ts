/**
 * Bézier flattening with a guaranteed maximum deviation.
 *
 * A curve sampled at n equal parameter steps stays within (1 / (8 n^2)) * max|B''| of the true
 * curve, and |B''| of a cubic is at most 6 * max(|P0 - 2 P1 + P2|, |P1 - 2 P2 + P3|) (a quadratic:
 * 2 * |P0 - 2 P1 + P2|). Solving for n gives a segment count that provably meets `tolerance`,
 * with no iteration. Coordinates and tolerance share one unit (PDF points after the CTM).
 */

/** Hard cap on segments per curve: an adversarial control polygon cannot allocate unbounded points. */
export const MAX_CURVE_SEGMENTS = 256;

function clampSegments(value: number, cap: number): number {
  if (!Number.isFinite(value)) return cap;
  return Math.max(1, Math.min(cap, Math.ceil(value)));
}

export function cubicSegments(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tolerance: number,
  cap: number = MAX_CURVE_SEGMENTS,
): number {
  const d1 = Math.hypot(x0 - 2 * x1 + x2, y0 - 2 * y1 + y2);
  const d2 = Math.hypot(x1 - 2 * x2 + x3, y1 - 2 * y2 + y3);
  return clampSegments(Math.sqrt((0.75 * Math.max(d1, d2)) / tolerance), cap);
}

export function quadraticSegments(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tolerance: number,
  cap: number = MAX_CURVE_SEGMENTS,
): number {
  const d = Math.hypot(x0 - 2 * x1 + x2, y0 - 2 * y1 + y2);
  return clampSegments(Math.sqrt((0.25 * d) / tolerance), cap);
}

/**
 * Appends the points of a cubic Bézier to `out` (flat x, y pairs), excluding the start point
 * and including the end point exactly.
 */
export function flattenCubic(
  out: number[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tolerance: number,
  cap: number = MAX_CURVE_SEGMENTS,
): void {
  const n = cubicSegments(x0, y0, x1, y1, x2, y2, x3, y3, tolerance, cap);
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    out.push(a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3);
  }
  out.push(x3, y3);
}

/** Same as {@link flattenCubic} for a quadratic Bézier. */
export function flattenQuadratic(
  out: number[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tolerance: number,
  cap: number = MAX_CURVE_SEGMENTS,
): void {
  const n = quadraticSegments(x0, y0, x1, y1, x2, y2, tolerance, cap);
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const u = 1 - t;
    out.push(
      u * u * x0 + 2 * u * t * x1 + t * t * x2,
      u * u * y0 + 2 * u * t * y1 + t * t * y2,
    );
  }
  out.push(x2, y2);
}
