import { expect, test } from "@playwright/test";

const STORAGE_KEY = "consent";

async function storedConsent(page: import("@playwright/test").Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { status: string; at: string }) : null;
  }, STORAGE_KEY);
}

test.describe("cookie consent", () => {
  test("shows on the first visit with equally prominent Accept and Reject", async ({
    page,
  }) => {
    await page.goto("/en");
    const banner = page.getByRole("region", { name: "Cookie preferences" });
    await expect(banner).toBeVisible();
    await expect(
      banner.getByRole("link", { name: "Read the cookie policy" }),
    ).toHaveAttribute("href", "/en/legal/cookies");

    const accept = banner.getByRole("button", { name: "Accept analytics" });
    const reject = banner.getByRole("button", { name: "Reject analytics" });
    const style = (locator: typeof accept) =>
      locator.evaluate((el) => {
        const css = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return {
          font: `${css.fontSize}/${css.fontWeight}`,
          background: css.backgroundColor,
          color: css.color,
          border: `${css.borderTopWidth} ${css.borderTopStyle} ${css.borderTopColor}`,
          padding: css.padding,
          height: Math.round(box.height),
          width: Math.round(box.width),
        };
      });
    expect(await style(accept)).toEqual(await style(reject));
  });

  test("rejecting persists across reloads (localStorage and cookie) and hides the banner", async ({
    page,
    context,
  }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Reject analytics" }).click();
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();

    expect((await storedConsent(page))?.status).toBe("denied");
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "consent")?.value).toBe("denied");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
    expect((await storedConsent(page))?.status).toBe("denied");
  });

  test("accepting persists across reloads and across pages and languages", async ({
    page,
  }) => {
    await page.goto("/pt");
    const banner = page.getByRole("region", { name: "Preferências de cookies" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Aceitar análise" }).click();
    await expect(banner).toBeHidden();
    expect((await storedConsent(page))?.status).toBe("granted");

    await page.reload();
    await page.waitForTimeout(500);
    await expect(
      page.getByRole("region", { name: "Preferências de cookies" }),
    ).toBeHidden();

    await page.goto("/en/pricing");
    await page.waitForTimeout(500);
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
  });

  test("a choice can be changed from the footer", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Reject analytics" }).click();

    const settings = page
      .getByRole("contentinfo")
      .getByRole("button", { name: "Cookie settings" });
    await settings.click();
    const banner = page.getByRole("region", { name: "Cookie preferences" });
    await expect(banner).toBeVisible();
    await expect(banner).toBeFocused();

    await banner.getByRole("button", { name: "Accept analytics" }).click();
    await expect(banner).toBeHidden();
    expect((await storedConsent(page))?.status).toBe("granted");
    await expect(settings).toBeFocused();
  });

  test("falls back to the cookie when localStorage is empty", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "consent", value: "denied", url: "http://localhost:3100" },
    ]);
    await page.goto("/en");
    await page.waitForTimeout(500);
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
  });

  test("can be answered with the keyboard", async ({ page }) => {
    await page.goto("/en");
    const reject = page.getByRole("button", { name: "Reject analytics" });
    await reject.focus();
    await expect(reject).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
  });
});

test.describe("analytics only after consent (Plausible, not cookieless)", () => {
  const SCRIPT = "https://plausible.io/js/script.js";

  async function trackPlausible(page: import("@playwright/test").Page) {
    const requests: string[] = [];
    await page.route("https://plausible.io/**", (route) => {
      requests.push(route.request().url());
      return route.fulfill({
        contentType: "application/javascript",
        body: "window.__plausibleLoaded = true;",
      });
    });
    return requests;
  }

  test("nothing loads before a decision, or after rejecting", async ({ page }) => {
    const requests = await trackPlausible(page);
    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeVisible();
    await page.waitForTimeout(800);
    expect(requests).toEqual([]);

    await page.getByRole("button", { name: "Reject analytics" }).click();
    await page.reload();
    await page.waitForTimeout(800);
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => (window as any).__plausibleLoaded)).toBeUndefined();
  });

  test("loads after accepting, and on later visits", async ({ page }) => {
    const requests = await trackPlausible(page);
    await page.goto("/en");
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect.poll(() => requests).toContain(SCRIPT);
    await expect
      .poll(() => page.evaluate(() => (window as any).__plausibleLoaded))
      .toBe(true);
    await expect(
      page.locator('script[src="https://plausible.io/js/script.js"]'),
    ).toHaveAttribute("data-domain", "acme.example");

    requests.length = 0;
    await page.reload();
    await expect.poll(() => requests).toContain(SCRIPT);
  });

  test("the security policy allows the configured analytics provider without violations", async ({
    page,
  }) => {
    await trackPlausible(page);
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/content security policy/i.test(message.text()))
        violations.push(message.text());
    });
    await page.goto("/en");
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as any).__plausibleLoaded)).toBe(true);
    expect(violations).toEqual([]);
  });
});
