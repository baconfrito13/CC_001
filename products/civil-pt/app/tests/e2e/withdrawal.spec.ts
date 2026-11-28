import { expect, test } from "@playwright/test";
import { uniqueIp } from "./helpers";

/**
 * Rastoplan sells to businesses only (`legal.sellsToConsumers: false`, docs/04-architecture.md
 * hand-off), so the starter's online withdrawal function must not exist: no footer link, no
 * form page, no policy document, no sitemap entry and no API. The function itself stays covered
 * by `tests/unit/withdrawal.test.ts` and `tests/unit/site-visibility.test.ts`, which force the
 * flag on, so switching the product to consumers later keeps a tested path.
 */
test.describe("B2B only: no consumer withdrawal function", () => {
  for (const locale of ["en", "pt"] as const) {
    test(`${locale}: the footer of every page has no withdrawal link`, async ({
      page,
    }) => {
      for (const path of ["", "/pricing", "/legal/privacy", "/not-a-page"]) {
        await page.goto(`/${locale}${path}`);
        const footer = page.getByRole("contentinfo");
        await expect(footer, `${locale}${path}`).toBeVisible();
        await expect(
          footer.locator('a[href$="/withdraw"]'),
          `${locale}${path}`,
        ).toHaveCount(0);
        await expect(
          footer.locator('a[href$="/legal/withdrawal"]'),
          `${locale}${path}`,
        ).toHaveCount(0);
      }
    });

    test(`${locale}: the form page and the policy document answer 404`, async ({
      page,
    }) => {
      for (const path of [`/${locale}/withdraw`, `/${locale}/legal/withdrawal`]) {
        const response = await page.goto(path);
        expect(response?.status(), path).toBe(404);
      }
    });
  }

  test("the sitemap does not list the withdrawal pages", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/withdraw");
    expect(sitemap).not.toContain("/legal/withdrawal");
  });

  test("POST /api/withdrawal is not served", async ({ request }) => {
    const response = await request.post("/api/withdrawal", {
      data: {
        name: "Ana Silva",
        email: "ana@example.com",
        reference: "ORD-1042",
        message: "",
        locale: "en",
        website: "",
      },
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(404);
  });
});
