import type { Locale, SiteConfig } from "@/config/site";
import { localeMeta } from "@/lib/i18n";

/**
 * Keys legal documents may use as `{{key}}`. The legal phase of the factory relies on this
 * exact list, so changing it is a breaking change for every product.
 */
export const PLACEHOLDER_KEYS = [
  "site.name",
  "site.url",
  "site.domain",
  "company.legalName",
  "company.taxId",
  "company.vatId",
  "company.registration",
  "company.address",
  "company.country",
  "contact.email",
  "contact.supportEmail",
  "contact.privacyEmail",
  "legal.effectiveDate",
  "legal.lastUpdated",
  "legal.governingLaw",
  "legal.jurisdiction",
  "legal.ralEntityName",
  "legal.ralEntityUrl",
  "legal.complaintsBookUrl",
  "legal.supervisoryAuthority",
  "legal.supervisoryAuthorityUrl",
] as const;

export type PlaceholderKey = (typeof PLACEHOLDER_KEYS)[number];
export type PlaceholderMap = Record<PlaceholderKey, string>;

export class UnreplacedPlaceholderError extends Error {
  constructor(public readonly placeholders: string[]) {
    super(
      `Unreplaced placeholder(s) in legal document: ${placeholders.join(", ")}. ` +
        `Allowed keys: ${PLACEHOLDER_KEYS.join(", ")}.`,
    );
    this.name = "UnreplacedPlaceholderError";
  }
}

function formatDate(isoDate: string, locale: Locale | undefined): string {
  if (!locale) return isoDate;
  // Parse as UTC so the day never shifts with the build machine's time zone.
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Flatten the site configuration into the `{{placeholder}}` map used by legal documents.
 * With `locale` set, dates are written out in that language ("8 de outubro de 2026") and
 * localized values use it; without it, dates stay ISO and the default locale's text is used.
 */
export function buildPlaceholderMap(config: SiteConfig, locale?: Locale): PlaceholderMap {
  const textLocale = locale ?? config.defaultLocale;
  return {
    "site.name": config.site.name,
    "site.url": config.site.url,
    "site.domain": config.site.domain,
    "company.legalName": config.company.legalName,
    "company.taxId": config.company.taxId,
    "company.vatId": config.company.vatId,
    "company.registration": config.company.registration,
    "company.address": config.company.address,
    "company.country": config.company.country,
    "contact.email": config.contact.email,
    "contact.supportEmail": config.contact.supportEmail,
    "contact.privacyEmail": config.contact.privacyEmail,
    "legal.effectiveDate": formatDate(config.legal.effectiveDate, locale),
    "legal.lastUpdated": formatDate(config.legal.lastUpdated, locale),
    "legal.governingLaw": config.legal.governingLaw[textLocale],
    "legal.jurisdiction": config.legal.jurisdiction[textLocale],
    "legal.ralEntityName": config.legal.ralEntityName,
    "legal.ralEntityUrl": config.legal.ralEntityUrl,
    "legal.complaintsBookUrl": config.legal.complaintsBookUrl,
    "legal.supervisoryAuthority": config.legal.supervisoryAuthority,
    "legal.supervisoryAuthorityUrl": config.legal.supervisoryAuthorityUrl,
  };
}

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

/**
 * Replace every `{{key}}` with its value. Throws `UnreplacedPlaceholderError` when a key is
 * unknown or any `{{`/`}}` is left over, so a broken legal page can never reach production.
 */
export function applyPlaceholders(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  const unknown = new Set<string>();
  const output = template.replace(PLACEHOLDER_PATTERN, (match, key: string) => {
    const value = Object.hasOwn(values, key) ? values[key] : undefined;
    if (value === undefined) {
      unknown.add(match);
      return match;
    }
    return value;
  });

  const leftovers = output.match(/\{\{[^}]*\}\}?|\{\{|\}\}/g) ?? [];
  const all = [...new Set([...unknown, ...leftovers])];
  if (all.length > 0) throw new UnreplacedPlaceholderError(all);
  return output;
}
