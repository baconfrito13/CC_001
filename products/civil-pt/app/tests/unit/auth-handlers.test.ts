import { describe, expect, it } from "vitest";
import {
  type AuthHandlerDeps,
  handleConfirm,
  handleOtp,
  handleSignOut,
  handleVerify,
} from "@/lib/auth/handlers";
import { createLogger } from "@/lib/core/logger";
import { type AuthWorld, authWorld, lastLogin, wrongCode } from "../support/auth-world";

const ORIGIN = "https://rastoplan.test";
const HOST = "rastoplan.test";

function deps(w: AuthWorld): Partial<AuthHandlerDeps> {
  return {
    service: async () => w.service,
    provider: async () => w.provider,
    log: createLogger(() => {}),
    origin: () => ORIGIN,
  };
}

const json = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      host: HOST,
      "x-forwarded-for": "203.0.113.9",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const form = (fields: Record<string, string>, headers: Record<string, string> = {}) => {
  const body = new URLSearchParams(fields);
  return new Request(`${ORIGIN}/api/auth/confirm`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: ORIGIN,
      host: HOST,
      "x-forwarded-for": "203.0.113.9",
      ...headers,
    },
    body,
  });
};

async function problemOf(response: Response) {
  expect(response.headers.get("content-type")).toBe("application/problem+json");
  return (await response.json()) as { status: number; code: string };
}

describe("POST /api/auth/otp", () => {
  it("US-01.1: answers 202 and sends the email", async () => {
    const w = authWorld();
    const response = await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "sent" });
    expect(w.email.outbox).toHaveLength(1);
    expect(
      lastLogin(w, "ana@empresa-exemplo.pt").link.startsWith(
        `${ORIGIN}/pt/auth/confirm?`,
      ),
    ).toBe(true);
  });

  it("US-01.4: 400 invalid_email for an incomplete address, and nothing is sent", async () => {
    const w = authWorld();
    for (const email of ["ana@empresa", "", "ana"]) {
      const response = await handleOtp(
        json("/api/auth/otp", { email, locale: "pt" }),
        deps(w),
      );
      expect(response.status).toBe(400);
      expect((await problemOf(response)).code).toBe("invalid_email");
    }
    expect(w.email.outbox).toHaveLength(0);
  });

  it("the link in the email uses the configured origin, not the Host header (token theft)", async () => {
    const w = authWorld();
    const request = json(
      "/api/auth/otp",
      { email: "ana@empresa-exemplo.pt", locale: "en" },
      {
        origin: "https://evil.example",
        host: "evil.example",
        "x-forwarded-host": "evil.example",
      },
    );
    await handleOtp(request, deps(w));
    const { link } = lastLogin(w, "ana@empresa-exemplo.pt");
    expect(link.startsWith(`${ORIGIN}/en/auth/confirm?`)).toBe(true);
    expect(link).not.toContain("evil.example");
  });

  it("answers 415, 413, 400 and 403 for a bad content type, a big body, bad JSON and another origin", async () => {
    const w = authWorld();
    const badType = new Request(`${ORIGIN}/api/auth/otp`, {
      method: "POST",
      headers: { "content-type": "text/plain", origin: ORIGIN, host: HOST },
      body: "x",
    });
    expect((await handleOtp(badType, deps(w))).status).toBe(415);
    const big = json("/api/auth/otp", {
      email: "a@b.pt",
      locale: "pt",
      next: "x".repeat(5000),
    });
    expect((await handleOtp(big, deps(w))).status).toBe(413);
    expect((await handleOtp(json("/api/auth/otp", "{not json"), deps(w))).status).toBe(
      400,
    );
    const foreign = json(
      "/api/auth/otp",
      { email: "a@b.pt", locale: "pt" },
      { origin: "https://evil.example" },
    );
    const refused = await handleOtp(foreign, deps(w));
    expect(refused.status).toBe(403);
    expect((await problemOf(refused)).code).toBe("forbidden");
    expect(w.email.outbox).toHaveLength(0);
  });

  it("429 with Retry-After when the limits are hit", async () => {
    const w = authWorld();
    let last: Response | undefined;
    for (let i = 0; i < 7; i += 1) {
      last = await handleOtp(
        json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
        deps(w),
      );
      w.advance(70_000);
    }
    expect(last?.status).toBe(429);
    expect(Number(last?.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await problemOf(last as Response)).code).toBe("rate_limited");
  });

  it("503 problem+json when the provider fails, without detail", async () => {
    const w = authWorld();
    const broken = {
      ...w.provider,
      sendCode: async () => {
        throw new Error("smtp down for ana@empresa-exemplo.pt");
      },
    };
    const response = await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      {
        ...deps(w),
        service: async () =>
          (await import("@/lib/auth/service")).createAuthService({
            provider: broken as never,
            store: w.store,
            events: { track() {} },
            log: createLogger(() => {}),
            now: () => w.now,
            salt: "salt-0123456789abcdef",
          }),
      },
    );
    expect(response.status).toBe(503);
    const text = JSON.stringify(await response.json());
    expect(text).not.toContain("smtp");
    expect(text).not.toContain("ana@");
  });
});

describe("POST /api/auth/verify", () => {
  const signIn = async (w: AuthWorld) => {
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    return lastLogin(w, "ana@empresa-exemplo.pt");
  };

  it("US-01.2: the right code gives a session cookie and the page to go to", async () => {
    const w = authWorld();
    const { code } = await signIn(w);
    const response = await handleVerify(
      json("/api/auth/verify", { email: "ana@empresa-exemplo.pt", code, locale: "pt" }),
      deps(w),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ redirectTo: "/pt/app" });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("rp_session=");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie).toContain("Secure"); // the request is https
  });

  it("the cookie is Secure only on https, so http://localhost works in development and in the e2e", async () => {
    const w = authWorld();
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    const local = new Request("http://localhost:3100/api/auth/verify", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3100",
        host: "localhost:3100",
      },
      body: JSON.stringify({ email: "ana@empresa-exemplo.pt", code, locale: "pt" }),
    });
    const response = await handleVerify(local, deps(w));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
  });

  it("T-14: next is honoured when it is inside the app and ignored when it is not", async () => {
    const w = authWorld();
    const { code } = await signIn(w);
    const hostile = await handleVerify(
      json("/api/auth/verify", {
        email: "ana@empresa-exemplo.pt",
        code,
        locale: "pt",
        next: "https://evil.example/pt/app",
      }),
      deps(w),
    );
    expect(await hostile.json()).toEqual({ redirectTo: "/pt/app" });
    w.advance(2 * 60_000);
    const { code: again } = await signIn(w);
    const fine = await handleVerify(
      json("/api/auth/verify", {
        email: "ana@empresa-exemplo.pt",
        code: again,
        locale: "pt",
        next: "/pt/app/projetos",
      }),
      deps(w),
    );
    expect(await fine.json()).toEqual({ redirectTo: "/pt/app/projetos" });
  });

  it("US-01.5: 400 invalid_code for a wrong or used code, and no cookie", async () => {
    const w = authWorld();
    const { code } = await signIn(w);
    const wrong = await handleVerify(
      json("/api/auth/verify", {
        email: "ana@empresa-exemplo.pt",
        code: wrongCode(code),
        locale: "pt",
      }),
      deps(w),
    );
    expect(wrong.status).toBe(400);
    expect((await problemOf(wrong)).code).toBe("invalid_code");
    expect(wrong.headers.get("set-cookie")).toBeNull();
    const malformed = await handleVerify(
      json("/api/auth/verify", {
        email: "ana@empresa-exemplo.pt",
        code: "12",
        locale: "pt",
      }),
      deps(w),
    );
    expect(malformed.status).toBe(400);
    expect((await problemOf(malformed)).code).toBe("invalid_code");
  });

  it("US-01.6: the fifth wrong code answers 429 too_many_attempts with Retry-After 900, and the right code is refused too", async () => {
    const w = authWorld();
    const { code } = await signIn(w);
    const attempt = (c: string) =>
      handleVerify(
        json("/api/auth/verify", {
          email: "ana@empresa-exemplo.pt",
          code: c,
          locale: "pt",
        }),
        deps(w),
      );
    for (let i = 0; i < 4; i += 1)
      expect((await attempt(wrongCode(code))).status).toBe(400);
    const locked = await attempt(wrongCode(code));
    expect(locked.status).toBe(429);
    expect(locked.headers.get("retry-after")).toBe("900");
    expect((await problemOf(locked)).code).toBe("too_many_attempts");
    const right = await attempt(code);
    expect(right.status).toBe(429);
    expect(right.headers.get("set-cookie")).toBeNull();
  });

  it("403 for another origin", async () => {
    const w = authWorld();
    const response = await handleVerify(
      json(
        "/api/auth/verify",
        { email: "a@b.pt", code: "123456", locale: "pt" },
        { origin: "https://evil.example" },
      ),
      deps(w),
    );
    expect(response.status).toBe(403);
  });
});

describe("POST /api/auth/confirm (the button of the confirmation page)", () => {
  it("US-01.1/3: the POST signs in and redirects (303) to a relative path, with the cookie", async () => {
    const w = authWorld();
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    const { token } = lastLogin(w, "ana@empresa-exemplo.pt");
    const response = await handleConfirm(
      form({ token_hash: token, type: "email", locale: "pt", next: "/pt/app/projetos" }),
      deps(w),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/pt/app/projetos");
    expect(response.headers.get("set-cookie")).toContain("rp_session=");
  });

  it("T-14: a hostile next goes to the default page", async () => {
    const w = authWorld();
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "en" }),
      deps(w),
    );
    const { token } = lastLogin(w, "ana@empresa-exemplo.pt");
    const response = await handleConfirm(
      form({ token_hash: token, type: "email", locale: "en", next: "//evil.example" }),
      deps(w),
    );
    expect(response.headers.get("location")).toBe("/en/app");
  });

  it("US-01.5: a used or unknown token sends the person back to the sign-in page with the reason, and no session", async () => {
    const w = authWorld();
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    const { token } = lastLogin(w, "ana@empresa-exemplo.pt");
    expect(
      (
        await handleConfirm(
          form({ token_hash: token, type: "email", locale: "pt" }),
          deps(w),
        )
      ).status,
    ).toBe(303);
    const again = await handleConfirm(
      form({ token_hash: token, type: "email", locale: "pt" }),
      deps(w),
    );
    expect(again.status).toBe(303);
    expect(again.headers.get("location")).toBe("/pt/entrar?erro=expired");
    expect(again.headers.get("set-cookie")).toBeNull();
    const unknown = await handleConfirm(
      form({ token_hash: "f".repeat(64), type: "email", locale: "pt" }),
      deps(w),
    );
    expect(unknown.headers.get("location")).toBe("/pt/entrar?erro=expired");
  });

  it("a form without a token or with a wrong type goes back with erro=link", async () => {
    const w = authWorld();
    const cases: Record<string, string>[] = [
      { locale: "pt" },
      { token_hash: "short", type: "email", locale: "pt" },
      { token_hash: "a".repeat(40), type: "magiclink", locale: "pt" },
    ];
    for (const fields of cases) {
      const response = await handleConfirm(form(fields), deps(w));
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("/pt/entrar?erro=link");
    }
  });

  it("403 for another origin (no token is used)", async () => {
    const w = authWorld();
    await handleOtp(
      json("/api/auth/otp", { email: "ana@empresa-exemplo.pt", locale: "pt" }),
      deps(w),
    );
    const { token } = lastLogin(w, "ana@empresa-exemplo.pt");
    const response = await handleConfirm(
      form(
        { token_hash: token, type: "email", locale: "pt" },
        { origin: "https://evil.example" },
      ),
      deps(w),
    );
    expect(response.status).toBe(403);
    const ok = await handleConfirm(
      form({ token_hash: token, type: "email", locale: "pt" }),
      deps(w),
    );
    expect(ok.headers.get("location")).toBe("/pt/app");
  });
});

describe("POST /api/auth/signout", () => {
  it("204 and the session cookie is cleared; safe to repeat", async () => {
    const w = authWorld();
    for (let i = 0; i < 2; i += 1) {
      const response = await handleSignOut(json("/api/auth/signout", {}), deps(w));
      expect(response.status).toBe(204);
      expect(response.headers.get("set-cookie")).toMatch(/rp_session=;/);
    }
  });
});
