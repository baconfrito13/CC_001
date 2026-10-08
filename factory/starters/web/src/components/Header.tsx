import Link from "next/link";
import { features, type Locale, locales, site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { localeMeta } from "@/lib/i18n";
import { primaryCtaHref } from "@/lib/links";
import { localizedPath } from "@/lib/locale-path";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { button, container } from "./ui";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const home = localizedPath(locale);
  const links = [
    { href: `${home}#features`, label: dict.nav.features },
    { href: `${home}#how-it-works`, label: dict.nav.howItWorks },
    ...(features.pricing
      ? [{ href: localizedPath(locale, "/pricing"), label: dict.nav.pricing }]
      : []),
    { href: `${home}#faq`, label: dict.nav.faq },
  ];
  const cta = primaryCtaHref(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div
        className={`${container} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}
      >
        <Link
          href={home}
          aria-label={fill(dict.a11y.homeLink, { name: site.name })}
          className="rounded-md"
        >
          <Logo />
        </Link>

        <nav
          aria-label={dict.a11y.primaryNav}
          className="order-3 w-full md:order-none md:w-auto"
        >
          <ul className="-mx-2 flex flex-wrap items-center gap-x-1 text-sm font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-md px-2 hover:text-brand hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher
            current={locale}
            label={dict.a11y.languageNav}
            options={locales.map((code) => ({
              code,
              label: localeMeta[code].label,
              htmlLang: localeMeta[code].htmlLang,
            }))}
          />
          {/* Wrapper hides the CTA on phones (the hero has one); `hidden` would clash with the button's own display. */}
          <div className="hidden sm:block">
            <a href={cta} className={button.primary}>
              {dict.nav.cta}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
