import { describe, expect, it } from "vitest";
import { AUTH_LIMITS } from "@/lib/auth/service";
import { OtpRequestSchema, SESSION_COOKIE, VerifyCodeSchema } from "@/lib/auth/types";
import { type AuthWorld, authWorld, lastLogin, wrongCode } from "../support/auth-world";

const IP = "203.0.113.7";
const MINUTE = 60_000;

const ask = (w: AuthWorld, email: string, ip = IP, locale: "pt" | "en" = "pt") =>
  w.service.requestCode({ email, locale, ip, origin: "https://rastoplan.test" });

const enter = (w: AuthWorld, email: string, code: string, ip = IP) =>
  w.service.verifyCode({ email, code, locale: "pt", ip, request: w.request });

describe("US-01: sign in with the email", () => {
  it("US-01.1: a new email gets ONE email with a 6-digit code valid 10 min and a link; the account and its trial are created when the code is used", async () => {
    const w = authWorld();
    expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });

    expect(w.email.outbox).toHaveLength(1);
    const { code, link, message } = lastLogin(w, "ana@empresa-exemplo.pt");
    expect(code).toMatch(/^\d{6}$/);
    expect(link).toContain("https://rastoplan.test/pt/auth/confirm?token_hash=");
    expect(link).toContain("type=email");
    expect(message.subject).toContain(code);
    expect(message.html).toContain(code);
    expect(w.events.named("signup_started")).toHaveLength(1);
    // nothing exists yet: the account is created by the first successful sign-in
    expect(await w.store.workspace.userExists("ana@empresa-exemplo.pt")).toBe(false);

    const result = await enter(w, "ana@empresa-exemplo.pt", code);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.redirectTo).toBe("/pt/app");
    expect(result.cookies).toHaveLength(1);
    expect(result.cookies[0]?.name).toBe(SESSION_COOKIE);
    expect(result.cookies[0]?.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(w.events.named("signup_completed")).toHaveLength(1);
    expect(w.events.named("signup_completed")[0]?.props).toEqual({
      method: "code",
      locale: "pt",
    });
    expect(
      (await w.store.ledger.balance({ userId: result.user.id, now: w.now })).available,
    ).toBe(5);
  });

  it("US-01.1: the link finishes the same sign-in with the POST of the confirmation page, and the event says 'link'", async () => {
    const w = authWorld();
    await ask(w, "bruno@empresa-exemplo.pt");
    const { token } = lastLogin(w, "bruno@empresa-exemplo.pt");
    const result = await w.service.confirmToken({
      token_hash: token,
      type: "email",
      locale: "pt",
      ip: IP,
      request: w.request,
    });
    expect(result.ok).toBe(true);
    expect(w.events.named("signup_completed")[0]?.props).toEqual({
      method: "link",
      locale: "pt",
    });
  });

  it("US-01.1: signup_completed fires once: a second sign-in of the same account is not a signup", async () => {
    const w = authWorld();
    for (let round = 0; round < 2; round += 1) {
      await ask(w, "ana@empresa-exemplo.pt");
      const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
      expect((await enter(w, "ana@empresa-exemplo.pt", code)).ok).toBe(true);
      w.advance(2 * MINUTE);
    }
    expect(w.events.named("signup_completed")).toHaveLength(1);
    expect(w.events.named("signup_started")).toHaveLength(1);
  });

  it("US-01.2: the code alone signs in, without opening the link, and the session is readable afterwards", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    const result = await enter(w, "ana@empresa-exemplo.pt", code);
    if (!result.ok) throw new Error("expected a session");
    const cookie = result.cookies[0];
    const current = await w.provider.currentUser({
      request: {
        cookies: [{ name: cookie?.name ?? "", value: cookie?.value ?? "" }],
        secure: false,
      },
      now: w.now,
    });
    expect(current.user).toEqual({
      id: result.user.id,
      email: "ana@empresa-exemplo.pt",
      locale: "pt",
    });
  });

  it("US-01.2: the email is case-insensitive and the code belongs to that email only", async () => {
    const w = authWorld();
    await ask(w, "Ana@Empresa-Exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    expect((await enter(w, "carla@empresa-exemplo.pt", code)).ok).toBe(false);
    expect((await enter(w, "ana@empresa-exemplo.pt", code)).ok).toBe(true);
  });

  it("US-01.3: only the confirmation consumes the token: asking for the same link many times does not use it, the first POST signs in, the second is refused", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { token, link } = lastLogin(w, "ana@empresa-exemplo.pt");
    // a scanner "opens" the link: that is a GET of a page, which never reaches the service.
    // What can reach it is a POST: the first one is the person's click.
    expect(link).toContain(token);
    const confirm = () =>
      w.service.confirmToken({
        token_hash: token,
        type: "email",
        locale: "pt",
        ip: IP,
        request: w.request,
      });
    expect((await confirm()).ok).toBe(true);
    expect(await confirm()).toEqual({ ok: false, error: "invalid_code" });
  });

  it("US-01.4: an incomplete email is rejected by the request schema and nothing is sent", () => {
    for (const email of [
      "ana@empresa",
      "ana",
      "@empresa.pt",
      "ana@.pt",
      "",
      "ana empresa@x.pt",
      "a".repeat(260),
    ]) {
      expect(OtpRequestSchema.safeParse({ email, locale: "pt" }).success, email).toBe(
        false,
      );
    }
    expect(
      OtpRequestSchema.safeParse({ email: " Ana@Empresa-Exemplo.PT ", locale: "pt" }),
    ).toMatchObject({
      success: true,
      data: { email: "ana@empresa-exemplo.pt" },
    });
    // unknown properties are refused, not ignored
    expect(
      OtpRequestSchema.safeParse({ email: "a@b.pt", locale: "pt", admin: true }).success,
    ).toBe(false);
  });

  it("US-01.5: a code that was already used is refused and gives no session", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    expect((await enter(w, "ana@empresa-exemplo.pt", code)).ok).toBe(true);
    expect(await enter(w, "ana@empresa-exemplo.pt", code)).toEqual({
      ok: false,
      error: "invalid_code",
    });
  });

  it("US-01.5: a code is valid for 10 minutes and not a second longer; the link too", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code, token } = lastLogin(w, "ana@empresa-exemplo.pt");
    w.advance(10 * MINUTE - 1000);
    // still valid just before: prove it with a wrong guess first (it must not consume the code)
    expect((await enter(w, "ana@empresa-exemplo.pt", wrongCode(code))).ok).toBe(false);
    w.advance(1000);
    expect(await enter(w, "ana@empresa-exemplo.pt", code)).toEqual({
      ok: false,
      error: "invalid_code",
    });
    expect(
      await w.service.confirmToken({
        token_hash: token,
        type: "email",
        locale: "pt",
        ip: IP,
        request: w.request,
      }),
    ).toEqual({ ok: false, error: "invalid_code" });
  });

  it("US-01.5: the code and the link of an earlier request stop working when a new code is issued", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const first = lastLogin(w, "ana@empresa-exemplo.pt");
    w.advance(2 * MINUTE);
    await ask(w, "ana@empresa-exemplo.pt");
    const second = lastLogin(w, "ana@empresa-exemplo.pt");
    expect(second.code).not.toBe(first.code);
    expect((await enter(w, "ana@empresa-exemplo.pt", first.code)).ok).toBe(
      second.code === first.code,
    );
    expect(
      (
        await w.service.confirmToken({
          token_hash: first.token,
          type: "email",
          locale: "pt",
          ip: IP,
          request: w.request,
        })
      ).ok,
    ).toBe(false);
    expect((await enter(w, "ana@empresa-exemplo.pt", second.code)).ok).toBe(true);
  });

  it("US-01.6 / SR-06: five wrong codes lock the email for 15 minutes and the code that was valid is dead", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code, token } = lastLogin(w, "ana@empresa-exemplo.pt");
    const wrong = wrongCode(code);

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      expect(await enter(w, "ana@empresa-exemplo.pt", wrong)).toEqual({
        ok: false,
        error: "invalid_code",
      });
    }
    expect(await enter(w, "ana@empresa-exemplo.pt", wrong)).toEqual({
      ok: false,
      error: "locked",
    });
    // the 6th try, even with the RIGHT code, is refused: the code was rotated
    expect(await enter(w, "ana@empresa-exemplo.pt", code)).toEqual({
      ok: false,
      error: "locked",
    });
    expect(
      (
        await w.service.confirmToken({
          token_hash: token,
          type: "email",
          locale: "pt",
          ip: IP,
          request: w.request,
        })
      ).ok,
    ).toBe(false);

    // after the lock the old code is still dead
    w.advance(15 * MINUTE + 1000);
    expect(await enter(w, "ana@empresa-exemplo.pt", code)).toEqual({
      ok: false,
      error: "invalid_code",
    });
  });

  it("US-01.6: while the email is locked no new code is sent, and the answer does not change", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    for (let i = 0; i < 5; i += 1)
      await enter(w, "ana@empresa-exemplo.pt", wrongCode(code));
    expect(w.email.outbox).toHaveLength(1);
    w.advance(2 * MINUTE);
    expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });
    expect(w.email.outbox).toHaveLength(1);

    w.advance(14 * MINUTE);
    await ask(w, "ana@empresa-exemplo.pt");
    expect(w.email.outbox).toHaveLength(2);
    const fresh = lastLogin(w, "ana@empresa-exemplo.pt");
    expect((await enter(w, "ana@empresa-exemplo.pt", fresh.code)).ok).toBe(true);
  });

  it("US-01.6: a successful sign-in clears the failures, so earlier typos do not add up", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    for (let i = 0; i < 4; i += 1)
      await enter(w, "ana@empresa-exemplo.pt", wrongCode(code));
    expect((await enter(w, "ana@empresa-exemplo.pt", code)).ok).toBe(true);
    w.advance(2 * MINUTE);
    await ask(w, "ana@empresa-exemplo.pt");
    const next = lastLogin(w, "ana@empresa-exemplo.pt");
    for (let i = 0; i < 4; i += 1)
      await enter(w, "ana@empresa-exemplo.pt", wrongCode(next.code));
    expect((await enter(w, "ana@empresa-exemplo.pt", next.code)).ok).toBe(true);
  });

  it("US-01: the verify request takes exactly 6 digits", () => {
    for (const code of ["12345", "1234567", "12a456", "", " 123456", "123 456"]) {
      expect(
        VerifyCodeSchema.safeParse({ email: "a@b.pt", code, locale: "pt" }).success,
        code,
      ).toBe(false);
    }
    expect(
      VerifyCodeSchema.safeParse({ email: "a@b.pt", code: "012345", locale: "pt" })
        .success,
    ).toBe(true);
  });

  it("T-05: the answer is the same for an email with an account and one without", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    const { code } = lastLogin(w, "ana@empresa-exemplo.pt");
    await enter(w, "ana@empresa-exemplo.pt", code);
    w.advance(2 * MINUTE);
    const known = await ask(w, "ana@empresa-exemplo.pt");
    const unknown = await ask(w, "nova@empresa-exemplo.pt");
    expect(known).toEqual(unknown);
    expect(w.email.outbox.map((m) => m.to)).toEqual([
      "ana@empresa-exemplo.pt",
      "ana@empresa-exemplo.pt",
      "nova@empresa-exemplo.pt",
    ]);
  });

  it("a request inside the 60 s cooldown sends nothing new and answers the same", async () => {
    const w = authWorld();
    await ask(w, "ana@empresa-exemplo.pt");
    expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });
    expect(w.email.outbox).toHaveLength(1);
    w.advance(AUTH_LIMITS.resendCooldownSeconds * 1000 + 1000);
    await ask(w, "ana@empresa-exemplo.pt");
    expect(w.email.outbox).toHaveLength(2);
  });
});

describe("limits (T-05, T-07)", () => {
  it("allows 5 code requests per email per hour, then answers rate_limited with a Retry-After", async () => {
    const w = authWorld();
    for (let i = 0; i < AUTH_LIMITS.otpPerEmailPerHour; i += 1) {
      expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });
      w.advance(70_000);
    }
    const limited = await ask(w, "ana@empresa-exemplo.pt");
    expect(limited).toMatchObject({ ok: false, error: "rate_limited" });
    if (!limited.ok) expect(limited.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("asking again for a code that did not arrive does not count as another new account", async () => {
    const w = authWorld();
    for (let i = 0; i < 4; i += 1) {
      expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });
      w.advance(2 * MINUTE);
    }
    expect(await ask(w, "b@empresa-exemplo.pt")).toEqual({ ok: true });
    expect(await ask(w, "c@empresa-exemplo.pt")).toEqual({ ok: true });
  });

  it("allows 3 new accounts per address per day; existing accounts are not counted", async () => {
    const w = authWorld();
    // an existing account first (created from another address)
    await ask(w, "ana@empresa-exemplo.pt", "198.51.100.1");
    await enter(
      w,
      "ana@empresa-exemplo.pt",
      lastLogin(w, "ana@empresa-exemplo.pt").code,
      "198.51.100.1",
    );
    w.advance(2 * MINUTE);

    for (const name of ["a", "b", "c"]) {
      expect(await ask(w, `${name}@empresa-exemplo.pt`)).toEqual({ ok: true });
    }
    expect(await ask(w, "d@empresa-exemplo.pt")).toMatchObject({
      ok: false,
      error: "rate_limited",
    });
    // asking again for the refused email does not slip past the limit
    w.advance(2 * MINUTE);
    expect(await ask(w, "d@empresa-exemplo.pt")).toMatchObject({
      ok: false,
      error: "rate_limited",
    });
    // ana (existing) and other addresses are unaffected
    expect(await ask(w, "ana@empresa-exemplo.pt")).toEqual({ ok: true });
    expect(await ask(w, "e@empresa-exemplo.pt", "198.51.100.9")).toEqual({ ok: true });
    // a day later the address may start new accounts again
    w.advance(24 * 3600 * 1000);
    expect(await ask(w, "d@empresa-exemplo.pt")).toEqual({ ok: true });
  });

  it("limits the verify attempts per address, whatever the email", async () => {
    const w = authWorld();
    for (let i = 0; i < AUTH_LIMITS.verifyPerIpPerWindow; i += 1) {
      await enter(w, `x${i}@empresa-exemplo.pt`, "000000");
    }
    expect(await enter(w, "y@empresa-exemplo.pt", "000000")).toMatchObject({
      ok: false,
      error: "rate_limited",
    });
  });
});

describe("the mock session (T-10, T-14)", () => {
  it("is refused when tampered with, expired, or signed with another secret", async () => {
    const { readSession, signSession } = await import("@/lib/auth/mock");
    const id = "a1000000-0000-4000-8000-000000000001";
    const now = new Date("2026-03-01T10:00:00Z");
    const exp = Math.floor(now.getTime() / 1000) + 3600;
    const good = signSession(id, exp, "secret-0123456789abc");
    expect(readSession(good, "secret-0123456789abc", now)).toBe(id);
    expect(readSession(good, "another-secret-0123456", now)).toBeNull();
    expect(
      readSession(
        good.replace(id, "a1000000-0000-4000-8000-000000000002"),
        "secret-0123456789abc",
        now,
      ),
    ).toBeNull();
    expect(
      readSession(good, "secret-0123456789abc", new Date(now.getTime() + 3601 * 1000)),
    ).toBeNull();
    for (const bad of [
      undefined,
      "",
      "a.b",
      "a.b.c.d",
      `${id}.abc.sig`,
      `${id}.${exp}.`,
    ]) {
      expect(readSession(bad, "secret-0123456789abc", now), String(bad)).toBeNull();
    }
  });

  it("signOut clears the cookie", async () => {
    const w = authWorld();
    const [cookie] = await w.provider.signOut({ request: w.request });
    expect(cookie).toMatchObject({ name: SESSION_COOKIE, value: "" });
    expect(cookie?.options.maxAge).toBe(0);
  });
});
