import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckoutStatus } from "@/components/CheckoutStatus";
import { CTA } from "@/components/CTA";
import { FAQ } from "@/components/FAQ";
import { Pricing } from "@/components/Pricing";
import { container } from "@/components/ui";
import { features, site } from "@/config/site";
import { getDictionary } from "@/content";
import { fill } from "@/lib/format";
import { isLocale } from "@/lib/i18n";
import { buildAlternates, buildSocialMetadata } from "@/lib/seo";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || !features.pricing) return {};
  const dict = getDictionary(locale);
  const description = fill(dict.meta.pricingDescription, { name: site.name });
  return {
    title: dict.meta.pricingTitle,
    description,
    alternates: buildAlternates(locale, "/pricing"),
    ...buildSocialMetadata(
      locale,
      "/pricing",
      `${dict.meta.pricingTitle} | ${site.name}`,
      description,
    ),
  };
}

export default async function PricingPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isLocale(locale) || !features.pricing) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <div className={`${container} pt-12`}>
        {/* useSearchParams needs a Suspense boundary so the page can stay statically rendered. */}
        <Suspense fallback={null}>
          <CheckoutStatus
            success={dict.pricing.checkoutSuccess}
            cancelled={dict.pricing.checkoutCancelled}
          />
        </Suspense>
      </div>
      <Pricing locale={locale} dict={dict} variant="full" />
      <FAQ dict={dict} />
      {features.waitlist ? <CTA locale={locale} dict={dict} /> : null}
    </>
  );
}
