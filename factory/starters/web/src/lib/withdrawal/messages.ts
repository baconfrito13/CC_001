import { company, contact, defaultLocale, site } from "@/config/site";
import { getDictionary } from "@/content";
import { fill } from "@/lib/format";
import { localeMeta } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale-path";
import type { WithdrawalEntry } from "./adapters";

export interface WithdrawalMessages {
  ackSubject: string;
  ackText: string;
  notifySubject: string;
  notifyText: string;
}

/** Timestamp for e-mails: unambiguous in any time zone (UTC), written for the locale. */
export function formatTimestamp(iso: string, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    dateStyle: "long",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * The acknowledgement the consumer receives (in their language, on a durable medium) and the
 * notification the company receives (in the default language). Copy lives in the dictionaries.
 */
export function renderWithdrawalMessages(entry: WithdrawalEntry): WithdrawalMessages {
  const ack = getDictionary(entry.locale).withdrawal.email;
  const notify = getDictionary(defaultLocale).withdrawal.email;

  const values = (locale: typeof entry.locale) => ({
    name: entry.name,
    email: entry.email,
    reference: entry.reference,
    message: entry.message ?? "-",
    company: company.legalName,
    supportEmail: contact.supportEmail,
    policyUrl: `${site.url}${localizedPath(locale, "/legal/withdrawal")}`,
    timestamp: formatTimestamp(entry.submittedAt, localeMeta[locale].intl),
  });

  return {
    ackSubject: fill(ack.ackSubject, values(entry.locale)),
    ackText: fill(ack.ackBody, values(entry.locale)),
    notifySubject: fill(notify.notifySubject, values(defaultLocale)),
    notifyText: fill(notify.notifyBody, values(defaultLocale)),
  };
}
