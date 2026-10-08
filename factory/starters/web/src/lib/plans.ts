import type { PricingPlan } from "@/config/site";

export type PlanActionKind = "link" | "stripe" | "waitlist";

/**
 * What the pricing button of a plan does:
 *  - "link":     `checkoutUrl` is set -> open the Merchant-of-Record / Payment Link checkout
 *  - "stripe":   `stripePriceId` is set -> POST /api/checkout, then redirect to Stripe
 *  - "waitlist": neither -> scroll to the waitlist (or contact the company when disabled)
 */
export function planActionKind(
  plan: Pick<PricingPlan, "checkoutUrl" | "stripePriceId">,
): PlanActionKind {
  if (plan.checkoutUrl) return "link";
  if (plan.stripePriceId) return "stripe";
  return "waitlist";
}
