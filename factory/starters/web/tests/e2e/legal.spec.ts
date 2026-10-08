import { expect, test } from "@playwright/test";
import { LEGAL_DOCS, LOCALES } from "./helpers";

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
        expect(text).toContain("Acme, Lda.");
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
    await expect(
      main.getByText("Centro de Arbitragem de Conflitos de Consumo de Lisboa").first(),
    ).toBeVisible();
  });

  test("dates are written out in the reader's language", async ({ page }) => {
    await page.goto("/pt/legal/privacy");
    await expect(page.getByRole("main")).toContainText("8 de outubro de 2026");
    await page.goto("/en/legal/privacy");
    await expect(page.getByRole("main")).toContainText("8 October 2026");
  });

  test("the footer links every document and the complaints book", async ({ page }) => {
    await page.goto("/pt");
    const footer = page.getByRole("contentinfo");
    for (const label of [
      "Política de Privacidade",
      "Termos e Condições",
      "Política de Cookies",
      "Direito de Livre Resolução",
      "Aviso Legal",
    ]) {
      await expect(footer.getByRole("link", { name: label })).toBeVisible();
    }
    const book = footer.getByRole("link", { name: /Livro de Reclamações/ });
    await expect(book).toHaveAttribute("href", "https://www.livroreclamacoes.pt");
    await expect(book).toHaveAttribute("rel", /noopener/);
    await expect(
      footer.getByRole("button", { name: "Definições de cookies" }),
    ).toBeVisible();
    await expect(footer).toContainText("© 2026 Acme, Lda.");
  });
});
