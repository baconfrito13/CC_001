import { type NextRequest, NextResponse } from "next/server";
import { locales } from "@/config/site";
import { sessionForProxy } from "@/lib/auth/proxy";
import { negotiateLocale } from "@/lib/i18n";
import { localizedPath, splitLocalePath } from "@/lib/locale-path";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 *
 * Every page lives under `/<locale>/...`. Requests without a locale prefix (most importantly
 * `/`) are redirected to the best locale for the visitor, chosen from Accept-Language with
 * the default locale as fallback. The redirect is temporary (307) because it depends on a
 * request header, and `Vary: Accept-Language` keeps shared caches honest.
 *
 * The signed-in area (`/<locale>/app/...`) needs a session: without one the visitor is sent
 * (302) to `/<locale>/entrar` and brought back afterwards (US-01 criterion 7). This is a first
 * gate; every page and route checks the user again and the database enforces the owner (RLS).
 */
const isAppArea = (rest: string) => rest === "/app" || rest.startsWith("/app/");

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale: current, rest } = splitLocalePath(pathname, locales);

  if (!current) {
    const locale = negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(locale, pathname);

    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  if (!isAppArea(rest)) return NextResponse.next();

  const session = await sessionForProxy(request);
  const response = session.authenticated
    ? NextResponse.next()
    : (() => {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(current, "/entrar");
        url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
        return NextResponse.redirect(url, 302);
      })();
  response.headers.set("Cache-Control", "private, no-store");
  for (const cookie of session.cookies) {
    response.cookies.set(cookie.name, cookie.value, {
      ...cookie.options,
      sameSite:
        cookie.options.sameSite === true
          ? "strict"
          : cookie.options.sameSite === false
            ? undefined
            : cookie.options.sameSite,
    });
  }
  return response;
}

export const config = {
  // Skip API routes, Next internals and anything that looks like a file (sitemap.xml,
  // robots.txt, icon.svg, ...).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
