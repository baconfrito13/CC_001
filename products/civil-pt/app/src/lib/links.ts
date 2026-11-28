import { contact, features, type Locale } from "@/config/site";
import type { Dictionary } from "@/content";
import { localizedPath } from "@/lib/locale-path";

/**
 * Where the main call to action leads: the waitlist when it is enabled, otherwise the pricing
 * page, otherwise an email to the contact address.
 */
export function primaryCtaHref(locale: Locale): string {
  if (features.waitlist) return `${localizedPath(locale)}#waitlist`;
  if (features.pricing) return localizedPath(locale, "/pricing");
  return `mailto:${contact.email}`;
}

/** Href + label of the main call to action, with a label that matches where it leads. */
export function primaryCta(
  locale: Locale,
  dict: Dictionary,
  waitlistLabel: string,
): { href: string; label: string } {
  const href = primaryCtaHref(locale);
  if (features.waitlist) return { href, label: waitlistLabel };
  if (features.pricing) return { href, label: dict.pricing.teaserCta };
  return { href, label: dict.pricing.ctaContact };
}

/** Fallback action of a plan with no checkout configured: the waitlist, or contact by email. */
export function planFallbackCta(
  locale: Locale,
  dict: Dictionary,
): { href: string; label: string } {
  if (features.waitlist) {
    return { href: `${localizedPath(locale)}#waitlist`, label: dict.pricing.ctaWaitlist };
  }
  return { href: `mailto:${contact.email}`, label: dict.pricing.ctaContact };
}
