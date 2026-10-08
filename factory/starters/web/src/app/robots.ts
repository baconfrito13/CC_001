import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getEnv } from "@/lib/env";
import { isIndexable } from "@/lib/indexing";

/** Production: crawl everything except /api. Anything else (previews, local): crawl nothing. */
export function robotsFor(indexable: boolean): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}

export default function robots(): MetadataRoute.Robots {
  return robotsFor(isIndexable(getEnv()));
}
