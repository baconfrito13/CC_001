import { expect, test } from "@playwright/test";
import { uniqueIp } from "./helpers";

const COPY = {
  en: {
    path: "/en/withdraw",
    footerLink: "Withdraw from contract",
    h1: "Withdraw from a contract",
    name: "Your name",
    email: "Email address for the acknowledgement",
    reference: "Order or contract reference",
    submit: "Confirm withdrawal",
    summary: "Please fix the following:",
    nameRequired: "Enter your name.",
    emailInvalid: "Enter a valid email address, for example name@example.com.",
    referenceRequired: "Enter the order or contract reference.",
    success: "Your withdrawal was received",
    ack: "An acknowledgement of receipt will be sent by email to ana@example.com.",
    policy: "withdrawal policy",
  },
  pt: {
    path: "/pt/withdraw",
    footerLink: "Cancelar contrato (livre resolução)",
    h1: "Cancelar contrato (livre resolução)",
    name: "O seu nome",
    email: "Endereço de e-mail para o aviso de receção",
    reference: "Referência da encomenda ou do contrato",
    submit: "Confirmar livre resolução",
    summary: "Corrija o seguinte:",
    nameRequired: "Indique o seu nome.",
    emailInvalid: "Indique um endereço de e-mail válido, por exemplo nome@exemplo.pt.",
    referenceRequired: "Indique a referência da encomenda ou do contrato.",
    success: "A sua livre resolução foi recebida",
    ack: "Será enviado um aviso de receção por e-mail para ana@exemplo.pt.",
    policy: "política de livre resolução",
  },
} as const;

test.describe("online withdrawal function (sellsToConsumers = true)", () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
  });

  for (const locale of ["en", "pt"] as const) {
    const t = COPY[locale];

    test.describe(locale, () => {
      test("is linked from the footer of every page and leads to the form", async ({
        page,
      }) => {
        // The consent banner overlays the footer until answered; the choice persists across pages.
        await page.goto(`/${locale}`);
        await page.getByRole("button", { name: /^(Reject|Rejeitar)/ }).click();
        for (const path of [
          `/${locale}`,
          `/${locale}/pricing`,
          `/${locale}/legal/privacy`,
          `/${locale}/missing`,
        ]) {
          await page.goto(path);
          await expect(
            page.getByRole("contentinfo").getByRole("link", { name: t.footerLink }),
          ).toHaveAttribute("href", t.path);
        }
        await page
          .getByRole("contentinfo")
          .getByRole("link", { name: t.footerLink })
          .click();
        await expect(page).toHaveURL(new RegExp(`${t.path}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.h1);
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          locale === "pt" ? "pt-PT" : "en",
        );
        await expect(
          page.getByRole("main").getByRole("link", { name: t.policy }),
        ).toHaveAttribute("href", `/${locale}/legal/withdrawal`);
      });

      test("shows accessible validation errors, then a confirmation with the timestamp", async ({
        page,
      }) => {
        await page.goto(t.path);
        const form = page.locator("main form");
        const submit = form.getByRole("button", { name: t.submit });

        await submit.click();
        const alert = page.locator('main [role="alert"]');
        await expect(alert).toContainText(t.summary);
        await expect(alert).toBeFocused();
        await expect(alert.getByRole("link", { name: t.nameRequired })).toBeVisible();
        await expect(
          alert.getByRole("link", { name: t.referenceRequired }),
        ).toBeVisible();
        await expect(form.getByLabel(t.name)).toHaveAttribute("aria-invalid", "true");
        await expect(form.getByLabel(t.name)).toHaveAccessibleDescription(t.nameRequired);
        await expect(form.getByLabel(t.reference)).toHaveAttribute(
          "aria-invalid",
          "true",
        );

        await form.getByLabel(t.name).fill("Ana Silva");
        await form.getByLabel(t.email).fill("not-an-email");
        await form.getByLabel(t.reference).fill("ORD-1042");
        await submit.click();
        await expect(form.getByLabel(t.email)).toHaveAccessibleDescription(
          t.emailInvalid,
        );

        const address = locale === "en" ? "ana@example.com" : "ana@exemplo.pt";
        await form.getByLabel(t.email).fill(address);
        await form.getByLabel(/Message|Mensagem/).fill("Changed my mind");
        await submit.click();

        const success = page.getByRole("status").filter({ hasText: t.success });
        await expect(success).toBeVisible();
        await expect(success).toBeFocused();
        await expect(success).toContainText("ORD-1042");
        await expect(success).toContainText(
          t.ack.replace("ana@example.com", address).replace("ana@exemplo.pt", address),
        );
        // The confirmation shows when the statement was received (year of the system clock).
        await expect(success).toContainText(String(new Date().getFullYear()));
        await expect(form).toBeHidden();
      });
    });
  }

  test("accessibility: the form and its errors have no serious violations", async ({
    page,
  }) => {
    const { default: AxeBuilder } = await import("@axe-core/playwright");
    for (const path of ["/en/withdraw", "/pt/withdraw"]) {
      await page.goto(path);
      await page.locator("main form").getByRole("button").click();
      await expect(page.locator('main [role="alert"]')).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        serious.map((v) => v.id),
        path,
      ).toEqual([]);
    }
  });

  test("the page is not offered to search engines", async ({ page, request }) => {
    await page.goto("/en/withdraw");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/withdraw<");
  });

  test("the policy page points to the online form", async ({ page }) => {
    await page.goto("/pt/legal/withdrawal");
    await expect(
      page.getByRole("main").getByRole("link", { name: "formulário de livre resolução" }),
    ).toHaveAttribute("href", "/pt/withdraw");
  });
});

test.describe("POST /api/withdrawal", () => {
  const valid = {
    name: "Ana Silva",
    email: "ana@example.com",
    reference: "ORD-1042",
    message: "",
    locale: "en",
    website: "",
  };

  test("accepts a statement and returns the receipt time", async ({ request }) => {
    const before = Date.now();
    const response = await request.post("/api/withdrawal", {
      data: valid,
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(Math.abs(Date.parse(body.submittedAt) - before)).toBeLessThan(60_000);
    expect(response.headers()["cache-control"]).toBe("no-store");
  });

  test("validates input and silently drops the honeypot", async ({ request }) => {
    const headers = { "x-forwarded-for": uniqueIp() };
    const bad = await request.post("/api/withdrawal", {
      data: { ...valid, email: "x", reference: "" },
      headers,
    });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).fieldErrors).toEqual({
      email: "invalid",
      reference: "required",
    });

    const trap = await request.post("/api/withdrawal", {
      data: { ...valid, website: "spam" },
      headers,
    });
    expect(trap.status()).toBe(200);
  });

  test("rate limits repeated requests from one IP, and rejects other origins and GET", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": uniqueIp() };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push(
        (await request.post("/api/withdrawal", { data: valid, headers })).status(),
      );
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);

    const crossOrigin = await request.post("/api/withdrawal", {
      data: valid,
      headers: { origin: "https://evil.example", "x-forwarded-for": uniqueIp() },
    });
    expect(crossOrigin.status()).toBe(403);
    expect((await request.get("/api/withdrawal")).status()).toBe(405);
  });
});
