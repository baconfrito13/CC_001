/** Fill `{name}`-style placeholders in dictionary strings. Unknown keys are left untouched. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

/** Format a price for a locale, e.g. 12 EUR + pt-PT -> "12,00 €". Whole amounts drop decimals. */
export function formatPrice(
  amount: number,
  currency: string,
  intlLocale: string,
): string {
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
