import { readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { config, type Locale, type SiteConfig } from "@/config/site";
import { applyPlaceholders, buildPlaceholderMap } from "@/lib/placeholders";

/** Every legal document the starter ships. `withdrawal` is only published for consumer sales. */
export const LEGAL_DOCS = [
  "privacy",
  "terms",
  "cookies",
  "withdrawal",
  "legal-notice",
] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

export function isLegalDoc(value: string): value is LegalDoc {
  return (LEGAL_DOCS as readonly string[]).includes(value);
}

/** Documents that are published for this configuration, in display order. */
export function getPublishedLegalDocs(siteConfig: SiteConfig = config): LegalDoc[] {
  return LEGAL_DOCS.filter(
    (doc) => doc !== "withdrawal" || siteConfig.legal.sellsToConsumers,
  );
}

export const LEGAL_CONTENT_DIR = path.join(process.cwd(), "src", "content", "legal");

/** Raw markdown (with `{{placeholders}}`) of a document. Read at build time only. */
export function readLegalSource(
  locale: Locale,
  doc: LegalDoc,
  baseDir = LEGAL_CONTENT_DIR,
): string {
  return readFileSync(path.join(baseDir, locale, `${doc}.md`), "utf8");
}

/**
 * Render markdown with placeholders to HTML. Throws if any `{{...}}` is left unreplaced.
 * The markdown is trusted repository content, so raw HTML in it is passed through.
 */
export function renderLegalMarkdown(
  markdown: string,
  values: Readonly<Record<string, string>>,
): string {
  const filled = applyPlaceholders(markdown, values);
  return marked.parse(filled, { async: false, gfm: true }) as string;
}

export function renderLegalDoc(
  locale: Locale,
  doc: LegalDoc,
  siteConfig: SiteConfig = config,
): string {
  return renderLegalMarkdown(
    readLegalSource(locale, doc),
    buildPlaceholderMap(siteConfig, locale),
  );
}
