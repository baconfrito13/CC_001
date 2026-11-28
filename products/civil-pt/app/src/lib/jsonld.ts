import type { Locale, SiteConfig } from "@/config/site";
import { localeMeta } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";

type JsonLd = Record<string, unknown>;

const SCHEMA = "https://schema.org";

export function organizationJsonLd(config: SiteConfig): JsonLd {
  const sameAs = Object.values(config.social).filter(Boolean);
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    name: config.company.legalName,
    legalName: config.company.legalName,
    brand: { "@type": "Brand", name: config.site.name },
    url: config.site.url,
    logo: `${config.site.url}/icon.svg`,
    email: config.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.company.address,
      addressCountry: config.company.country,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(
  config: SiteConfig,
  locale: Locale,
  description: string,
): JsonLd {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    name: config.site.name,
    url: `${config.site.url}${localizedPath(locale)}`,
    description,
    inLanguage: localeMeta[locale].htmlLang,
    publisher: { "@type": "Organization", name: config.company.legalName },
  };
}

const UNIT_CODES = { month: "MON", year: "ANN" } as const;

export function softwareApplicationJsonLd(
  config: SiteConfig,
  locale: Locale,
  description: string,
): JsonLd {
  const pricingUrl = `${config.site.url}${localizedPath(locale, "/pricing")}`;
  const offers = config.features.pricing
    ? config.pricing.plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name[locale],
        price: plan.price.toFixed(2),
        priceCurrency: plan.currency,
        url: pricingUrl,
        availability: `${SCHEMA}/PreOrder`,
        ...(plan.interval === "one_time"
          ? {}
          : {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: plan.price.toFixed(2),
                priceCurrency: plan.currency,
                referenceQuantity: {
                  "@type": "QuantitativeValue",
                  value: 1,
                  unitCode: UNIT_CODES[plan.interval],
                },
              },
            }),
      }))
    : undefined;

  return {
    "@context": SCHEMA,
    "@type": "SoftwareApplication",
    name: config.site.name,
    description,
    url: `${config.site.url}${localizedPath(locale)}`,
    applicationCategory: config.site.applicationCategory,
    operatingSystem: "Web",
    inLanguage: localeMeta[locale].htmlLang,
    ...(offers ? { offers } : {}),
  };
}

export function faqJsonLd(
  items: readonly { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Serialise JSON-LD for an inline <script>: `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
