import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { container } from "@/components/ui";
import { site } from "@/config/site";
import { authCopy } from "@/content/app/auth";
import { userFromCookies } from "@/lib/auth";
import { safeNext } from "@/lib/auth/redirect";
import { fill } from "@/lib/format";
import { isLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; erro?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // The sign-in page is not for search engines: no index, no snippet.
  return {
    title: authCopy[locale].login.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function SignInPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const next = safeNext(query.next, locale);

  // Somebody already signed in has nothing to do here.
  if (await userFromCookies()) redirect(next);

  const copy = authCopy[locale].login;
  const reason: Record<string, string> = {
    expired: copy.codeExpired,
    busy: copy.tooManyRequests,
    link: authCopy[locale].confirm.missingToken,
  };
  const initialError = query.erro ? (reason[query.erro] ?? null) : null;

  return (
    <div className={`${container} py-12 sm:py-16`}>
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {fill(copy.title, { name: site.name })}
        </h1>
        <p className="mt-2 text-muted-foreground">{copy.intro}</p>
        <div className="mt-6">
          <LoginForm
            locale={locale}
            next={next}
            copy={copy}
            termsHref={localizedPath(locale, "/legal/terms")}
            privacyHref={localizedPath(locale, "/legal/privacy")}
            initialError={initialError}
          />
        </div>
      </div>
    </div>
  );
}
