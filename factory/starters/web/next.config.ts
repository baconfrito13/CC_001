import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/** Origin of a URL, or undefined when it is missing or malformed. */
function originOf(value: string | undefined, fallback?: string): string | undefined {
  try {
    return new URL(value || fallback || "").origin;
  } catch {
    return undefined;
  }
}

/**
 * Content-Security-Policy that works with statically rendered Next.js pages.
 *
 * Static pages cannot carry a per-request nonce, and Next.js (like React) emits inline
 * bootstrap scripts, so `script-src` needs 'unsafe-inline'. Everything else is locked down:
 * no plugins, no framing, no foreign form targets, no base-tag hijacking, and network access
 * only to this site plus the analytics provider that is configured. For a strict nonce-based
 * policy see the README ("Security headers"): it requires dynamic rendering.
 * Applied in production only; `next dev` needs 'unsafe-eval' and websockets.
 */
function contentSecurityPolicy(): string {
  const plausibleProvider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible";
  const posthogProvider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "posthog";

  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];
  const extras: string[] = [];

  if (plausibleProvider) {
    const origin = originOf(
      process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC,
      "https://plausible.io",
    );
    if (origin) {
      scriptSrc.push(origin);
      connectSrc.push(origin);
    }
  }
  if (posthogProvider) {
    const host = originOf(
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
      "https://eu.i.posthog.com",
    );
    if (host) {
      const assets = host.replace(".i.posthog.com", "-assets.i.posthog.com");
      scriptSrc.push(host, assets);
      connectSrc.push(host, assets);
      extras.push("worker-src 'self' blob:");
    }
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...extras,
  ].join("; ");
}

const securityHeaders = [
  // Two years, all subdomains. Add "; preload" only if you submit the domain to hstspreload.org.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isProduction
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy() }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `next dev` would otherwise write an AGENTS.md into the project; the README covers this.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
