"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLocalePath } from "@/lib/locale-path";

export interface LocaleOption {
  code: string;
  label: string;
  htmlLang: string;
}

/** Links to the same page in every locale. The current language is shown but not linked. */
export function LocaleSwitcher({
  options,
  current,
  label,
}: {
  options: LocaleOption[];
  current: string;
  label: string;
}) {
  const pathname = usePathname() ?? `/${current}`;
  const codes = options.map((option) => option.code);
  if (options.length < 2) return null;

  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1 text-sm">
        {options.map((option) => (
          <li key={option.code}>
            {option.code === current ? (
              <span
                lang={option.htmlLang}
                aria-current="true"
                className="inline-flex min-h-9 items-center rounded-md bg-muted px-2.5 font-semibold"
              >
                {option.label}
              </span>
            ) : (
              <Link
                href={switchLocalePath(pathname, option.code, codes)}
                lang={option.htmlLang}
                hrefLang={option.htmlLang}
                // The target may not exist in the other language (e.g. a 404 page): never prefetch it.
                prefetch={false}
                className="inline-flex min-h-9 items-center rounded-md px-2.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {option.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
