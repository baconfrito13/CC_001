/**
 * Pure path helpers with no configuration import, so client components can use them
 * without pulling the (zod-based) site config into the browser bundle.
 */

/** `("pt", "/pricing")` -> `/pt/pricing`; `("en", "")` and `("en", "/")` -> `/en`. */
export function localizedPath(locale: string, path = ""): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean === "" || clean.startsWith("/") ? clean : `/${clean}`}`;
}

/** Split `/pt/legal/privacy` into `{ locale: "pt", rest: "/legal/privacy" }`. */
export function splitLocalePath(
  pathname: string,
  locales: readonly string[],
): { locale: string | null; rest: string } {
  const [, first = "", ...others] = pathname.split("/");
  if (locales.includes(first)) {
    return { locale: first, rest: others.length > 0 ? `/${others.join("/")}` : "" };
  }
  return { locale: null, rest: pathname === "/" ? "" : pathname };
}

/** Same page in another locale (used by the locale switcher). */
export function switchLocalePath(
  pathname: string,
  target: string,
  locales: readonly string[],
): string {
  return localizedPath(target, splitLocalePath(pathname, locales).rest);
}
