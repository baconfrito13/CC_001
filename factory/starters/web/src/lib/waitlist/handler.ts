import { site } from "@/config/site";
import { getEnv } from "@/lib/env";
import { getClientIp, isSameOrigin, json, readJsonBody } from "@/lib/http";
import { type AdapterSelection, selectWaitlistAdapter } from "./adapters";
import { createRateLimiter, type RateLimiter } from "./rate-limit";
import { parseWaitlistRequest } from "./schema";

export interface WaitlistDeps {
  select: () => AdapterSelection;
  limiter: RateLimiter;
  now: () => Date;
  logError: (message: string, error?: unknown) => void;
}

/** 5 signups per IP per 10 minutes, per server instance. */
const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

const defaultDeps: WaitlistDeps = {
  select: () => selectWaitlistAdapter(getEnv()),
  limiter: defaultLimiter,
  now: () => new Date(),
  logError: (message, error) => console.error(message, error ?? ""),
};

/**
 * POST /api/waitlist
 *
 * 200 {ok:true}                 stored (or silently dropped when the honeypot was filled)
 * 400 {error:"validation"}      with `fieldErrors` ("required" | "invalid" per field)
 * 403 {error:"forbidden"}       cross-origin browser request
 * 413/415                       oversized body / not JSON
 * 429 {error:"rate_limited"}    with Retry-After
 * 502 {error:"upstream"}        the adapter failed
 * 503 {error:"not_configured"}  production without an adapter (also logged as an error)
 */
export async function handleWaitlist(
  request: Request,
  overrides: Partial<WaitlistDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps, ...overrides };

  if (!isSameOrigin(request.headers))
    return json({ error: "forbidden" }, { status: 403 });

  const limit = deps.limiter.check(getClientIp(request.headers));
  if (!limit.allowed) {
    return json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) return json({ error: body.error }, { status: body.status });

  const parsed = parseWaitlistRequest(body.data);
  if (!parsed.ok) {
    // Bots that fill the honeypot get a success response and nothing is stored.
    if (parsed.reason === "honeypot") return json({ ok: true });
    return json(
      { error: "validation", fieldErrors: parsed.fieldErrors },
      { status: 400 },
    );
  }

  const selection = deps.select();
  if (!selection.ok) {
    deps.logError(`[waitlist] ${selection.message}`);
    return json({ error: "not_configured" }, { status: 503 });
  }

  try {
    await selection.adapter.subscribe({
      email: parsed.data.email,
      locale: parsed.data.locale,
      consentAt: deps.now().toISOString(),
      source: site.domain,
    });
  } catch (error) {
    deps.logError(`[waitlist] adapter "${selection.adapter.name}" failed`, error);
    return json({ error: "upstream" }, { status: 502 });
  }
  return json({ ok: true });
}
