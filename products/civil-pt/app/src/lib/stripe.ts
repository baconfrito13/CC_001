import Stripe from "stripe";
import type { Env } from "@/lib/env";

/** Returns a Stripe client, or null when STRIPE_SECRET_KEY is not set. */
export function createStripe(env: Pick<Env, "STRIPE_SECRET_KEY">): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  // The SDK pins the API version it was generated against, so none is set here.
  return new Stripe(env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 15_000 });
}
