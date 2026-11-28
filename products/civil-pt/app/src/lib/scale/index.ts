import { MAX_SCALE_RATIO, MIN_SCALE_RATIO } from "@/lib/engine/scale";

export { MAX_SCALE_RATIO, MIN_SCALE_RATIO };

/** The scales the PRD lists (US-03 criterion 2); any whole value from 1 to 10000 is also valid. */
export const SCALE_PRESETS = [50, 100, 200, 500] as const;

/** "1:100". The ratio is the denominator of the scale. */
export function formatScale(ratio: number): string {
  return `1:${ratio}`;
}

/**
 * A scale ratio from user input or a request body, or null when it is not a whole number from
 * 1 to 10000. Strings must be plain digits (no exponent, no decimals).
 */
export function parseScaleRatio(value: unknown): number | null {
  let ratio: number;
  if (typeof value === "number") {
    ratio = value;
  } else if (typeof value === "string" && /^\s*\d{1,5}\s*$/.test(value)) {
    ratio = Number(value);
  } else {
    return null;
  }
  return Number.isInteger(ratio) && ratio >= MIN_SCALE_RATIO && ratio <= MAX_SCALE_RATIO
    ? ratio
    : null;
}

/** Only this much of a page's text is searched: a title block is short, a hostile PDF is not. */
const MAX_TEXT_LENGTH = 200_000;

/** Drawing scales that appear on construction sheets: a bare "1:N" must be one of them. */
const COMMON_SCALES = new Set([
  1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 150, 200, 250, 500, 1000, 2000, 5000, 10_000,
]);

// "ESC. 1/100", "Escala: 1:50", "SCALE 1 : 20", "escala de 1/75". The keyword is required
// because "1/100" alone is as likely a sheet number or a date. `[^\S\r\n]` would forbid line
// breaks; here "ESC." and the value may be on different lines of the title block.
const KEYWORD =
  /\b(?:esc(?:alas?)?|scales?)\b\.?\s{0,5}[:=\-–]?\s{0,5}(?:de\s+)?1\s{0,3}[:/]\s{0,3}(\d{1,5})(?!\d)/gi;
const BARE = /(?<![\d/:.,])1\s{0,2}:\s{0,2}(\d{1,5})(?![\d/:.,])/g;

function collect(
  text: string,
  pattern: RegExp,
  accept: (ratio: number) => boolean,
): Set<number> {
  const found = new Set<number>();
  for (const match of text.matchAll(pattern)) {
    const ratio = Number(match[1]);
    if (
      Number.isInteger(ratio) &&
      ratio >= MIN_SCALE_RATIO &&
      ratio <= MAX_SCALE_RATIO &&
      accept(ratio)
    ) {
      found.add(ratio);
    }
  }
  return found;
}

/**
 * The scale announced in a sheet's text (US-03 criterion 1), or null.
 *
 * Null also when the page announces several different scales (a plan at 1:100 with a detail at
 * 1:20): picking one would silently measure the wrong thing, so the user chooses (criterion 2).
 * A bare "1:N" counts only when no keyword match exists, it is the only candidate and N is a
 * common drawing scale.
 */
export function detectScale(text: string): { ratio: number } | null {
  const haystack = text.slice(0, MAX_TEXT_LENGTH);
  const keyworded = collect(haystack, KEYWORD, () => true);
  if (keyworded.size > 0) {
    return keyworded.size === 1 ? { ratio: [...keyworded][0] as number } : null; // reason: size is 1
  }
  const bare = collect(haystack, BARE, (ratio) => COMMON_SCALES.has(ratio));
  return bare.size === 1 ? { ratio: [...bare][0] as number } : null; // reason: size is 1
}
