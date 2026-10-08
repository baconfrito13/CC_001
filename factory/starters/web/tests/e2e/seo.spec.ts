import { expect, test } from "@playwright/test";
import { LEGAL_DOCS } from "./helpers";

test.describe("SEO and metadata routes", () => {
  test("sitemap.xml lists every locale URL with hreflang alternates", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");
    const xml = await response.text();
    for (const path of ["", "/pricing", ...LEGAL_DOCS.map((doc) => `/legal/${doc}`)]) {
      expect(xml).toContain(`<loc>http://localhost:3100/en${path}</loc>`);
      expect(xml).toContain(`<loc>http://localhost:3100/pt${path}</loc>`);
    }
    expect(xml).toContain('hreflang="pt-PT"');
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  test("robots.txt blocks /api and links the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-Agent: *");
    expect(text).toContain("Allow: /");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap: http://localhost:3100/sitemap.xml");
  });

  test("serves an Open Graph image per locale and a favicon", async ({
    request,
    page,
  }) => {
    await page.goto("/pt");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toContain("/pt/opengraph-image");
    const image = await request.get(new URL(og ?? "", "http://localhost:3100").pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
    expect((await image.body()).byteLength).toBeGreaterThan(5_000);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "pt_PT",
    );

    const icon = await request.get("/icon.svg");
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("svg");
  });

  test("home includes structured data (Organization, WebSite, SoftwareApplication, FAQPage)", async ({
    page,
  }) => {
    await page.goto("/en");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => JSON.parse(node.textContent ?? "null")),
      );
    const types = blocks.map((block) => block["@type"]).sort();
    expect(types).toEqual(["FAQPage", "Organization", "SoftwareApplication", "WebSite"]);
    const app = blocks.find((block) => block["@type"] === "SoftwareApplication");
    expect(app.offers.map((offer: { name: string }) => offer.name)).toEqual([
      "Starter",
      "Pro",
      "Team",
    ]);
    const faq = blocks.find((block) => block["@type"] === "FAQPage");
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
  });

  test("security headers are sent", async ({ request }) => {
    const headers = (await request.get("/en")).headers();
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toContain("camera=()");
    const csp = headers["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("https://plausible.io");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("hydrates and navigates without console errors or CSP violations", async ({
    page,
  }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning")
        problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));
    await page.goto("/en");
    await page.getByRole("button", { name: "Reject analytics" }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL(/\/en\/pricing$/);
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Privacy Policy" })
      .click();
    await expect(page).toHaveURL(/\/en\/legal\/privacy$/);
    await page.waitForTimeout(500);
    expect(problems).toEqual([]);
  });
});
