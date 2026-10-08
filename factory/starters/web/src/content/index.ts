import type { Locale } from "@/config/site";
import { en } from "./en";
import { pt } from "./pt";
import type { Dictionary } from "./types";

export type { Dictionary } from "./types";

/** One dictionary per supported locale. `Record<Locale, ...>` makes a missing locale a type error. */
export const dictionaries: Record<Locale, Dictionary> = { en, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
