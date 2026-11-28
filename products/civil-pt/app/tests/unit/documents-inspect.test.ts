import { describe, expect, it } from "vitest";
import { Content, MM, PdfBuilder } from "../../fixtures/pdf-builder";
import { vectorA2 } from "../../fixtures/sheets";
import { passwordProtected, rasterOnly } from "../../fixtures/sheets";
import { hasPdfHeader, inspectPdf } from "@/lib/documents/inspect";

const A3 = { width: 420 * MM, height: 297 * MM };

/** A multi-page sheet set whose pages carry the given title-block texts. */
function sheetSet(texts: (string | null)[], extra: { padding?: number } = {}): Uint8Array {
  const builder = new PdfBuilder();
  const font = builder.addFont();
  if (extra.padding) builder.addPadding(extra.padding);
  for (const text of texts) {
    const content = new Content().strokeGray(0).lineWidth(0.5).rect(20, 20, 200, 100).stroke();
    if (text !== null) content.text(30, 40, 10, text);
    builder.addPage(A3, content, { fonts: { F1: font } });
  }
  return builder.build();
}

describe("inspectPdf (US-02, US-03)", () => {
  it("US-02.1: counts the pages and reports each page size", async () => {
    const result = await inspectPdf(sheetSet([null, null, null, null]), { maxPages: 40 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pageCount).toBe(4);
    expect(result.sheets.map((s) => s.pageNo)).toEqual([1, 2, 3, 4]);
    expect(result.sheets[0]).toMatchObject({ widthPt: 1190.55, heightPt: 841.89 });
  });

  it("US-03.1: reads the scale of each page from its text and marks it detected", async () => {
    const result = await inspectPdf(
      sheetSet(["PLANTA PISO 0   ESC. 1/100", "ESCALA 1:50", null, "ESC. 1/100 e ESC. 1/20"]),
      { maxPages: 40 },
    );
    if (!result.ok) throw new Error("expected a readable PDF");
    expect(result.sheets.map((s) => [s.scaleRatio, s.scaleSource])).toEqual([
      [100, "detected"],
      [50, "detected"],
      [null, null],
      [null, null], // two scales on one page: ambiguous, the user chooses
    ]);
  });

  it("US-03.2: a sheet without scale text has no scale", async () => {
    const result = await inspectPdf(vectorA2(), { maxPages: 40 });
    if (!result.ok) throw new Error("expected a readable PDF");
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0]).toMatchObject({ scaleRatio: null, scaleSource: null });
  });

  it("US-02.3: more pages than allowed is refused with reason 'pages', before reading any page", async () => {
    const result = await inspectPdf(sheetSet(Array(45).fill(null)), { maxPages: 40 });
    expect(result).toEqual({ ok: false, reason: "pages" });
    expect((await inspectPdf(sheetSet(Array(40).fill(null)), { maxPages: 40 })).ok).toBe(true);
  });

  it("US-02.3: text, an Office file, a truncated PDF and a protected PDF are refused with reason 'type'", async () => {
    const encoder = new TextEncoder();
    const whole = sheetSet([null]);
    for (const bad of [
      encoder.encode("not a pdf at all"),
      encoder.encode("PK\u0003\u0004 zip container"),
      new Uint8Array(0),
      whole.slice(0, 200), // truncated: header only
      new Uint8Array([...encoder.encode("%PDF-1.7\n"), ...new Uint8Array(50).fill(7)]),
      passwordProtected(),
    ]) {
      expect(await inspectPdf(bad, { maxPages: 40 })).toEqual({ ok: false, reason: "type" });
    }
  });

  it("accepts a raster-only PDF at upload time: processing, not upload, refuses it (US-04.2)", async () => {
    const result = await inspectPdf(rasterOnly(), { maxPages: 40 });
    expect(result.ok).toBe(true);
  });

  it("hasPdfHeader looks only at the first five bytes", () => {
    expect(hasPdfHeader(new TextEncoder().encode("%PDF-1.4"))).toBe(true);
    expect(hasPdfHeader(new TextEncoder().encode(" %PDF-1.4"))).toBe(false);
    expect(hasPdfHeader(new TextEncoder().encode("%PDF"))).toBe(false);
  });

  it("US-02.2: a large file (the size is padding, not pages) is read quickly", async () => {
    const big = sheetSet(Array(38).fill("ESC. 1/200"), { padding: 20 * 1024 * 1024 });
    expect(big.byteLength).toBeGreaterThan(20 * 1024 * 1024);
    const started = Date.now();
    const result = await inspectPdf(big, { maxPages: 40 });
    if (!result.ok) throw new Error("expected a readable PDF");
    expect(result.pageCount).toBe(38);
    expect(result.sheets.every((s) => s.scaleRatio === 200)).toBe(true);
    expect(Date.now() - started).toBeLessThan(20_000);
  });
});
