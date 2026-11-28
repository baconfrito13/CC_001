import type { AuthRequest } from "./types";

/** `Cookie: a=1; b=2` as name/value pairs. Malformed pairs are skipped, values are decoded. */
export function parseCookieHeader(header: string | null | undefined): {
  name: string;
  value: string;
}[] {
  if (!header) return [];
  const cookies: { name: string; value: string }[] = [];
  for (const part of header.slice(0, 16_384).split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    let value = part.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1);
    }
    try {
      cookies.push({ name, value: decodeURIComponent(value) });
    } catch {
      cookies.push({ name, value });
    }
  }
  return cookies;
}

/** Is the request HTTPS, as the visitor sees it (behind Vercel the proxy header says so)? */
export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function authRequestFrom(request: Request): AuthRequest {
  return {
    cookies: parseCookieHeader(request.headers.get("cookie")),
    secure: isSecureRequest(request),
  };
}
