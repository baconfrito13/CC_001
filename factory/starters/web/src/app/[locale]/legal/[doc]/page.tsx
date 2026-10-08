import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/components/ui";
import { company, config, locales } from "@/config/site";
import { getDictionary } from "@/content";
import { isLocale, localeMeta } from "@/lib/i18n";
import { getPublishedLegalDocs, isLegalDoc, renderLegalDoc } from "@/lib/legal";
import { localizedPath } from "@/lib/locale-path";
import { buildPlaceholderMap } from "@/lib/placeholders";
import { buildAlternates } from "@/lib/seo";

type PageParams = { params: Promise<{ locale: string; doc: string }> };

export function generateStaticParams() {
  const docs = getPublishedLegalDocs();
  return locales.flatMap((locale) => docs.map((doc) => ({ locale, doc })));
}

/**
 * Unknown documents (and `withdrawal` when not selling to consumers) are 404s through
 * notFound(). dynamicParams stays enabled on purpose: with `dynamicParams = false` Next.js 16.4
 * answers unknown params with a redirect loop on RSC prefetches.
 */
function resolve(locale: string, doc: string) {
  if (!isLocale(locale) || !isLegalDoc(doc) || !getPublishedLegalDocs().includes(doc))
    return null;
  return { locale, doc };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, doc } = await params;
  const resolved = resolve(locale, doc);
  if (!resolved) return {};
  const entry = getDictionary(resolved.locale).legal.docs[resolved.doc];
  return {
    title: entry.label,
    description: entry.description,
    alternates: buildAlternates(resolved.locale, `/legal/${resolved.doc}`),
  };
}

export default async function LegalPage({ params }: PageParams) {
  const { locale, doc } = await params;
  const resolved = resolve(locale, doc);
  if (!resolved) notFound();

  const dict = getDictionary(resolved.locale);
  const html = renderLegalDoc(resolved.locale, resolved.doc);

  return (
    <article className={`${container} py-12 sm:py-16`}>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link
          href={localizedPath(resolved.locale)}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {dict.legal.homeBreadcrumb}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{dict.legal.docs[resolved.doc].label}</span>
      </nav>
      <div className="legal-prose" lang={localeMeta[resolved.locale].htmlLang}>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted repository markdown rendered at build time. */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        {dict.legal.lastUpdated}:{" "}
        {buildPlaceholderMap(config, resolved.locale)["legal.lastUpdated"]} ·{" "}
        {company.legalName}
      </p>
    </article>
  );
}
