/**
 * PDF affine matrices `[a b c d e f]`: x' = a*x + c*y + e, y' = b*x + d*y + f.
 */
export type Matrix = readonly [number, number, number, number, number, number];

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

export function translation(tx: number, ty: number): Matrix {
  return [1, 0, 0, 1, tx, ty];
}

export function scaling(sx: number, sy: number = sx): Matrix {
  return [sx, 0, 0, sy, 0, 0];
}

/** Counter-clockwise rotation in radians. */
export function rotation(angle: number): Matrix {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cos, sin, -sin, cos, 0, 0];
}

/**
 * The matrix that applies `inner` first and `outer` second. A PDF `cm` operator does
 * `ctm = compose(ctm, m)`: the new matrix acts in the space the previous one defined.
 */
export function compose(outer: Matrix, inner: Matrix): Matrix {
  const [a, b, c, d, e, f] = outer;
  const [p, q, r, s, t, u] = inner;
  return [
    a * p + c * q,
    b * p + d * q,
    a * r + c * s,
    b * r + d * s,
    a * t + c * u + e,
    b * t + d * u + f,
  ];
}

export function apply(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** Linear scale of the matrix: the square root of the absolute determinant. */
export function scaleFactor(m: Matrix): number {
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
}
