import type { Metadata } from "next";
import { defaultLocale, type Locale, locales, site } from "@/config/site";
import { localeMeta } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";

/** Canonical URL + hreflang alternates (including x-default) for a page path like "/pricing". */
export function buildAlternates(
  locale: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const code of locales) {
    languages[localeMeta[code].hreflang] = `${site.url}${localizedPath(code, path)}`;
  }
  languages["x-default"] = `${site.url}${localizedPath(defaultLocale, path)}`;
  return { canonical: `${site.url}${localizedPath(locale, path)}`, languages };
}

/** Open Graph + Twitter metadata shared by pages. The image comes from opengraph-image.tsx. */
export function buildSocialMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: `${site.url}${localizedPath(locale, path)}`,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeMeta[l].ogLocale),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
