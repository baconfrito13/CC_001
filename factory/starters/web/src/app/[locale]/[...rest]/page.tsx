import { notFound } from "next/navigation";

/**
 * Catch-all for unknown URLs below a valid locale. Calling notFound() here answers with a
 * real 404 status and renders [locale]/not-found.tsx inside the localized layout. Without it,
 * Next.js would show its unstyled built-in 404, because the root layout lives in a dynamic
 * segment. (Next 16.4 renders notFound() responses on the client, see README "Gotchas".)
 */
export default function UnknownPage(): never {
  notFound();
}
