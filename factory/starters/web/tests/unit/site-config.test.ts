import { describe, expect, it } from "vitest";
import {
  analytics,
  config,
  defaultLocale,
  features,
  legal,
  locales,
  parseSiteConfig,
  pricing,
  rawConfig,
  site,
} from "@/config/site";

/** Deep copy of the shipped config that tests can mutate freely. */
function draft() {
  return structuredClone(rawConfig) as Record<string, any>;
}

describe("site config schema", () => {
  it("accepts the shipped placeholder configuration", () => {
    expect(() => parseSiteConfig(rawConfig)).not.toThrow();
    expect(config.site.name).toBe("Acme");
    expect(config.company.legalName).toBe("Acme, Lda.");
  });

  it("exposes the documented sections", () => {
    expect(locales).toEqual(["en", "pt"]);
    expect(defaultLocale).toBe("en");
    expect(legal.complaintsBookUrl).toBe("https://www.livroreclamacoes.pt");
    expect(legal.supervisoryAuthority).toBe("CNPD");
    expect(legal.supervisoryAuthorityUrl).toBe("https://www.cnpd.pt");
    expect(features).toEqual({ waitlist: true, pricing: true, blog: false });
    expect(analytics.posthogHost).toBe("https://eu.i.posthog.com");
    expect(pricing.plans.length).toBeGreaterThan(0);
  });

  it("falls back to http://localhost:3000 and strips trailing slashes from the site URL", () => {
    expect(site.url).toMatch(/^https?:\/\/[^/]+$/);
    if (!process.env.NEXT_PUBLIC_SITE_URL) expect(site.url).toBe("http://localhost:3000");
  });

  it("requires every field of every locale for localized strings", () => {
    const input = draft();
    delete input.pricing.plans[0].name.pt;
    expect(() => parseSiteConfig(input)).toThrow(/pricing\.plans\.0\.name\.pt/);
  });

  it("rejects an invalid site URL, e-mail address and date, naming the failing path", () => {
    const input = draft();
    input.site.url = "not a url";
    input.contact.email = "nope";
    input.legal.effectiveDate = "08/10/2026";
    let message = "";
    try {
      parseSiteConfig(input);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("site.url");
    expect(message).toContain("contact.email");
    expect(message).toContain("legal.effectiveDate");
  });

  it("rejects a default locale that is not enabled", () => {
    const input = draft();
    input.locales = ["pt"];
    input.defaultLocale = "en";
    expect(() => parseSiteConfig(input)).toThrow(/defaultLocale/);
  });

  it("rejects duplicate plan ids and malformed plan values", () => {
    const duplicate = draft();
    duplicate.pricing.plans[1].id = duplicate.pricing.plans[0].id;
    expect(() => parseSiteConfig(duplicate)).toThrow(/unique/);

    const badCurrency = draft();
    badCurrency.pricing.plans[0].currency = "eur";
    expect(() => parseSiteConfig(badCurrency)).toThrow(/ISO 4217/);

    const negative = draft();
    negative.pricing.plans[0].price = -1;
    expect(() => parseSiteConfig(negative)).toThrow(/price/);

    const badId = draft();
    badId.pricing.plans[0].id = "Not Kebab";
    expect(() => parseSiteConfig(badId)).toThrow(/kebab-case/);
  });

  it("accepts either checkoutUrl or stripePriceId on a plan, never both", () => {
    const link = draft();
    link.pricing.plans[1].checkoutUrl = "https://pay.example.com/buy/abc";
    expect(() => parseSiteConfig(link)).not.toThrow();

    const stripe = draft();
    stripe.pricing.plans[1].stripePriceId = "price_1Abc123";
    expect(() => parseSiteConfig(stripe)).not.toThrow();

    const both = draft();
    both.pricing.plans[1].checkoutUrl = "https://pay.example.com/buy/abc";
    both.pricing.plans[1].stripePriceId = "price_1Abc123";
    expect(() => parseSiteConfig(both)).toThrow(/either checkoutUrl or stripePriceId/);

    const badPrice = draft();
    badPrice.pricing.plans[1].stripePriceId = "prod_123";
    expect(() => parseSiteConfig(badPrice)).toThrow(/price_/);
  });

  it("validates the analytics provider requirements", () => {
    const plausible = draft();
    plausible.analytics = { provider: "plausible" };
    expect(() => parseSiteConfig(plausible)).toThrow(/plausibleDomain/);
    plausible.analytics.plausibleDomain = "acme.example";
    expect(parseSiteConfig(plausible).analytics.plausibleScriptSrc).toBe(
      "https://plausible.io/js/script.js",
    );

    const posthog = draft();
    posthog.analytics = { provider: "posthog" };
    expect(() => parseSiteConfig(posthog)).toThrow(/posthogKey/);
    posthog.analytics.posthogKey = "phc_123";
    expect(parseSiteConfig(posthog).analytics.posthogHost).toBe(
      "https://eu.i.posthog.com",
    );

    const none = draft();
    none.analytics = {};
    expect(parseSiteConfig(none).analytics).toMatchObject({
      provider: "none",
      cookieless: false,
    });
  });

  it("keeps Stripe Managed Payments off unless enabled", () => {
    expect(config.payments.stripeManagedPayments).toBe(false);
    const input = draft();
    delete input.payments;
    expect(() => parseSiteConfig(input)).toThrow(/payments/);
    input.payments = {};
    expect(parseSiteConfig(input).payments.stripeManagedPayments).toBe(false);
    input.payments = { stripeManagedPayments: true };
    expect(parseSiteConfig(input).payments.stripeManagedPayments).toBe(true);
  });

  it("defaults feature flags", () => {
    const input = draft();
    input.features = {};
    expect(parseSiteConfig(input).features).toEqual({
      waitlist: true,
      pricing: true,
      blog: false,
    });
  });

  it("only accepts valid social URLs", () => {
    const input = draft();
    input.social = { x: "https://x.com/acme", github: "nope" };
    expect(() => parseSiteConfig(input)).toThrow(/social\.github/);
  });
});
