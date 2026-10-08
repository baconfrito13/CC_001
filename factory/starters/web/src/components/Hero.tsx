import type { Locale } from "@/config/site";
import { site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { primaryCta } from "@/lib/links";
import { button, container } from "./ui";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const vars = { name: site.name };
  const cta = primaryCta(locale, dict, dict.hero.primaryCta);
  return (
    <section
      aria-labelledby="hero-title"
      className="bg-linear-to-b from-muted to-background py-20 sm:py-28"
    >
      <div className={`${container} text-center`}>
        <p className="mx-auto inline-block rounded-full border border-border bg-card px-4 py-1 text-sm font-semibold text-accent">
          {dict.hero.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl"
        >
          {dict.hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl">
          {fill(dict.hero.subtitle, vars)}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={cta.href} className={`${button.primary} w-full sm:w-auto`}>
            {cta.label}
          </a>
          <a href="#how-it-works" className={`${button.secondary} w-full sm:w-auto`}>
            {dict.hero.secondaryCta}
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{dict.hero.note}</p>
      </div>
    </section>
  );
}
