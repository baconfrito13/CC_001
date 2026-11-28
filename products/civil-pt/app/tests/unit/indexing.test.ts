import { afterEach, describe, expect, it, vi } from "vitest";
import { parseEnv } from "@/lib/env";
import { isIndexable, robotsMetadata } from "@/lib/indexing";

const cases: [string, Record<string, string>, boolean][] = [
  ["nothing set (local build, CI)", {}, false],
  ["Vercel production", { VERCEL_ENV: "production" }, true],
  ["Vercel preview", { VERCEL_ENV: "preview" }, false],
  ["Vercel development", { VERCEL_ENV: "development" }, false],
  ["explicit opt-in anywhere", { NEXT_PUBLIC_INDEXABLE: "true" }, true],
  [
    "explicit opt-in overrides a preview",
    { VERCEL_ENV: "preview", NEXT_PUBLIC_INDEXABLE: "true" },
    true,
  ],
  [
    "explicit opt-out hides production",
    { VERCEL_ENV: "production", NEXT_PUBLIC_INDEXABLE: "false" },
    false,
  ],
  [
    "blank values are ignored",
    { VERCEL_ENV: "production", NEXT_PUBLIC_INDEXABLE: "" },
    true,
  ],
];

describe("isIndexable", () => {
  for (const [name, vars, expected] of cases) {
    it(`${name} -> ${expected ? "indexable" : "noindex"}`, () => {
      expect(isIndexable(parseEnv(vars))).toBe(expected);
    });
  }
});

describe("robotsMetadata", () => {
  it("adds noindex/nofollow to non-indexable deployments only", () => {
    expect(robotsMetadata(parseEnv({}))).toEqual({
      robots: { index: false, follow: false },
    });
    expect(robotsMetadata(parseEnv({ VERCEL_ENV: "production" }))).toEqual({});
  });
});

describe("next.config.ts mirrors the rule in the X-Robots-Tag header and builds the CSP", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function headersFor(vars: Record<string, string>, nodeEnv = "production") {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", nodeEnv);
    for (const key of [
      "VERCEL_ENV",
      "NEXT_PUBLIC_INDEXABLE",
      "NEXT_PUBLIC_ANALYTICS_PROVIDER",
    ]) {
      vi.stubEnv(key, "");
    }
    for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value);
    const { default: nextConfig } = await import("../../next.config");
    const rules = (await nextConfig.headers?.()) ?? [];
    return Object.fromEntries((rules[0]?.headers ?? []).map((h) => [h.key, h.value]));
  }

  for (const [name, vars, indexable] of cases) {
    it(`${name}`, async () => {
      const headers = await headersFor(vars);
      expect(headers["X-Robots-Tag"] !== undefined).toBe(!indexable);
      if (!indexable) expect(headers["X-Robots-Tag"]).toBe("noindex, nofollow");
    });
  }

  it("always sends the baseline security headers", async () => {
    const headers = await headersFor({});
    expect(headers["Strict-Transport-Security"]).toContain("max-age=");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("sets a CSP in production only, allowing just the configured analytics provider", async () => {
    const plain = (await headersFor({}))["Content-Security-Policy"] ?? "";
    expect(plain).toContain("script-src 'self' 'unsafe-inline'");
    expect(plain).toContain("connect-src 'self'");
    expect(plain).not.toContain("plausible");
    expect(plain).not.toContain("posthog");

    const plausible =
      (await headersFor({ NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible" }))[
        "Content-Security-Policy"
      ] ?? "";
    expect(plausible).toContain("script-src 'self' 'unsafe-inline' https://plausible.io");
    expect(plausible).toContain("connect-src 'self' https://plausible.io");

    const posthog =
      (await headersFor({ NEXT_PUBLIC_ANALYTICS_PROVIDER: "posthog" }))[
        "Content-Security-Policy"
      ] ?? "";
    expect(posthog).toContain("https://eu.i.posthog.com");
    expect(posthog).toContain("https://eu-assets.i.posthog.com");

    expect(
      (await headersFor({}, "development"))["Content-Security-Policy"],
    ).toBeUndefined();
  });
});
