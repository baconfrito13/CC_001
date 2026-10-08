import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@/components/Analytics";
import { ConsentProvider, CookieBanner } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { analytics, config, locales, site } from "@/config/site";
import { getDictionary } from "@/content";
import { readBrandColors } from "@/lib/brand";
import { getEnv } from "@/lib/env";
import { fill } from "@/lib/format";
import { isLocale, localeMeta } from "@/lib/i18n";
import { robotsMetadata } from "@/lib/indexing";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { localizedPath } from "@/lib/locale-path";
import { buildAlternates, buildSocialMetadata } from "@/lib/seo";

type LayoutParams = { params: Promise<{ locale: string }> };

/** Only the configured locales exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateViewport(): Viewport {
  const colors = readBrandColors();
  return {
    colorScheme: "light dark",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: colors.background },
      { media: "(prefers-color-scheme: dark)", color: colors.darkBackground },
    ],
  };
}

export async function generateMetadata({ params }: LayoutParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const title = fill(dict.meta.homeTitle, { name: site.name });
  const description = fill(dict.meta.description, { name: site.name });

  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.name}` },
    description,
    applicationName: site.name,
    alternates: buildAlternates(locale),
    ...buildSocialMetadata(locale, "", title, description),
    // Previews and unlaunched deployments must never end up in a search index.
    ...robotsMetadata(getEnv()),
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutParams & { children: ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const description = fill(dict.meta.description, { name: site.name });

  return (
    <html lang={localeMeta[locale].htmlLang}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-brand px-4 py-2 font-semibold text-brand-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          {dict.a11y.skipToContent}
        </a>
        <ConsentProvider>
          <Header locale={locale} dict={dict} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer locale={locale} dict={dict} />
          <CookieBanner
            policyHref={localizedPath(locale, "/legal/cookies")}
            strings={{
              regionLabel: dict.consent.regionLabel,
              title: dict.consent.title,
              body: dict.consent.body,
              policyLinkText: dict.consent.policyLinkText,
              accept: dict.consent.accept,
              reject: dict.consent.reject,
            }}
          />
          <Analytics
            provider={analytics.provider}
            plausibleDomain={analytics.plausibleDomain}
            plausibleScriptSrc={analytics.plausibleScriptSrc}
            posthogKey={analytics.posthogKey}
            posthogHost={analytics.posthogHost}
            cookieless={analytics.cookieless}
          />
        </ConsentProvider>
        <JsonLd data={organizationJsonLd(config)} />
        <JsonLd data={websiteJsonLd(config, locale, description)} />
      </body>
    </html>
  );
}
