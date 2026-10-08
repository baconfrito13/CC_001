import { expect, test } from "@playwright/test";
import { uniqueIp } from "./helpers";

test.describe("waitlist form", () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
  });

  test("shows accessible validation errors, then a success state", async ({ page }) => {
    await page.goto("/en");
    const form = page.locator("#waitlist form");
    await form.scrollIntoViewIfNeeded();
    const email = form.getByLabel("Email address");
    const consent = form.getByRole("checkbox");
    const submit = form.getByRole("button", { name: "Join the waitlist" });

    // Nothing filled in.
    await submit.click();
    const alert = page.locator('#waitlist [role="alert"]');
    await expect(alert).toContainText("Please fix the following:");
    await expect(alert).toBeFocused();
    await expect(
      alert.getByRole("link", { name: "Enter your email address." }),
    ).toBeVisible();
    await expect(
      alert.getByRole("link", { name: "Please tick the box to confirm you agree." }),
    ).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription("Enter your email address.");
    await expect(consent).toHaveAttribute("aria-invalid", "true");
    await expect(consent).toHaveAccessibleDescription(
      "Please tick the box to confirm you agree.",
    );

    // Invalid e-mail, consent still missing.
    await email.fill("not-an-email");
    await submit.click();
    await expect(email).toHaveAccessibleDescription(/valid email address/);

    // Valid e-mail, consent still missing.
    await email.fill("ana@example.com");
    await submit.click();
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await expect(consent).toHaveAttribute("aria-invalid", "true");

    // Consent given: success.
    await consent.check();
    await submit.click();
    const success = page.locator("#waitlist").getByRole("status");
    await expect(success).toContainText("You are on the list!");
    await expect(success).toBeFocused();
    await expect(form).toBeHidden();
  });

  test("the consent label links to the privacy policy and the box starts unticked", async ({
    page,
  }) => {
    await page.goto("/pt");
    const form = page.locator("#waitlist form");
    await expect(form.getByRole("checkbox")).not.toBeChecked();
    const link = form.getByRole("link", { name: /política de privacidade/ });
    await expect(link).toHaveAttribute("href", "/pt/legal/privacy");
  });

  test("works in Portuguese", async ({ page }) => {
    await page.goto("/pt");
    const form = page.locator("#waitlist form");
    await form.getByRole("button", { name: "Entrar na lista de espera" }).click();
    await expect(page.locator('#waitlist [role="alert"]')).toContainText(
      "Indique o seu endereço de e-mail.",
    );
    await form.getByLabel("Endereço de e-mail").fill("ana@exemplo.pt");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Entrar na lista de espera" }).click();
    await expect(page.locator("#waitlist").getByRole("status")).toContainText(
      "Está na lista!",
    );
  });

  test("the honeypot field is invisible to people and assistive technology", async ({
    page,
  }) => {
    await page.goto("/en");
    const honeypot = page.locator("#waitlist-website");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(
      await honeypot.evaluate((el) => el.closest("[aria-hidden='true']") !== null),
    ).toBe(true);
    expect(await honeypot.evaluate((el) => el.getBoundingClientRect().right <= 0)).toBe(
      true,
    );
  });
});

test.describe("POST /api/waitlist", () => {
  const valid = { email: "api@example.com", consent: true, locale: "en", website: "" };

  test("accepts a valid signup (console adapter)", async ({ request }) => {
    const response = await request.post("/api/waitlist", {
      data: valid,
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers()["cache-control"]).toBe("no-store");
  });

  test("validates input", async ({ request }) => {
    const headers = { "x-forwarded-for": uniqueIp() };
    const noConsent = await request.post("/api/waitlist", {
      data: { ...valid, consent: false },
      headers,
    });
    expect(noConsent.status()).toBe(400);
    expect((await noConsent.json()).fieldErrors).toEqual({ consent: "required" });

    const badEmail = await request.post("/api/waitlist", {
      data: { ...valid, email: "nope" },
      headers,
    });
    expect(badEmail.status()).toBe(400);
    expect((await badEmail.json()).fieldErrors).toEqual({ email: "invalid" });

    const notJson = await request.post("/api/waitlist", {
      data: "email=a@b.co",
      headers: { ...headers, "content-type": "text/plain" },
    });
    expect(notJson.status()).toBe(415);
  });

  test("pretends success for the honeypot", async ({ request }) => {
    const response = await request.post("/api/waitlist", {
      data: { ...valid, website: "https://spam.example" },
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(200);
  });

  test("rate limits repeated requests from one IP", async ({ request }) => {
    const headers = { "x-forwarded-for": uniqueIp() };
    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1) {
      statuses.push(
        (await request.post("/api/waitlist", { data: valid, headers })).status(),
      );
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429]);
  });

  test("rejects browser requests from another origin", async ({ request }) => {
    const response = await request.post("/api/waitlist", {
      data: valid,
      headers: { origin: "https://evil.example", "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(403);
  });

  test("is not available through GET", async ({ request }) => {
    expect((await request.get("/api/waitlist")).status()).toBe(405);
  });
});

test.describe("payment endpoints without configuration", () => {
  test("checkout answers 404 for plans without a Stripe price", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: { planId: "pro", locale: "en" },
    });
    expect(response.status()).toBe(404);
    expect((await response.json()).error).toBe("unknown_plan");
  });

  test("the Stripe webhook answers 501 until STRIPE_* variables are set", async ({
    request,
  }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: "{}",
      headers: { "stripe-signature": "t=1,v1=abc" },
    });
    expect(response.status()).toBe(501);
    expect((await response.json()).error).toBe("stripe_not_configured");
  });
});
