import { site } from "@/config/site";

/**
 * Inline SVG mark + wordmark. Colours come from the brand CSS variables, so the logo follows
 * `npm run brand:apply` and dark mode automatically. The mark is the pin on a dimension line
 * from `brand/logo-mark.svg`, drawn on a brand-coloured square.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="7" fill="var(--brand)" />
        <path
          d="M8 18v8M24 18v8M8 22h16M16 14.5v7.5"
          stroke="var(--brand-foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="10.5" r="3" fill="var(--brand-foreground)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">{site.name}</span>
    </span>
  );
}
