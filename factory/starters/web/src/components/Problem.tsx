import type { Dictionary } from "@/content";
import { Section } from "./Section";

export function Problem({ dict }: { dict: Dictionary }) {
  return (
    <Section id="problem" title={dict.problem.title} intro={dict.problem.intro}>
      <ul className="grid gap-6 md:grid-cols-3">
        {dict.problem.items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-border bg-card p-6 text-card-foreground"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
