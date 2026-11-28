import type { NewSheet } from "@/lib/data/types";
import { EngineError, openPdf } from "@/lib/engine";
import { detectScale } from "@/lib/scale";

/**
 * What the server learns about an uploaded PDF before it creates the sheets (US-02 criteria 2
 * and 3, US-03 criterion 1): is it a PDF, how many pages, how big is each page and does the
 * page say what scale it was drawn at.
 *
 * The file is untrusted (SR-05, T-04): it is opened with the engine's locked-down pdf.js
 * options, the page count is checked before any page is read, and only the text of each page is
 * read, never its drawing operators (processing is a separate, billed step).
 */

export type InspectOutcome =
  | { ok: true; pageCount: number; sheets: NewSheet[] }
  | { ok: false; reason: "type" | "pages" };

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/** SR-04: the file must start with `%PDF-`; the extension and the declared type mean nothing. */
export function hasPdfHeader(bytes: Uint8Array): boolean {
  return PDF_MAGIC.every((byte, index) => bytes[index] === byte);
}

/** Only this much text per page is looked at for the scale; a title block is a few lines. */
const MAX_TEXT_CHARS = 200_000;

function joinText(items: readonly unknown[]): string {
  let text = "";
  for (const item of items) {
    if (typeof item !== "object" || item === null || !("str" in item)) continue;
    const { str, hasEOL } = item as { str: unknown; hasEOL?: unknown }; // reason: narrowed above, pdf.js TextItem
    if (typeof str !== "string") continue;
    text += hasEOL === true ? `${str}\n` : `${str} `;
    if (text.length >= MAX_TEXT_CHARS) break;
  }
  return text;
}

export async function inspectPdf(
  bytes: Uint8Array,
  options: { maxPages: number },
): Promise<InspectOutcome> {
  if (!hasPdfHeader(bytes)) return { ok: false, reason: "type" };

  let opened: Awaited<ReturnType<typeof openPdf>>;
  try {
    opened = await openPdf(bytes);
  } catch (error) {
    // A damaged or password-protected file: not something the product can measure.
    if (error instanceof EngineError) return { ok: false, reason: "type" };
    throw error;
  }

  try {
    if (opened.numPages > options.maxPages) return { ok: false, reason: "pages" };

    const sheets: NewSheet[] = [];
    for (let pageNo = 1; pageNo <= opened.numPages; pageNo += 1) {
      const page = await opened.document.getPage(pageNo);
      const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = page.view;
      const turned = page.rotate % 180 !== 0;
      const width = Math.abs(x1 - x0);
      const height = Math.abs(y1 - y0);
      if (!(width > 0 && height > 0)) return { ok: false, reason: "type" };

      let scaleRatio: number | null = null;
      try {
        const content = await page.getTextContent();
        scaleRatio = detectScale(joinText(content.items))?.ratio ?? null;
      } catch {
        // Text that cannot be read just means "scale not detected": the user chooses it.
        scaleRatio = null;
      }
      sheets.push({
        pageNo,
        widthPt: round2(turned ? height : width),
        heightPt: round2(turned ? width : height),
        scaleRatio,
        scaleSource: scaleRatio === null ? null : "detected",
      });
      page.cleanup();
    }
    return { ok: true, pageCount: opened.numPages, sheets };
  } catch (error) {
    if (error instanceof EngineError) return { ok: false, reason: "type" };
    // A page that cannot be read means the file is damaged for our purposes.
    return { ok: false, reason: "type" };
  } finally {
    await opened.destroy();
  }
}

const round2 = (value: number) => Math.round(value * 100) / 100;
