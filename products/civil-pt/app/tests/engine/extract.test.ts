import { describe, expect, it } from "vitest";
import { analyzeSheet } from "@/lib/engine/analyze";
import { EngineError } from "@/lib/engine/errors";
import { encodeGeometryPackage } from "@/lib/engine/package";
import { openPdf } from "@/lib/engine/pdf";
import { ElementKind } from "@/lib/engine/types";
import { Content, MM, PdfBuilder } from "../../fixtures/pdf-builder";
import {
  BLOCKS,
  blockInstances,
  LAYERS,
  layeredSheet,
  metresToPoints,
  offsetRotatedPage,
  openAndClosedShapes,
  PAGE_BOXES,
  SHAPES,
  SLABS,
  slabsWithHoles,
  vectorA2,
} from "../../fixtures/sheets";
import { elementsOf, FIXED_CLOCK } from "./support";

const analyse = (bytes: Uint8Array, scaleRatio = 100) =>
  analyzeSheet(bytes, { pageNo: 1, scaleRatio });

const codeOf = async (promise: Promise<unknown>): Promise<string> => {
  try {
    await promise;
  } catch (error) {
    return error instanceof EngineError ? error.code : `other:${String(error)}`;
  }
  return "no error";
};

describe("engine/extract: fill rules and holes (spike S6)", () => {
  it("engine: even-odd subpaths with holes subtract the hole area (spike S6)", async () => {
    const result = await analyse(slabsWithHoles());
    const elements = elementsOf(result);
    expect(elements).toHaveLength(5);
    expect(elements.map((e) => e.kind)).toEqual(Array(5).fill("polygon"));
    // (a) even-odd slab with a void, (b) non-zero same winding, (c) non-zero opposite winding,
    // (d) courtyard + island: two elements.
    expect(elements.map((e) => Math.round(e.area * 100) / 100)).toEqual([
      SLABS.evenOddHole,
      SLABS.nonZeroSameWinding,
      SLABS.nonZeroOppositeWinding,
      SLABS.islandOuter,
      SLABS.islandInner,
    ]);
    expect(elements.map((e) => e.rings)).toEqual([2, 1, 2, 2, 1]);
    expect(result.sheet.stats.holes).toBe(3);
  });

  it("engine: a hole's boundary counts towards the perimeter of the element", async () => {
    const [slab] = elementsOf(await analyse(slabsWithHoles()));
    // 10 m outer square (40 m) plus the 4 m hole (16 m).
    expect(slab?.length).toBeCloseTo(56, 2);
  });
});

describe("engine/extract: transformations and page boxes", () => {
  it("engine: block instances follow the form /Matrix and the cm that placed them", async () => {
    const lengths = elementsOf(await analyse(blockInstances())).map((e) => e.length);
    expect(lengths).toHaveLength(2);
    expect(lengths[0]).toBeCloseTo(BLOCKS.lineLengthM * BLOCKS.scaleFirst, 2);
    expect(lengths[1]).toBeCloseTo(BLOCKS.lineLengthM * BLOCKS.scaleSecond, 2);
  });

  it("engine: a page with an offset origin, /Rotate and /UserUnit measures in real-world metres", async () => {
    const result = await analyse(offsetRotatedPage());
    const [square] = elementsOf(result);
    expect(square?.area).toBeCloseTo(PAGE_BOXES.side ** 2, 1);
    expect(square?.length).toBeCloseTo(PAGE_BOXES.side * 4, 2);
    expect(result.sheet.page.userUnit).toBe(PAGE_BOXES.userUnit);
    expect(result.sheet.page.rotate).toBe(PAGE_BOXES.rotate);
    expect(result.sheet.page.view[0]).toBe(PAGE_BOXES.origin[0]);
    expect(result.sheet.page.view[1]).toBe(PAGE_BOXES.origin[1]);
    // Stored coordinates are relative to the page origin: the square was drawn 100 pt from it.
    expect(result.sheet.elements.coords[0]).toBeCloseTo(100, 3);
    expect(result.sheet.elements.coords[1]).toBeCloseTo(100, 3);
  });

  it("engine: the page size comes from the visible box, before rotation", async () => {
    const { sheet } = await analyse(vectorA2());
    expect(sheet.page.widthPt).toBeCloseTo(420 * MM, 2);
    expect(sheet.page.heightPt).toBeCloseTo(594 * MM, 2);
    expect(sheet.page.pageNo).toBe(1);
  });
});

describe("engine/extract: open and closed shapes", () => {
  it("engine: explicit close, return to start, s, and a fill are polygons; a 1 m gap stays a polyline", async () => {
    const elements = elementsOf(await analyse(openAndClosedShapes()));
    expect(elements.map((e) => e.kind)).toEqual([
      "polygon",
      "polygon",
      "polygon",
      "polyline",
      "polygon",
    ]);
    for (const polygon of elements.filter((e) => e.kind === "polygon")) {
      expect(polygon.area).toBeCloseTo(SHAPES.side ** 2, 2);
      expect(polygon.length).toBeCloseTo(4 * SHAPES.side, 2);
    }
    const open = elements[3];
    expect(open?.area).toBe(0);
    expect(open?.length).toBeCloseTo(3 * SHAPES.side + (SHAPES.side - SHAPES.gap), 2);
  });

  it("engine: endpoints within 5 cm close a polygon, endpoints 20 cm apart do not", async () => {
    const side = metresToPoints(5);
    const build = (gapMetres: number) =>
      new PdfBuilder()
        .addPage(
          { width: 600, height: 600 },
          new Content()
            .polyline([
              [100, 100],
              [100 + side, 100],
              [100 + side, 100 + side],
              [100, 100 + side],
              [100, 100 + metresToPoints(gapMetres)],
            ])
            .stroke(),
        )
        .build();
    expect((await analyse(build(0.04)).then(elementsOf))[0]?.kind).toBe("polygon");
    expect((await analyse(build(0.2)).then(elementsOf))[0]?.kind).toBe("polyline");
  });
});

describe("engine/extract: styles", () => {
  const sheetWith = (draw: (c: Content) => void) => {
    const c = new Content();
    draw(c);
    return new PdfBuilder().addPage({ width: 600, height: 600 }, c).build();
  };
  const styleCount = async (draw: (c: Content) => void) =>
    (await analyse(sheetWith(draw))).sheet.styles.length;

  it("engine: the same visible style drawn through different transforms is one style", async () => {
    const result = await analyse(
      sheetWith((c) => {
        c.strokeRgb(1, 0, 0).lineWidth(1).moveTo(0, 0).lineTo(100, 0).stroke();
        // Width 10 under a 0.1 scale is the same pen on paper.
        c.save()
          .scale(0.1)
          .lineWidth(10)
          .moveTo(0, 100)
          .lineTo(1000, 100)
          .stroke()
          .restore();
      }),
    );
    expect(result.sheet.styles).toHaveLength(1);
    expect(result.sheet.styles[0]).toMatchObject({
      stroke: "#ff0000",
      fill: null,
      widthPt: 1,
    });
  });

  it("engine: colour, width and dash each make a new style", async () => {
    expect(
      await styleCount((c) => {
        c.moveTo(0, 0).lineTo(10, 0).stroke();
        c.strokeRgb(1, 0, 0).moveTo(0, 5).lineTo(10, 5).stroke();
        c.lineWidth(2).moveTo(0, 10).lineTo(10, 10).stroke();
        c.dash([3, 1]).moveTo(0, 15).lineTo(10, 15).stroke();
      }),
    ).toBe(4);
  });

  it("engine: widths that differ only in rounding noise are one style", async () => {
    expect(
      await styleCount((c) => {
        c.lineWidth(0.35).moveTo(0, 0).lineTo(10, 0).stroke();
        c.lineWidth(0.3503).moveTo(0, 5).lineTo(10, 5).stroke();
      }),
    ).toBe(1);
  });

  it("engine: stroke only, fill only and both are three styles; fill-only ignores the pen width", async () => {
    const result = await analyse(
      sheetWith((c) => {
        c.strokeRgb(0, 0, 1).fillRgb(1, 1, 0);
        c.rect(0, 0, 10, 10).stroke();
        c.lineWidth(3).rect(20, 0, 10, 10).fill();
        c.lineWidth(0.5).rect(40, 0, 10, 10).fill();
        c.lineWidth(1).rect(60, 0, 10, 10).fillStroke();
      }),
    );
    const styles = result.sheet.styles;
    expect(styles).toHaveLength(3);
    expect(styles.map((s) => [s.stroke, s.fill])).toEqual([
      ["#0000ff", null],
      [null, "#ffff00"],
      ["#0000ff", "#ffff00"],
    ]);
  });

  it("engine: gray and CMYK colours are reduced to hex like RGB ones", async () => {
    const result = await analyse(
      sheetWith((c) => {
        c.strokeGray(0.5).moveTo(0, 0).lineTo(10, 0).stroke();
        c.strokeCmyk(0, 0, 0, 1).moveTo(0, 5).lineTo(10, 5).stroke();
      }),
    );
    expect(result.sheet.styles[0]?.stroke).toBe("#808080");
    expect(result.sheet.styles[1]?.stroke).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("engine: a dash pattern is kept in page points with its phase", async () => {
    const result = await analyse(
      sheetWith((c) => {
        c.dash([6, 2], 1).moveTo(0, 0).lineTo(10, 0).stroke();
      }),
    );
    expect(result.sheet.styles[0]).toMatchObject({ dash: [6, 2], dashPhase: 1 });
  });
});

describe("engine/extract: layers and degenerate content", () => {
  it("engine: content in a layer that is off by default is not measured", async () => {
    const result = await analyse(layeredSheet());
    const lengths = elementsOf(result).map((e) => Math.round(e.length * 100) / 100);
    expect(lengths).toEqual([LAYERS.visibleLengthM, LAYERS.plainLengthM]);
    expect(result.sheet.stats.hiddenPaths).toBe(1);
  });

  it("engine: zero-length lines and collinear fills are counted as degenerate, not measured", async () => {
    const c = new Content();
    c.moveTo(10, 10).lineTo(10, 10).stroke();
    c.fillRgb(0, 0, 0)
      .polyline([
        [0, 0],
        [50, 0],
        [100, 0],
      ])
      .fill();
    c.moveTo(5, 5).stroke();
    const result = await analyse(
      new PdfBuilder().addPage({ width: 200, height: 200 }, c).build(),
    );
    expect(result.sheet.elements.count).toBe(0);
    expect(result.sheet.stats.degenerateSubpaths).toBeGreaterThanOrEqual(2);
  });

  it("engine: clipping is counted but never applied", async () => {
    const c = new Content();
    c.rect(0, 0, 10, 10).clip();
    c.moveTo(0, 0).lineTo(100, 0).stroke();
    const result = await analyse(
      new PdfBuilder().addPage({ width: 200, height: 200 }, c).build(),
    );
    expect(result.sheet.stats.clipOperations).toBe(1);
    expect(result.sheet.elements.count).toBe(1);
    expect(result.sheet.elements.kind[0]).toBe(ElementKind.polyline);
  });
});

describe("engine/extract: limits and errors (SR-05)", () => {
  it("SR-05: the element cap is enforced with too_many_elements", async () => {
    const code = await codeOf(
      analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100, maxElements: 2 }),
    );
    expect(code).toBe("too_many_elements");
    expect(
      await codeOf(
        analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100, maxElements: 3 }),
      ),
    ).toBe("no error");
  });

  it("SR-05: the vertex cap is enforced with too_many_vertices", async () => {
    expect(
      await codeOf(
        analyzeSheet(vectorA2(), { pageNo: 1, scaleRatio: 100, maxVertices: 10 }),
      ),
    ).toBe("too_many_vertices");
  });

  it("SR-05: the time budget is enforced with an injected clock", async () => {
    let t = 0;
    const clock = () => {
      t += 100;
      return t;
    };
    expect(
      await codeOf(
        analyzeSheet(vectorA2(), {
          pageNo: 1,
          scaleRatio: 100,
          deadlineMs: 50,
          now: clock,
        }),
      ),
    ).toBe("timeout");
  });

  it("engine: a scale outside 1:1 to 1:10000 is invalid_scale", async () => {
    expect(await codeOf(analyse(vectorA2(), 0))).toBe("invalid_scale");
    expect(await codeOf(analyse(vectorA2(), 20000))).toBe("invalid_scale");
  });

  it("engine: a page that does not exist is page_out_of_range", async () => {
    expect(await codeOf(analyzeSheet(vectorA2(), { pageNo: 2, scaleRatio: 100 }))).toBe(
      "page_out_of_range",
    );
    expect(await codeOf(analyzeSheet(vectorA2(), { pageNo: 0, scaleRatio: 100 }))).toBe(
      "page_out_of_range",
    );
    expect(await codeOf(analyzeSheet(vectorA2(), { pageNo: 1.5, scaleRatio: 100 }))).toBe(
      "page_out_of_range",
    );
  });

  it("engine: bytes that are not a PDF are invalid_pdf", async () => {
    expect(await codeOf(analyse(new TextEncoder().encode("this is not a pdf")))).toBe(
      "invalid_pdf",
    );
    expect(await codeOf(analyse(new Uint8Array(0)))).toBe("invalid_pdf");
  });

  it("engine: openPdf does not detach or alter the caller's buffer", async () => {
    const bytes = vectorA2();
    const copy = bytes.slice();
    const opened = await openPdf(bytes);
    await opened.destroy();
    expect(bytes.byteLength).toBe(copy.byteLength);
    expect(Buffer.from(bytes).equals(Buffer.from(copy))).toBe(true);
  });
});

describe("engine/extract: determinism", () => {
  it("engine: the same PDF gives byte-identical geometry (reprocessing is free and stable)", async () => {
    const run = async () => {
      const r = await analyzeSheet(slabsWithHoles(), {
        pageNo: 1,
        scaleRatio: 100,
        now: FIXED_CLOCK,
      });
      return Buffer.from(encodeGeometryPackage(r.sheet, r.assignment));
    };
    expect((await run()).equals(await run())).toBe(true);
  });
});

describe("engine/extract: graphics state", () => {
  const page =
    (c: Content, resources = {}) =>
    (builder: PdfBuilder) =>
      builder.addPage({ width: 600, height: 600 }, c, resources);

  it("engine: q and Q restore the stroke colour and width", async () => {
    const c = new Content().strokeRgb(1, 0, 0).lineWidth(2);
    c.save()
      .strokeRgb(0, 0, 1)
      .lineWidth(4)
      .moveTo(0, 0)
      .lineTo(10, 0)
      .stroke()
      .restore();
    c.moveTo(0, 5).lineTo(10, 5).stroke();
    const result = await analyse(page(c)(new PdfBuilder()).build());
    expect(result.sheet.styles.map((s) => [s.stroke, s.widthPt])).toEqual([
      ["#0000ff", 4],
      ["#ff0000", 2],
    ]);
  });

  it("engine: a form XObject cannot leak its colour into the page", async () => {
    const builder = new PdfBuilder();
    const form = builder.addForm(
      [0, 0, 100, 100],
      new Content().strokeRgb(0, 0, 1).moveTo(0, 0).lineTo(10, 0).stroke(),
    );
    const c = new Content()
      .strokeRgb(1, 0, 0)
      .paintXObject("F")
      .moveTo(0, 5)
      .lineTo(10, 5)
      .stroke();
    builder.addPage({ width: 600, height: 600 }, c, { xobjects: { F: form } });
    const result = await analyse(builder.build());
    expect(elementsOf(result).map((e) => e.stroke)).toEqual(["#0000ff", "#ff0000"]);
  });

  it("engine: an ExtGState can set the line width and the dash pattern", async () => {
    const builder = new PdfBuilder();
    const gs = builder.addGraphicsState("/LW 2.5 /D [[4 1] 0]");
    const c = new Content().setGraphicsState("GS1").moveTo(0, 0).lineTo(10, 0).stroke();
    builder.addPage({ width: 600, height: 600 }, c, { graphicsStates: { GS1: gs } });
    const result = await analyse(builder.build());
    expect(result.sheet.styles[0]).toMatchObject({
      widthPt: 2.5,
      dash: [4, 1],
      dashPhase: 0,
    });
  });

  it("engine: a small closed shape keeps all its vertices (the 5 cm tolerance is for open paths)", async () => {
    // A 4 cm x 4 cm square at 1:100: the last vertex is 4 cm from the first, inside the tolerance.
    const side = metresToPoints(0.04);
    const c = new Content()
      .polyline([
        [100, 100],
        [100 + side, 100],
        [100 + side, 100 + side],
        [100, 100 + side],
      ])
      .closePath()
      .stroke();
    const result = await analyse(
      new PdfBuilder().addPage({ width: 600, height: 600 }, c).build(),
    );
    const [square] = elementsOf(result);
    expect(square?.kind).toBe("polygon");
    expect(square?.area).toBeCloseTo(0.04 * 0.04, 5);
    expect(result.sheet.stats.vertices).toBe(4);
  });

  it("engine: analyzes the requested page of a multi-page PDF", async () => {
    const builder = new PdfBuilder();
    builder.addPage(
      { width: 600, height: 600 },
      new Content().strokeRgb(1, 0, 0).moveTo(0, 0).lineTo(100, 0).stroke(),
    );
    builder.addPage(
      { width: 600, height: 600 },
      new Content()
        .strokeRgb(0, 0, 1)
        .rect(0, 0, 50, 50)
        .stroke()
        .moveTo(0, 0)
        .lineTo(5, 5)
        .stroke(),
    );
    const bytes = builder.build();
    const first = await analyzeSheet(bytes, { pageNo: 1, scaleRatio: 100 });
    const second = await analyzeSheet(bytes, { pageNo: 2, scaleRatio: 100 });
    expect(first.sheet.elements.count).toBe(1);
    expect(second.sheet.elements.count).toBe(2);
    expect(second.sheet.page.pageNo).toBe(2);
  });

  it("engine: more rings in one path than the nesting budget are measured separately and reported", async () => {
    const c = new Content().fillRgb(0, 0, 0);
    for (let i = 0; i < 5001; i++) c.rect((i % 100) * 5, Math.floor(i / 100) * 5, 3, 3);
    c.fill();
    const result = await analyse(
      new PdfBuilder({ compress: true }).addPage({ width: 600, height: 600 }, c).build(),
    );
    expect(result.sheet.elements.count).toBe(5001);
    expect(result.sheet.stats.nestingSkippedPaths).toBe(1);
  });
});
