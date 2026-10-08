import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import type { PricingPlan } from "@/config/site";
import { type CheckoutClient, handleCheckout } from "@/lib/checkout";
import type { PaymentEvent } from "@/lib/payments";
import { handleStripeWebhook, toPaymentEvent } from "@/lib/stripe-webhook";

const plan = (overrides: Partial<PricingPlan>): PricingPlan => ({
  id: "pro",
  name: { en: "Pro", pt: "Pro" },
  price: 12,
  currency: "EUR",
  interval: "month",
  features: { en: ["a"], pt: ["a"] },
  highlighted: false,
  ...overrides,
});

const plans = [
  plan({ id: "pro", stripePriceId: "price_pro_monthly" }),
  plan({
    id: "lifetime",
    interval: "one_time",
    price: 99,
    stripePriceId: "price_lifetime",
  }),
  plan({ id: "link", checkoutUrl: "https://pay.example/buy" }),
  plan({ id: "free", price: 0 }),
];

function checkoutRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  function setup() {
    const create = vi.fn(async () => ({
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
    }));
    const client: CheckoutClient = { checkout: { sessions: { create } } };
    const logError = vi.fn();
    return {
      create,
      logError,
      deps: { getClient: () => client, plans, baseUrl: "https://acme.example", logError },
    };
  }

  it("answers 501 with a clear message when Stripe is not configured", async () => {
    const { deps } = setup();
    const response = await handleCheckout(
      checkoutRequest({ planId: "pro", locale: "en" }),
      {
        ...deps,
        getClient: () => null,
      },
    );
    expect(response.status).toBe(501);
    const body = await response.json();
    expect(body.error).toBe("stripe_not_configured");
    expect(body.message).toContain("STRIPE_SECRET_KEY");
  });

  it("creates a subscription session with localized return URLs", async () => {
    const { deps, create } = setup();
    const response = await handleCheckout(
      checkoutRequest({ planId: "pro", locale: "pt" }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_pro_monthly", quantity: 1 }],
        success_url:
          "https://acme.example/pt/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://acme.example/pt/pricing?checkout=cancelled",
        locale: "pt",
        metadata: { planId: "pro", locale: "pt" },
        subscription_data: { metadata: { planId: "pro", locale: "pt" } },
      }),
    );
  });

  it("uses payment mode for one-time plans", async () => {
    const { deps, create } = setup();
    await handleCheckout(checkoutRequest({ planId: "lifetime", locale: "en" }), deps);
    const params = (create.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(params.mode).toBe("payment");
    expect(params).not.toHaveProperty("subscription_data");
    expect(params.success_url).toContain("https://acme.example/en/pricing");
  });

  it("answers 404 for unknown plans and plans without a stripePriceId", async () => {
    const { deps, create } = setup();
    for (const planId of ["missing", "link", "free"]) {
      const response = await handleCheckout(
        checkoutRequest({ planId, locale: "en" }),
        deps,
      );
      expect(response.status).toBe(404);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it("validates the body, content type and origin", async () => {
    const { deps } = setup();
    expect((await handleCheckout(checkoutRequest({ planId: "pro" }), deps)).status).toBe(
      400,
    );
    expect(
      (await handleCheckout(checkoutRequest({ planId: "pro", locale: "xx" }), deps))
        .status,
    ).toBe(400);
    expect(
      (
        await handleCheckout(
          checkoutRequest(
            { planId: "pro", locale: "en" },
            { "content-type": "text/plain" },
          ),
          deps,
        )
      ).status,
    ).toBe(415);
    expect(
      (
        await handleCheckout(
          checkoutRequest(
            { planId: "pro", locale: "en" },
            { origin: "https://evil.example" },
          ),
          deps,
        )
      ).status,
    ).toBe(403);
  });

  it("answers 502 and logs when Stripe fails", async () => {
    const { deps, logError } = setup();
    const response = await handleCheckout(
      checkoutRequest({ planId: "pro", locale: "en" }),
      {
        ...deps,
        getClient: () => ({
          checkout: {
            sessions: {
              create: async () => {
                throw new Error("stripe down");
              },
            },
          },
        }),
      },
    );
    expect(response.status).toBe(502);
    expect(logError).toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/stripe", () => {
  const secret = "whsec_test_secret";
  const stripe = new Stripe("sk_test_dummy");

  function event(type: string, object: Record<string, unknown>) {
    return JSON.stringify({
      id: "evt_1",
      object: "event",
      api_version: "2026-09-30.endive",
      created: 1_790_000_000,
      type,
      data: { object },
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
    });
  }

  function signed(payload: string, signingSecret = secret) {
    return new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": stripe.webhooks.generateTestHeaderString({
          payload,
          secret: signingSecret,
        }),
      },
      body: payload,
    });
  }

  function setup() {
    const onEvent = vi.fn(async (_event: PaymentEvent) => {});
    const logError = vi.fn();
    return {
      onEvent,
      logError,
      deps: { getClient: () => stripe, secret: () => secret, onEvent, logError },
    };
  }

  it("verifies the signature against the raw body and forwards checkout.session.completed", async () => {
    const { deps, onEvent } = setup();
    const payload = event("checkout.session.completed", {
      id: "cs_test_1",
      object: "checkout.session",
      mode: "subscription",
      metadata: { planId: "pro" },
    });
    const response = await handleStripeWebhook(signed(payload), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(onEvent).toHaveBeenCalledOnce();
    const forwarded = onEvent.mock.calls[0]?.[0];
    expect(forwarded).toMatchObject({ type: "checkout.completed", planId: "pro" });
    expect(forwarded?.type === "checkout.completed" && forwarded.session.id).toBe(
      "cs_test_1",
    );
  });

  it("forwards customer.subscription.created / updated / deleted", async () => {
    const { deps, onEvent } = setup();
    for (const suffix of ["created", "updated", "deleted"]) {
      const payload = event(`customer.subscription.${suffix}`, {
        id: "sub_1",
        object: "subscription",
      });
      expect((await handleStripeWebhook(signed(payload), deps)).status).toBe(200);
    }
    expect(onEvent.mock.calls.map(([e]) => e.type)).toEqual([
      "subscription.created",
      "subscription.updated",
      "subscription.deleted",
    ]);
  });

  it("acknowledges but ignores other event types", async () => {
    const { deps, onEvent } = setup();
    const response = await handleStripeWebhook(
      signed(event("invoice.paid", { id: "in_1", object: "invoice" })),
      deps,
    );
    expect(response.status).toBe(200);
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("rejects a bad signature, a tampered body and a missing signature with 400", async () => {
    const { deps, onEvent } = setup();
    const payload = event("customer.subscription.created", {
      id: "sub_1",
      object: "subscription",
    });

    expect((await handleStripeWebhook(signed(payload, "whsec_other"), deps)).status).toBe(
      400,
    );

    const tampered = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: signed(payload).headers,
      body: payload.replace("sub_1", "sub_2"),
    });
    expect((await handleStripeWebhook(tampered, deps)).status).toBe(400);

    const unsigned = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
    });
    expect((await handleStripeWebhook(unsigned, deps)).status).toBe(400);
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("answers 501 when the secret or the client is missing", async () => {
    const { deps } = setup();
    const payload = event("invoice.paid", { id: "in_1", object: "invoice" });
    expect(
      (await handleStripeWebhook(signed(payload), { ...deps, secret: () => undefined }))
        .status,
    ).toBe(501);
    expect(
      (await handleStripeWebhook(signed(payload), { ...deps, getClient: () => null }))
        .status,
    ).toBe(501);
  });

  it("answers 500 when the onPaymentEvent hook throws, so Stripe retries", async () => {
    const { deps, logError } = setup();
    const failing = {
      ...deps,
      onEvent: async () => {
        throw new Error("db down");
      },
    };
    const payload = event("customer.subscription.deleted", {
      id: "sub_1",
      object: "subscription",
    });
    expect((await handleStripeWebhook(signed(payload), failing)).status).toBe(500);
    expect(logError).toHaveBeenCalled();
  });

  it("toPaymentEvent maps only the supported events", () => {
    const base = { id: "evt", object: "event", data: { object: {} } };
    expect(
      toPaymentEvent({ ...base, type: "invoice.paid" } as unknown as Stripe.Event),
    ).toBeNull();
    expect(
      toPaymentEvent({
        ...base,
        type: "customer.subscription.updated",
      } as unknown as Stripe.Event)?.type,
    ).toBe("subscription.updated");
  });
});

describe("planActionKind", () => {
  it("picks the pricing button behaviour from the plan configuration", async () => {
    const { planActionKind } = await import("@/lib/plans");
    expect(planActionKind({ checkoutUrl: "https://pay.example/buy" })).toBe("link");
    expect(planActionKind({ stripePriceId: "price_123" })).toBe("stripe");
    expect(planActionKind({})).toBe("waitlist");
  });
});
