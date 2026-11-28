import { type NextRequest, NextResponse } from "next/server";
import { locales } from "@/config/site";
import { negotiateLocale } from "@/lib/i18n";
import { localizedPath, splitLocalePath } from "@/lib/locale-path";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 *
 * Every page lives under `/<locale>/...`. Requests without a locale prefix (most importantly
 * `/`) are redirected to the best locale for the visitor, chosen from Accept-Language with
 * the default locale as fallback. The redirect is temporary (307) because it depends on a
 * request header, and `Vary: Accept-Language` keeps shared caches honest.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (splitLocalePath(pathname, locales).locale) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = localizedPath(locale, pathname);

  const response = NextResponse.redirect(url, 307);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip API routes, Next internals and anything that looks like a file (sitemap.xml,
  // robots.txt, icon.svg, ...).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
