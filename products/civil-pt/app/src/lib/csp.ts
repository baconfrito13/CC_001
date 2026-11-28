/**
 * Content-Security-Policy (SR-13, docs/04-architecture.md section 11), as a pure function of
 * the environment so it can be unit-tested; next.config.ts applies it in production.
 *
 * What it allows, and why:
 * - `script-src 'self' 'unsafe-inline'`: statically rendered Next.js pages cannot carry a
 *   per-request nonce and emit inline bootstrap scripts. Plus the analytics script origin.
 * - `worker-src 'self' blob:`: the pdf.js viewer (slice S-05) runs its parser in a Web Worker,
 *   and PostHog does too; both need `blob:`.
 * - `connect-src`: this site, the analytics provider that is configured, the Supabase project
 *   (the browser reads rows through PostgREST and moves PDFs through signed Storage URLs) and
 *   the Sentry ingest host. Nothing else: no wildcards, no `https:`.
 * - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`:
 *   nobody frames the app, no plugins, no base-tag hijacking, no foreign form targets.
 */

/**
 * The variables it reads: NEXT_PUBLIC_ANALYTICS_PROVIDER, NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC,
 * NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_SUPABASE_URL and SENTRY_DSN. `process.env` fits.
 */
export type CspEnv = Readonly<Record<string, string | undefined>>;

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The origin of a URL, or undefined when it is missing, malformed or not safe to allow: only
 * https origins (and plain http for loopback hosts, for local Supabase and e2e runs).
 */
export function safeOrigin(
  value: string | undefined,
  fallback?: string,
): string | undefined {
  try {
    const url = new URL(value || fallback || "");
    if (url.protocol === "https:") return url.origin;
    if (url.protocol === "http:" && LOOPBACK.has(url.hostname)) return url.origin;
    return undefined;
  } catch {
    return undefined;
  }
}

export function buildContentSecurityPolicy(env: CspEnv): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];

  if (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible") {
    const origin = safeOrigin(
      env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC,
      "https://plausible.io",
    );
    if (origin) {
      scriptSrc.push(origin);
      connectSrc.push(origin);
    }
  }
  if (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "posthog") {
    const host = safeOrigin(env.NEXT_PUBLIC_POSTHOG_HOST, "https://eu.i.posthog.com");
    if (host) {
      const assets = host.replace(".i.posthog.com", "-assets.i.posthog.com");
      scriptSrc.push(host, assets);
      connectSrc.push(host, assets);
    }
  }

  const supabase = safeOrigin(env.NEXT_PUBLIC_SUPABASE_URL);
  if (supabase) connectSrc.push(supabase);
  const sentry = safeOrigin(env.SENTRY_DSN);
  if (sentry) connectSrc.push(sentry);

  return [
    "default-src 'self'",
    `script-src ${[...new Set(scriptSrc)].join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${[...new Set(connectSrc)].join(" ")}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
