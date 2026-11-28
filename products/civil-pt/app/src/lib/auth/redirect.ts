import { supportedLocales } from "@/config/site";

/**
 * Where a person lands after signing in (T-14, SR-14). `next` comes from a query string or a
 * body, so it is never trusted: only a relative path of this site inside the signed-in area (or
 * the pricing page, for "buy a pass" before signing in) is accepted. Anything else, including
 * `//evil.example`, `https://evil.example`, `/\evil.example` and paths with control characters,
 * becomes the default.
 */

const LOCALES = supportedLocales.join("|");
const ALLOWED = new RegExp(
  `^/(?:${LOCALES})/(?:app|pricing|precos)(?:/[A-Za-z0-9._~!$&'()*+,;=:@%-]*)*(?:\\?[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?$`,
);

export function defaultNext(locale: string): string {
  return `/${locale}/app`;
}

export function safeNext(next: string | null | undefined, locale: string): string {
  if (!next || next.length > 512) return defaultNext(locale);
  // Decoded form must be as plain as the raw one: "%2F%2Fevil.example" is a protocol-relative URL.
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return defaultNext(locale);
  }
  const hostile = (value: string) =>
    value.startsWith("//") ||
    value.includes("\\") ||
    // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control characters is the point
    /[\u0000-\u001f\u007f]/.test(value) ||
    value.includes("..");
  if (hostile(next) || hostile(decoded)) return defaultNext(locale);
  return ALLOWED.test(next) ? next : defaultNext(locale);
}
