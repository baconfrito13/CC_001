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
      // Typed parsing is the subject here, not the production guard (tested below).
      ALLOW_TEST_ADAPTERS: "true",
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
    const known = new Set([
      ...Object.keys(envSchema.shape),
      "CHROMIUM_PATH",
      "BASE_URL",
      "PG_TEST_URL",
    ]);
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

const prod = {
  NODE_ENV: "production",
  DATA_ADAPTER: "supabase",
  STORAGE_ADAPTER: "supabase",
  AUTH_ADAPTER: "supabase",
  EMAIL_ADAPTER: "resend",
  PAYMENTS_ADAPTER: "stripe",
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "Rastoplan <nao-responder@rastoplan.com>",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  CRON_SECRET: "c".repeat(32),
  HASH_SALT: "s".repeat(24),
} as const;

function message(source: Record<string, string>): string {
  try {
    parseEnv(source);
  } catch (error) {
    if (error instanceof EnvError) return error.message;
    throw error;
  }
  return "";
}

describe("adapters and limits (S-01)", () => {
  it("defaults to test mode: memory data and storage, mock auth and payments, console email", () => {
    const env = parseEnv({});
    expect(env).toMatchObject({
      DATA_ADAPTER: "memory",
      STORAGE_ADAPTER: "memory",
      AUTH_ADAPTER: "mock",
      EMAIL_ADAPTER: "console",
      PAYMENTS_ADAPTER: "mock",
      PAYMENTS_LIVE: false,
      PROCESSING_MODE: "inline",
      ALLOW_TEST_ADAPTERS: false,
    });
  });

  it("defaults every product limit to the value in the PRD", () => {
    expect(parseEnv({})).toMatchObject({
      MAX_PDF_MB: 50,
      MAX_PDF_PAGES: 40,
      PROCESSING_MAX_ELEMENTS: 500_000,
      LOW_DIVERSITY_SHARE: 0.9,
      TRIAL_SHEETS: 5,
      TRIAL_DAYS: 14,
      LOT_VALIDITY_DAYS: 90,
      GRACE_DAYS: 7,
      FOUNDER_PRICE_SLOTS: 10,
      UPLOADS_PER_HOUR: 30,
    });
  });

  it("reads limits from strings and rejects nonsense", () => {
    expect(parseEnv({ TRIAL_SHEETS: "3", LOW_DIVERSITY_SHARE: "0.85" })).toMatchObject({
      TRIAL_SHEETS: 3,
      LOW_DIVERSITY_SHARE: 0.85,
    });
    expect(message({ TRIAL_SHEETS: "many" })).toContain("TRIAL_SHEETS");
    expect(message({ TRIAL_SHEETS: "0" })).toContain("TRIAL_SHEETS");
    expect(message({ LOW_DIVERSITY_SHARE: "1.5" })).toContain("LOW_DIVERSITY_SHARE");
    expect(message({ DATA_ADAPTER: "mysql" })).toContain("DATA_ADAPTER");
  });

  it("fails at boot when a chosen real adapter lacks its variables", () => {
    expect(message({ DATA_ADAPTER: "supabase" })).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(message({ STORAGE_ADAPTER: "supabase" })).toContain(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
    expect(message({ AUTH_ADAPTER: "supabase" })).toContain(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    expect(message({ EMAIL_ADAPTER: "resend" })).toContain("RESEND_API_KEY");
    expect(message({ EMAIL_ADAPTER: "resend", RESEND_API_KEY: "re_x" })).toContain(
      "EMAIL_FROM",
    );
    expect(message({ PAYMENTS_ADAPTER: "stripe" })).toContain("STRIPE_SECRET_KEY");
  });

  it("accepts the starter's RESEND_FROM as the sender of the email adapter", () => {
    expect(
      message({
        EMAIL_ADAPTER: "resend",
        RESEND_API_KEY: "re_x",
        RESEND_FROM: "R <a@b.pt>",
      }),
    ).toBe("");
  });
});

describe("payments live requires live keys (SR-08)", () => {
  const stripe = {
    PAYMENTS_ADAPTER: "stripe",
    STRIPE_SECRET_KEY: "sk_test_x",
    STRIPE_WEBHOOK_SECRET: "whsec_x",
  };

  it("refuses PAYMENTS_LIVE=true with a test key, a missing key or the mock adapter", () => {
    expect(message({ ...stripe, PAYMENTS_LIVE: "true" })).toContain("sk_live_");
    expect(message({ PAYMENTS_LIVE: "true" })).toContain("PAYMENTS_ADAPTER");
    expect(
      message({
        ...stripe,
        STRIPE_SECRET_KEY: "sk_live_x",
        PAYMENTS_LIVE: "true",
        STRIPE_WEBHOOK_SECRET: "",
      }),
    ).toContain("STRIPE_WEBHOOK_SECRET");
  });

  it("accepts live mode only with a live key and the Stripe adapter", () => {
    expect(
      message({ ...stripe, STRIPE_SECRET_KEY: "sk_live_x", PAYMENTS_LIVE: "true" }),
    ).toBe("");
    expect(
      message({ ...stripe, STRIPE_SECRET_KEY: "rk_live_x", PAYMENTS_LIVE: "true" }),
    ).toBe("");
  });

  it("refuses a live key while PAYMENTS_LIVE is off, so a preview can never charge", () => {
    expect(message({ ...stripe, STRIPE_SECRET_KEY: "sk_live_x" })).toContain(
      "PAYMENTS_LIVE",
    );
  });
});

describe("production boot guard (T-10, SR-08)", () => {
  const mocks = [
    ["DATA_ADAPTER", "memory"],
    ["STORAGE_ADAPTER", "memory"],
    ["AUTH_ADAPTER", "mock"],
    ["EMAIL_ADAPTER", "console"],
    ["PAYMENTS_ADAPTER", "mock"],
    ["WAITLIST_ADAPTER", "console"],
  ] as const;

  it("accepts a complete production configuration with real adapters", () => {
    expect(message({ ...prod })).toBe("");
  });

  it.each(mocks)("refuses %s=%s when NODE_ENV=production", (key, value) => {
    const text = message({ ...prod, [key]: value });
    expect(text).toContain(key);
    expect(text).toMatch(/test adapter|not allowed in production/i);
  });

  it("does not refuse the same adapters outside production", () => {
    for (const nodeEnv of ["development", "test"]) {
      expect(
        message({ NODE_ENV: nodeEnv, DATA_ADAPTER: "memory", AUTH_ADAPTER: "mock" }),
      ).toBe("");
    }
  });

  it("does not run during `next build`, which compiles with the defaults", () => {
    expect(
      message({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" }),
    ).toBe("");
  });

  it("requires the secrets production needs", () => {
    expect(message({ ...prod, CRON_SECRET: "" })).toContain("CRON_SECRET");
    expect(message({ ...prod, HASH_SALT: "" })).toContain("HASH_SALT");
    expect(message({ ...prod, CRON_SECRET: "short" })).toContain("CRON_SECRET");
  });

  it("allows test adapters in a production build only with the explicit CI switch", () => {
    expect(message({ NODE_ENV: "production", ALLOW_TEST_ADAPTERS: "true" })).toBe("");
  });

  it("never honours the switch on a Vercel production deployment", () => {
    const text = message({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      ALLOW_TEST_ADAPTERS: "true",
    });
    expect(text).toContain("ALLOW_TEST_ADAPTERS");
    expect(text).toContain("DATA_ADAPTER");
  });

  it("still honours the switch on a Vercel preview", () => {
    expect(
      message({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        ALLOW_TEST_ADAPTERS: "true",
      }),
    ).toBe("");
  });
});
