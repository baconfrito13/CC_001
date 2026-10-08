import { describe, expect, it, vi } from "vitest";
import {
  createConsoleAdapter,
  createResendAdapter,
  createWebhookAdapter,
  selectWaitlistAdapter,
  type WaitlistAdapter,
} from "@/lib/waitlist/adapters";
import { handleWaitlist, type WaitlistDeps } from "@/lib/waitlist/handler";
import { createRateLimiter } from "@/lib/waitlist/rate-limit";
import { parseWaitlistRequest } from "@/lib/waitlist/schema";

const valid = { email: "Ana@Example.com ", consent: true, locale: "pt", website: "" };

describe("parseWaitlistRequest", () => {
  it("accepts a valid submission, trimming and lower-casing the e-mail", () => {
    const result = parseWaitlistRequest(valid);
    expect(result).toEqual({
      ok: true,
      data: { email: "ana@example.com", consent: true, locale: "pt" },
    });
  });

  it("accepts a submission without the honeypot field", () => {
    expect(
      parseWaitlistRequest({ email: "a@b.co", consent: true, locale: "en" }).ok,
    ).toBe(true);
  });

  it("requires explicit consent", () => {
    for (const consent of [false, undefined, "true", 1, null]) {
      const result = parseWaitlistRequest({ ...valid, consent });
      expect(result).toMatchObject({
        ok: false,
        reason: "invalid",
        fieldErrors: { consent: "required" },
      });
    }
  });

  it("distinguishes a missing e-mail from an invalid one", () => {
    expect(parseWaitlistRequest({ ...valid, email: "" })).toMatchObject({
      fieldErrors: { email: "required" },
    });
    expect(parseWaitlistRequest({ ...valid, email: undefined })).toMatchObject({
      fieldErrors: { email: "required" },
    });
    expect(parseWaitlistRequest({ ...valid, email: "not-an-email" })).toMatchObject({
      fieldErrors: { email: "invalid" },
    });
    expect(
      parseWaitlistRequest({ ...valid, email: `${"a".repeat(260)}@example.com` }),
    ).toMatchObject({
      fieldErrors: { email: "invalid" },
    });
  });

  it("rejects an unknown locale", () => {
    expect(parseWaitlistRequest({ ...valid, locale: "fr" })).toMatchObject({
      fieldErrors: { locale: "invalid" },
    });
  });

  it("reports every invalid field at once", () => {
    expect(
      parseWaitlistRequest({ email: "x", consent: false, locale: "en" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { email: "invalid", consent: "required" },
    });
  });

  it("flags a filled honeypot, even when everything else is valid", () => {
    expect(parseWaitlistRequest({ ...valid, website: "http://spam.example" })).toEqual({
      ok: false,
      reason: "honeypot",
    });
  });

  it("handles bodies that are not objects", () => {
    for (const body of [null, "x", 42, []]) {
      expect(parseWaitlistRequest(body)).toMatchObject({ ok: false, reason: "invalid" });
    }
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit per key within the window, then blocks with Retry-After", () => {
    let now = 1_000_000;
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });
    expect(limiter.check("a")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("a")).toMatchObject({ allowed: true, remaining: 0 });
    now += 10_000;
    expect(limiter.check("a")).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 50,
    });
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("forgets hits once the window has passed", () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => now });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    now = 1_001;
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("keeps memory bounded when flooded with distinct keys", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 3 });
    for (let i = 0; i < 20; i += 1) expect(limiter.check(`ip-${i}`).allowed).toBe(true);
  });
});

describe("adapters", () => {
  const entry = {
    email: "ana@example.com",
    locale: "pt",
    consentAt: "2026-10-08T10:00:00.000Z",
    source: "acme.example",
  };

  it("console adapter prints the entry as JSON", async () => {
    const log = vi.fn();
    await createConsoleAdapter(log).subscribe(entry);
    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0]?.[0]).toContain(JSON.stringify(entry));
  });

  it("webhook adapter POSTs email, locale, consentAt and source as JSON", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    await createWebhookAdapter(
      "https://hooks.example/waitlist",
      fetchMock as unknown as typeof fetch,
    ).subscribe(entry);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.example/waitlist");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual(entry);
  });

  it("webhook adapter fails when the endpoint answers with an error", async () => {
    const fetchMock = vi.fn(async () => new Response("no", { status: 500 }));
    await expect(
      createWebhookAdapter(
        "https://hooks.example/w",
        fetchMock as unknown as typeof fetch,
      ).subscribe(entry),
    ).rejects.toThrow(/HTTP 500/);
  });

  it("resend adapter creates a contact in the segment", async () => {
    const create = vi.fn(async () => ({ error: null }));
    const adapter = createResendAdapter({
      apiKey: "re_test",
      segmentId: "seg_1",
      createClient: () => ({ contacts: { create } }),
    });
    await adapter.subscribe(entry);
    expect(create).toHaveBeenCalledWith({
      email: "ana@example.com",
      unsubscribed: false,
      segments: [{ id: "seg_1" }],
    });
  });

  it("resend adapter omits segments when none is configured and surfaces API errors", async () => {
    const create = vi.fn(async () => ({ error: { message: "domain not verified" } }));
    const adapter = createResendAdapter({
      apiKey: "re_test",
      createClient: () => ({ contacts: { create } }),
    });
    await expect(adapter.subscribe(entry)).rejects.toThrow(/domain not verified/);
    expect(create).toHaveBeenCalledWith({
      email: "ana@example.com",
      unsubscribed: false,
    });
  });
});

describe("selectWaitlistAdapter", () => {
  const base = {
    NODE_ENV: "development" as const,
    WAITLIST_ADAPTER: undefined,
    RESEND_API_KEY: undefined,
    RESEND_SEGMENT_ID: undefined,
    WAITLIST_WEBHOOK_URL: undefined,
  };

  it("uses the console adapter in development and test", () => {
    for (const NODE_ENV of ["development", "test"] as const) {
      const selection = selectWaitlistAdapter({ ...base, NODE_ENV });
      expect(selection.ok && selection.adapter.name).toBe("console");
    }
  });

  it("reports 'not configured' in production without an adapter", () => {
    const selection = selectWaitlistAdapter({ ...base, NODE_ENV: "production" });
    expect(selection).toMatchObject({ ok: false, reason: "not_configured" });
  });

  it("prefers Resend, then the webhook", () => {
    const resend = selectWaitlistAdapter({
      ...base,
      NODE_ENV: "production",
      RESEND_API_KEY: "re_x",
      WAITLIST_WEBHOOK_URL: "https://hooks.example/w",
    });
    expect(resend.ok && resend.adapter.name).toBe("resend");
    const webhook = selectWaitlistAdapter({
      ...base,
      NODE_ENV: "production",
      WAITLIST_WEBHOOK_URL: "https://hooks.example/w",
    });
    expect(webhook.ok && webhook.adapter.name).toBe("webhook");
  });

  it("honours an explicit adapter, even in production, and flags missing variables", () => {
    const consoleInProd = selectWaitlistAdapter({
      ...base,
      NODE_ENV: "production",
      WAITLIST_ADAPTER: "console",
    });
    expect(consoleInProd.ok && consoleInProd.adapter.name).toBe("console");
    expect(selectWaitlistAdapter({ ...base, WAITLIST_ADAPTER: "resend" })).toMatchObject({
      ok: false,
      reason: "misconfigured",
    });
    expect(selectWaitlistAdapter({ ...base, WAITLIST_ADAPTER: "webhook" })).toMatchObject(
      {
        ok: false,
        reason: "misconfigured",
      },
    );
  });
});

describe("POST /api/waitlist handler", () => {
  function request(body: unknown, headers: Record<string, string> = {}, raw?: string) {
    return new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
      body: raw ?? JSON.stringify(body),
    });
  }

  function deps(overrides: Partial<WaitlistDeps> = {}) {
    const subscribe = vi.fn(async () => {});
    const adapter: WaitlistAdapter = { name: "console", subscribe };
    const logError = vi.fn();
    const all: Partial<WaitlistDeps> = {
      select: () => ({ ok: true, adapter }),
      limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
      now: () => new Date("2026-10-08T10:00:00.000Z"),
      logError,
      ...overrides,
    };
    return { all, subscribe, logError };
  }

  it("stores a valid signup with the consent timestamp and source", async () => {
    const { all, subscribe } = deps();
    const response = await handleWaitlist(request(valid), all);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(subscribe).toHaveBeenCalledWith({
      email: "ana@example.com",
      locale: "pt",
      consentAt: "2026-10-08T10:00:00.000Z",
      source: "acme.example",
    });
  });

  it("answers 400 with field errors and stores nothing when validation fails", async () => {
    const { all, subscribe } = deps();
    const response = await handleWaitlist(
      request({ email: "bad", consent: false, locale: "en" }),
      all,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "validation",
      fieldErrors: { email: "invalid", consent: "required" },
    });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions with a success response", async () => {
    const { all, subscribe } = deps();
    const response = await handleWaitlist(request({ ...valid, website: "spam" }), all);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("rate limits per IP with Retry-After", async () => {
    const { all, subscribe } = deps({
      limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
    });
    const headers = { "x-forwarded-for": "203.0.113.7, 10.0.0.1" };
    expect((await handleWaitlist(request(valid, headers), all)).status).toBe(200);
    expect((await handleWaitlist(request(valid, headers), all)).status).toBe(200);
    const blocked = await handleWaitlist(request(valid, headers), all);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(subscribe).toHaveBeenCalledTimes(2);
    const other = await handleWaitlist(
      request(valid, { "x-forwarded-for": "203.0.113.8" }),
      all,
    );
    expect(other.status).toBe(200);
  });

  it("answers 503 and logs an error when no adapter is configured", async () => {
    const { all, logError } = deps({
      select: () => ({
        ok: false,
        reason: "not_configured",
        message: "No waitlist adapter configured.",
      }),
    });
    const response = await handleWaitlist(request(valid), all);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "not_configured" });
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("No waitlist adapter configured"),
    );
  });

  it("answers 502 and logs when the adapter fails", async () => {
    const { all, logError } = deps({
      select: () => ({
        ok: true,
        adapter: {
          name: "webhook",
          subscribe: async () => {
            throw new Error("boom");
          },
        },
      }),
    });
    const response = await handleWaitlist(request(valid), all);
    expect(response.status).toBe(502);
    expect(logError).toHaveBeenCalled();
  });

  it("rejects non-JSON, malformed and oversized bodies", async () => {
    const { all } = deps();
    expect(
      (await handleWaitlist(request(valid, { "content-type": "text/plain" }), all))
        .status,
    ).toBe(415);
    expect((await handleWaitlist(request(null, {}, "{not json"), all)).status).toBe(400);
    const huge = await handleWaitlist(
      request(null, {}, JSON.stringify({ email: "a".repeat(20_000) })),
      all,
    );
    expect(huge.status).toBe(413);
  });

  it("rejects cross-origin browser requests", async () => {
    const { all, subscribe } = deps();
    const response = await handleWaitlist(
      request(valid, { origin: "https://evil.example" }),
      all,
    );
    expect(response.status).toBe(403);
    expect(subscribe).not.toHaveBeenCalled();
    const sameOrigin = await handleWaitlist(
      request(valid, { origin: "http://localhost:3000" }),
      all,
    );
    expect(sameOrigin.status).toBe(200);
  });

  it("never caches responses", async () => {
    const { all } = deps();
    const response = await handleWaitlist(request(valid), all);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
