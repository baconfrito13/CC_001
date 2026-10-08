import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { config, locales, site } from "@/config/site";
import { readBrandColors } from "@/lib/brand";
import {
  faqJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/jsonld";
import { getPublishedLegalDocs } from "@/lib/legal";
import { buildAlternates } from "@/lib/seo";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every page in every locale", () => {
    const expectedPaths = [
      "",
      "/pricing",
      ...getPublishedLegalDocs().map((doc) => `/legal/${doc}`),
    ];
    expect(entries).toHaveLength(expectedPaths.length * locales.length);
    for (const path of expectedPaths) {
      for (const locale of locales) {
        expect(entries.map((e) => e.url)).toContain(`${site.url}/${locale}${path}`);
      }
    }
  });

  it("adds hreflang alternates (pt-PT) and x-default to every entry", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual(["en", "pt-PT", "x-default"]);
      expect(languages["x-default"]).toBe(languages.en);
      expect(languages["pt-PT"]).toContain("/pt");
    }
  });

  it("includes the withdrawal page only when selling to consumers", () => {
    expect(entries.some((e) => e.url.endsWith("/legal/withdrawal"))).toBe(
      config.legal.sellsToConsumers,
    );
  });
});

describe("robots", () => {
  it("allows the site, blocks /api and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${site.url}/sitemap.xml`,
    });
  });
});

describe("alternates", () => {
  it("builds canonical and hreflang links for a page", () => {
    const alternates = buildAlternates("pt", "/pricing");
    expect(alternates.canonical).toBe(`${site.url}/pt/pricing`);
    expect(alternates.languages).toEqual({
      en: `${site.url}/en/pricing`,
      "pt-PT": `${site.url}/pt/pricing`,
      "x-default": `${site.url}/en/pricing`,
    });
  });
});

describe("JSON-LD", () => {
  it("describes the organization and website", () => {
    const org = organizationJsonLd(config);
    expect(org).toMatchObject({
      "@type": "Organization",
      legalName: config.company.legalName,
      url: site.url,
    });
    expect(websiteJsonLd(config, "pt", "descrição")).toMatchObject({
      "@type": "WebSite",
      inLanguage: "pt-PT",
    });
  });

  it("derives SoftwareApplication offers from the pricing plans", () => {
    const app = softwareApplicationJsonLd(config, "en", "desc") as {
      offers: Record<string, any>[];
    };
    expect(app).toMatchObject({
      "@type": "SoftwareApplication",
      applicationCategory: "BusinessApplication",
    });
    expect(app.offers).toHaveLength(config.pricing.plans.length);
    const pro = app.offers.find((offer) => offer.name === "Pro");
    expect(pro).toMatchObject({ price: "12.00", priceCurrency: "EUR" });
    expect(pro?.priceSpecification.referenceQuantity.unitCode).toBe("MON");
    const free = app.offers.find((offer) => offer.name === "Starter");
    expect(free?.price).toBe("0.00");
  });

  it("omits offers when pricing is disabled", () => {
    const app = softwareApplicationJsonLd(
      { ...config, features: { ...config.features, pricing: false } },
      "en",
      "d",
    );
    expect(app).not.toHaveProperty("offers");
  });

  it("builds FAQPage markup", () => {
    expect(faqJsonLd([{ question: "Q?", answer: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Q?",
          acceptedAnswer: { "@type": "Answer", text: "A." },
        },
      ],
    });
  });

  it("escapes < so structured data can never close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("brand colors", () => {
  it("reads light colors and the dark background from tokens.css", () => {
    const colors = readBrandColors();
    expect(colors).toMatchObject({
      brand: "#4f46e5",
      brandForeground: "#ffffff",
      darkBackground: "#0b1020",
    });
  });

  it("fails loudly when a token is missing", () => {
    expect(() => readBrandColors(":root { --brand: #fff; }")).toThrow(
      /--brand-foreground/,
    );
  });
});
