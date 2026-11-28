import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./src/lib/csp";

const isProduction = process.env.NODE_ENV === "production";

/** Mirrors src/lib/indexing.ts (a unit test keeps them in sync). */
function isIndexable(): boolean {
  const explicit = process.env.NEXT_PUBLIC_INDEXABLE?.trim();
  if (explicit) return explicit === "true" || explicit === "1";
  return process.env.VERCEL_ENV === "production";
}

const securityHeaders = [
  // Two years, all subdomains. Add "; preload" only if you submit the domain to hstspreload.org.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isProduction
    ? [{ key: "Content-Security-Policy", value: buildContentSecurityPolicy(process.env) }]
    : []),
  // Belt and braces next to robots.txt and <meta name="robots">: also covers images and APIs.
  ...(isIndexable() ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // pdf.js loads its worker (`pdf.worker.mjs`) from next to its own module at run time. Bundled,
  // it cannot find it ("Setting up fake worker failed"): keep it external so Node resolves it
  // from node_modules, and Vercel's file tracing ships the package with the function.
  serverExternalPackages: ["pdfjs-dist"],
  // `next dev` would otherwise write an AGENTS.md into the project; the README covers this.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
