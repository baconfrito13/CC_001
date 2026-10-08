import { describe, expect, it, vi } from "vitest";
import { config } from "@/config/site";
import { createRateLimiter } from "@/lib/waitlist/rate-limit";
import {
  createWithdrawalConsoleAdapter,
  createWithdrawalResendAdapter,
  createWithdrawalWebhookAdapter,
  selectWithdrawalAdapter,
  type WithdrawalAdapter,
  type WithdrawalEntry,
} from "@/lib/withdrawal/adapters";
import { withdrawalEnabled } from "@/lib/withdrawal/enabled";
import { handleWithdrawal, type WithdrawalDeps } from "@/lib/withdrawal/handler";
import { formatTimestamp, renderWithdrawalMessages } from "@/lib/withdrawal/messages";
import { parseWithdrawalRequest } from "@/lib/withdrawal/schema";

const valid = {
  name: "  Ana Silva ",
  email: "Ana@Example.com ",
  reference: " ORD-1042 ",
  message: "",
  locale: "pt",
  website: "",
};

describe("parseWithdrawalRequest", () => {
  it("accepts a valid statement, trimming text and lower-casing the e-mail", () => {
    expect(parseWithdrawalRequest(valid)).toEqual({
      ok: true,
      data: {
        name: "Ana Silva",
        email: "ana@example.com",
        reference: "ORD-1042",
        message: undefined,
        locale: "pt",
      },
    });
  });

  it("keeps an optional message", () => {
    const result = parseWithdrawalRequest({ ...valid, message: " Changed my mind " });
    expect(result).toMatchObject({ ok: true, data: { message: "Changed my mind" } });
  });

  it("requires name, e-mail and reference", () => {
    for (const field of ["name", "email", "reference"] as const) {
      for (const value of ["", "   ", undefined, 7]) {
        expect(parseWithdrawalRequest({ ...valid, [field]: value })).toMatchObject({
          ok: false,
          reason: "invalid",
          fieldErrors: { [field]: "required" },
        });
      }
    }
  });

  it("rejects an invalid e-mail and an unknown locale", () => {
    expect(parseWithdrawalRequest({ ...valid, email: "nope" })).toMatchObject({
      fieldErrors: { email: "invalid" },
    });
    expect(parseWithdrawalRequest({ ...valid, locale: "fr" })).toMatchObject({
      fieldErrors: { locale: "invalid" },
    });
  });

  it("limits text lengths", () => {
    expect(parseWithdrawalRequest({ ...valid, name: "a".repeat(121) })).toMatchObject({
      fieldErrors: { name: "too_long" },
    });
    expect(
      parseWithdrawalRequest({ ...valid, reference: "a".repeat(121) }),
    ).toMatchObject({
      fieldErrors: { reference: "too_long" },
    });
    expect(parseWithdrawalRequest({ ...valid, message: "a".repeat(2001) })).toMatchObject(
      {
        fieldErrors: { message: "too_long" },
      },
    );
    expect(parseWithdrawalRequest({ ...valid, message: "a".repeat(2000) }).ok).toBe(true);
  });

  it("reports several problems at once", () => {
    expect(
      parseWithdrawalRequest({ ...valid, name: "", email: "x", reference: "" }),
    ).toMatchObject({
      fieldErrors: { name: "required", email: "invalid", reference: "required" },
    });
  });

  it("flags a filled honeypot", () => {
    expect(parseWithdrawalRequest({ ...valid, website: "http://spam.example" })).toEqual({
      ok: false,
      reason: "honeypot",
    });
  });

  it("handles bodies that are not objects", () => {
    for (const body of [null, "x", 42, []]) {
      expect(parseWithdrawalRequest(body)).toMatchObject({
        ok: false,
        reason: "invalid",
      });
    }
  });
});

describe("withdrawalEnabled", () => {
  it("follows legal.sellsToConsumers", () => {
    expect(withdrawalEnabled(config)).toBe(config.legal.sellsToConsumers);
    expect(
      withdrawalEnabled({ legal: { ...config.legal, sellsToConsumers: true } }),
    ).toBe(true);
    expect(
      withdrawalEnabled({ legal: { ...config.legal, sellsToConsumers: false } }),
    ).toBe(false);
  });
});

describe("withdrawal e-mails", () => {
  const entry: WithdrawalEntry = {
    name: "Ana Silva",
    email: "ana@example.com",
    reference: "ORD-1042",
    message: "Mudei de ideias",
    locale: "pt",
    submittedAt: "2026-10-08T10:00:00.000Z",
    source: "acme.example",
  };

  it("writes the acknowledgement in the consumer's language, with reference and time", () => {
    const pt = renderWithdrawalMessages(entry);
    expect(pt.ackSubject).toContain("ORD-1042");
    expect(pt.ackText).toContain("Olá Ana Silva");
    expect(pt.ackText).toContain("8 de outubro de 2026");
    expect(pt.ackText).toContain("/pt/legal/withdrawal");
    expect(pt.ackText).toContain(config.company.legalName);

    const en = renderWithdrawalMessages({ ...entry, locale: "en" });
    expect(en.ackText).toContain("Hello Ana Silva");
    expect(en.ackText).toContain("8 October 2026");
    expect(en.ackText).toContain("/en/legal/withdrawal");
  });

  it("writes the company notification in the default language with every detail", () => {
    const { notifySubject, notifyText } = renderWithdrawalMessages(entry);
    expect(notifySubject).toContain("ORD-1042");
    for (const detail of [
      "Ana Silva",
      "ana@example.com",
      "ORD-1042",
      "Mudei de ideias",
      "8 October 2026",
    ]) {
      expect(notifyText).toContain(detail);
    }
  });

  it("never leaves a {placeholder} in a message", () => {
    for (const locale of ["en", "pt"] as const) {
      const m = renderWithdrawalMessages({ ...entry, locale, message: undefined });
      for (const text of Object.values(m)) expect(text).not.toMatch(/\{\w+\}/);
    }
  });

  it("formats timestamps in UTC", () => {
    expect(formatTimestamp("2026-10-08T23:30:00.000Z", "en-GB")).toContain(
      "8 October 2026",
    );
    expect(formatTimestamp("2026-10-08T23:30:00.000Z", "en-GB")).toContain("UTC");
  });
});

describe("withdrawal adapters", () => {
  const entry: WithdrawalEntry = {
    name: "Ana",
    email: "ana@example.com",
    reference: "ORD-1",
    locale: "en",
    submittedAt: "2026-10-08T10:00:00.000Z",
    source: "acme.example",
  };
  const messages = {
    ackSubject: "ack s",
    ackText: "ack t",
    notifySubject: "n s",
    notifyText: "n t",
  };

  it("console adapter prints the statement", async () => {
    const log = vi.fn();
    await createWithdrawalConsoleAdapter(log).submit(entry, messages);
    expect(log.mock.calls[0]?.[0]).toContain("ORD-1");
  });

  it("webhook adapter sends the statement and the acknowledgement text", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    await createWithdrawalWebhookAdapter(
      "https://hooks.example/w",
      fetchMock as unknown as typeof fetch,
    ).submit(entry, messages);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.example/w");
    expect(JSON.parse(String(init.body))).toEqual({
      type: "withdrawal",
      ...entry,
      acknowledgement: { subject: "ack s", text: "ack t" },
    });
  });

  it("webhook adapter fails on HTTP errors", async () => {
    const fetchMock = vi.fn(async () => new Response("no", { status: 500 }));
    await expect(
      createWithdrawalWebhookAdapter(
        "https://hooks.example/w",
        fetchMock as unknown as typeof fetch,
      ).submit(entry, messages),
    ).rejects.toThrow(/HTTP 500/);
  });

  it("resend adapter notifies the company first, then acknowledges the consumer", async () => {
    const send = vi.fn(async () => ({ error: null }));
    const adapter = createWithdrawalResendAdapter({
      apiKey: "re_x",
      from: "Acme <noreply@acme.example>",
      notifyTo: "support@acme.example",
      createClient: () => ({ emails: { send } }),
    });
    await adapter.submit(entry, messages);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenNthCalledWith(1, {
      from: "Acme <noreply@acme.example>",
      to: "support@acme.example",
      replyTo: "ana@example.com",
      subject: "n s",
      text: "n t",
    });
    expect(send).toHaveBeenNthCalledWith(2, {
      from: "Acme <noreply@acme.example>",
      to: "ana@example.com",
      replyTo: "support@acme.example",
      subject: "ack s",
      text: "ack t",
    });
  });

  it("resend adapter fails if the company cannot be notified, but only logs a failed acknowledgement", async () => {
    const failFirst = vi.fn(async () => ({ error: { message: "domain not verified" } }));
    await expect(
      createWithdrawalResendAdapter({
        apiKey: "k",
        from: "a@b.co",
        notifyTo: "s@b.co",
        createClient: () => ({ emails: { send: failFirst } }),
      }).submit(entry, messages),
    ).rejects.toThrow(/domain not verified/);
    expect(failFirst).toHaveBeenCalledTimes(1);

    const logError = vi.fn();
    const failSecond = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "bounced" } });
    await createWithdrawalResendAdapter({
      apiKey: "k",
      from: "a@b.co",
      notifyTo: "s@b.co",
      logError,
      createClient: () => ({ emails: { send: failSecond } }),
    }).submit(entry, messages);
    expect(logError).toHaveBeenCalledWith(expect.stringContaining("bounced"));
  });
});

describe("selectWithdrawalAdapter", () => {
  const base = {
    NODE_ENV: "development" as const,
    WAITLIST_ADAPTER: undefined,
    RESEND_API_KEY: undefined,
    RESEND_FROM: undefined,
    WAITLIST_WEBHOOK_URL: undefined,
    WITHDRAWAL_WEBHOOK_URL: undefined,
  };
  const deps = { notifyTo: "support@acme.example" };
  const pick = (env: Parameters<typeof selectWithdrawalAdapter>[0]) => {
    const selection = selectWithdrawalAdapter(env, deps);
    return selection.ok ? selection.adapter.name : selection.reason;
  };

  it("uses the console adapter in development and test", () => {
    expect(pick(base)).toBe("console");
    expect(pick({ ...base, NODE_ENV: "test" })).toBe("console");
  });

  it("refuses to run in production without an adapter", () => {
    expect(pick({ ...base, NODE_ENV: "production" })).toBe("not_configured");
  });

  it("prefers Resend (key and sender), then a dedicated or the waitlist webhook", () => {
    const prod = { ...base, NODE_ENV: "production" as const };
    expect(pick({ ...prod, RESEND_API_KEY: "re", RESEND_FROM: "a@b.co" })).toBe("resend");
    // Resend without a sender cannot send e-mail: fall through to the webhook.
    expect(
      pick({
        ...prod,
        RESEND_API_KEY: "re",
        WAITLIST_WEBHOOK_URL: "https://h.example/w",
      }),
    ).toBe("webhook");
    expect(pick({ ...prod, RESEND_API_KEY: "re" })).toBe("not_configured");
    expect(pick({ ...prod, WITHDRAWAL_WEBHOOK_URL: "https://h.example/w" })).toBe(
      "webhook",
    );
  });

  it("honours an explicit adapter and flags missing variables", () => {
    expect(pick({ ...base, NODE_ENV: "production", WAITLIST_ADAPTER: "console" })).toBe(
      "console",
    );
    expect(pick({ ...base, WAITLIST_ADAPTER: "resend", RESEND_API_KEY: "re" })).toBe(
      "misconfigured",
    );
    expect(pick({ ...base, WAITLIST_ADAPTER: "webhook" })).toBe("misconfigured");
  });
});

describe("POST /api/withdrawal handler", () => {
  function request(body: unknown, headers: Record<string, string> = {}, raw?: string) {
    return new Request("http://localhost:3000/api/withdrawal", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
      body: raw ?? JSON.stringify(body),
    });
  }

  function setup(overrides: Partial<WithdrawalDeps> = {}) {
    const submit = vi.fn(async () => {});
    const adapter: WithdrawalAdapter = { name: "console", submit };
    const logError = vi.fn();
    const deps: Partial<WithdrawalDeps> = {
      enabled: true,
      select: () => ({ ok: true, adapter }),
      limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
      now: () => new Date("2026-10-08T10:00:00.000Z"),
      logError,
      ...overrides,
    };
    return { deps, submit, logError };
  }

  it("delivers a valid statement and answers with the receipt time", async () => {
    const { deps, submit } = setup();
    const response = await handleWithdrawal(request(valid), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      submittedAt: "2026-10-08T10:00:00.000Z",
    });
    expect(submit).toHaveBeenCalledOnce();
    const [entry, messages] = submit.mock.calls[0] as unknown as [
      WithdrawalEntry,
      Record<string, string>,
    ];
    expect(entry).toMatchObject({
      name: "Ana Silva",
      email: "ana@example.com",
      reference: "ORD-1042",
      locale: "pt",
      submittedAt: "2026-10-08T10:00:00.000Z",
      source: "acme.example",
    });
    expect(messages.ackText).toContain("Ana Silva");
  });

  it("answers 400 with field errors and delivers nothing", async () => {
    const { deps, submit } = setup();
    const response = await handleWithdrawal(
      request({ ...valid, email: "bad", reference: "" }),
      deps,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "validation",
      fieldErrors: { email: "invalid", reference: "required" },
    });
    expect(submit).not.toHaveBeenCalled();
  });

  it("drops honeypot submissions silently", async () => {
    const { deps, submit } = setup();
    const response = await handleWithdrawal(request({ ...valid, website: "spam" }), deps);
    expect(response.status).toBe(200);
    expect(submit).not.toHaveBeenCalled();
  });

  it("is a 404 when the site does not sell to consumers", async () => {
    const { deps, submit } = setup({ enabled: false });
    const response = await handleWithdrawal(request(valid), deps);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "withdrawal_disabled" });
    expect(submit).not.toHaveBeenCalled();
  });

  it("rate limits per IP", async () => {
    const { deps } = setup({
      limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }),
    });
    const headers = { "x-forwarded-for": "203.0.113.9" };
    expect((await handleWithdrawal(request(valid, headers), deps)).status).toBe(200);
    const blocked = await handleWithdrawal(request(valid, headers), deps);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("answers 503 and logs an error without an adapter (production)", async () => {
    const { deps, logError } = setup({
      select: () => ({
        ok: false,
        reason: "not_configured",
        message: "No withdrawal adapter configured.",
      }),
    });
    const response = await handleWithdrawal(request(valid), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "not_configured" });
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("No withdrawal adapter configured"),
    );
  });

  it("answers 502 and logs when the adapter fails", async () => {
    const { deps, logError } = setup({
      select: () => ({
        ok: true,
        adapter: {
          name: "webhook",
          submit: async () => {
            throw new Error("down");
          },
        },
      }),
    });
    expect((await handleWithdrawal(request(valid), deps)).status).toBe(502);
    expect(logError).toHaveBeenCalled();
  });

  it("rejects non-JSON, malformed, oversized and cross-origin requests", async () => {
    const { deps, submit } = setup();
    expect(
      (await handleWithdrawal(request(valid, { "content-type": "text/plain" }), deps))
        .status,
    ).toBe(415);
    expect((await handleWithdrawal(request(null, {}, "{oops"), deps)).status).toBe(400);
    expect(
      (
        await handleWithdrawal(
          request(null, {}, JSON.stringify({ message: "a".repeat(20_000) })),
          deps,
        )
      ).status,
    ).toBe(413);
    expect(
      (await handleWithdrawal(request(valid, { origin: "https://evil.example" }), deps))
        .status,
    ).toBe(403);
    expect(submit).not.toHaveBeenCalled();
  });
});
