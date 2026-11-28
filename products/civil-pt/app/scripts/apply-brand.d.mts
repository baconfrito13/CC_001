export const COLOR_KEYS: readonly string[];
export const MODES: readonly ["light", "dark"];
export const CONTRAST_PAIRS: readonly (readonly [string, string])[];
export const MIN_CONTRAST: number;

export interface BrandTokens {
  color: { light: Record<string, string>; dark: Record<string, string> };
  font: { sans: string; display: string };
  radius: string;
}

export interface ContrastFailure {
  mode: "light" | "dark";
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
}

export class BrandTokensError extends Error {
  problems: string[];
  constructor(problems: string[]);
}

export function parseTokens(input: unknown): BrandTokens;
export function renderTokensCss(tokens: BrandTokens): string;
export function luminance(hex: string): number;
export function contrastRatio(a: string, b: string): number;
export function checkContrast(tokens: BrandTokens, minimum?: number): ContrastFailure[];
export function run(
  argv: string[],
  io?: { cwd?: string; stdout?: (s: string) => void; stderr?: (s: string) => void },
): number;
