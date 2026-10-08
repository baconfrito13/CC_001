let counter = 0;

/** A unique client IP per call, so tests never share the waitlist rate-limit bucket. */
export function uniqueIp(): string {
  counter += 1;
  const worker = Number(process.env.TEST_PARALLEL_INDEX ?? 0) % 250;
  return `10.${worker}.${Math.floor(counter / 250) % 250}.${(counter % 250) + 1}`;
}

export const LOCALES = [
  {
    code: "en",
    htmlLang: "en",
    h1: "Go from idea to launched product in days, not months",
  },
  {
    code: "pt",
    htmlLang: "pt-PT",
    h1: "Da ideia ao produto lançado em dias, não em meses",
  },
] as const;

export const LEGAL_DOCS = [
  "privacy",
  "terms",
  "cookies",
  "withdrawal",
  "legal-notice",
] as const;
