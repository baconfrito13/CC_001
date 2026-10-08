import { contact, features, type Locale } from "@/config/site";
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
