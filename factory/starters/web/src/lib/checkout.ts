import { z } from "zod";
import { config, type PricingPlan, site, supportedLocales } from "@/config/site";
import { getEnv } from "@/lib/env";
import { isSameOrigin, json, readJsonBody } from "@/lib/http";
import { localeMeta } from "@/lib/i18n";
import { createStripe } from "@/lib/stripe";

/** The slice of the Stripe SDK used here, so tests can inject a fake. */
export interface CheckoutClient {
  checkout: {
    sessions: {
      create(params: {
        mode: "payment" | "subscription";
        line_items: { price: string; quantity: number }[];
        success_url: string;
        cancel_url: string;
        locale?: "en" | "pt";
        allow_promotion_codes?: boolean;
        client_reference_id?: string;
        metadata?: Record<string, string>;
        subscription_data?: { metadata?: Record<string, string> };
      }): Promise<{ url: string | null }>;
    };
  };
}

export interface CheckoutDeps {
  getClient: () => CheckoutClient | null;
  plans: readonly PricingPlan[];
  baseUrl: string;
  logError: (message: string, error?: unknown) => void;
}

const defaultDeps: CheckoutDeps = {
  getClient: () => createStripe(getEnv()) as CheckoutClient | null,
  plans: config.pricing.plans,
  baseUrl: site.url,
  logError: (message, error) => console.error(message, error ?? ""),
};

const checkoutSchema = z.object({
  planId: z.string().min(1).max(64),
  locale: z.enum(supportedLocales),
});

/**
 * POST /api/checkout  { planId, locale }  ->  { url }
 *
 * 501 when Stripe is not configured, 404 for unknown / non-Stripe plans. Redirect URLs are
 * built from the configured site URL (never from request headers).
 */
export async function handleCheckout(
  request: Request,
  overrides: Partial<CheckoutDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps, ...overrides };

  if (!isSameOrigin(request.headers))
    return json({ error: "forbidden" }, { status: 403 });

  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return json({ error: body.error }, { status: body.status });

  const parsed = checkoutSchema.safeParse(body.data);
  if (!parsed.success) return json({ error: "validation" }, { status: 400 });
  const { planId, locale } = parsed.data;

  const plan = deps.plans.find((candidate) => candidate.id === planId);
  if (!plan?.stripePriceId) {
    return json(
      { error: "unknown_plan", message: "No plan with a stripePriceId matches this id." },
      { status: 404 },
    );
  }

  const stripe = deps.getClient();
  if (!stripe) {
    return json(
      {
        error: "stripe_not_configured",
        message:
          "Stripe checkout is not configured. Set STRIPE_SECRET_KEY, or use `checkoutUrl` on the plan for a no-code checkout link.",
      },
      { status: 501 },
    );
  }

  const mode = plan.interval === "one_time" ? "payment" : "subscription";
  const metadata = { planId: plan.id, locale };
  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${deps.baseUrl}/${locale}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${deps.baseUrl}/${locale}/pricing?checkout=cancelled`,
      locale: localeMeta[locale].stripe as "en" | "pt",
      allow_promotion_codes: true,
      metadata,
      ...(mode === "subscription" ? { subscription_data: { metadata } } : {}),
    });
    if (!session.url) throw new Error("Stripe returned a session without a URL");
    return json({ url: session.url });
  } catch (error) {
    deps.logError("[checkout] could not create a Stripe Checkout Session", error);
    return json(
      { error: "upstream", message: "Could not start checkout." },
      { status: 502 },
    );
  }
}
