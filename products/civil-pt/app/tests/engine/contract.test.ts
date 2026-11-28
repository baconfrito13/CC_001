import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeSheet } from "@/lib/engine/analyze";
import { EngineError } from "@/lib/engine/errors";
import { DRAW } from "@/lib/engine/path";
import {
  DOCUMENT_OPTIONS,
  mapOpenError,
  openPdf,
  PDFJS_VERSION,
  pdfjs,
} from "@/lib/engine/pdf";
import { passwordProtected } from "../../fixtures/sheets";

const root = path.resolve(import.meta.dirname, "../..");
const read = (relative: string): string =>
  readFileSync(path.join(root, relative), "utf8");
/** The flat Float32Array inside a `constructPath` argument list. */
function pathData(args: unknown[] | undefined): Float32Array {
  const data = ((args ?? [])[1] as unknown[] | undefined)?.[0];
  if (!(data instanceof Float32Array)) throw new Error("constructPath has no path data");
  return data;
}
const fixture = (name: string): Uint8Array =>
  new Uint8Array(readFileSync(path.join(root, "fixtures", name)));

/**
 * Contract with pdfjs-dist (ADR 0005, rule 1). The engine reads an internal format of the
 * library (the `constructPath` operator and the path operation codes), which has changed between
 * majors. An upgrade that breaks the format must fail here, not in a customer's sheet.
 */
describe("contract: pdfjs-dist 6.5.438", () => {
  it("contract: package.json pins pdfjs-dist exactly and the installed version is the tested one", () => {
    const manifest = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
    };
    expect(manifest.dependencies["pdfjs-dist"]).toBe("6.5.438");
    expect(PDFJS_VERSION).toBe("6.5.438");
    const installed = JSON.parse(read("node_modules/pdfjs-dist/package.json")) as {
      version: string;
    };
    expect(installed.version).toBe(PDFJS_VERSION);
    expect(pdfjs.version).toBe(PDFJS_VERSION);
  });

  it("contract: every operator the extractor switches on exists in OPS", () => {
    const used = [
      "save",
      "restore",
      "transform",
      "constructPath",
      "paintFormXObjectBegin",
      "paintFormXObjectEnd",
      "beginGroup",
      "endGroup",
      "setLineWidth",
      "setDash",
      "setGState",
      "setStrokeRGBColor",
      "setFillRGBColor",
      "setStrokeColorN",
      "setFillColorN",
      "setStrokeColor",
      "setFillColor",
      "setStrokeTransparent",
      "setFillTransparent",
      "stroke",
      "closeStroke",
      "fill",
      "eoFill",
      "fillStroke",
      "eoFillStroke",
      "closeFillStroke",
      "closeEOFillStroke",
      "endPath",
      "clip",
      "eoClip",
      "beginMarkedContent",
      "beginMarkedContentProps",
      "endMarkedContent",
      "paintImageXObject",
      "paintInlineImageXObject",
      "paintImageMaskXObject",
      "paintImageXObjectRepeat",
      "paintImageMaskXObjectRepeat",
      "paintImageMaskXObjectGroup",
      "paintInlineImageXObjectGroup",
    ];
    const ops = pdfjs.OPS as Record<string, number>;
    for (const name of used) expect(typeof ops[name], name).toBe("number");
  });

  it("contract: constructPath is [paint operator, [Float32Array of draw ops and coordinates], bounding box]", async () => {
    const opened = await openPdf(fixture("vector-a2.pdf"));
    try {
      const page = await opened.document.getPage(1);
      const list = await page.getOperatorList({
        intent: "display",
        annotationMode: pdfjs.AnnotationMode.DISABLE,
      });
      const paths = list.fnArray.flatMap((fn, index) =>
        fn === pdfjs.OPS.constructPath ? [list.argsArray[index] as unknown[]] : [],
      );
      expect(paths).toHaveLength(3);
      for (const args of paths) {
        expect(args[0]).toBe(pdfjs.OPS.stroke);
        const data = (args[1] as unknown[])[0];
        expect(data).toBeInstanceOf(Float32Array);
        expect(args[2]).toBeInstanceOf(Float32Array);
      }
      // The rectangle: moveTo, three lineTo and a closePath (13 numbers).
      const rectangle = Array.from(pathData(paths[0]));
      expect(rectangle).toHaveLength(13);
      expect([
        rectangle[0],
        rectangle[3],
        rectangle[6],
        rectangle[9],
        rectangle[12],
      ]).toEqual([DRAW.moveTo, DRAW.lineTo, DRAW.lineTo, DRAW.lineTo, DRAW.closePath]);
      // The circle: a moveTo, four curveTo and a closePath.
      const circle = Array.from(pathData(paths[2]));
      expect(
        circle.filter((v, i) => v === DRAW.curveTo && (i - 3) % 7 === 0),
      ).toHaveLength(4);
      expect(circle[0]).toBe(DRAW.moveTo);
      expect(circle.at(-1)).toBe(DRAW.closePath);
    } finally {
      await opened.destroy();
    }
  });

  it("contract: pdfjs-dist 6.5.438 gives exact totals for a fixed PDF", async () => {
    const result = await analyzeSheet(fixture("vector-a2.pdf"), {
      pageNo: 1,
      scaleRatio: 100,
    });
    const [rectangle, polyline, circle] = Array.from(
      { length: result.sheet.elements.count },
      (_, e) => ({
        area: result.sheet.elements.area[e] as number,
        length: result.sheet.elements.length[e] as number,
      }),
    );
    expect(result.sheet.elements.count).toBe(3);
    expect(rectangle?.area).toBeCloseTo(102.3, 3);
    expect(rectangle?.length).toBeCloseTo(41.3, 3);
    expect(polyline?.length).toBeCloseTo(40, 3);
    expect(circle?.length).toBeCloseTo(9.4243, 3);
    expect(circle?.area).toBeCloseTo(7.0651, 3);
    expect(result.sheet.page.widthPt).toBeCloseTo(1190.551, 2);
    expect(result.sheet.page.heightPt).toBeCloseTo(1683.78, 2);
  });

  it("contract: an encrypted-looking or damaged PDF is rejected with an EngineError, never a raw pdf.js error", async () => {
    const damaged = fixture("vector-a2.pdf").slice(0, 120);
    await expect(openPdf(damaged)).rejects.toBeInstanceOf(EngineError);
    const password = new Error("No password given");
    password.name = "PasswordException";
    expect(mapOpenError(password).code).toBe("encrypted");
    expect(mapOpenError(new Error("boom")).code).toBe("invalid_pdf");
  });

  it("contract: a password-protected PDF is refused as encrypted by the real library", async () => {
    const error = await openPdf(passwordProtected()).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(EngineError);
    expect((error as EngineError).code).toBe("encrypted");
  });
});

/** SR-05: the PDF is untrusted input. */
describe("SR-05: pdfjs-dist is used without eval and without host access", () => {
  it("SR-05: the installed pdfjs-dist build contains no eval or Function constructor", () => {
    // pdfjs-dist 6 removed `isEvalSupported`; this scan replaces the option and fails if a future
    // version brings an eval path back.
    for (const file of ["legacy/build/pdf.mjs", "legacy/build/pdf.worker.mjs"]) {
      const source = read(path.join("node_modules/pdfjs-dist", file));
      expect(source, file).not.toMatch(/\beval\s*\(/);
      expect(source, file).not.toMatch(/new\s+Function\s*\(/);
    }
  });

  it("SR-05: documents are opened without system fonts, XFA, host fetching or chatty logging", () => {
    expect(DOCUMENT_OPTIONS).toMatchObject({
      useSystemFonts: false,
      enableXfa: false,
      useWorkerFetch: false,
      disableFontFace: true,
      verbosity: pdfjs.VerbosityLevel.ERRORS,
    });
    expect(DOCUMENT_OPTIONS.maxImageSize).toBeGreaterThan(0);
    // `isEvalSupported` is not a pdfjs-dist 6 option: it must not be passed (it would hide the removal).
    expect(Object.keys(DOCUMENT_OPTIONS)).not.toContain("isEvalSupported");
  });

  it("SR-05: the engine never creates a canvas (the optional native canvas package is unused)", () => {
    // pdf.js loads @napi-rs/canvas lazily, only in NodeCanvasFactory._createCanvas.
    const engineSources = [
      "analyze",
      "extract",
      "pdf",
      "package",
      "grouping",
      "path",
    ].map((name) => read(`src/lib/engine/${name}.ts`));
    for (const source of engineSources) {
      expect(source).not.toMatch(/napi-rs|createCanvas|getContext|\.render\(/);
    }
  });
});

describe("contract: the pdf.js worker is preloaded", () => {
  it("contract: globalThis.pdfjsWorker holds the worker's message handler, so no worker path is looked up at run time", () => {
    const holder = globalThis as { pdfjsWorker?: { WorkerMessageHandler?: unknown } };
    expect(typeof holder.pdfjsWorker?.WorkerMessageHandler).toBe("function");
  });

  it("engine: the modules the viewer imports in the browser pull in neither pdfjs-dist nor Node built-ins", () => {
    const seen = new Set<string>();
    const visit = (name: string): void => {
      if (seen.has(name)) return;
      seen.add(name);
      const source = read(`src/lib/engine/${name}.ts`);
      expect(source, name).not.toMatch(/from "(pdfjs-dist|node:|fs|path|zlib)/);
      for (const match of source.matchAll(/from "\.\/([a-z-]+)"/g))
        visit(match[1] as string);
    };
    for (const name of ["package", "types", "grouping", "table", "metrics"]) visit(name);
    expect([...seen].sort()).toEqual([
      "errors",
      "grouping",
      "metrics",
      "package",
      "table",
      "types",
    ]);
  });
});

describe("contract: Next.js keeps pdf.js out of the server bundle", () => {
  it("contract: next.config marks pdfjs-dist as a server external package (a bundled copy cannot find its worker)", async () => {
    const { default: config } = await import("../../next.config");
    expect(config.serverExternalPackages).toContain("pdfjs-dist");
  });
});
