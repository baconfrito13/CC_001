import { describe, expect, it } from "vitest";
import { EngineError } from "@/lib/engine/errors";
import { compose, scaling, translation } from "@/lib/engine/matrix";
import { DRAW, decodePath } from "@/lib/engine/path";

const I = [1, 0, 0, 1, 0, 0] as const;
const { moveTo: M, lineTo: L, curveTo: C, quadraticCurveTo: Q, closePath: Z } = DRAW;

describe("engine/path", () => {
  it("engine: the draw operation codes match what pdfjs-dist writes", () => {
    expect(DRAW).toEqual({
      moveTo: 0,
      lineTo: 1,
      curveTo: 2,
      quadraticCurveTo: 3,
      closePath: 4,
    });
  });

  it("engine: a closed rectangle decodes to one closed subpath of four points", () => {
    const subpaths = decodePath([M, 10, 10, L, 60, 10, L, 60, 30, L, 10, 30, Z], I, 0.01);
    expect(subpaths).toHaveLength(1);
    expect(subpaths[0]?.closed).toBe(true);
    expect(subpaths[0]?.pts).toEqual([10, 10, 60, 10, 60, 30, 10, 30]);
  });

  it("engine: an open polyline stays open", () => {
    const [sub] = decodePath(new Float32Array([M, 0, 0, L, 10, 0, L, 10, 10]), I, 0.01);
    expect(sub?.closed).toBe(false);
    expect(sub?.pts).toEqual([0, 0, 10, 0, 10, 10]);
  });

  it("engine: the CTM is applied to every point (CAD exports draw inside scaled blocks)", () => {
    const ctm = compose(translation(100, 200), scaling(0.1));
    const [sub] = decodePath([M, 0, 0, L, 100, 0, L, 100, 50, Z], ctm, 0.01);
    expect(sub?.pts).toEqual([100, 200, 110, 200, 110, 205]);
  });

  it("engine: a cubic Bézier is flattened and ends exactly on its end point", () => {
    const [sub] = decodePath([M, 0, 0, C, 0, 10, 10, 10, 10, 0], I, 0.01);
    expect((sub?.pts.length ?? 0) / 2).toBeGreaterThan(4);
    expect(sub?.pts.slice(-2)).toEqual([10, 0]);
  });

  it("engine: a quadratic Bézier is flattened and ends exactly on its end point", () => {
    const [sub] = decodePath([M, 0, 0, Q, 5, 10, 10, 0], I, 0.01);
    expect((sub?.pts.length ?? 0) / 2).toBeGreaterThan(3);
    expect(sub?.pts.slice(-2)).toEqual([10, 0]);
  });

  it("engine: several subpaths in one path stay separate", () => {
    const subpaths = decodePath(
      [M, 0, 0, L, 5, 0, L, 5, 5, Z, M, 20, 20, L, 30, 20, L, 30, 30, L, 20, 30, Z],
      I,
      0.01,
    );
    expect(subpaths.map((s) => s.pts.length / 2)).toEqual([3, 4]);
    expect(subpaths.every((s) => s.closed)).toBe(true);
  });

  it("engine: drawing after a close starts a new subpath at the previous start point", () => {
    const subpaths = decodePath([M, 1, 1, L, 4, 1, L, 4, 4, Z, L, 9, 9], I, 0.01);
    expect(subpaths).toHaveLength(2);
    expect(subpaths[1]?.pts).toEqual([1, 1, 9, 9]);
    expect(subpaths[1]?.closed).toBe(false);
  });

  it("engine: a line without a preceding moveTo starts a subpath at that point", () => {
    const [sub] = decodePath([L, 3, 4, L, 5, 6], I, 0.01);
    expect(sub?.pts).toEqual([3, 4, 5, 6]);
  });

  it("engine: a null path (nothing to paint) decodes to no subpaths", () => {
    expect(decodePath(null, I, 0.01)).toEqual([]);
  });

  it("engine: an unknown draw operation is reported, not guessed", () => {
    expect(() => decodePath([M, 0, 0, 9, 1, 1], I, 0.01)).toThrow(EngineError);
    try {
      decodePath([M, 0, 0, 9, 1, 1], I, 0.01);
    } catch (error) {
      expect((error as EngineError).code).toBe("unsupported_pdfjs_data");
    }
  });

  it("engine: truncated path data is reported", () => {
    expect(() => decodePath([M, 0, 0, L, 5], I, 0.01)).toThrow(/truncated/i);
  });

  it("SR-05: a path that exactly fits the vertex budget decodes", () => {
    const data = [M, 0, 0, ...Array.from({ length: 50 }, (_, i) => [L, i, i]).flat()];
    expect(decodePath(data, I, 0.01, 51)[0]?.pts.length).toBe(102);
    expect(() => decodePath(data, I, 0.01, 50)).toThrow(EngineError);
  });

  it("SR-05: a path that would exceed the vertex budget stops early with too_many_vertices", () => {
    const data = [M, 0, 0, ...Array.from({ length: 50 }, (_, i) => [L, i, i]).flat()];
    try {
      decodePath(data, I, 0.01, 10);
      expect.unreachable("expected the vertex budget to be enforced");
    } catch (error) {
      expect(error).toBeInstanceOf(EngineError);
      expect((error as EngineError).code).toBe("too_many_vertices");
    }
  });
});
