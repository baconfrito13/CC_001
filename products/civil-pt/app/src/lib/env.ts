import { z } from "zod";

/**
 * Typed, validated access to environment variables.
 *
 * Every variable is optional: the starter must build and run with an empty environment.
 * Empty strings (a blank `KEY=` line copied from `.env.example`) are treated as "not set".
 * Document every new variable in `.env.example`.
 *
 * Server-only module: do not import it from client components. Values that the browser needs
 * are passed down as props from server components (see `src/components/Analytics.tsx`).
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

/** An adapter switch: one of `values`, `fallback` (the test-mode choice) when unset. */
const adapter = <const T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number],
) => z.preprocess(emptyToUndefined, z.enum(values).default(fallback));

const flag = (fallback: boolean) =>
  z.preprocess(emptyToUndefined, booleanString.default(fallback));

/** A tunable limit: an integer in [min, max] read from a string, `fallback` when unset. */
const limit = (fallback: number, min: number, max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(min).max(max).default(fallback),
  );

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).catch("development"),

  // Search-engine indexing (build time). See src/lib/indexing.ts.
  VERCEL_ENV: optional(z.enum(["production", "preview", "development"])),
  NEXT_PUBLIC_INDEXABLE: optional(booleanString),

  // Public (inlined in the browser bundle at build time)
  NEXT_PUBLIC_SITE_URL: optional(z.url()),
  NEXT_PUBLIC_ANALYTICS_PROVIDER: optional(z.enum(["none", "plausible", "posthog"])),
  NEXT_PUBLIC_ANALYTICS_COOKIELESS: optional(booleanString),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optional(z.string().min(1)),
  NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC: optional(z.url()),
  NEXT_PUBLIC_POSTHOG_KEY: optional(z.string().min(1)),
  NEXT_PUBLIC_POSTHOG_HOST: optional(z.url()),

  // Waitlist adapters (server only)
  WAITLIST_ADAPTER: optional(z.enum(["console", "resend", "webhook"])),
  RESEND_API_KEY: optional(z.string().min(1)),
  RESEND_SEGMENT_ID: optional(z.string().min(1)),
  WAITLIST_WEBHOOK_URL: optional(z.url()),

  // Online withdrawal function (POST /api/withdrawal). Uses the same adapters as the waitlist.
  /** Sender of the acknowledgement e-mails sent through Resend, e.g. "Rastoplan <nao-responder@rastoplan.com>". */
  RESEND_FROM: optional(z.string().min(3)),
  /** Separate endpoint for withdrawals; falls back to WAITLIST_WEBHOOK_URL. */
  WITHDRAWAL_WEBHOOK_URL: optional(z.url()),

  // Payments (server only)
  STRIPE_SECRET_KEY: optional(z.string().min(1)),
  STRIPE_WEBHOOK_SECRET: optional(z.string().min(1)),

  // Adapters. The defaults are the test-mode choices: the app runs with no account at all.
  // Production refuses them (see `productionProblems`).
  DATA_ADAPTER: adapter(["memory", "supabase"], "memory"),
  STORAGE_ADAPTER: adapter(["memory", "supabase"], "memory"),
  AUTH_ADAPTER: adapter(["mock", "supabase"], "mock"),
  EMAIL_ADAPTER: adapter(["console", "resend"], "console"),
  PAYMENTS_ADAPTER: adapter(["mock", "stripe"], "mock"),
  /** Real money moves only when this is true and a live Stripe key is present. */
  PAYMENTS_LIVE: flag(false),
  PROCESSING_MODE: adapter(["inline", "after"], "inline"),
  /** CI and local production builds only: lets the test adapters boot with NODE_ENV=production. */
  ALLOW_TEST_ADAPTERS: flag(false),

  // Supabase. The URL and the anon key are public by design (RLS protects the data); the
  // service-role key is a server-only secret and must never get a NEXT_PUBLIC_ prefix.
  NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(z.string().min(1)),
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string().min(1)),

  /** Sender of transactional email, e.g. "Rastoplan <nao-responder@rastoplan.com>". */
  EMAIL_FROM: optional(z.string().min(3)),

  // Secrets generated per environment (`openssl rand -hex 32`).
  CRON_SECRET: optional(z.string().min(32)),
  HASH_SALT: optional(z.string().min(16)),

  /** Sentry DSN: only its origin is used here, to allow it in the CSP `connect-src`. */
  SENTRY_DSN: optional(z.url()),

  // Product limits (PRD section 7 and US-08): adjustable without a deploy of new code.
  MAX_PDF_MB: limit(50, 1, 200),
  MAX_PDF_PAGES: limit(40, 1, 500),
  PROCESSING_MAX_ELEMENTS: limit(500_000, 1_000, 10_000_000),
  LOW_DIVERSITY_SHARE: z.preprocess(
    emptyToUndefined,
    z.coerce.number().gt(0).lte(1).default(0.9),
  ),
  TRIAL_SHEETS: limit(5, 1, 100),
  TRIAL_DAYS: limit(14, 1, 90),
  LOT_VALIDITY_DAYS: limit(90, 1, 365),
  GRACE_DAYS: limit(7, 0, 60),
  FOUNDER_PRICE_SLOTS: limit(10, 0, 1_000),
  UPLOADS_PER_HOUR: limit(30, 1, 10_000),
});

export type Env = z.output<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment variables:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** Adapters that exist only for development and tests: they must never serve production. */
export function testAdaptersIn(env: Env): string[] {
  const active: string[] = [];
  if (env.DATA_ADAPTER === "memory") active.push("DATA_ADAPTER=memory");
  if (env.STORAGE_ADAPTER === "memory") active.push("STORAGE_ADAPTER=memory");
  if (env.AUTH_ADAPTER === "mock") active.push("AUTH_ADAPTER=mock");
  if (env.EMAIL_ADAPTER === "console") active.push("EMAIL_ADAPTER=console");
  if (env.PAYMENTS_ADAPTER === "mock") active.push("PAYMENTS_ADAPTER=mock");
  if (env.WAITLIST_ADAPTER === "console") active.push("WAITLIST_ADAPTER=console");
  return active;
}

const isLiveStripeKey = (key: string) => /^(sk|rk)_live_/.test(key);

/** Rules that hold in every environment: a chosen real adapter needs what it needs. */
function configProblems(env: Env): string[] {
  const problems: string[] = [];
  const need = (when: boolean, label: string, entries: [string, unknown][]) => {
    if (!when) return;
    for (const [name, value] of entries) {
      if (!value) problems.push(`${name}: required when ${label}`);
    }
  };

  const supabaseVars: [string, unknown][] = [
    ["NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
  ];
  need(env.DATA_ADAPTER === "supabase", "DATA_ADAPTER=supabase", supabaseVars);
  need(env.STORAGE_ADAPTER === "supabase", "STORAGE_ADAPTER=supabase", supabaseVars);
  need(env.AUTH_ADAPTER === "supabase", "AUTH_ADAPTER=supabase", supabaseVars);
  need(env.EMAIL_ADAPTER === "resend", "EMAIL_ADAPTER=resend", [
    ["RESEND_API_KEY", env.RESEND_API_KEY],
    ["EMAIL_FROM (or RESEND_FROM)", env.EMAIL_FROM ?? env.RESEND_FROM],
  ]);
  need(env.PAYMENTS_ADAPTER === "stripe", "PAYMENTS_ADAPTER=stripe", [
    ["STRIPE_SECRET_KEY", env.STRIPE_SECRET_KEY],
  ]);

  // The mock sign-in keeps its accounts in the memory store: with a database behind it, the
  // account ids would not exist there (every project has a foreign key to auth.users).
  if (env.AUTH_ADAPTER === "mock" && env.DATA_ADAPTER !== "memory") {
    problems.push("AUTH_ADAPTER=mock: needs DATA_ADAPTER=memory");
  }

  const key = env.STRIPE_SECRET_KEY;
  if (env.PAYMENTS_LIVE) {
    if (env.PAYMENTS_ADAPTER !== "stripe") {
      problems.push("PAYMENTS_ADAPTER: must be stripe when PAYMENTS_LIVE=true");
    }
    if (!key || !isLiveStripeKey(key)) {
      problems.push(
        "STRIPE_SECRET_KEY: must be a live key (sk_live_ or rk_live_) when PAYMENTS_LIVE=true",
      );
    }
    if (!env.STRIPE_WEBHOOK_SECRET) {
      problems.push("STRIPE_WEBHOOK_SECRET: required when PAYMENTS_LIVE=true");
    }
  } else if (key && isLiveStripeKey(key)) {
    problems.push(
      "PAYMENTS_LIVE: a live Stripe key is set but PAYMENTS_LIVE is not true",
    );
  }
  return problems;
}

/**
 * Rules that apply to a production server only (T-10, SR-08): no test adapter, and the
 * secrets production needs. `ALLOW_TEST_ADAPTERS=true` exists for CI and local production
 * builds (`next start` always runs with NODE_ENV=production) and is ignored, with an error,
 * on a Vercel production deployment.
 */
function productionProblems(env: Env): string[] {
  const onVercelProduction = env.VERCEL_ENV === "production";
  const override = env.ALLOW_TEST_ADAPTERS && !onVercelProduction;
  const problems: string[] = [];

  if (env.ALLOW_TEST_ADAPTERS && onVercelProduction) {
    problems.push("ALLOW_TEST_ADAPTERS: not allowed on a Vercel production deployment");
  }
  if (override) return problems;

  for (const active of testAdaptersIn(env)) {
    problems.push(`${active}: test adapter, not allowed in production`);
  }
  if (!env.CRON_SECRET)
    problems.push("CRON_SECRET: required in production (32+ characters)");
  if (!env.HASH_SALT) problems.push("HASH_SALT: required in production (16+ characters)");
  return problems;
}

/**
 * Parse and validate a set of variables. Throws `EnvError` with a readable list.
 *
 * The production rules run only on the server, and not while `next build` compiles with the
 * defaults (`NEXT_PHASE=phase-production-build`): they are enforced when the server boots
 * (`src/instrumentation.ts`) and on the first read.
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    );
  }
  const env = result.data;
  const building = source.NEXT_PHASE === "phase-production-build";
  const problems = [
    ...configProblems(env),
    ...(env.NODE_ENV === "production" && !building && typeof window === "undefined"
      ? productionProblems(env)
      : []),
  ];
  if (problems.length > 0) throw new EnvError(problems);
  return env;
}

let cached: Env | undefined;

/** Validated `process.env`, parsed once per process. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
