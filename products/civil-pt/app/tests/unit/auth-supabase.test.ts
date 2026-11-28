import { describe, expect, it } from "vitest";
import {
  type AuthClientLike,
  AuthProviderError,
  type CookieBridge,
  createSupabaseAuthProvider,
  isFirstSession,
  type SupabaseAuthClients,
} from "@/lib/auth/supabase";

const NOW = new Date("2026-03-01T10:00:00Z");
const REQUEST = { cookies: [{ name: "sb-session", value: "abc" }], secure: true };

type Verify = Awaited<ReturnType<AuthClientLike["auth"]["verifyOtp"]>>;

/** A Supabase client that records its calls and answers from a script. */
function fake(
  script: {
    send?: { code?: string; message: string; status?: number } | null;
    verify?: Verify;
    user?: Awaited<ReturnType<AuthClientLike["auth"]["getUser"]>>;
    linkError?: boolean;
    setCookies?: { name: string; value: string; options: Record<string, unknown> }[];
  } = {},
) {
  const calls: { fn: string; args: unknown }[] = [];
  let bridge: CookieBridge | undefined;
  const client: AuthClientLike = {
    auth: {
      async signInWithOtp(params) {
        calls.push({ fn: "signInWithOtp", args: params });
        return { error: script.send ?? null };
      },
      async verifyOtp(params) {
        calls.push({ fn: "verifyOtp", args: params });
        bridge?.setAll(script.setCookies ?? []);
        return script.verify ?? { data: { user: null }, error: { message: "no script" } };
      },
      async getUser() {
        calls.push({ fn: "getUser", args: null });
        bridge?.setAll(script.setCookies ?? []);
        return script.user ?? { data: { user: null }, error: null };
      },
      async signOut(options) {
        calls.push({ fn: "signOut", args: options });
        bridge?.setAll(script.setCookies ?? []);
        return { error: null };
      },
      admin: {
        async generateLink(params) {
          calls.push({ fn: "generateLink", args: params });
          return {
            error: script.linkError
              ? { message: "boom", code: "unexpected_failure" }
              : null,
          };
        },
      },
    },
  };
  const clients: SupabaseAuthClients = {
    anon: () => client,
    session: (b) => {
      bridge = b;
      return client;
    },
    admin: () => client,
  };
  return { clients, calls };
}

const user = {
  id: "a1000000-0000-4000-8000-000000000001",
  email: "ana@empresa-exemplo.pt",
  created_at: "2026-03-01T10:00:00Z",
  email_confirmed_at: "2026-03-01T10:00:01Z",
  last_sign_in_at: "2026-03-01T10:00:01Z",
  user_metadata: { locale: "en" },
};

describe("supabase auth provider (transport proven against a fake)", () => {
  it("US-01.1: asks Supabase to email the token, with the confirmation page as redirect and the language as user data", async () => {
    const { clients, calls } = fake();
    await createSupabaseAuthProvider(clients).sendCode({
      email: "ana@empresa-exemplo.pt",
      locale: "pt",
      next: "/pt/app/projetos",
      origin: "https://rastoplan.test",
      now: NOW,
    });
    expect(calls).toEqual([
      {
        fn: "signInWithOtp",
        args: {
          email: "ana@empresa-exemplo.pt",
          options: {
            shouldCreateUser: true,
            emailRedirectTo:
              "https://rastoplan.test/pt/auth/confirm?next=%2Fpt%2Fapp%2Fprojetos",
            data: { locale: "pt" },
          },
        },
      },
    ]);
  });

  it("does not fail the request when Supabase's own one-per-minute limit answers, but does for a real outage", async () => {
    const input = {
      email: "a@b.pt",
      locale: "pt" as const,
      next: "/pt/app",
      origin: "https://x.test",
      now: NOW,
    };
    await expect(
      createSupabaseAuthProvider(
        fake({ send: { code: "over_email_send_rate_limit", message: "x" } }).clients,
      ).sendCode(input),
    ).resolves.toBeUndefined();
    await expect(
      createSupabaseAuthProvider(
        fake({ send: { code: "unexpected_failure", message: "x", status: 500 } }).clients,
      ).sendCode(input),
    ).rejects.toBeInstanceOf(AuthProviderError);
  });

  it("US-01.2: verifies the code for the email and returns the session cookies, httpOnly and secure on https", async () => {
    const { clients, calls } = fake({
      verify: { data: { user }, error: null },
      setCookies: [
        {
          name: "sb-session",
          value: "token",
          options: { path: "/", maxAge: 100, httpOnly: false },
        },
      ],
    });
    const result = await createSupabaseAuthProvider(clients).verifyCode({
      email: "ana@empresa-exemplo.pt",
      code: "123456",
      locale: "pt",
      now: NOW,
      request: REQUEST,
    });
    expect(calls[0]).toEqual({
      fn: "verifyOtp",
      args: { email: "ana@empresa-exemplo.pt", token: "123456", type: "email" },
    });
    expect(result).toMatchObject({
      ok: true,
      isNewUser: true,
      user: { id: user.id, email: "ana@empresa-exemplo.pt", locale: "en" },
    });
    if (!result.ok) return;
    expect(result.cookies).toEqual([
      {
        name: "sb-session",
        value: "token",
        options: { path: "/", maxAge: 100, httpOnly: true, secure: true },
      },
    ]);
  });

  it("US-01.3: the link finishes with the token hash only", async () => {
    const { clients, calls } = fake({ verify: { data: { user }, error: null } });
    await createSupabaseAuthProvider(clients).verifyToken({
      tokenHash: "h".repeat(40),
      locale: "pt",
      now: NOW,
      request: REQUEST,
    });
    expect(calls[0]).toEqual({
      fn: "verifyOtp",
      args: { token_hash: "h".repeat(40), type: "email" },
    });
  });

  it("US-01.5: an expired, used or wrong token is `ok: false`; an outage is an error", async () => {
    const input = {
      email: "a@b.pt",
      code: "123456",
      locale: "pt" as const,
      now: NOW,
      request: REQUEST,
    };
    for (const error of [
      { code: "otp_expired", message: "Token has expired or is invalid", status: 403 },
      { message: "Token has expired or is invalid", status: 403 },
      { code: "validation_failed", message: "x", status: 422 },
    ]) {
      const provider = createSupabaseAuthProvider(
        fake({ verify: { data: { user: null }, error } }).clients,
      );
      expect(await provider.verifyCode(input)).toEqual({ ok: false });
    }
    const outage = createSupabaseAuthProvider(
      fake({
        verify: {
          data: { user: null },
          error: { code: "unexpected_failure", message: "x", status: 503 },
        },
      }).clients,
    );
    await expect(outage.verifyCode(input)).rejects.toBeInstanceOf(AuthProviderError);
  });

  it("an account that signed in before is not a new user", () => {
    expect(isFirstSession(user)).toBe(true);
    expect(isFirstSession({ ...user, last_sign_in_at: "2026-03-09T08:00:00Z" })).toBe(
      false,
    );
    expect(isFirstSession({ ...user, email_confirmed_at: null })).toBe(false);
    expect(isFirstSession({ ...user, last_sign_in_at: undefined })).toBe(false);
  });

  it("SR-06: rotating the code asks the admin API for a new link (never emailed)", async () => {
    const { clients, calls } = fake();
    await createSupabaseAuthProvider(clients).rotateCode({
      email: "ana@empresa-exemplo.pt",
      now: NOW,
    });
    expect(calls).toEqual([
      {
        fn: "generateLink",
        args: { type: "magiclink", email: "ana@empresa-exemplo.pt" },
      },
    ]);
    await expect(
      createSupabaseAuthProvider(fake({ linkError: true }).clients).rotateCode({
        email: "a@b.pt",
        now: NOW,
      }),
    ).rejects.toBeInstanceOf(AuthProviderError);
  });

  it("authorises with getUser (the Auth server), never by trusting the cookie; no cookie means no call", async () => {
    const none = fake();
    const anonymous = await createSupabaseAuthProvider(none.clients).currentUser({
      request: { cookies: [], secure: true },
      now: NOW,
    });
    expect(anonymous).toEqual({ user: null, cookies: [] });
    expect(none.calls).toEqual([]);

    const known = fake({
      user: { data: { user }, error: null },
      setCookies: [{ name: "sb-session", value: "fresh", options: { path: "/" } }],
    });
    const current = await createSupabaseAuthProvider(known.clients).currentUser({
      request: REQUEST,
      now: NOW,
    });
    expect(known.calls.map((c) => c.fn)).toEqual(["getUser"]);
    expect(current.user).toMatchObject({ id: user.id, locale: "en" });
    expect(current.cookies[0]).toMatchObject({ name: "sb-session", value: "fresh" });

    const invalid = fake({
      user: { data: { user: null }, error: { message: "invalid JWT", status: 401 } },
    });
    expect(
      (
        await createSupabaseAuthProvider(invalid.clients).currentUser({
          request: REQUEST,
          now: NOW,
        })
      ).user,
    ).toBeNull();
  });

  it("signs out of this browser only (scope local) and returns the cleared cookies", async () => {
    const { clients, calls } = fake({
      setCookies: [{ name: "sb-session", value: "", options: { path: "/", maxAge: 0 } }],
    });
    const cookies = await createSupabaseAuthProvider(clients).signOut({
      request: REQUEST,
    });
    expect(calls).toEqual([{ fn: "signOut", args: { scope: "local" } }]);
    expect(cookies[0]).toMatchObject({
      name: "sb-session",
      value: "",
      options: { maxAge: 0 },
    });
  });
});
