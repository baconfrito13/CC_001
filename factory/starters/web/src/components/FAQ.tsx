import { site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill } from "@/lib/format";
import { faqJsonLd } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { Section } from "./Section";

export function FAQ({ dict }: { dict: Dictionary }) {
  const items = dict.faq.items.map((item) => ({
    question: fill(item.question, { name: site.name }),
    answer: fill(item.answer, { name: site.name }),
  }));

  return (
    <Section id="faq" title={dict.faq.title} intro={dict.faq.intro}>
      <div className="max-w-3xl divide-y divide-border rounded-xl border border-border bg-card text-card-foreground">
        {items.map((item) => (
          <details key={item.question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                focusable="false"
                className="shrink-0 transition-transform group-open:rotate-180"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <p className="mt-3 text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </Section>
  );
}
