import { hmacRef } from "@/lib/core/hash";
import { errorCode, type Logger, logger } from "@/lib/core/logger";
import { problem } from "@/lib/core/problem";
import { getDataStore } from "@/lib/data";
import type { DataStore } from "@/lib/data/types";
import { getEnv } from "@/lib/env";
import { getClientIp } from "@/lib/http";

/** 60 checks per minute per client (docs/04-architecture.md section 6). */
export const HEALTH_LIMIT = 60;
const WINDOW_SECONDS = 60;
/** Used only when HASH_SALT is not set, which production forbids. */
const DEV_SALT = "rastoplan-dev-hash-salt";

export interface HealthDeps {
  version: string;
  store: () => Promise<DataStore>;
  now: () => Date;
  salt: () => string;
  log: Logger;
}

const defaultDeps = (version: string): HealthDeps => ({
  version,
  store: getDataStore,
  now: () => new Date(),
  salt: () => getEnv().HASH_SALT ?? DEV_SALT,
  log: logger,
});

/**
 * GET and HEAD /api/health: what an uptime monitor calls.
 *
 * 200 {status:"ok", version, db:"ok"}        the data adapter answered a ping
 * 503 {status:"degraded", version, db:"error"} it did not (the cause is logged, not returned)
 * 429 problem+json                            more than 60 checks a minute from one client
 *
 * The body never carries configuration, adapter names or secrets. The client address is only
 * used as a keyed hash, and only for the rate limit.
 */
export async function handleHealth(
  request: Request,
  version: string,
  overrides: Partial<HealthDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps(version), ...overrides };
  const headers = { "Cache-Control": "no-store" };
  const bodyless = request.method === "HEAD";
  const reply = (status: number, body: Record<string, string>) =>
    new Response(bodyless ? null : JSON.stringify(body), {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    });

  try {
    const store = await deps.store();
    const client = hmacRef(getClientIp(request.headers), deps.salt());
    const limited = await store.security
      .rateLimitHit({
        key: `health:${client}`,
        limit: HEALTH_LIMIT,
        windowSeconds: WINDOW_SECONDS,
        now: deps.now(),
      })
      // A broken limiter must not hide the real answer: the ping below reports the outage.
      .catch((error: unknown) => {
        deps.log.warn("health_rate_limit_unavailable", {
          route: "/api/health",
          error_code: errorCode(error),
        });
        return null;
      });
    if (limited && !limited.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((limited.resetAt.getTime() - deps.now().getTime()) / 1000),
      );
      return problem(429, "rate_limited", {
        headers: { "Retry-After": String(retryAfter) },
      });
    }
    await store.ping();
    return reply(200, { status: "ok", version: deps.version, db: "ok" });
  } catch (error) {
    deps.log.error("health_check_failed", {
      route: "/api/health",
      check: "data",
      error_code: errorCode(error),
    });
    return reply(503, { status: "degraded", version: deps.version, db: "error" });
  }
}
