import type { ReactNode } from "react";
import { container } from "./ui";

interface SectionProps {
  id: string;
  title: string;
  intro?: string;
  /** Use "h1" when the section is the main heading of its page. */
  as?: "h1" | "h2";
  tone?: "default" | "muted";
  children: ReactNode;
}

/** A labelled landmark section with a consistent heading, intro and spacing. */
export function Section({
  id,
  title,
  intro,
  as: Heading = "h2",
  tone = "default",
  children,
}: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-24 py-16 sm:py-20 ${tone === "muted" ? "bg-muted" : ""}`}
    >
      <div className={container}>
        <div className="max-w-2xl">
          <Heading
            id={headingId}
            className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            {title}
          </Heading>
          {intro ? <p className="mt-4 text-lg text-muted-foreground">{intro}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
