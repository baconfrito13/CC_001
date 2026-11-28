import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, safeOrigin } from "@/lib/csp";

const directive = (csp: string, name: string) =>
  csp
    .split("; ")
    .find((part) => part.startsWith(`${name} `))
    ?.slice(name.length + 1)
    .split(" ") ?? [];

describe("SR-13: Content-Security-Policy", () => {
  const base = buildContentSecurityPolicy({});

  it("lets the pdf.js worker start from a blob and nothing else load as a worker", () => {
    expect(directive(base, "worker-src")).toEqual(["'self'", "blob:"]);
  });

  it("locks framing, plugins, base tags and form targets", () => {
    expect(directive(base, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(base, "object-src")).toEqual(["'none'"]);
    expect(directive(base, "base-uri")).toEqual(["'self'"]);
    expect(directive(base, "form-action")).toEqual(["'self'"]);
    expect(directive(base, "default-src")).toEqual(["'self'"]);
  });

  it("allows network access to this site only, until a service is configured", () => {
    expect(directive(base, "connect-src")).toEqual(["'self'"]);
  });

  it("adds the Supabase project, the analytics provider and Sentry to connect-src, nothing more", () => {
    const csp = buildContentSecurityPolicy({
      NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co",
      NEXT_PUBLIC_ANALYTICS_PROVIDER: "posthog",
      NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
      SENTRY_DSN: "https://publickey@o123.ingest.de.sentry.io/456",
    });
    expect(directive(csp, "connect-src")).toEqual([
      "'self'",
      "https://eu.i.posthog.com",
      "https://eu-assets.i.posthog.com",
      "https://abcdefgh.supabase.co",
      "https://o123.ingest.de.sentry.io",
    ]);
    // the Sentry key is part of the DSN, not of the origin
    expect(csp).not.toContain("publickey");
  });

  it("never contains a wildcard, a bare scheme or unsafe-eval", () => {
    const csp = buildContentSecurityPolicy({
      NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co",
      NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible",
    });
    expect(csp).not.toMatch(/\*|\bhttps?:(?=[\s;]|$)|unsafe-eval/);
  });

  it("keeps the script origin of the configured analytics provider only", () => {
    expect(
      directive(
        buildContentSecurityPolicy({ NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible" }),
        "script-src",
      ),
    ).toEqual(["'self'", "'unsafe-inline'", "https://plausible.io"]);
    expect(directive(base, "script-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("ignores origins it cannot trust instead of widening the policy", () => {
    const csp = buildContentSecurityPolicy({
      NEXT_PUBLIC_SUPABASE_URL: "http://supabase.example.org", // plain http, not loopback
      SENTRY_DSN: "not a url",
    });
    expect(directive(csp, "connect-src")).toEqual(["'self'"]);
  });
});

describe("safeOrigin", () => {
  it.each([
    ["https://abcdefgh.supabase.co/rest/v1", undefined, "https://abcdefgh.supabase.co"],
    ["http://127.0.0.1:54321", undefined, "http://127.0.0.1:54321"], // local Supabase
    ["http://localhost:3000", undefined, "http://localhost:3000"],
    [undefined, "https://plausible.io", "https://plausible.io"], // fallback when unset
    ["", "https://plausible.io", "https://plausible.io"],
    ["http://evil.example", undefined, undefined],
    ["javascript:alert(1)", undefined, undefined],
    ["data:text/html,x", undefined, undefined],
    ["nope", undefined, undefined],
    [undefined, undefined, undefined],
  ])("%s -> %s", (value, fallback, expected) => {
    expect(safeOrigin(value, fallback)).toBe(expected);
  });
});
