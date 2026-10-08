import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTA } from "@/components/CTA";
import { FAQ } from "@/components/FAQ";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { Pricing } from "@/components/Pricing";
import { Problem } from "@/components/Problem";
import { config, features, site } from "@/config/site";
import { getDictionary } from "@/content";
import { fill } from "@/lib/format";
import { isLocale } from "@/lib/i18n";
import { softwareApplicationJsonLd } from "@/lib/jsonld";
import { buildAlternates, buildSocialMetadata } from "@/lib/seo";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const title = fill(dict.meta.homeTitle, { name: site.name });
  const description = fill(dict.meta.description, { name: site.name });
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale),
    ...buildSocialMetadata(locale, "", title, description),
  };
}

export default async function HomePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Problem dict={dict} />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      {features.pricing ? <Pricing locale={locale} dict={dict} variant="teaser" /> : null}
      <FAQ dict={dict} />
      {features.waitlist ? <CTA locale={locale} dict={dict} /> : null}
      <JsonLd
        data={softwareApplicationJsonLd(
          config,
          locale,
          fill(dict.meta.description, { name: site.name }),
        )}
      />
    </>
  );
}
