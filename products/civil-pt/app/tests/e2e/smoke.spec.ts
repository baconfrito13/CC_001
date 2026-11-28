import { expect, test } from "@playwright/test";

/**
 * Read-only smoke tests: safe against any deployment, local or live.
 *
 *   BASE_URL=https://my-product.vercel.app npm run test:smoke
 *
 * Nothing here submits a form, starts a checkout or depends on test-only configuration.
 */
test.describe("production smoke test", () => {
  test("health endpoint reports ok and a version, without leaking configuration", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(Object.keys(body).sort()).toEqual(["status", "version"]);
  });

  for (const [path, lang] of [
    ["/en", "en"],
    ["/pt", "pt-PT"],
  ] as const) {
    test(`${path} renders with the right language and a single h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("/ redirects to a locale", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "accept-language": "pt-PT" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/\/pt$/);
  });

  test("legal pages are published without unreplaced placeholders", async ({ page }) => {
    for (const locale of ["en", "pt"]) {
      for (const doc of ["privacy", "terms", "cookies", "legal-notice"]) {
        const response = await page.goto(`/${locale}/legal/${doc}`);
        expect(response?.status(), `${locale}/${doc}`).toBe(200);
        expect(await page.content(), `${locale}/${doc}`).not.toContain("{{");
        expect(await page.locator("body").innerText(), `${locale}/${doc}`).not.toContain(
          "}}",
        );
      }
    }
  });

  test("the consent banner is offered to new visitors", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept analytics" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject analytics" })).toBeVisible();
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("User-Agent: *");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });

  test("security headers are present", async ({ request }) => {
    const headers = (await request.get("/en")).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["strict-transport-security"]).toBeTruthy();
  });

  test("unknown pages are real 404s", async ({ request }) => {
    expect((await request.get("/en/definitely-not-a-page")).status()).toBe(404);
  });
});
