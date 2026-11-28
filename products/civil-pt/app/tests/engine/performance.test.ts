import { beforeAll, describe, expect, it } from "vitest";
import { analyzeSheet, type SheetAnalysis } from "@/lib/engine/analyze";
import { NO_GROUP } from "@/lib/engine/types";
import { evenSheet50k, PENS } from "../../fixtures/sheets";

const RUNS = 20;
const BUDGET_MS = 90_000;

function percentile(values: readonly number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)] as number;
}

describe("US-04.3: a sheet with 50 000 elements in 6 styles", () => {
  let pdf: Uint8Array;
  beforeAll(() => {
    pdf = evenSheet50k();
  });

  it("US-04.3: 50,000 elements in 6 styles give at most 6 groups per kind; p95 <= 90 s over 20 runs", async () => {
    const timings: number[] = [];
    let last: SheetAnalysis | undefined;
    for (let run = 0; run < RUNS; run++) {
      const started = performance.now();
      last = await analyzeSheet(pdf, { pageNo: 1, scaleRatio: 100 });
      timings.push(performance.now() - started);
    }
    expect(last?.sheet.elements.count).toBe(50_000);
    expect(last?.outcome).toBe("ready");

    const groups = last?.assignment.groups ?? [];
    const perKind = (kind: string) => groups.filter((g) => g.kind === kind).length;
    expect(perKind("polygon")).toBeLessThanOrEqual(PENS.length);
    expect(perKind("polyline")).toBeLessThanOrEqual(PENS.length);
    expect(groups.length).toBeLessThanOrEqual(2 * PENS.length);
    // Not 50 000 rows: every element belongs to one of those few groups.
    expect(groups.reduce((sum, g) => sum + g.count, 0)).toBe(50_000);
    expect(Array.from(last?.assignment.groupOf ?? []).some((g) => g === NO_GROUP)).toBe(
      false,
    );

    expect(percentile(timings, 0.95)).toBeLessThanOrEqual(BUDGET_MS);
  }, 600_000);

  it("US-04.3: the 50 000 element sheet stays within the 20 MB budget as a package", async () => {
    const { encodeGeometryPackage, gzipPackage } = await import("@/lib/engine/package");
    const result = await analyzeSheet(pdf, { pageNo: 1, scaleRatio: 100 });
    const gzipped = await gzipPackage(
      encodeGeometryPackage(result.sheet, result.assignment),
    );
    // The geometry bucket takes at most 50 MB per file (Supabase Storage limit, ADR 0005).
    expect(gzipped.length).toBeLessThan(10 * 1024 * 1024);
  }, 120_000);
});
