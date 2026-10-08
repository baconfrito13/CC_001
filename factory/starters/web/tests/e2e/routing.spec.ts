import { expect, test } from "@playwright/test";
import { LOCALES } from "./helpers";

test.describe("locale routing", () => {
  test("/ redirects to the best locale from Accept-Language", async ({ request }) => {
    const pt = await request.get("/", {
      headers: { "accept-language": "pt-PT,pt;q=0.9,en;q=0.5" },
      maxRedirects: 0,
    });
    expect(pt.status()).toBe(307);
    expect(new URL(pt.headers().location ?? "", "http://x").pathname).toBe("/pt");
    expect(pt.headers().vary).toContain("Accept-Language");

    const en = await request.get("/", {
      headers: { "accept-language": "en-US,en;q=0.9" },
      maxRedirects: 0,
    });
    expect(new URL(en.headers().location ?? "", "http://x").pathname).toBe("/en");

    const other = await request.get("/", {
      headers: { "accept-language": "fr-FR,fr;q=0.9" },
      maxRedirects: 0,
    });
    expect(new URL(other.headers().location ?? "", "http://x").pathname).toBe("/en");

    const none = await request.get("/", {
      headers: { "accept-language": "" },
      maxRedirects: 0,
    });
    expect(new URL(none.headers().location ?? "", "http://x").pathname).toBe("/en");
  });

  test("the browser lands on /en for an English browser", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test.describe("Portuguese browser", () => {
    test.use({ locale: "pt-PT" });
    test("the browser lands on /pt", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/pt$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
    });
  });

  test("paths without a locale are redirected, keeping path and query", async ({
    request,
  }) => {
    const response = await request.get("/pricing?ref=x", {
      headers: { "accept-language": "pt" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/\/pt\/pricing\?ref=x$/);
  });

  for (const locale of LOCALES) {
    test(`home renders in ${locale.code} with <html lang="${locale.htmlLang}">`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale.code}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.htmlLang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.h1);
      for (const id of [
        "problem",
        "features",
        "how-it-works",
        "pricing",
        "faq",
        "waitlist",
      ]) {
        await expect(page.locator(`section#${id}`)).toBeAttached();
      }
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("alternate language links and canonical are present", async ({ page }) => {
    await page.goto("/pt");
    const hrefs = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        links.map((link) => [link.getAttribute("hreflang"), link.getAttribute("href")]),
      );
    const map = Object.fromEntries(hrefs);
    expect(Object.keys(map).sort()).toEqual(["en", "pt-PT", "x-default"]);
    expect(map["pt-PT"]).toMatch(/\/pt$/);
    expect(map.en).toMatch(/\/en$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/pt$/);
  });

  test("the language switcher keeps the current page", async ({ page }) => {
    await page.goto("/en/pricing");
    await page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "Português" })
      .click();
    await expect(page).toHaveURL(/\/pt\/pricing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Preços simples e transparentes",
    );
  });

  test("navigates from the header to the pricing page", async ({ page }) => {
    await page.goto("/en");
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL(/\/en\/pricing$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Simple, transparent pricing",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Pro" })).toBeVisible();
    await expect(page.getByText("Most popular")).toBeVisible();
  });

  test("pricing buttons without a checkout configured lead to the waitlist", async ({
    page,
  }) => {
    await page.goto("/pt/pricing");
    const buttons = page.getByRole("link", { name: "Entrar na lista de espera" });
    await expect(buttons.first()).toHaveAttribute("href", "/pt#waitlist");
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });
});

test.describe("not found", () => {
  test("unknown pages answer 404 with a localized page", async ({ page }) => {
    const response = await page.goto("/en/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("link", { name: "Back to the home page" }),
    ).toHaveAttribute("href", "/en");

    const pt = await page.goto("/pt/nada/aqui");
    expect(pt?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
  });

  test("a path without locale ends in a 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
  });

  test("an unknown legal document is a 404", async ({ page }) => {
    const response = await page.goto("/en/legal/not-a-document");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
  });
});
