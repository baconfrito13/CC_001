import type Stripe from "stripe";

/**
 * Normalised payment events delivered by POST /api/webhooks/stripe.
 * Only the events a typical launch needs are forwarded; add more in `stripe-webhook.ts`.
 */
export type PaymentEvent =
  | {
      type: "checkout.completed";
      session: Stripe.Checkout.Session;
      /** `metadata.planId` set by POST /api/checkout (absent for Payment Links). */
      planId: string | undefined;
    }
  | {
      type: "subscription.created" | "subscription.updated" | "subscription.deleted";
      subscription: Stripe.Subscription;
    };

/**
 * EXTENSION POINT. Called once per verified Stripe event; throwing makes the webhook answer
 * 500 so Stripe retries. Make the implementation idempotent: Stripe may deliver an event more
 * than once.
 *
 * Typical things to do here: mark a user as paid in your database, grant or revoke access on
 * `subscription.deleted`, send a receipt or welcome email, notify yourself.
 */
export async function onPaymentEvent(_event: PaymentEvent): Promise<void> {
  // Intentionally a no-op in the starter.
}
