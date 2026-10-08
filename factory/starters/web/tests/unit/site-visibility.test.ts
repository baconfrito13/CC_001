import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Renders the real Footer and withdrawal page with `legal.sellsToConsumers` forced to true or
 * false (the configuration is a build-time constant, so the module graph is re-imported).
 */
async function load(sellsToConsumers: boolean) {
  vi.resetModules();
  vi.doUnmock("@/config/site");
  vi.doMock("@/config/site", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/config/site")>();
    const legal = { ...original.config.legal, sellsToConsumers };
    return { ...original, config: { ...original.config, legal }, legal };
  });
  // Sequential on purpose: the mocked config must be the first thing the graph resolves.
  await import("@/config/site");
  const { Footer } = await import("@/components/Footer");
  const { ConsentProvider } = await import("@/components/CookieConsent");
  const page = await import("@/app/[locale]/withdraw/page");
  const { getDictionary } = await import("@/content");
  const renderFooter = (locale: "en" | "pt") =>
    renderToStaticMarkup(
      createElement(
        ConsentProvider,
        null,
        createElement(Footer, { locale, dict: getDictionary(locale) }),
      ),
    );
  return { renderFooter, page };
}

afterEach(() => {
  vi.doUnmock("@/config/site");
  vi.resetModules();
});

describe("footer: Livro de Reclamações", () => {
  for (const sells of [true, false]) {
    for (const locale of ["en", "pt"] as const) {
      it(`is shown as a button-styled link in ${locale} (sellsToConsumers=${sells})`, async () => {
        const { renderFooter } = await load(sells);
        const html = renderFooter(locale);
        const link = html.match(
          /<a[^>]*href="https:\/\/www\.livroreclamacoes\.pt"[^>]*>[\s\S]*?<\/a>/,
        )?.[0];
        expect(link, "complaints book link").toBeDefined();
        expect(link).toContain("Livro de Reclamações");
        expect(link).toContain("border-2"); // button style, not a plain text link
        expect(link).toContain('rel="noopener noreferrer"');
        expect(link).toContain("sr-only");
        if (locale === "en") expect(link).toContain("Complaints book");
      });
    }
  }

  it("never links to the discontinued EU ODR platform", async () => {
    const { renderFooter } = await load(true);
    for (const locale of ["en", "pt"] as const) {
      expect(renderFooter(locale)).not.toMatch(/ec\.europa\.eu|\/odr/);
    }
  });
});

describe("online withdrawal function visibility", () => {
  it("is linked from the footer and the page renders when selling to consumers", async () => {
    const { renderFooter, page } = await load(true);
    expect(renderFooter("en")).toContain('href="/en/withdraw"');
    expect(renderFooter("en")).toContain("Withdraw from contract");
    expect(renderFooter("pt")).toContain('href="/pt/withdraw"');
    expect(renderFooter("pt")).toContain("Cancelar contrato (livre resolução)");

    const element = (await page.default({
      params: Promise.resolve({ locale: "pt" }),
    })) as ReactElement;
    const html = renderToStaticMarkup(element);
    expect(html).toContain("Cancelar contrato (livre resolução)");
    expect(html).toContain('href="/pt/legal/withdrawal"');
    expect(html).toContain("<form");
  });

  it("is absent from the footer and the page is a 404 when not selling to consumers", async () => {
    const { renderFooter, page } = await load(false);
    for (const locale of ["en", "pt"] as const) {
      const html = renderFooter(locale);
      expect(html.match(/[^"]*withdraw[^"]*/g)).toBeNull();
      expect(html).not.toContain("/legal/withdrawal");
    }
    await expect(
      page.default({ params: Promise.resolve({ locale: "en" }) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
    expect(
      await page.generateMetadata({ params: Promise.resolve({ locale: "en" }) }),
    ).toEqual({});
  });

  it("rejects unknown locales", async () => {
    const { page } = await load(true);
    await expect(
      page.default({ params: Promise.resolve({ locale: "xx" }) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });
});
