import { EngineError } from "./errors";

/** 1 pt is 1/72 inch; 1 inch is 25.4 mm. */
const MILLIMETRES_PER_POINT = 25.4 / 72;

export const MIN_SCALE_RATIO = 1;
export const MAX_SCALE_RATIO = 10_000;

/**
 * Real-world metres for one PDF point on a sheet drawn at 1:`ratio`.
 * `userUnit` is the page's `/UserUnit` (default 1): a page unit of 1/72 inch times that number.
 */
export function metersPerPoint(ratio: number, userUnit = 1): number {
  return (MILLIMETRES_PER_POINT / 1000) * ratio * userUnit;
}

/** The denominator of a 1:N scale, validated against the range the product accepts (US-03). */
export function parseScaleRatio(value: number): number {
  if (!Number.isFinite(value) || value < MIN_SCALE_RATIO || value > MAX_SCALE_RATIO) {
    throw new EngineError(
      "invalid_scale",
      `Scale ratio must be between ${MIN_SCALE_RATIO} and ${MAX_SCALE_RATIO}`,
    );
  }
  return value;
}
