import type Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { json } from "@/lib/http";
import { onPaymentEvent, type PaymentEvent } from "@/lib/payments";
import { createStripe } from "@/lib/stripe";

/** The slice of the Stripe SDK used here, so tests can inject a fake. */
export interface WebhookVerifier {
  webhooks: {
    constructEventAsync(
      payload: string,
      header: string,
      secret: string,
    ): Promise<Stripe.Event>;
  };
}

export interface StripeWebhookDeps {
  getClient: () => WebhookVerifier | null;
  secret: () => string | undefined;
  onEvent: (event: PaymentEvent) => Promise<void>;
  logError: (message: string, error?: unknown) => void;
}

const defaultDeps: StripeWebhookDeps = {
  getClient: () => createStripe(getEnv()),
  secret: () => getEnv().STRIPE_WEBHOOK_SECRET,
  onEvent: onPaymentEvent,
  logError: (message, error) => console.error(message, error ?? ""),
};

/** Map a verified Stripe event to the small set of events the app cares about. */
export function toPaymentEvent(event: Stripe.Event): PaymentEvent | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      return { type: "checkout.completed", session, planId: session.metadata?.planId };
    }
    case "customer.subscription.created":
      return { type: "subscription.created", subscription: event.data.object };
    case "customer.subscription.updated":
      return { type: "subscription.updated", subscription: event.data.object };
    case "customer.subscription.deleted":
      return { type: "subscription.deleted", subscription: event.data.object };
    default:
      return null;
  }
}

/**
 * POST /api/webhooks/stripe
 *
 * The signature is verified against the RAW request body, so the body must not be parsed
 * before this point. 400 for a missing/invalid signature, 501 when Stripe is not configured,
 * 500 when the `onPaymentEvent` hook throws (Stripe will retry).
 */
export async function handleStripeWebhook(
  request: Request,
  overrides: Partial<StripeWebhookDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps, ...overrides };

  const secret = deps.secret();
  const stripe = deps.getClient();
  if (!stripe || !secret) {
    return json(
      {
        error: "stripe_not_configured",
        message:
          "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to receive Stripe webhooks.",
      },
      { status: 501 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ error: "missing_signature" }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch {
    return json({ error: "invalid_signature" }, { status: 400 });
  }

  const paymentEvent = toPaymentEvent(event);
  if (paymentEvent) {
    try {
      await deps.onEvent(paymentEvent);
    } catch (error) {
      deps.logError(
        `[stripe-webhook] handler failed for ${event.type} (${event.id})`,
        error,
      );
      return json({ error: "handler_failed" }, { status: 500 });
    }
  }
  return json({ received: true });
}
