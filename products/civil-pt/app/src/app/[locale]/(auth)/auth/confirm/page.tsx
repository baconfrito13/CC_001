import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { button, container } from "@/components/ui";
import { authCopy } from "@/content/app/auth";
import { safeNext } from "@/lib/auth/redirect";
import { isLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: authCopy[locale].confirm.metaTitle,
    robots: { index: false, follow: false },
    // The address carries the one-time token: never send it to other sites as a referrer.
    referrer: "no-referrer",
  };
}

/**
 * The page the link of the email opens (US-01 criteria 1 and 3). Rendering it uses nothing: the
 * token is only put in a hidden field, and only the POST of the button (`/api/auth/confirm`)
 * consumes it. A mail scanner that fetches this page, with or without following redirects,
 * therefore leaves the token intact.
 */
export default async function ConfirmPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { token_hash: tokenHash, type, next } = await searchParams;
  const copy = authCopy[locale].confirm;
  const usable =
    typeof tokenHash === "string" && tokenHash.length > 0 && type === "email";

  return (
    <div className={`${container} py-12 sm:py-16`}>
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{copy.title}</h1>
        {usable ? (
          <>
            <p className="mt-2 text-muted-foreground">{copy.body}</p>
            <form method="post" action="/api/auth/confirm" className="mt-6">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value="email" />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={safeNext(next, locale)} />
              <button type="submit" className={`${button.primary} w-full`}>
                {copy.button}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-muted-foreground">{copy.missingToken}</p>
            <p className="mt-6">
              <Link href={localizedPath(locale, "/entrar")} className={button.primary}>
                {copy.backToLogin}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
