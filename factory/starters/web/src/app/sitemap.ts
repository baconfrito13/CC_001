import type { MetadataRoute } from "next";
import { defaultLocale, features, legal, locales, site } from "@/config/site";
import { localeMeta } from "@/lib/i18n";
import { getPublishedLegalDocs } from "@/lib/legal";
import { localizedPath } from "@/lib/locale-path";

/** Every page in every locale, each with hreflang alternates (and x-default). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; lastModified?: Date }[] = [
    { path: "" },
    ...(features.pricing ? [{ path: "/pricing" }] : []),
    ...getPublishedLegalDocs().map((doc) => ({
      path: `/legal/${doc}`,
      lastModified: new Date(`${legal.lastUpdated}T00:00:00Z`),
    })),
  ];

  return pages.flatMap(({ path, lastModified }) => {
    const languages: Record<string, string> = Object.fromEntries(
      locales.map((locale) => [
        localeMeta[locale].hreflang,
        `${site.url}${localizedPath(locale, path)}`,
      ]),
    );
    languages["x-default"] = `${site.url}${localizedPath(defaultLocale, path)}`;

    return locales.map((locale) => ({
      url: `${site.url}${localizedPath(locale, path)}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}
