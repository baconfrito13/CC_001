/**
 * Single source of truth for everything product-specific that is not UI copy.
 *
 * Edit the `rawConfig` object below. It is validated with zod when this module is first
 * imported (during `next build`, `next dev` and tests), so a typo or a missing value fails
 * loudly instead of shipping broken pages or legal text.
 *
 * UI copy lives in `src/content/{en,pt}.ts`; legal documents in `src/content/legal/`.
 */
import { z } from "zod";
import { getEnv } from "@/lib/env";

// ---------------------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------------------

/** Locales the code base has dictionaries for. Add a locale here AND in `src/content`. */
export const supportedLocales = ["en", "pt"] as const;
export type Locale = (typeof supportedLocales)[number];

const localeSchema = z.enum(supportedLocales);

/** A string that must be provided for every supported locale. */
const localized = <T extends z.ZodType>(schema: T) => z.record(localeSchema, schema);

const nonEmpty = z.string().trim().min(1);

// ---------------------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------------------

const planSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use kebab-case, e.g. 'pro-yearly'"),
    name: localized(nonEmpty),
    description: localized(nonEmpty).optional(),
    /** Price in major currency units (12 = 12.00). Use 0 for a free plan. */
    price: z.number().min(0),
    currency: z.string().regex(/^[A-Z]{3}$/, "use an ISO 4217 code, e.g. 'EUR'"),
    interval: z.enum(["month", "year", "one_time"]),
    features: localized(z.array(nonEmpty).min(1)),
    highlighted: z.boolean().default(false),
    /**
     * No-code checkout: a Merchant-of-Record link (Lemon Squeezy, Paddle, Polar, ...) or a
     * Stripe Payment Link. The pricing button opens it directly.
     */
    checkoutUrl: z.url().optional(),
    /** Stripe Price id. The pricing button calls POST /api/checkout (needs STRIPE_SECRET_KEY). */
    stripePriceId: z
      .string()
      .regex(/^price_[A-Za-z0-9_]+$/, "expected a Stripe Price id starting with 'price_'")
      .optional(),
  })
  .refine((plan) => !(plan.checkoutUrl && plan.stripePriceId), {
    message: "set either checkoutUrl or stripePriceId, not both",
    path: ["checkoutUrl"],
  });

const paymentsSchema = z.object({
  /**
   * Stripe Managed Payments (Stripe as Merchant of Record). When true, POST /api/checkout
   * creates Checkout Sessions with `managed_payments: { enabled: true }`. Your Stripe account
   * must be eligible and have Managed Payments switched on in the Dashboard. Payment Links
   * used through `checkoutUrl` are configured in the Dashboard instead.
   */
  stripeManagedPayments: z.boolean().default(false),
});

const analyticsSchema = z
  .object({
    provider: z.enum(["none", "plausible", "posthog"]).default("none"),
    plausibleDomain: z.string().min(1).optional(),
    plausibleScriptSrc: z.url().default("https://plausible.io/js/script.js"),
    posthogKey: z.string().min(1).optional(),
    posthogHost: z.url().default("https://eu.i.posthog.com"),
    /** Only honoured for Plausible: a cookieless setup may load without consent. */
    cookieless: z.boolean().default(false),
  })
  .superRefine((analytics, ctx) => {
    if (analytics.provider === "plausible" && !analytics.plausibleDomain) {
      ctx.addIssue({
        code: "custom",
        path: ["plausibleDomain"],
        message: "plausibleDomain is required when provider is 'plausible'",
      });
    }
    if (analytics.provider === "posthog" && !analytics.posthogKey) {
      ctx.addIssue({
        code: "custom",
        path: ["posthogKey"],
        message: "posthogKey is required when provider is 'posthog'",
      });
    }
  });

export const siteConfigSchema = z
  .object({
    site: z.object({
      name: nonEmpty,
      tagline: nonEmpty,
      description: nonEmpty,
      /** Canonical origin, no trailing slash. Comes from NEXT_PUBLIC_SITE_URL. */
      url: z.url(),
      domain: nonEmpty,
      /** schema.org applicationCategory used in the SoftwareApplication JSON-LD. */
      applicationCategory: nonEmpty.default("BusinessApplication"),
    }),
    locales: z.array(localeSchema).min(1),
    defaultLocale: localeSchema,
    company: z.object({
      legalName: nonEmpty,
      taxId: nonEmpty,
      vatId: nonEmpty,
      registration: nonEmpty,
      address: nonEmpty,
      country: nonEmpty,
    }),
    contact: z.object({
      email: z.email(),
      supportEmail: z.email(),
      privacyEmail: z.email(),
    }),
    legal: z.object({
      /** ISO dates (YYYY-MM-DD). Rendered in the reader's locale inside legal documents. */
      effectiveDate: z.iso.date(),
      lastUpdated: z.iso.date(),
      governingLaw: localized(nonEmpty),
      jurisdiction: localized(nonEmpty),
      ralEntityName: nonEmpty,
      ralEntityUrl: z.url(),
      complaintsBookUrl: z.url(),
      supervisoryAuthority: nonEmpty,
      supervisoryAuthorityUrl: z.url(),
      /** true -> the withdrawal policy page is published and linked. */
      sellsToConsumers: z.boolean(),
    }),
    social: z
      .object({
        x: z.url(),
        linkedin: z.url(),
        github: z.url(),
        youtube: z.url(),
        instagram: z.url(),
        facebook: z.url(),
      })
      .partial(),
    pricing: z.object({
      plans: z
        .array(planSchema)
        .min(1)
        .refine((plans) => new Set(plans.map((p) => p.id)).size === plans.length, {
          message: "plan ids must be unique",
        }),
    }),
    payments: paymentsSchema,
    analytics: analyticsSchema,
    features: z.object({
      waitlist: z.boolean().default(true),
      pricing: z.boolean().default(true),
      /** Reserved: no blog is scaffolded yet. Keep false until a blog route exists. */
      blog: z.boolean().default(false),
    }),
  })
  .refine((config) => config.locales.includes(config.defaultLocale), {
    message: "defaultLocale must be one of locales",
    path: ["defaultLocale"],
  });

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;
export type PricingPlan = SiteConfig["pricing"]["plans"][number];

// ---------------------------------------------------------------------------------------
// Values (placeholders: replace for each product)
// ---------------------------------------------------------------------------------------

const env = getEnv();

export const rawConfig = {
  site: {
    name: "Acme",
    tagline: "The simplest way to get your next idea off the ground",
    description:
      "Acme is a placeholder product used to demonstrate the web launch starter. Replace this text.",
    url: (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
    domain: "acme.example",
    applicationCategory: "BusinessApplication",
  },
  locales: ["en", "pt"],
  defaultLocale: "en",
  company: {
    legalName: "Acme, Lda.",
    taxId: "PT 000 000 000 (placeholder)",
    vatId: "PT000000000 (placeholder)",
    registration:
      "Conservatória do Registo Comercial de Lisboa, no. 000000000 (placeholder)",
    address: "Rua do Exemplo 1, 1000-000 Lisboa",
    country: "Portugal",
  },
  contact: {
    email: "hello@acme.example",
    supportEmail: "support@acme.example",
    privacyEmail: "privacy@acme.example",
  },
  legal: {
    effectiveDate: "2026-10-08",
    lastUpdated: "2026-10-08",
    governingLaw: { en: "Portuguese law", pt: "a lei portuguesa" },
    jurisdiction: {
      en: "the courts of the district of Lisbon, Portugal",
      pt: "os tribunais da comarca de Lisboa, Portugal",
    },
    ralEntityName: "Centro de Arbitragem de Conflitos de Consumo de Lisboa",
    ralEntityUrl: "https://www.centroarbitragemlisboa.pt",
    complaintsBookUrl: "https://www.livroreclamacoes.pt",
    supervisoryAuthority: "CNPD",
    supervisoryAuthorityUrl: "https://www.cnpd.pt",
    sellsToConsumers: true,
  },
  social: {
    // x: "https://x.com/acme",
    // linkedin: "https://www.linkedin.com/company/acme",
  },
  pricing: {
    plans: [
      {
        id: "free",
        name: { en: "Starter", pt: "Inicial" },
        description: {
          en: "Everything you need to try Acme.",
          pt: "Tudo o que precisa para experimentar o Acme.",
        },
        price: 0,
        currency: "EUR",
        interval: "month",
        features: {
          en: ["1 project", "Community support", "Basic reports"],
          pt: ["1 projeto", "Apoio da comunidade", "Relatórios básicos"],
        },
        highlighted: false,
      },
      {
        id: "pro",
        name: { en: "Pro", pt: "Pro" },
        description: {
          en: "For individuals who rely on Acme every day.",
          pt: "Para quem usa o Acme todos os dias.",
        },
        price: 12,
        currency: "EUR",
        interval: "month",
        features: {
          en: [
            "Unlimited projects",
            "Priority email support",
            "Advanced reports",
            "Export your data",
          ],
          pt: [
            "Projetos ilimitados",
            "Apoio prioritário por e-mail",
            "Relatórios avançados",
            "Exportação dos seus dados",
          ],
        },
        highlighted: true,
        // checkoutUrl: "https://acme.lemonsqueezy.com/checkout/buy/...",
        // stripePriceId: "price_...",
      },
      {
        id: "team",
        name: { en: "Team", pt: "Equipa" },
        description: {
          en: "Shared workspaces for small teams.",
          pt: "Espaços partilhados para pequenas equipas.",
        },
        price: 39,
        currency: "EUR",
        interval: "month",
        features: {
          en: ["Everything in Pro", "Up to 10 members", "Shared workspaces", "Audit log"],
          pt: [
            "Tudo o que está no Pro",
            "Até 10 membros",
            "Espaços de trabalho partilhados",
            "Registo de auditoria",
          ],
        },
        highlighted: false,
      },
    ],
  },
  payments: {
    stripeManagedPayments: false,
  },
  analytics: {
    // Prefer environment variables so each deployment can differ (see .env.example).
    provider: env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "none",
    plausibleDomain: env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    plausibleScriptSrc: env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC,
    posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: env.NEXT_PUBLIC_POSTHOG_HOST,
    cookieless: env.NEXT_PUBLIC_ANALYTICS_COOKIELESS ?? false,
  },
  features: {
    waitlist: true,
    pricing: true,
    blog: false,
  },
} satisfies SiteConfigInput;

/** Parse errors are rewritten to name the failing path, then thrown at import time. */
export function parseSiteConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new Error(
      `Invalid site configuration (src/config/site.ts):\n${lines.join("\n")}`,
    );
  }
  return result.data;
}

export const config: SiteConfig = parseSiteConfig(rawConfig);

export const {
  site,
  locales,
  defaultLocale,
  company,
  contact,
  legal,
  social,
  pricing,
  payments,
  analytics,
  features,
} = config;
