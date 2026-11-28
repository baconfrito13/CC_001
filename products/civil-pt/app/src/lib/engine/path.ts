import { flattenCubic, flattenQuadratic } from "./curves";
import { EngineError } from "./errors";
import { apply, type Matrix } from "./matrix";

/**
 * The path operation codes of pdfjs-dist 6.x `constructPath` data (`DrawOPS` in its worker).
 * They are not exported by the package, so they are pinned here and guarded by the contract
 * test in `tests/engine/contract.test.ts`, which fails if an upgrade changes them.
 */
export const DRAW = {
  moveTo: 0,
  lineTo: 1,
  curveTo: 2,
  quadraticCurveTo: 3,
  closePath: 4,
} as const;

/** One subpath in page space (flat x, y pairs), with Béziers already flattened. */
export interface Subpath {
  pts: number[];
  /** True when the path closed it explicitly (`h`, or the closing paint operators). */
  closed: boolean;
}

/**
 * Decodes the flat `constructPath` buffer into page-space subpaths.
 *
 * `ctm` maps path coordinates to page space; control points are mapped before flattening
 * (an affine map keeps a Bézier a Bézier), and `tolerance` is in page-space points.
 * `maxPoints` bounds the vertices produced (SR-05): exceeding it throws `too_many_vertices`.
 */
export function decodePath(
  data: ArrayLike<number> | null | undefined,
  ctm: Matrix,
  tolerance: number,
  maxPoints: number = Number.POSITIVE_INFINITY,
): Subpath[] {
  const out: Subpath[] = [];
  if (!data || data.length === 0) return out;

  let current: Subpath | null = null;
  let px = 0;
  let py = 0;
  let startX = 0;
  let startY = 0;
  let total = 0;
  let i = 0;
  const length = data.length;

  const read = (count: number): void => {
    if (i + count > length) {
      throw new EngineError(
        "unsupported_pdfjs_data",
        "Truncated path data from pdfjs-dist",
      );
    }
  };
  const num = (index: number): number => data[index] as number;
  const begin = (x: number, y: number): Subpath => {
    const sub: Subpath = { pts: [x, y], closed: false };
    out.push(sub);
    total += 1;
    startX = x;
    startY = y;
    px = x;
    py = y;
    return sub;
  };
  /** Drawing after a close continues from the closed subpath's start point (PDF 8.5.2.1). */
  const active = (): Subpath => {
    if (current === null || current.closed)
      current = begin(current ? startX : px, current ? startY : py);
    return current;
  };
  const checkBudget = (before: number, sub: Subpath): void => {
    total += (sub.pts.length - before) / 2;
    if (total > maxPoints) {
      throw new EngineError(
        "too_many_vertices",
        `Path has more than ${maxPoints} vertices`,
      );
    }
  };

  while (i < length) {
    const op = num(i++);
    switch (op) {
      case DRAW.moveTo: {
        read(2);
        const [x, y] = apply(ctm, num(i), num(i + 1));
        i += 2;
        current = begin(x, y);
        break;
      }
      case DRAW.lineTo: {
        read(2);
        const [x, y] = apply(ctm, num(i), num(i + 1));
        i += 2;
        if (current === null) {
          // A line with no current point (malformed content): treat it as the start of a subpath.
          current = begin(x, y);
          break;
        }
        const sub = active();
        const before = sub.pts.length;
        sub.pts.push(x, y);
        px = x;
        py = y;
        checkBudget(before, sub);
        break;
      }
      case DRAW.curveTo: {
        read(6);
        const [x1, y1] = apply(ctm, num(i), num(i + 1));
        const [x2, y2] = apply(ctm, num(i + 2), num(i + 3));
        const [x3, y3] = apply(ctm, num(i + 4), num(i + 5));
        i += 6;
        const sub = active();
        const before = sub.pts.length;
        flattenCubic(sub.pts, px, py, x1, y1, x2, y2, x3, y3, tolerance);
        px = x3;
        py = y3;
        checkBudget(before, sub);
        break;
      }
      case DRAW.quadraticCurveTo: {
        read(4);
        const [x1, y1] = apply(ctm, num(i), num(i + 1));
        const [x2, y2] = apply(ctm, num(i + 2), num(i + 3));
        i += 4;
        const sub = active();
        const before = sub.pts.length;
        flattenQuadratic(sub.pts, px, py, x1, y1, x2, y2, tolerance);
        px = x2;
        py = y2;
        checkBudget(before, sub);
        break;
      }
      case DRAW.closePath: {
        if (current) {
          current.closed = true;
          px = startX;
          py = startY;
        }
        break;
      }
      default:
        throw new EngineError(
          "unsupported_pdfjs_data",
          `Unknown path operation ${op} from pdfjs-dist`,
        );
    }
  }
  return out;
}
