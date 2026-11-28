/**
 * Best-effort in-memory sliding-window rate limiter.
 *
 * State lives in the memory of one server instance, so on serverless platforms each warm
 * instance counts separately. It stops casual abuse and accidental double submits; for real
 * protection put a WAF / rate-limit rule (Vercel Firewall, Cloudflare) in front of /api.
 */
export interface RateLimiterOptions {
  /** Maximum requests per key per window. */
  limit: number;
  windowMs: number;
  /** Injectable clock for tests. */
  now?: () => number;
  /** Upper bound on tracked keys, to cap memory under a flood of distinct IPs. */
  maxKeys?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { limit, windowMs, now = Date.now, maxKeys = 5_000 } = options;
  const hits = new Map<string, number[]>();

  function prune(timestamp: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => timestamp - t < windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key) {
      const timestamp = now();
      if (hits.size >= maxKeys && !hits.has(key)) prune(timestamp);
      // Still full after pruning: evict the oldest key so memory stays bounded.
      if (hits.size >= maxKeys && !hits.has(key)) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }

      const recent = (hits.get(key) ?? []).filter((t) => timestamp - t < windowMs);
      if (recent.length >= limit) {
        const oldestHit = recent[0] ?? timestamp;
        hits.set(key, recent);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((oldestHit + windowMs - timestamp) / 1000),
          ),
        };
      }
      recent.push(timestamp);
      hits.set(key, recent);
      return { allowed: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
