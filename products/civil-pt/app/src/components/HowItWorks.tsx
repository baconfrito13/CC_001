import { site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { Section } from "./Section";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <Section
      id="how-it-works"
      title={dict.howItWorks.title}
      intro={dict.howItWorks.intro}
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {dict.howItWorks.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">
                {fill(step.body, { name: site.name })}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
