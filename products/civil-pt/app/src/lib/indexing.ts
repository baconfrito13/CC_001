import type { Env } from "@/lib/env";

/**
 * Should search engines index this deployment?
 *
 * - `NEXT_PUBLIC_INDEXABLE=true|false` always wins (use it on Cloudflare, self-hosting, or to
 *   keep a Vercel production deployment hidden before launch).
 * - Otherwise only Vercel production deployments are indexable (`VERCEL_ENV=production`).
 *   Preview deployments, local builds and CI builds are not.
 *
 * Decided at build time (the pages are static). The same rule is mirrored in next.config.ts
 * for the X-Robots-Tag header; a unit test keeps both in sync.
 */
export function isIndexable(
  env: Pick<Env, "VERCEL_ENV" | "NEXT_PUBLIC_INDEXABLE">,
): boolean {
  if (env.NEXT_PUBLIC_INDEXABLE !== undefined) return env.NEXT_PUBLIC_INDEXABLE;
  return env.VERCEL_ENV === "production";
}

/** `<meta name="robots">` for non-indexable deployments, nothing for production. */
export function robotsMetadata(env: Pick<Env, "VERCEL_ENV" | "NEXT_PUBLIC_INDEXABLE">): {
  robots?: { index: false; follow: false };
} {
  return isIndexable(env) ? {} : { robots: { index: false, follow: false } };
}
