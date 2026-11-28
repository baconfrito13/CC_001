import type { DocumentRecord, SheetRecord } from "@/lib/data/types";

/**
 * What the browser gets to see of a document and its sheets. No storage path (it names the
 * owner's folder) and no internal state: the page and the API return exactly these shapes.
 */
export interface PublicSheet {
  id: string;
  pageNo: number;
  widthPt: number;
  heightPt: number;
  scaleRatio: number | null;
  scaleSource: "detected" | "manual" | null;
  status: SheetRecord["status"];
  needsRecalc: boolean;
}

export interface PublicDocument {
  id: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number | null;
  status: DocumentRecord["status"];
  createdAt: string;
  sheets: PublicSheet[];
}

export const toPublicSheet = (sheet: SheetRecord): PublicSheet => ({
  id: sheet.id,
  pageNo: sheet.pageNo,
  widthPt: sheet.widthPt,
  heightPt: sheet.heightPt,
  scaleRatio: sheet.scaleRatio,
  scaleSource: sheet.scaleSource,
  status: sheet.status,
  needsRecalc: sheet.needsRecalc,
});

export const toPublicDocument = (document: DocumentRecord): PublicDocument => ({
  id: document.id,
  fileName: document.fileName,
  sizeBytes: document.sizeBytes,
  pageCount: document.pageCount,
  status: document.status,
  createdAt: document.createdAt.toISOString(),
  sheets: document.sheets.map(toPublicSheet),
});
