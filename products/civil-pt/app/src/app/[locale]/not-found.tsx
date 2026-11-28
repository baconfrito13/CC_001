import Link from "next/link";
import { locale as routeLocale } from "next/root-params";
import { button, container } from "@/components/ui";
import { defaultLocale } from "@/config/site";
import { getDictionary } from "@/content";
import { isLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";

/** Rendered for any unknown URL below a valid locale (see [...rest]/page.tsx) and notFound(). */
export default async function NotFound() {
  const requested = await routeLocale();
  const locale = isLocale(requested) ? requested : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className={`${container} py-24 text-center`}>
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        {dict.notFound.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{dict.notFound.body}</p>
      <p className="mt-8">
        <Link href={localizedPath(locale)} className={button.primary}>
          {dict.notFound.home}
        </Link>
      </p>
    </div>
  );
}
