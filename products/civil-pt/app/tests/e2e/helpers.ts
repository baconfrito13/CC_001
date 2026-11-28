import { defaultLocale, site } from "../../src/config/site";
import { en } from "../../src/content/en";
import { pt } from "../../src/content/pt";

let counter = 0;

/** A unique client IP per call, so tests never share the waitlist rate-limit bucket. */
export function uniqueIp(): string {
  counter += 1;
  const worker = Number(process.env.TEST_PARALLEL_INDEX ?? 0) % 250;
  return `10.${worker}.${Math.floor(counter / 250) % 250}.${(counter % 250) + 1}`;
}

/**
 * UI copy comes from the dictionaries, so the final landing copy (gtm phase) never forces a
 * test edit. What the tests pin is structure: which text appears in which locale.
 */
export const COPY = { en, pt } as const;

export { defaultLocale, site };

export const LOCALES = [
  { code: "en", htmlLang: "en", h1: en.hero.title },
  { code: "pt", htmlLang: "pt-PT", h1: pt.hero.title },
] as const;

/** Rastoplan is B2B only (`legal.sellsToConsumers: false`), so there is no `withdrawal` document. */
export const LEGAL_DOCS = ["privacy", "terms", "cookies", "legal-notice"] as const;
