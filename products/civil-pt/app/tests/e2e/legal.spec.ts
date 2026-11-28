import { expect, test } from "@playwright/test";
import { config } from "../../src/config/site";
import { LEGAL_DOCS, LOCALES, site } from "./helpers";

test.describe("legal pages", () => {
  for (const locale of LOCALES) {
    for (const doc of LEGAL_DOCS) {
      test(`${locale.code}/${doc} renders without unreplaced placeholders`, async ({
        page,
      }) => {
        const response = await page.goto(`/${locale.code}/legal/${doc}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale.htmlLang);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        expect(await page.content()).not.toContain("{{");
        const visibleText = await page.locator("body").innerText();
        expect(visibleText).not.toContain("{{");
        expect(visibleText).not.toContain("}}");

        const text = await page.locator("main").innerText();
        // Each document names the product or the company (legal-notice only the company).
        expect(text.includes(site.name) || text.includes(config.company.legalName)).toBe(
          true,
        );
        expect(text).toMatch(
          locale.code === "en"
            ? /Template — replaced by the factory legal phase/
            : /Modelo — substituído pela fase legal da fábrica/,
        );
      });
    }
  }

  test("the legal notice shows the complaints book and the regulators", async ({
    page,
  }) => {
    await page.goto("/pt/legal/legal-notice");
    const main = page.getByRole("main");
    await expect(
      main.getByRole("link", { name: "https://www.livroreclamacoes.pt" }),
    ).toHaveAttribute("href", "https://www.livroreclamacoes.pt");
    await expect(main.getByRole("link", { name: "https://www.cnpd.pt" })).toBeVisible();
    await expect(main.getByText(config.legal.ralEntityName).first()).toBeVisible();
  });

  test("dates are written out in the reader's language", async ({ page }) => {
    const written = (intl: string) =>
      new Intl.DateTimeFormat(intl, { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(`${config.legal.effectiveDate}T00:00:00Z`),
      );
    await page.goto("/pt/legal/privacy");
    await expect(page.getByRole("main")).toContainText(written("pt-PT"));
    await page.goto("/en/legal/privacy");
    await expect(page.getByRole("main")).toContainText(written("en-GB"));
  });

  test("the footer links every document and the complaints book", async ({ page }) => {
    await page.goto("/pt");
    const footer = page.getByRole("contentinfo");
    for (const label of [
      "Política de Privacidade",
      "Termos e Condições",
      "Política de Cookies",
      "Aviso Legal",
    ]) {
      await expect(footer.getByRole("link", { name: label })).toBeVisible();
    }
    // B2B only: no consumer withdrawal document or form.
    await expect(
      footer.getByRole("link", { name: /Livre Resolução|livre resolução/ }),
    ).toHaveCount(0);
    const book = footer.getByRole("link", { name: /Livro de Reclamações/ });
    await expect(book).toHaveAttribute("href", "https://www.livroreclamacoes.pt");
    await expect(book).toHaveAttribute("rel", /noopener/);
    await expect(
      footer.getByRole("button", { name: "Definições de cookies" }),
    ).toBeVisible();
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} ${config.company.legalName}`,
    );
  });

  test("the Livro de Reclamações is a prominent button-styled link in the footer of every page, in every language", async ({
    page,
  }) => {
    const paths = [
      "",
      "/pricing",
      "/legal/privacy",
      "/legal/legal-notice",
      "/not-a-page",
    ];
    for (const locale of ["en", "pt"]) {
      for (const path of paths) {
        await page.goto(`/${locale}${path}`);
        const book = page
          .getByRole("contentinfo")
          .getByRole("link", { name: /^Livro de Reclamações/ });
        await expect(book, `${locale}${path}`).toBeVisible();
        await expect(book).toHaveAttribute("href", "https://www.livroreclamacoes.pt");
        await expect(book).toHaveAttribute("target", "_blank");
        await expect(book).toHaveAttribute("rel", /noopener/);
        // Button style: a 2px border, padded, at least 44px tall (not a plain text link).
        const box = await book.evaluate((el) => {
          const css = getComputedStyle(el);
          return {
            border: css.borderTopWidth,
            height: el.getBoundingClientRect().height,
            display: css.display,
          };
        });
        expect(box.border).toBe("2px");
        expect(box.height).toBeGreaterThanOrEqual(44);
        if (locale === "en") await expect(book).toHaveAccessibleName(/Complaints book/);
      }
    }
  });

  test("no page links to the discontinued EU online dispute resolution platform", async ({
    page,
  }) => {
    const paths = ["", "/pricing", ...LEGAL_DOCS.map((doc) => `/legal/${doc}`)];
    for (const locale of ["en", "pt"]) {
      for (const path of paths) {
        await page.goto(`/${locale}${path}`);
        expect(
          await page.locator('a[href*="ec.europa.eu"], a[href*="/odr"]').count(),
          `${locale}${path}`,
        ).toBe(0);
      }
    }
  });
});
