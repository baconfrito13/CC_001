/**
 * Closed rings and the regions they enclose.
 *
 * A painted path can hold several subpaths: a slab with a void, two rooms drawn together, an
 * island inside a courtyard. The fill rule decides which rings are material and which are holes,
 * so the area is the outer ring minus its holes (spike S6: counting every ring as its own area
 * over-states anything with a hole).
 */

export type FillRule = "nonzero" | "evenodd";

export interface Ring {
  /** Flat x, y pairs; the closing edge from the last vertex to the first is implicit. */
  pts: number[];
  /** Signed shoelace area: positive counter-clockwise. */
  area: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Region {
  /** Index of the ring that bounds the material. */
  outer: number;
  /** Indices of the rings that cut holes out of it. */
  holes: number[];
}

/** Signed shoelace area of a ring given as flat x, y pairs (positive counter-clockwise). */
export function signedArea(pts: ArrayLike<number>): number {
  const n = pts.length / 2;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = i + 1 === n ? 0 : i + 1;
    sum +=
      (pts[2 * i] as number) * (pts[2 * j + 1] as number) -
      (pts[2 * j] as number) * (pts[2 * i + 1] as number);
  }
  return sum / 2;
}

/** Length of the polyline; with `closed`, the closing edge is included. */
export function ringLength(pts: ArrayLike<number>, closed: boolean): number {
  const n = pts.length / 2;
  let sum = 0;
  for (let i = 1; i < n; i++) {
    sum += Math.hypot(
      (pts[2 * i] as number) - (pts[2 * i - 2] as number),
      (pts[2 * i + 1] as number) - (pts[2 * i - 1] as number),
    );
  }
  if (closed && n > 1) {
    sum += Math.hypot(
      (pts[0] as number) - (pts[2 * n - 2] as number),
      (pts[1] as number) - (pts[2 * n - 1] as number),
    );
  }
  return sum;
}

export function makeRing(pts: number[]): Ring {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] as number;
    const y = pts[i + 1] as number;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { pts, area: signedArea(pts), minX, minY, maxX, maxY };
}

/**
 * 1 when the point is strictly inside the ring, 0 when strictly outside and -1 when it lies
 * within `eps` of the boundary (touching rings share vertices and edges all the time).
 */
export function pointInRing(
  x: number,
  y: number,
  pts: ArrayLike<number>,
  eps: number,
): 1 | 0 | -1 {
  const n = pts.length / 2;
  const eps2 = eps * eps;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[2 * i] as number;
    const yi = pts[2 * i + 1] as number;
    const xj = pts[2 * j] as number;
    const yj = pts[2 * j + 1] as number;
    const dx = xi - xj;
    const dy = yi - yj;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - xj) * dx + (y - yj) * dy) / len2));
    const ex = x - (xj + t * dx);
    const ey = y - (yj + t * dy);
    if (ex * ex + ey * ey <= eps2) return -1;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside ? 1 : 0;
}

/** Vertices sampled from a ring when testing containment (bounds the cost on huge rings). */
const CONTAINMENT_SAMPLES = 32;

/** True when `inner` lies inside `outer`: no sampled vertex outside and at least one strictly inside. */
function ringInside(inner: Ring, outer: Ring, eps: number): boolean {
  if (
    inner.minX < outer.minX - eps ||
    inner.minY < outer.minY - eps ||
    inner.maxX > outer.maxX + eps ||
    inner.maxY > outer.maxY + eps
  ) {
    return false;
  }
  const n = inner.pts.length / 2;
  const step = Math.max(1, Math.floor(n / CONTAINMENT_SAMPLES));
  let strictlyInside = 0;
  for (let k = 0; k < n; k += step) {
    const verdict = pointInRing(
      inner.pts[2 * k] as number,
      inner.pts[2 * k + 1] as number,
      outer.pts,
      eps,
    );
    if (verdict === 0) return false;
    if (verdict === 1) strictlyInside++;
  }
  return strictlyInside > 0;
}

/** Above this many rings in one painted path the nesting analysis is skipped (hatch-like paths). */
export const DEFAULT_MAX_RINGS_FOR_NESTING = 5000;

/** Zero-area rings (collinear points) paint nothing and are dropped. */
const MIN_RING_AREA = 1e-9;

/**
 * Groups the rings of one painted path into regions under the fill rule.
 *
 * Rings that do not cross are fully described by containment, so the algorithm builds the
 * containment forest (parent = smallest ring containing it) and then decides per ring whether
 * the area just inside it is painted: even-odd by nesting depth, non-zero by the sum of the
 * windings of the ring and all its ancestors. A painted ring inside an unpainted one opens a
 * region; an unpainted ring inside a painted one is a hole of it; rings that do not change
 * the painted state (non-zero, same winding) are interior and ignored.
 *
 * `eps` is the distance, in page points, within which a vertex counts as touching an edge.
 */
export function buildRegions(
  rings: readonly Ring[],
  rule: FillRule,
  eps: number,
  options: { maxRingsForNesting?: number } = {},
): { regions: Region[]; nestingSkipped: boolean } {
  const maxRings = options.maxRingsForNesting ?? DEFAULT_MAX_RINGS_FOR_NESTING;
  const live: number[] = [];
  rings.forEach((ring, index) => {
    if (Math.abs(ring.area) > MIN_RING_AREA) live.push(index);
  });

  if (live.length <= 1) {
    return {
      regions: live.map((outer) => ({ outer, holes: [] })),
      nestingSkipped: false,
    };
  }
  if (rings.length > maxRings) {
    return { regions: live.map((outer) => ({ outer, holes: [] })), nestingSkipped: true };
  }

  const order = [...live].sort(
    (a, b) =>
      Math.abs((rings[b] as Ring).area) - Math.abs((rings[a] as Ring).area) || a - b,
  );
  const parent = new Map<number, number>();
  for (let k = 0; k < order.length; k++) {
    const i = order[k] as number;
    const inner = rings[i] as Ring;
    for (let m = k - 1; m >= 0; m--) {
      const j = order[m] as number;
      const outer = rings[j] as Ring;
      if (Math.abs(outer.area) <= Math.abs(inner.area)) continue;
      if (ringInside(inner, outer, eps)) {
        parent.set(i, j);
        break;
      }
    }
  }

  const winding = new Map<number, number>();
  const depth = new Map<number, number>();
  const painted = new Map<number, boolean>();
  const owner = new Map<number, number>();
  const regions = new Map<number, number[]>();
  for (const i of order) {
    const p = parent.get(i);
    const sign = (rings[i] as Ring).area > 0 ? 1 : -1;
    winding.set(i, sign + (p === undefined ? 0 : (winding.get(p) as number)));
    depth.set(i, p === undefined ? 0 : (depth.get(p) as number) + 1);
    const isPainted =
      rule === "evenodd" ? (depth.get(i) as number) % 2 === 0 : winding.get(i) !== 0;
    painted.set(i, isPainted);
    const parentPainted = p === undefined ? false : (painted.get(p) as boolean);
    if (isPainted && !parentPainted) {
      owner.set(i, i);
      regions.set(i, []);
    } else if (p !== undefined && parentPainted) {
      const root = owner.get(p);
      if (root === undefined) continue;
      owner.set(i, root);
      if (!isPainted) (regions.get(root) as number[]).push(i);
    }
  }

  return {
    regions: [...regions.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([outer, holes]) => ({ outer, holes: holes.sort((a, b) => a - b) })),
    nestingSkipped: false,
  };
}
