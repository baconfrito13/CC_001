import { type Locale, site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { localizedPath } from "@/lib/locale-path";
import { container } from "./ui";
import { WaitlistForm } from "./WaitlistForm";

/** Final call to action: the waitlist form. */
export function CTA({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-title"
      className="scroll-mt-24 bg-brand py-16 text-brand-foreground sm:py-20"
    >
      <div className={`${container} grid items-start gap-10 lg:grid-cols-2`}>
        <div>
          <h2
            id="waitlist-title"
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {dict.cta.title}
          </h2>
          <p className="mt-4 text-lg">{fill(dict.cta.body, { name: site.name })}</p>
        </div>
        <WaitlistForm
          locale={locale}
          privacyHref={localizedPath(locale, "/legal/privacy")}
          externalLinkHint={dict.a11y.externalLink}
          strings={{
            emailLabel: dict.waitlist.emailLabel,
            emailPlaceholder: dict.waitlist.emailPlaceholder,
            submit: dict.waitlist.submit,
            submitting: dict.waitlist.submitting,
            consentPrefix: fill(dict.waitlist.consentPrefix, { name: site.name }),
            consentLinkText: dict.waitlist.consentLinkText,
            consentSuffix: dict.waitlist.consentSuffix,
            errors: dict.waitlist.errors,
            successTitle: dict.waitlist.successTitle,
            successBody: fill(dict.waitlist.successBody, { name: site.name }),
          }}
        />
      </div>
    </section>
  );
}
