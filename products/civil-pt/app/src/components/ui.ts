/** Shared Tailwind class strings, so buttons and inputs look the same everywhere. */

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-center text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70";

export const button = {
  primary: `${buttonBase} bg-brand text-brand-foreground hover:brightness-110`,
  secondary: `${buttonBase} border border-muted-foreground/60 bg-card text-card-foreground hover:bg-muted`,
  /** Used by the consent banner: both choices share exactly this style. */
  equal: `${buttonBase} border-2 border-foreground bg-background text-foreground hover:bg-muted`,
};

export const input =
  "block min-h-11 w-full rounded-lg border border-muted-foreground bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground";

export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";
