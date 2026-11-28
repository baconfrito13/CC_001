import { describe, expect, it } from "vitest";
import { metersPerPoint } from "@/lib/engine";
import {
  detectScale,
  formatScale,
  MAX_SCALE_RATIO,
  MIN_SCALE_RATIO,
  parseScaleRatio,
  SCALE_PRESETS,
} from "@/lib/scale";

describe("detectScale (US-03)", () => {
  it("US-03.1: reads 'ESC. 1/100' from the title block as 1:100", () => {
    expect(detectScale("PLANTA DO PISO 0 ESC. 1/100 DATA 2026-03")).toEqual({
      ratio: 100,
    });
  });

  it("US-03.1: 100 pt of the PDF are 3.528 m at 1:100 (±0.001 m)", () => {
    const detected = detectScale("ESC. 1/100");
    expect(detected).not.toBeNull();
    expect(100 * metersPerPoint(detected?.ratio ?? 0)).toBeCloseTo(3.528, 3);
  });

  it.each([
    ["ESC. 1/100", 100],
    ["ESC 1:50", 50],
    ["Esc.: 1/200", 200],
    ["ESCALA 1:500", 500],
    ["Escala: 1 / 25", 25],
    ["escala de 1/75", 75],
    ["Escalas 1:100", 100],
    ["SCALE 1:20", 20],
    ["Scale: 1 : 1000", 1000],
    ["Planta ESC.1/100 (A1)", 100],
  ])("reads %j as 1:%i", (text, ratio) => {
    expect(detectScale(text)).toEqual({ ratio });
  });

  it("works on text items joined with spaces or line breaks", () => {
    expect(detectScale("ESC.\n1/100")).toEqual({ ratio: 100 });
    expect(detectScale("ESCALA   \t 1:200")).toEqual({ ratio: 200 });
  });

  it("returns null when the page has no scale text", () => {
    expect(detectScale("")).toBeNull();
    expect(detectScale("Planta de implantação. Folha 1/10. Data 28/11/2026")).toBeNull();
  });

  it("does not take a sheet number or a date for a scale: a keyword is required for 1/N", () => {
    expect(detectScale("FOLHA 1/100")).toBeNull();
    expect(detectScale("1/100")).toBeNull();
    expect(detectScale("Desenho 3 de 100")).toBeNull();
  });

  it("accepts a bare '1:N' only when it is the single candidate and N is a drawing scale", () => {
    expect(detectScale("PLANTA 1:100")).toEqual({ ratio: 100 });
    expect(detectScale("PLANTA 1:100 PORMENOR 1:20")).toBeNull();
    expect(detectScale("RAZÃO 1:7")).toBeNull();
    expect(detectScale("HORA 1:30")).toBeNull();
  });

  it("prefers keyword matches over bare ones", () => {
    expect(detectScale("ESC. 1/100 (detalhe 1:20)")).toEqual({ ratio: 100 });
  });

  it("is ambiguous (null) when several different scales are announced, never a guess", () => {
    expect(detectScale("ESC. 1/100  ESC. 1/20 PORMENOR")).toBeNull();
    expect(detectScale("ESCALAS 1/100 e ESCALA 1/50")).toBeNull();
  });

  it("is not ambiguous when the same scale is repeated", () => {
    expect(detectScale("ESC. 1/100 ... ESC. 1:100")).toEqual({ ratio: 100 });
  });

  it("ignores values outside 1:1 to 1:10000 and does not truncate longer numbers", () => {
    expect(detectScale("ESC. 1/0")).toBeNull();
    expect(detectScale("ESC. 1/10001")).toBeNull();
    expect(detectScale("ESC. 1/100000")).toBeNull();
    expect(detectScale("ESC. 1/10000")).toEqual({ ratio: 10_000 });
    expect(detectScale("ESC. 1/1")).toEqual({ ratio: 1 });
    expect(detectScale("ESC. 1/1000")).toEqual({ ratio: 1000 });
  });

  it("bounds the work on hostile text", () => {
    const hostile = `${"ESC. ".repeat(200_000)}1/100`;
    const started = Date.now();
    detectScale(hostile);
    expect(Date.now() - started).toBeLessThan(2_000);
  });
});

describe("parseScaleRatio (US-03.2: 1:1 to 1:10000)", () => {
  it("accepts whole numbers in range, as numbers or numeric strings", () => {
    expect(parseScaleRatio(100)).toBe(100);
    expect(parseScaleRatio("50")).toBe(50);
    expect(parseScaleRatio(" 200 ")).toBe(200);
    expect(parseScaleRatio(MIN_SCALE_RATIO)).toBe(1);
    expect(parseScaleRatio(MAX_SCALE_RATIO)).toBe(10_000);
  });

  it.each([
    0,
    -1,
    10_001,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    "",
    "abc",
    "1e3",
    null,
    undefined,
    {},
  ])("rejects %j", (value) => {
    expect(parseScaleRatio(value)).toBeNull();
  });

  it("offers the presets of the PRD and formats a ratio as 1:N", () => {
    expect([...SCALE_PRESETS]).toEqual([50, 100, 200, 500]);
    expect(formatScale(100)).toBe("1:100");
  });
});
