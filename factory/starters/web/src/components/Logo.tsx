import { site } from "@/config/site";

/**
 * Inline SVG mark + wordmark. Colours come from the brand CSS variables, so the logo follows
 * `npm run brand:apply` and dark mode automatically. Replace the shape with brand/logo-mark.svg
 * paths when the brand phase delivers a real logo.
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
        <rect width="32" height="32" rx="8" fill="var(--brand)" />
        <path
          d="M9 23 16 8l7 15M12 18.5h8"
          stroke="var(--brand-foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">{site.name}</span>
    </span>
  );
}
