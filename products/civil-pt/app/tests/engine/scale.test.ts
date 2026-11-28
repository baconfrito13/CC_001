import { describe, expect, it } from "vitest";
import { EngineError } from "@/lib/engine/errors";
import { metersPerPoint, parseScaleRatio } from "@/lib/engine/scale";

describe("engine/scale", () => {
  it("US-03.1: at 1:100 a length of 100 pt is 3.528 m", () => {
    expect(100 * metersPerPoint(100)).toBeCloseTo(3.528, 3);
  });

  it("engine: one point is 25.4/72 mm of paper multiplied by the scale ratio", () => {
    expect(metersPerPoint(1)).toBeCloseTo(25.4 / 72 / 1000, 15);
    expect(metersPerPoint(500)).toBeCloseTo((25.4 / 72 / 1000) * 500, 12);
  });

  it("engine: /UserUnit multiplies the page unit", () => {
    expect(metersPerPoint(100, 2)).toBeCloseTo(2 * metersPerPoint(100), 15);
  });

  it("engine: accepts the whole 1:1 to 1:10000 range", () => {
    expect(parseScaleRatio(1)).toBe(1);
    expect(parseScaleRatio(10000)).toBe(10000);
    expect(parseScaleRatio(37.5)).toBe(37.5);
  });

  it.each([0, -100, Number.NaN, Number.POSITIVE_INFINITY, 10001, 0.99])(
    "engine: rejects the invalid scale ratio %s with the invalid_scale code",
    (value) => {
      expect(() => parseScaleRatio(value)).toThrow(EngineError);
      try {
        parseScaleRatio(value);
      } catch (error) {
        expect((error as EngineError).code).toBe("invalid_scale");
      }
    },
  );
});
