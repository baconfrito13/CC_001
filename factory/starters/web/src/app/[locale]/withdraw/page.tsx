import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/components/ui";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { contact, site } from "@/config/site";
import { getDictionary } from "@/content";
import { fill } from "@/lib/format";
import { isLocale, localeMeta } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";
import { buildAlternates } from "@/lib/seo";
import { withdrawalEnabled } from "@/lib/withdrawal/enabled";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || !withdrawalEnabled()) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.withdrawal.title,
    description: dict.withdrawal.metaDescription,
    alternates: buildAlternates(locale, "/withdraw"),
    // A utility page: reachable from the footer, not something to rank.
    robots: { index: false, follow: true },
  };
}

/** Online withdrawal function. Exists only when `legal.sellsToConsumers` is true. */
export default async function WithdrawPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isLocale(locale) || !withdrawalEnabled()) notFound();
  const dict = getDictionary(locale);
  const w = dict.withdrawal;

  return (
    <div className={`${container} py-12 sm:py-16`}>
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {w.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {fill(w.intro, { name: site.name })}
        </p>
        <p className="mt-3">
          {w.policyPrefix}
          <Link
            href={localizedPath(locale, "/legal/withdrawal")}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {w.policyLinkText}
          </Link>
          {w.policySuffix}
        </p>
        <div className="mt-8">
          <WithdrawalForm
            locale={locale}
            intlLocale={localeMeta[locale].intl}
            supportEmail={contact.supportEmail}
            strings={{
              nameLabel: w.nameLabel,
              emailLabel: w.emailLabel,
              referenceLabel: w.referenceLabel,
              referenceHint: w.referenceHint,
              messageLabel: w.messageLabel,
              messageHint: w.messageHint,
              submit: w.submit,
              submitting: w.submitting,
              errors: w.errors,
              successTitle: w.successTitle,
              successBody: w.successBody,
              successReference: w.successReference,
              successAck: w.successAck,
            }}
          />
        </div>
      </div>
    </div>
  );
}
