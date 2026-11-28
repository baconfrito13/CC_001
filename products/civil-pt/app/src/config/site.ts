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

/** Exact token for values only the founder knows; `06-qa` and `launch` reject it in production. */
export const PENDING_FOUNDER = "[A PREENCHER PELO FUNDADOR]";

export const rawConfig = {
  site: {
    name: "Rastoplan",
    tagline: "Cada quantidade, com rasto até à folha",
    description:
      "O Rastoplan lê plantas em PDF vetorial, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel.",
    url: (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
    domain: "rastoplan.com",
    applicationCategory: "BusinessApplication",
  },
  locales: ["en", "pt"],
  defaultLocale: "pt",
  // Company identity: values only the founder knows stay as the exact pending token (HT in
  // docs/05-build.md section 10). `06-qa` and `launch` fail the release while it is present.
  company: {
    legalName: PENDING_FOUNDER,
    taxId: PENDING_FOUNDER,
    vatId: PENDING_FOUNDER,
    registration: PENDING_FOUNDER,
    address: PENDING_FOUNDER,
    country: "Portugal",
  },
  contact: {
    email: "ola@rastoplan.com",
    supportEmail: "apoio@rastoplan.com",
    privacyEmail: "privacidade@rastoplan.com",
  },
  legal: {
    // Draft dates; `launch` sets the real effective date at go-live.
    effectiveDate: "2026-11-28",
    lastUpdated: "2026-11-28",
    governingLaw: { en: "Portuguese law", pt: "a lei portuguesa" },
    jurisdiction: {
      en: "the courts of the district of Lisbon, Portugal",
      pt: "os tribunais da comarca de Lisboa, Portugal",
    },
    ralEntityName:
      "Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC)",
    ralEntityUrl: "https://www.cniacc.pt",
    complaintsBookUrl: "https://www.livroreclamacoes.pt",
    supervisoryAuthority: "CNPD",
    supervisoryAuthorityUrl: "https://www.cnpd.pt",
    // B2B only (architecture hand-off): the online withdrawal function stays switched off.
    sellsToConsumers: false,
  },
  social: {},
  // Prices are EUR without VAT, from docs/02-business.md section 5. Stripe price ids are added by
  // the billing slice (S-09); until then every plan button leads to the demo request.
  pricing: {
    plans: [
      {
        id: "pass-20",
        name: { en: "Pass 20", pt: "Passe 20" },
        description: {
          en: "One small tender or one freelance job.",
          pt: "Um concurso pequeno ou um trabalho de independente.",
        },
        price: 59,
        currency: "EUR",
        interval: "one_time",
        features: {
          en: [
            "20 sheets, valid for 90 days",
            "Excel export with the Trace sheet",
            "No subscription",
          ],
          pt: [
            "20 folhas, válidas 90 dias",
            "Exportação para Excel com a folha «Rasto»",
            "Sem subscrição",
          ],
        },
        highlighted: false,
      },
      {
        id: "pass-60",
        name: { en: "Pass 60", pt: "Passe 60" },
        description: {
          en: "A medium tender for a contractor's estimator.",
          pt: "Um concurso médio para o orçamentista de uma empreiteira.",
        },
        price: 129,
        currency: "EUR",
        interval: "one_time",
        features: {
          en: [
            "60 sheets, valid for 90 days",
            "Excel export with the Trace sheet",
            "No subscription",
          ],
          pt: [
            "60 folhas, válidas 90 dias",
            "Exportação para Excel com a folha «Rasto»",
            "Sem subscrição",
          ],
        },
        highlighted: true,
      },
      {
        id: "pass-150",
        name: { en: "Pass 150", pt: "Passe 150" },
        description: {
          en: "A large tender or several at the same time.",
          pt: "Um concurso grande ou vários em simultâneo.",
        },
        price: 249,
        currency: "EUR",
        interval: "one_time",
        features: {
          en: [
            "150 sheets, valid for 90 days",
            "Excel export with the Trace sheet",
            "No subscription",
          ],
          pt: [
            "150 folhas, válidas 90 dias",
            "Exportação para Excel com a folha «Rasto»",
            "Sem subscrição",
          ],
        },
        highlighted: false,
      },
      {
        id: "independente",
        name: { en: "Freelancer", pt: "Independente" },
        description: {
          en: "Monthly, for subcontractors and independent estimators.",
          pt: "Mensal, para subempreiteiros e medidores independentes.",
        },
        price: 49,
        currency: "EUR",
        interval: "month",
        features: {
          en: [
            "15 sheets a month",
            "Each month's sheets valid for 90 days",
            "Cancel at any time",
          ],
          pt: [
            "15 folhas por mês",
            "As folhas de cada mês valem 90 dias",
            "Cancele quando quiser",
          ],
        },
        highlighted: false,
      },
      {
        id: "empresa",
        name: { en: "Company", pt: "Empresa" },
        description: {
          en: "Monthly, for contractors with a steady flow of tenders.",
          pt: "Mensal, para empreiteiras com um fluxo contínuo de concursos.",
        },
        price: 99,
        currency: "EUR",
        interval: "month",
        features: {
          en: [
            "50 sheets a month",
            "Each month's sheets valid for 90 days",
            "Cancel at any time",
          ],
          pt: [
            "50 folhas por mês",
            "As folhas de cada mês valem 90 dias",
            "Cancele quando quiser",
          ],
        },
        highlighted: false,
      },
      {
        id: "gabinete",
        name: { en: "Studio", pt: "Gabinete" },
        description: {
          en: "Monthly, for design offices with several tenders.",
          pt: "Mensal, para gabinetes com vários concursos.",
        },
        price: 199,
        currency: "EUR",
        interval: "month",
        features: {
          en: [
            "120 sheets a month",
            "Each month's sheets valid for 90 days",
            "Cancel at any time",
          ],
          pt: [
            "120 folhas por mês",
            "As folhas de cada mês valem 90 dias",
            "Cancele quando quiser",
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
