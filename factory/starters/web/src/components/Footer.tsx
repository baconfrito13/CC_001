import Link from "next/link";
import { company, contact, type Locale, legal, site, social } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { getPublishedLegalDocs } from "@/lib/legal";
import { localizedPath } from "@/lib/locale-path";
import { CookieSettingsButton } from "./CookieConsent";
import { Logo } from "./Logo";
import { container } from "./ui";

const socialLabels: Record<keyof typeof social, string> = {
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
};

const footerLink =
  "inline-flex min-h-9 items-center underline-offset-4 hover:text-brand hover:underline";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const docs = getPublishedLegalDocs();
  const socialLinks = (
    Object.entries(social) as [keyof typeof social, string | undefined][]
  ).filter((entry): entry is [keyof typeof social, string] => Boolean(entry[1]));
  // Built at build time: refresh by redeploying (or switch the page to dynamic rendering).
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted">
      <div className={`${container} grid gap-10 py-12 md:grid-cols-4`}>
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-muted-foreground">
            {fill(dict.footer.blurb, { name: site.name })}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {company.legalName} · {dict.footer.vatLabel} {company.vatId}
            <br />
            {company.address}
          </p>
        </div>

        <nav aria-label={dict.a11y.footerNav}>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {dict.footer.legalTitle}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {docs.map((doc) => (
              <li key={doc}>
                <Link
                  href={localizedPath(locale, `/legal/${doc}`)}
                  className={footerLink}
                >
                  {dict.legal.docs[doc].label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={legal.complaintsBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={dict.footer.complaintsBookHint}
                className={footerLink}
              >
                {dict.footer.complaintsBook}
                <span className="sr-only"> {dict.a11y.externalLink}</span>
              </a>
            </li>
            <li>
              <CookieSettingsButton
                label={dict.consent.settings}
                className={`${footerLink} cursor-pointer`}
              />
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {dict.footer.contactTitle}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a href={`mailto:${contact.email}`} className={footerLink}>
                {contact.email}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.supportEmail}`} className={footerLink}>
                {contact.supportEmail}
              </a>
            </li>
          </ul>
          {socialLinks.length > 0 ? (
            <>
              <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide">
                {dict.footer.followTitle}
              </h2>
              <ul className="mt-3 space-y-1 text-sm">
                {socialLinks.map(([network, url]) => (
                  <li key={network}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className={footerLink}
                    >
                      {socialLabels[network]}
                      <span className="sr-only"> {dict.a11y.externalLink}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <p className={`${container} py-5 text-sm text-muted-foreground`}>
          {fill(dict.footer.copyright, { year, company: company.legalName })}
        </p>
      </div>
    </footer>
  );
}
