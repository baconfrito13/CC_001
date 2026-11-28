/** Small helpers shared by the API route handlers. */

export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

/** Best-effort client IP. Only trust it when the app runs behind a proxy you control. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Basic CSRF defence for browser-initiated JSON POSTs: when an Origin header is present it
 * must point at the host that received the request. Requests without Origin (curl, server to
 * server) are allowed; they cannot be forged by a victim's browser.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return true;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type JsonBodyResult =
  | { ok: true; data: unknown }
  | {
      ok: false;
      status: 400 | 413 | 415;
      error: "invalid_json" | "payload_too_large" | "unsupported_media_type";
    };

/** Read a JSON request body with a size limit. */
export async function readJsonBody(
  request: Request,
  maxBytes = 10_000,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, status: 415, error: "unsupported_media_type" };
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return { ok: false, status: 413, error: "payload_too_large" };

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
