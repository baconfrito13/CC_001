import { defaultLocale, type Locale, locales, site } from "@/config/site";
import { localizedPath } from "./locale-path";

export type { Locale };

export interface LocaleMeta {
  /** Name of the language in that language (for the locale switcher). */
  label: string;
  /** Value of <html lang>. Portuguese content is European Portuguese. */
  htmlLang: string;
  /** hreflang value used in alternates and the sitemap. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** BCP 47 tag for Intl formatting. */
  intl: string;
  /** Locale code understood by Stripe Checkout. */
  stripe: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    label: "English",
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
    intl: "en-GB",
    stripe: "en",
  },
  pt: {
    label: "Português",
    htmlLang: "pt-PT",
    hreflang: "pt-PT",
    ogLocale: "pt_PT",
    intl: "pt-PT",
    stripe: "pt",
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

interface WeightedTag {
  tag: string;
  q: number;
  index: number;
}

/** Parse an Accept-Language header into tags ordered by preference (q desc, then position). */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  const tags: WeightedTag[] = [];
  // Bound the work done on hostile input.
  header
    .slice(0, 1024)
    .split(",")
    .slice(0, 32)
    .forEach((part, index) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag?.trim().toLowerCase();
      if (!tag || !/^(\*|[a-z]{1,8}(-[a-z0-9]{1,8})*)$/.test(tag)) return;
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key?.trim().toLowerCase() === "q") {
          const parsed = Number(value);
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
        }
      }
      if (q > 0) tags.push({ tag, q, index });
    });
  return tags.sort((a, b) => b.q - a.q || a.index - b.index).map((entry) => entry.tag);
}

/**
 * Pick the best supported locale for an Accept-Language header.
 * `pt-PT`, `pt-BR` and `pt` all resolve to `pt`; anything unmatched falls back to the default.
 */
export function negotiateLocale(
  header: string | null | undefined,
  available: readonly Locale[] = locales,
  fallback: Locale = defaultLocale,
): Locale {
  for (const tag of parseAcceptLanguage(header)) {
    if (tag === "*") return fallback;
    const exact = available.find((locale) => locale.toLowerCase() === tag);
    if (exact) return exact;
    const primary = tag.split("-")[0];
    const byPrimary = available.find((locale) => locale.toLowerCase() === primary);
    if (byPrimary) return byPrimary;
  }
  return fallback;
}

export { localizedPath, splitLocalePath, switchLocalePath } from "./locale-path";

/** Absolute URL for a locale + path, based on the configured site URL. */
export function absoluteUrl(locale: Locale, path = "", baseUrl = site.url): string {
  return `${baseUrl}${localizedPath(locale, path)}`;
}
