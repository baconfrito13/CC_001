import { readFileSync } from "node:fs";
import path from "node:path";

export interface BrandColors {
  brand: string;
  brandForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  mutedForeground: string;
  /** Page background in dark mode (second block of tokens.css), for <meta name="theme-color">. */
  darkBackground: string;
}

const TOKENS_CSS = path.join(process.cwd(), "src", "app", "tokens.css");

function readVariable(css: string, name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
  if (!match?.[1]) throw new Error(`Brand token --${name} not found in tokens.css`);
  return match[1];
}

/**
 * Light-mode brand colours, read from the first `:root` block of tokens.css.
 * Used where CSS variables are unavailable (Open Graph images), so tokens.css stays the
 * single source of truth for colour. Build-time only.
 */
export function readBrandColors(css = readFileSync(TOKENS_CSS, "utf8")): BrandColors {
  const darkStart = css.indexOf("@media");
  const root = darkStart === -1 ? css : css.slice(0, darkStart);
  const dark = darkStart === -1 ? css : css.slice(darkStart);
  return {
    brand: readVariable(root, "brand"),
    brandForeground: readVariable(root, "brand-foreground"),
    accent: readVariable(root, "accent"),
    accentForeground: readVariable(root, "accent-foreground"),
    background: readVariable(root, "background"),
    foreground: readVariable(root, "foreground"),
    mutedForeground: readVariable(root, "muted-foreground"),
    darkBackground: readVariable(dark, "background"),
  };
}
