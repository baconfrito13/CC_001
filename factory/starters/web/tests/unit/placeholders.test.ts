import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { config, supportedLocales } from "@/config/site";
import {
  LEGAL_CONTENT_DIR,
  LEGAL_DOCS,
  getPublishedLegalDocs,
  readLegalSource,
  renderLegalDoc,
  renderLegalMarkdown,
} from "@/lib/legal";
import {
  PLACEHOLDER_KEYS,
  UnreplacedPlaceholderError,
  applyPlaceholders,
  buildPlaceholderMap,
} from "@/lib/placeholders";

const EXPECTED_KEYS = [
  "site.name",
  "site.url",
  "site.domain",
  "company.legalName",
  "company.taxId",
  "company.vatId",
  "company.registration",
  "company.address",
  "company.country",
  "contact.email",
  "contact.supportEmail",
  "contact.privacyEmail",
  "legal.effectiveDate",
  "legal.lastUpdated",
  "legal.governingLaw",
  "legal.jurisdiction",
  "legal.ralEntityName",
  "legal.ralEntityUrl",
  "legal.complaintsBookUrl",
  "legal.supervisoryAuthority",
  "legal.supervisoryAuthorityUrl",
];

describe("placeholder map", () => {
  it("exposes exactly the documented flattened keys", () => {
    expect([...PLACEHOLDER_KEYS]).toEqual(EXPECTED_KEYS);
    expect(Object.keys(buildPlaceholderMap(config)).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it("flattens config values and never produces an empty value", () => {
    const map = buildPlaceholderMap(config);
    expect(map["site.name"]).toBe(config.site.name);
    expect(map["company.legalName"]).toBe(config.company.legalName);
    expect(map["contact.privacyEmail"]).toBe(config.contact.privacyEmail);
    expect(map["legal.complaintsBookUrl"]).toBe("https://www.livroreclamacoes.pt");
    for (const value of Object.values(map)) expect(value.trim()).not.toBe("");
  });

  it("keeps ISO dates and default-locale text without a locale", () => {
    const map = buildPlaceholderMap(config);
    expect(map["legal.effectiveDate"]).toBe(config.legal.effectiveDate);
    expect(map["legal.governingLaw"]).toBe(config.legal.governingLaw.en);
  });

  it("localizes dates and localized values for a locale", () => {
    const pt = buildPlaceholderMap({ ...config, legal: { ...config.legal, effectiveDate: "2026-03-05" } }, "pt");
    expect(pt["legal.effectiveDate"]).toBe("5 de março de 2026");
    expect(pt["legal.governingLaw"]).toBe(config.legal.governingLaw.pt);
    const en = buildPlaceholderMap({ ...config, legal: { ...config.legal, effectiveDate: "2026-03-05" } }, "en");
    expect(en["legal.effectiveDate"]).toBe("5 March 2026");
  });
});

describe("applyPlaceholders", () => {
  const values = { "site.name": "Acme", "company.legalName": "Acme, Lda." };

  it("replaces every occurrence, tolerating inner whitespace", () => {
    expect(applyPlaceholders("{{site.name}} by {{ company.legalName }} - {{site.name}}", values)).toBe(
      "Acme by Acme, Lda. - Acme",
    );
  });

  it("throws, listing the key, when a placeholder is unknown", () => {
    expect(() => applyPlaceholders("Hello {{site.nme}}", values)).toThrow(UnreplacedPlaceholderError);
    expect(() => applyPlaceholders("Hello {{site.nme}}", values)).toThrow(/site\.nme/);
  });

  it("throws on malformed or half-open placeholders left in the text", () => {
    expect(() => applyPlaceholders("Hello {{site.name", values)).toThrow(UnreplacedPlaceholderError);
    expect(() => applyPlaceholders("Hello site.name}}", values)).toThrow(UnreplacedPlaceholderError);
    expect(() => applyPlaceholders("Hello {{ }}", values)).toThrow(UnreplacedPlaceholderError);
  });

  it("does not treat Object.prototype keys as values", () => {
    expect(() => applyPlaceholders("{{constructor}}", values)).toThrow(UnreplacedPlaceholderError);
  });

  it("fails loudly when a value itself contains a placeholder", () => {
    expect(() => applyPlaceholders("{{site.name}}", { "site.name": "{{oops}}" })).toThrow(
      UnreplacedPlaceholderError,
    );
  });
});

describe("legal documents", () => {
  it("renderLegalMarkdown converts markdown to HTML after replacing placeholders", () => {
    const html = renderLegalMarkdown("# {{site.name}}\n\nBy **{{company.legalName}}**", {
      "site.name": "Acme",
      "company.legalName": "Acme, Lda.",
    });
    expect(html).toContain("<h1>Acme</h1>");
    expect(html).toContain("<strong>Acme, Lda.</strong>");
  });

  it("refuses to render a document with an unreplaced placeholder", () => {
    expect(() => renderLegalMarkdown("Contact {{contact.phone}}", buildPlaceholderMap(config))).toThrow(
      /contact\.phone/,
    );
  });

  it("ships every document in every locale, and nothing else", () => {
    for (const locale of supportedLocales) {
      const files = readdirSync(path.join(LEGAL_CONTENT_DIR, locale)).sort();
      expect(files).toEqual(LEGAL_DOCS.map((doc) => `${doc}.md`).sort());
    }
  });

  for (const locale of supportedLocales) {
    for (const doc of LEGAL_DOCS) {
      it(`renders ${locale}/${doc} completely, marked as a template`, () => {
        const source = readLegalSource(locale, doc);
        const firstLine = source.split("\n")[0] ?? "";
        expect(firstLine).toMatch(locale === "en" ? /Template — replaced by the factory legal phase/ : /Modelo — substituído pela fase legal da fábrica/);

        const html = renderLegalDoc(locale, doc);
        expect(html).not.toMatch(/\{\{|\}\}/);
        expect(html).toContain("<h1>");
        expect(html).toContain(config.site.name);
      });
    }
  }

  it("cites the complaints book, the RAL entity and the supervisory authority where required", () => {
    for (const locale of supportedLocales) {
      const notice = renderLegalDoc(locale, "legal-notice");
      expect(notice).toContain("https://www.livroreclamacoes.pt");
      expect(notice).toContain(config.legal.ralEntityName);
      expect(notice).toContain(config.legal.supervisoryAuthorityUrl);
    }
  });

  it("only publishes the withdrawal policy when selling to consumers", () => {
    expect(getPublishedLegalDocs(config)).toContain("withdrawal");
    const b2b = { ...config, legal: { ...config.legal, sellsToConsumers: false } };
    expect(getPublishedLegalDocs(b2b)).toEqual(["privacy", "terms", "cookies", "legal-notice"]);
  });
});
