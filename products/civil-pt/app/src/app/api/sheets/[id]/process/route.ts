import { problem } from "@/lib/core/problem";

export const dynamic = "force-dynamic";

/**
 * POST /api/sheets/:id/process: processing arrives with slice S-04 (queue, ledger, executor).
 * Until then the sheet list already shows "Processar" once a scale is set (US-03 criterion 2)
 * and this answers 501, which the page turns into a plain message. S-04 replaces this file.
 */
export function POST() {
  return problem(501, "not_implemented");
}
