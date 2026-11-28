import { describe, expect, it } from "vitest";
import {
  apply,
  compose,
  IDENTITY,
  type Matrix,
  rotation,
  scaleFactor,
  scaling,
  translation,
} from "@/lib/engine/matrix";

describe("engine/matrix", () => {
  it("engine: the identity leaves a point unchanged", () => {
    expect(apply(IDENTITY, 3, -4)).toEqual([3, -4]);
  });

  it("engine: compose applies the inner matrix first, like successive PDF cm operators", () => {
    // q 1 0 0 1 10 0 cm 2 0 0 2 0 0 cm: the point (1, 0) is scaled to (2, 0), then moved to (12, 0).
    const ctm = compose(translation(10, 0), scaling(2));
    expect(apply(ctm, 1, 0)).toEqual([12, 0]);
  });

  it("engine: a rotation by 90 degrees maps the x axis onto the y axis", () => {
    const [x, y] = apply(rotation(Math.PI / 2), 5, 0);
    expect(x).toBeCloseTo(0, 12);
    expect(y).toBeCloseTo(5, 12);
  });

  it("engine: scaleFactor is the square root of the absolute determinant", () => {
    expect(scaleFactor(scaling(0.1))).toBeCloseTo(0.1, 12);
    // A rotation never changes lengths, and a mirror (negative determinant) keeps the magnitude.
    expect(scaleFactor(rotation(0.7))).toBeCloseTo(1, 12);
    const mirror: Matrix = [-2, 0, 0, 2, 0, 0];
    expect(scaleFactor(mirror)).toBeCloseTo(2, 12);
  });

  it("engine: composing a rotated and scaled matrix keeps areas proportional to the determinant", () => {
    const ctm = compose(rotation(Math.PI / 6), scaling(0.1));
    expect(scaleFactor(ctm) ** 2).toBeCloseTo(0.01, 12);
  });
});
