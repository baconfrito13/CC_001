import type { Env } from "@/lib/env";

/** What every adapter receives. `consentAt` is the server-side time the consent was recorded. */
export interface WaitlistEntry {
  email: string;
  locale: string;
  /** ISO 8601 timestamp of the moment the visitor ticked the consent box and submitted. */
  consentAt: string;
  /** Where the signup came from (the site domain). */
  source: string;
}

export interface WaitlistAdapter {
  readonly name: "console" | "resend" | "webhook";
  subscribe(entry: WaitlistEntry): Promise<void>;
}

export class WaitlistAdapterError extends Error {
  constructor(
    public readonly adapter: string,
    message: string,
  ) {
    super(`[waitlist:${adapter}] ${message}`);
    this.name = "WaitlistAdapterError";
  }
}

/** Development/test adapter: prints the entry. Do not use in production (it logs the email). */
export function createConsoleAdapter(
  log: (message: string) => void = console.info,
): WaitlistAdapter {
  return {
    name: "console",
    async subscribe(entry) {
      log(`[waitlist:console] ${JSON.stringify(entry)}`);
    },
  };
}

/** POSTs `{ email, locale, consentAt, source }` as JSON to any HTTP endpoint (Zapier, n8n, ...). */
export function createWebhookAdapter(
  url: string,
  fetchImpl: typeof fetch = fetch,
): WaitlistAdapter {
  return {
    name: "webhook",
    async subscribe(entry) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: entry.email,
          locale: entry.locale,
          consentAt: entry.consentAt,
          source: entry.source,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        throw new WaitlistAdapterError(
          "webhook",
          `endpoint answered HTTP ${response.status}`,
        );
      }
    },
  };
}

/** Minimal slice of the Resend SDK that the adapter uses (makes it easy to fake in tests). */
export interface ResendContactsClient {
  contacts: {
    create(payload: {
      email: string;
      unsubscribed?: boolean;
      segments?: { id: string }[];
    }): Promise<{ error: { message: string; name?: string } | null }>;
  };
}

/**
 * Adds the visitor as a Resend contact (optionally into a segment).
 *
 * Resend renamed "audiences" to "segments"; the SDK now takes `segments: [{ id }]` and marks
 * `audienceId` as deprecated, so this adapter uses segments. The contact's `created_at` in
 * Resend is the consent record; the webhook adapter also carries `consentAt` explicitly.
 */
export function createResendAdapter(options: {
  apiKey: string;
  segmentId?: string;
  createClient?: (apiKey: string) => Promise<ResendContactsClient> | ResendContactsClient;
}): WaitlistAdapter {
  const { apiKey, segmentId } = options;
  const createClient =
    options.createClient ??
    (async (key: string) => {
      const { Resend } = await import("resend");
      return new Resend(key) as unknown as ResendContactsClient;
    });

  return {
    name: "resend",
    async subscribe(entry) {
      const client = await createClient(apiKey);
      const { error } = await client.contacts.create({
        email: entry.email,
        unsubscribed: false,
        ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
      });
      if (error) throw new WaitlistAdapterError("resend", error.message);
    },
  };
}

export type AdapterSelection =
  | { ok: true; adapter: WaitlistAdapter }
  | { ok: false; reason: "not_configured" | "misconfigured"; message: string };

/**
 * Choose the adapter from the environment.
 *
 * - `WAITLIST_ADAPTER` set: use exactly that adapter (error if its variables are missing).
 * - otherwise: Resend if `RESEND_API_KEY`, else webhook if `WAITLIST_WEBHOOK_URL`,
 *   else the console adapter in development/test.
 * - production with nothing configured: not_configured (the API answers 503).
 */
export function selectWaitlistAdapter(
  env: Pick<
    Env,
    | "NODE_ENV"
    | "WAITLIST_ADAPTER"
    | "RESEND_API_KEY"
    | "RESEND_SEGMENT_ID"
    | "WAITLIST_WEBHOOK_URL"
  >,
  deps: { fetch?: typeof fetch; log?: (message: string) => void } = {},
): AdapterSelection {
  const choice =
    env.WAITLIST_ADAPTER ??
    (env.RESEND_API_KEY
      ? "resend"
      : env.WAITLIST_WEBHOOK_URL
        ? "webhook"
        : env.NODE_ENV !== "production"
          ? "console"
          : undefined);

  switch (choice) {
    case "resend":
      if (!env.RESEND_API_KEY) {
        return {
          ok: false,
          reason: "misconfigured",
          message: "WAITLIST_ADAPTER=resend needs RESEND_API_KEY",
        };
      }
      return {
        ok: true,
        adapter: createResendAdapter({
          apiKey: env.RESEND_API_KEY,
          segmentId: env.RESEND_SEGMENT_ID,
        }),
      };
    case "webhook":
      if (!env.WAITLIST_WEBHOOK_URL) {
        return {
          ok: false,
          reason: "misconfigured",
          message: "WAITLIST_ADAPTER=webhook needs WAITLIST_WEBHOOK_URL",
        };
      }
      return {
        ok: true,
        adapter: createWebhookAdapter(env.WAITLIST_WEBHOOK_URL, deps.fetch),
      };
    case "console":
      return { ok: true, adapter: createConsoleAdapter(deps.log) };
    default:
      return {
        ok: false,
        reason: "not_configured",
        message:
          "No waitlist adapter configured. Set RESEND_API_KEY (+ RESEND_SEGMENT_ID) or WAITLIST_WEBHOOK_URL.",
      };
  }
}
