import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { LOCALES } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function seriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations
    .filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    )
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
}

test.describe("accessibility (axe)", () => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} mode`, () => {
      test.use({ colorScheme: scheme });

      for (const locale of LOCALES) {
        test(`home (${locale.code}) with the consent banner open has no serious or critical violations`, async ({
          page,
        }) => {
          await page.goto(`/${locale.code}`);
          await expect(
            page.getByRole("region", { name: /cookie|cookies/i }),
          ).toBeVisible();
          expect(await seriousViolations(page)).toEqual([]);
        });

        test(`home (${locale.code}) after answering the banner has no serious or critical violations`, async ({
          page,
        }) => {
          await page.goto(`/${locale.code}`);
          await page.getByRole("button", { name: /^(Reject|Rejeitar)/ }).click();
          await expect(
            page.getByRole("region", { name: /cookie|cookies/i }),
          ).toBeHidden();
          expect(await seriousViolations(page)).toEqual([]);
        });
      }

      test("pricing, a legal page and the 404 page have no serious or critical violations", async ({
        page,
      }) => {
        for (const path of [
          "/pt/pricing",
          "/en/legal/privacy",
          "/pt/legal/terms",
          "/en/missing-page",
        ]) {
          await page.goto(path);
          await page.waitForLoadState("networkidle");
          expect(await seriousViolations(page), path).toEqual([]);
        }
      });
    });
  }

  test("the waitlist form with errors has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/en");
    await page
      .locator("#waitlist form")
      .getByRole("button", { name: "Join the waitlist" })
      .click();
    await expect(page.locator('#waitlist [role="alert"]')).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
});

test.describe("responsive layout", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const path of ["/en", "/pt", "/en/pricing", "/pt/legal/privacy"]) {
    test(`${path} does not scroll horizontally at 360px`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("the header keeps the navigation reachable on a phone", async ({ page }) => {
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("smooth scrolling is switched off", async ({ page }) => {
    await page.goto("/en");
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("auto");
  });
});
