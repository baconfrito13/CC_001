import { describe, expect, it } from "vitest";
import { config, supportedLocales } from "@/config/site";
import { dictionaries } from "@/content";
import { en } from "@/content/en";
import { pt } from "@/content/pt";
import { fill, formatPrice } from "@/lib/format";

/** Flatten a dictionary to `path -> string` so locales can be compared key by key. */
function flatten(
  value: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (typeof value === "string") {
    out[prefix] = value;
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flatten(item, `${prefix}[${index}]`, out);
    });
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value))
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
  } else {
    throw new Error(`Unexpected value at ${prefix}`);
  }
  return out;
}

describe("dictionaries", () => {
  it("exist for every supported locale", () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...supportedLocales].sort());
  });

  it("have exactly the same keys in English and Portuguese", () => {
    expect(Object.keys(flatten(pt)).sort()).toEqual(Object.keys(flatten(en)).sort());
  });

  it("never contain empty strings", () => {
    for (const dictionary of [en, pt]) {
      for (const [key, value] of Object.entries(flatten(dictionary))) {
        expect(value.trim(), key).not.toBe("");
      }
    }
  });

  it("use the same {placeholders} in both locales", () => {
    const tokens = (text: string) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const flatEn = flatten(en);
    const flatPt = flatten(pt);
    for (const key of Object.keys(flatEn)) {
      expect(tokens(flatPt[key] ?? ""), key).toEqual(tokens(flatEn[key] ?? ""));
    }
  });

  it("only use known placeholders", () => {
    const known = new Set([
      "name",
      "company",
      "year",
      "date",
      "plan",
      "price",
      "language",
    ]);
    for (const dictionary of [en, pt]) {
      for (const [key, value] of Object.entries(flatten(dictionary))) {
        for (const match of value.matchAll(/\{(\w+)\}/g))
          expect(known.has(match[1] ?? ""), `${key}: {${match[1]}}`).toBe(true);
      }
    }
  });

  it("keeps Portuguese copy European (no Brazilian forms)", () => {
    const text = Object.values(flatten(pt)).join("\n").toLowerCase();
    for (const brazilian of [
      "usuário",
      "você",
      "arquivo",
      "baixar",
      "equipe",
      "tela ",
      "salvar",
    ]) {
      expect(text, brazilian).not.toContain(brazilian);
    }
  });

  it("names the complaints book in Portuguese", () => {
    expect(pt.footer.complaintsBook).toBe("Livro de Reclamações");
  });

  it("covers every locale for every plan", () => {
    for (const plan of config.pricing.plans) {
      for (const locale of supportedLocales) {
        expect(plan.name[locale]).toBeTruthy();
        expect(plan.features[locale].length).toBeGreaterThan(0);
      }
    }
  });
});

describe("format helpers", () => {
  it("fills known placeholders and leaves unknown ones", () => {
    expect(fill("Hello {name}, {unknown}", { name: "Ana" })).toBe("Hello Ana, {unknown}");
    expect(fill("© {year}", { year: 2026 })).toBe("© 2026");
  });

  it("formats prices per locale", () => {
    expect(formatPrice(12, "EUR", "en-GB")).toBe("€12");
    expect(formatPrice(9.9, "EUR", "en-GB")).toBe("€9.90");
    expect(formatPrice(12, "EUR", "pt-PT").replace(/\s/g, " ")).toBe("12 €");
  });
});
