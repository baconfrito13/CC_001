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
  /** Sender of the acknowledgement e-mails sent through Resend, e.g. "Acme <noreply@acme.example>". */
  RESEND_FROM: optional(z.string().min(3)),
  /** Separate endpoint for withdrawals; falls back to WAITLIST_WEBHOOK_URL. */
  WITHDRAWAL_WEBHOOK_URL: optional(z.url()),

  // Payments (server only)
  STRIPE_SECRET_KEY: optional(z.string().min(1)),
  STRIPE_WEBHOOK_SECRET: optional(z.string().min(1)),
});

export type Env = z.output<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment variables:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** Parse and validate a set of variables. Throws `EnvError` with a readable list. */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    );
  }
  return result.data;
}

let cached: Env | undefined;

/** Validated `process.env`, parsed once per process. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
