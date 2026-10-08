import { site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { Section } from "./Section";

export function Features({ dict }: { dict: Dictionary }) {
  return (
    <Section
      id="features"
      title={dict.features.title}
      intro={dict.features.intro}
      tone="muted"
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dict.features.items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-border bg-card p-6 text-card-foreground"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-lg bg-brand text-brand-foreground"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="m10 2 1.8 4.7L16.5 8l-4.7 1.3L10 14l-1.8-4.7L3.5 8l4.7-1.3L10 2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">
              {fill(item.body, { name: site.name })}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
