/**
 * `npm run ggeo -- [--scale 100] <pdf-or-folder>...`: the G-GEO gate script (PRD §5.2, ADR 0006).
 *
 * Runs the real measurement engine over PDF files and prints, per page, metrics M1 to M4, M6
 * and M9, then evaluates the criteria C1 to C5 and the outcome (A, B, inconclusive, or a
 * format problem). A folder is one procedure per sub-folder (C1 wants at least 6); a lone file
 * is its own procedure. Files stay wherever they are: nothing is copied or uploaded, and real
 * tender drawings must never be committed (ADR 0006).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { interpretSheet } from "../src/lib/engine/analyze.ts";
import { extractPage } from "../src/lib/engine/extract.ts";
import { openPdf } from "../src/lib/engine/pdf.ts";

interface Row {
  procedure: string;
  file: string;
  page: number;
  widthMm: number;
  heightMm: number;
  elements: number;
  styles: number;
  topShare: number;
  groupsFor90: number;
  closedShare: number;
  images: number;
  imageAreaShare: number;
  ms: number;
}

const args = process.argv.slice(2);
let scale = 100;
const targets: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scale") scale = Number(args[++i]);
  else targets.push(args[i] as string);
}
if (targets.length === 0) {
  console.error("usage: npm run ggeo -- [--scale 100] <pdf-or-folder>...");
  process.exit(2);
}

function collect(
  target: string,
  procedure: string | null,
): Array<{ file: string; procedure: string }> {
  if (statSync(target).isFile()) {
    return target.toLowerCase().endsWith(".pdf")
      ? [{ file: target, procedure: procedure ?? path.basename(target) }]
      : [];
  }
  return readdirSync(target)
    .sort()
    .flatMap((name) => {
      const child = path.join(target, name);
      return collect(child, procedure ?? (statSync(child).isDirectory() ? name : null));
    });
}

const ptToMm = 25.4 / 72;
const rows: Row[] = [];
for (const target of targets) {
  for (const { file, procedure } of collect(target, null)) {
    const opened = await openPdf(new Uint8Array(readFileSync(file)));
    try {
      for (let page = 1; page <= opened.numPages; page++) {
        const sheet = await extractPage(opened.document, page, { scaleRatio: scale });
        const { metrics } = interpretSheet(sheet);
        rows.push({
          procedure,
          file: path.basename(file),
          page,
          widthMm: Math.round(sheet.page.widthPt * ptToMm),
          heightMm: Math.round(sheet.page.heightPt * ptToMm),
          elements: metrics.elements,
          styles: metrics.styles,
          topShare: metrics.topStyleShare,
          groupsFor90: metrics.groupsFor90,
          closedShare: metrics.closedShare,
          images: metrics.images,
          imageAreaShare: sheet.stats.imageAreaShare,
          ms: Math.round(sheet.stats.durationMs),
        });
      }
    } finally {
      await opened.destroy();
    }
  }
}

// A drawing sheet is A3 or larger (to 5 mm); smaller pages are written pieces, whatever they hold.
const isDrawingSheet = (r: Row): boolean =>
  Math.max(r.widthMm, r.heightMm) >= 415 && Math.min(r.widthMm, r.heightMm) >= 292;
const isRaster = (r: Row): boolean =>
  r.elements < 100 && r.images > 0 && r.imageAreaShare >= 0.5;
const isVector = (r: Row): boolean => r.elements >= 100 && !isRaster(r);

console.log(
  [
    "procedure",
    "file",
    "page",
    "mm",
    "elements",
    "styles",
    "top%",
    "g90",
    "closed%",
    "images",
    "ms",
  ].join("\t"),
);
for (const r of rows) {
  console.log(
    [
      r.procedure,
      r.file,
      r.page,
      `${r.widthMm}x${r.heightMm}`,
      r.elements,
      r.styles,
      (100 * r.topShare).toFixed(1),
      r.groupsFor90,
      (100 * r.closedShare).toFixed(1),
      r.images,
      r.ms,
    ].join("\t"),
  );
}

const drawings = rows.filter(isDrawingSheet);
const vectorDrawings = drawings.filter(isVector);
const procedures = new Set(vectorDrawings.map((r) => r.procedure));
const share = (n: number, d: number): number => (d === 0 ? 0 : n / d);
const times = rows.map((r) => r.ms).sort((a, b) => a - b);
const pct = (p: number): number =>
  times[Math.min(times.length - 1, Math.ceil(p * times.length) - 1)] ?? 0;

const c1 = vectorDrawings.length >= 10 && procedures.size >= 6;
const c2 =
  share(vectorDrawings.filter((r) => r.topShare <= 0.5).length, vectorDrawings.length) >=
  0.6;
const c3 =
  share(
    vectorDrawings.filter((r) => r.groupsFor90 <= 30).length,
    vectorDrawings.length,
  ) >= 0.6;
const c4 =
  share(
    vectorDrawings.filter((r) => r.closedShare >= 0.1).length,
    vectorDrawings.length,
  ) >= 0.5;
const c5 = share(vectorDrawings.length, drawings.length) >= 0.5;

console.log("");
console.log(
  `pages ${rows.length}; drawing sheets (>= A3) ${drawings.length}; vector drawing sheets ${vectorDrawings.length}; procedures with one ${procedures.size}`,
);
console.log(
  `M9 extraction time per page: p50 ${pct(0.5)} ms, p95 ${pct(0.95)} ms, max ${times.at(-1) ?? 0} ms`,
);
console.log(`C1 sample (>= 10 vector sheets, >= 6 procedures): ${c1 ? "pass" : "FAIL"}`);
if (c1) {
  console.log(
    `C2 largest style group <= 50% in >= 60% of sheets: ${c2 ? "pass" : "FAIL"}`,
  );
  console.log(
    `C3 groups covering 90% <= 30 in >= 60% of sheets: ${c3 ? "pass" : "FAIL"}`,
  );
  console.log(`C4 >= 10% closed polygons in >= 50% of sheets: ${c4 ? "pass" : "FAIL"}`);
  console.log(
    `C5 >= 50% of the drawing sheets are vector: ${c5 ? "pass" : "FAIL (format problem: 🔴 founder decision)"}`,
  );
}
const outcome = !c1
  ? "inconclusive (C1 fails)"
  : !c5
    ? "format problem (C5 fails)"
    : c2 && c3 && c4
      ? "A (group by style)"
      : "B (user selection, US-20)";
console.log(`G-GEO outcome: ${outcome}`);
