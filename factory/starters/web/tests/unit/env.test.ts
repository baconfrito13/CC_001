import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EnvError, envSchema, parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("accepts an empty environment: every variable is optional", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
  });

  it("treats blank values (copied .env.example lines) as unset", () => {
    const env = parseEnv({
      RESEND_API_KEY: "",
      WAITLIST_WEBHOOK_URL: "  ",
      NEXT_PUBLIC_SITE_URL: "",
    });
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.WAITLIST_WEBHOOK_URL).toBeUndefined();
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
  });

  it("parses typed values", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://acme.example",
      NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible",
      NEXT_PUBLIC_ANALYTICS_COOKIELESS: "true",
      WAITLIST_ADAPTER: "webhook",
      WAITLIST_WEBHOOK_URL: "https://hooks.example/w",
    });
    expect(env).toMatchObject({
      NODE_ENV: "production",
      NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible",
      NEXT_PUBLIC_ANALYTICS_COOKIELESS: true,
      WAITLIST_ADAPTER: "webhook",
    });
    expect(
      parseEnv({ NEXT_PUBLIC_ANALYTICS_COOKIELESS: "0" })
        .NEXT_PUBLIC_ANALYTICS_COOKIELESS,
    ).toBe(false);
  });

  it("falls back to development for unknown NODE_ENV values", () => {
    expect(parseEnv({ NODE_ENV: "staging" }).NODE_ENV).toBe("development");
  });

  it("throws a readable error for invalid values", () => {
    let error: unknown;
    try {
      parseEnv({
        NEXT_PUBLIC_SITE_URL: "not-a-url",
        NEXT_PUBLIC_ANALYTICS_PROVIDER: "matomo",
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(EnvError);
    expect((error as Error).message).toContain("NEXT_PUBLIC_SITE_URL");
    expect((error as Error).message).toContain("NEXT_PUBLIC_ANALYTICS_PROVIDER");
  });
});

describe(".env.example", () => {
  const example = readFileSync(
    path.join(import.meta.dirname, "../../.env.example"),
    "utf8",
  );
  const documented = new Set(
    [...example.matchAll(/^#?\s?([A-Z][A-Z0-9_]+)=/gm)].map(
      (match) => match[1] as string,
    ),
  );

  it("documents every variable the app reads", () => {
    for (const key of Object.keys(envSchema.shape)) {
      if (key === "NODE_ENV") continue;
      expect(documented.has(key), `${key} is missing from .env.example`).toBe(true);
    }
  });

  it("only documents variables the app knows (test-only ones excepted)", () => {
    const known = new Set([...Object.keys(envSchema.shape), "CHROMIUM_PATH", "BASE_URL"]);
    for (const key of documented)
      expect(known.has(key), `${key} is not in the env schema`).toBe(true);
  });

  it("ships blank values only, so nothing secret can be committed by copying it", () => {
    for (const line of example.split("\n")) {
      if (/^[A-Z][A-Z0-9_]+=./.test(line))
        throw new Error(`.env.example has a value: ${line}`);
    }
  });
});
