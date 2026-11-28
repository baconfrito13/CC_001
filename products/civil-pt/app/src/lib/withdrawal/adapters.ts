import type { Env } from "@/lib/env";
import { WaitlistAdapterError } from "@/lib/waitlist/adapters";
import type { WithdrawalMessages } from "./messages";

/** A consumer's statement of withdrawal, as delivered to the adapters. */
export interface WithdrawalEntry {
  name: string;
  email: string;
  reference: string;
  message?: string;
  locale: "en" | "pt";
  /** ISO 8601 time at which the server received the statement. */
  submittedAt: string;
  source: string;
}

export interface WithdrawalAdapter {
  readonly name: "console" | "resend" | "webhook";
  submit(entry: WithdrawalEntry, messages: WithdrawalMessages): Promise<void>;
}

export function createWithdrawalConsoleAdapter(
  log: (message: string) => void = console.info,
): WithdrawalAdapter {
  return {
    name: "console",
    async submit(entry, messages) {
      log(
        `[withdrawal:console] ${JSON.stringify({ ...entry, acknowledgement: messages.ackSubject })}`,
      );
    },
  };
}

/**
 * POSTs the statement as JSON. The payload carries the acknowledgement text so the receiving
 * automation (Zapier, n8n, a support desk) can e-mail it to the consumer.
 */
export function createWithdrawalWebhookAdapter(
  url: string,
  fetchImpl: typeof fetch = fetch,
): WithdrawalAdapter {
  return {
    name: "webhook",
    async submit(entry, messages) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "withdrawal",
          ...entry,
          acknowledgement: { subject: messages.ackSubject, text: messages.ackText },
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

/** Minimal slice of the Resend SDK used here (easy to fake in tests). */
export interface ResendEmailClient {
  emails: {
    send(payload: {
      from: string;
      to: string | string[];
      replyTo?: string;
      subject: string;
      text: string;
    }): Promise<{ error: { message: string } | null }>;
  };
}

/**
 * Resend: notifies the company first (so a statement is never lost), then sends the consumer
 * the acknowledgement of receipt. A failing acknowledgement is logged but does not fail the
 * request: the company already has the statement.
 */
export function createWithdrawalResendAdapter(options: {
  apiKey: string;
  from: string;
  notifyTo: string;
  logError?: (message: string, error?: unknown) => void;
  createClient?: (apiKey: string) => Promise<ResendEmailClient> | ResendEmailClient;
}): WithdrawalAdapter {
  const { apiKey, from, notifyTo, logError = console.error } = options;
  const createClient =
    options.createClient ??
    (async (key: string) => {
      const { Resend } = await import("resend");
      return new Resend(key) as unknown as ResendEmailClient;
    });

  return {
    name: "resend",
    async submit(entry, messages) {
      const client = await createClient(apiKey);
      const notify = await client.emails.send({
        from,
        to: notifyTo,
        replyTo: entry.email,
        subject: messages.notifySubject,
        text: messages.notifyText,
      });
      if (notify.error) throw new WaitlistAdapterError("resend", notify.error.message);

      const ack = await client.emails.send({
        from,
        to: entry.email,
        replyTo: notifyTo,
        subject: messages.ackSubject,
        text: messages.ackText,
      });
      if (ack.error) {
        logError(`[withdrawal] acknowledgement e-mail failed: ${ack.error.message}`);
      }
    },
  };
}

export type WithdrawalAdapterSelection =
  | { ok: true; adapter: WithdrawalAdapter }
  | { ok: false; reason: "not_configured" | "misconfigured"; message: string };

/**
 * Same rules as the waitlist, with two differences: Resend also needs RESEND_FROM (it sends
 * e-mail, not just a contact), and the webhook may be a dedicated WITHDRAWAL_WEBHOOK_URL.
 * Production without any adapter is "not_configured" (the API answers 503).
 */
export function selectWithdrawalAdapter(
  env: Pick<
    Env,
    | "NODE_ENV"
    | "WAITLIST_ADAPTER"
    | "RESEND_API_KEY"
    | "RESEND_FROM"
    | "WAITLIST_WEBHOOK_URL"
    | "WITHDRAWAL_WEBHOOK_URL"
  >,
  deps: {
    fetch?: typeof fetch;
    log?: (message: string) => void;
    logError?: (message: string, error?: unknown) => void;
    notifyTo: string;
  },
): WithdrawalAdapterSelection {
  const webhookUrl = env.WITHDRAWAL_WEBHOOK_URL ?? env.WAITLIST_WEBHOOK_URL;
  const resendReady = Boolean(env.RESEND_API_KEY && env.RESEND_FROM);

  const choice =
    env.WAITLIST_ADAPTER ??
    (resendReady
      ? "resend"
      : webhookUrl
        ? "webhook"
        : env.NODE_ENV !== "production"
          ? "console"
          : undefined);

  switch (choice) {
    case "resend":
      if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
        return {
          ok: false,
          reason: "misconfigured",
          message: "Withdrawals via Resend need RESEND_API_KEY and RESEND_FROM",
        };
      }
      return {
        ok: true,
        adapter: createWithdrawalResendAdapter({
          apiKey: env.RESEND_API_KEY,
          from: env.RESEND_FROM,
          notifyTo: deps.notifyTo,
          logError: deps.logError,
        }),
      };
    case "webhook":
      if (!webhookUrl) {
        return {
          ok: false,
          reason: "misconfigured",
          message:
            "Withdrawals via webhook need WITHDRAWAL_WEBHOOK_URL or WAITLIST_WEBHOOK_URL",
        };
      }
      return {
        ok: true,
        adapter: createWithdrawalWebhookAdapter(webhookUrl, deps.fetch),
      };
    case "console":
      return { ok: true, adapter: createWithdrawalConsoleAdapter(deps.log) };
    default:
      return {
        ok: false,
        reason: "not_configured",
        message:
          "No withdrawal adapter configured. Set RESEND_API_KEY + RESEND_FROM, or WITHDRAWAL_WEBHOOK_URL / WAITLIST_WEBHOOK_URL.",
      };
  }
}
