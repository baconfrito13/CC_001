import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Locale } from "@/config/site";
import { isLocale } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AuthProvider,
  AuthRequest,
  CookieToSet,
  CurrentUser,
  SessionUser,
  VerifyOutcome,
} from "./types";

/**
 * `AUTH_ADAPTER=supabase`: Supabase Auth with the email OTP flow.
 *
 * - `sendCode` asks Supabase to email the one-time token. The project's "Magic link" template
 *   (generated: supabase/templates/login.html) contains the 6-digit `{{ .Token }}` and a link to
 *   `<site>/<locale>/auth/confirm?next=…&token_hash={{ .TokenHash }}&type=email`.
 * - `verifyCode` / `verifyToken` consume that one token (`verifyOtp`) and Supabase answers with
 *   a session, which `@supabase/ssr` writes as cookies through the bridge below.
 * - `currentUser` uses `auth.getUser()`, which asks the Auth server (never `getSession()`, which
 *   trusts the cookie: docs/04-architecture.md section 7).
 *
 * The transport is proven against fakes here; the real service needs the project of founder
 * task E (spike S7: whether `generateLink` invalidates the previous code is checked there).
 */

interface UserLike {
  id: string;
  email?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

interface AuthFailure {
  code?: string;
  message: string;
  status?: number;
}

/** The slice of `SupabaseClient["auth"]` this adapter uses; a fake satisfies it in tests. */
export interface AuthClientLike {
  auth: {
    signInWithOtp(params: {
      email: string;
      options: {
        shouldCreateUser: boolean;
        emailRedirectTo: string;
        data: Record<string, unknown>;
      };
    }): PromiseLike<{ error: AuthFailure | null }>;
    verifyOtp(
      params:
        | { email: string; token: string; type: "email" }
        | { token_hash: string; type: "email" },
    ): PromiseLike<{ data: { user: UserLike | null }; error: AuthFailure | null }>;
    getUser(): PromiseLike<{
      data: { user: UserLike | null };
      error: AuthFailure | null;
    }>;
    signOut(options?: { scope: "local" }): PromiseLike<{ error: AuthFailure | null }>;
    admin: {
      generateLink(params: {
        type: "magiclink";
        email: string;
      }): PromiseLike<{ error: AuthFailure | null }>;
    };
  };
}

/** Where a session client reads the request's cookies and puts the ones Supabase wants set. */
export interface CookieBridge {
  getAll(): { name: string; value: string }[];
  setAll(
    cookies: { name: string; value: string; options: CookieToSet["options"] }[],
  ): void;
}

export interface SupabaseAuthClients {
  /** For sending the code: no cookies, no stored state. */
  anon(): AuthClientLike;
  /** For everything that reads or writes the session. */
  session(bridge: CookieBridge): AuthClientLike;
  /** The service-role client (rotating a code). */
  admin(): AuthClientLike;
}

export class AuthProviderError extends Error {
  constructor(
    public readonly operation: string,
    public readonly code: string,
  ) {
    super(`auth ${operation} failed (${code})`);
    this.name = "AuthProviderError";
  }
}

/** Errors that mean "this code or token is not usable" (not an outage). */
const NOT_USABLE = new Set([
  "otp_expired",
  "otp_disabled",
  "bad_otp",
  "validation_failed",
]);

const FIVE_SECONDS = 5_000;

/**
 * Is this the first session of the account? Supabase confirms the email and signs the person in
 * in the same call the first time; later sign-ins move `last_sign_in_at` away from
 * `email_confirmed_at`.
 */
export function isFirstSession(user: UserLike): boolean {
  const confirmed = Date.parse(user.email_confirmed_at ?? "");
  const last = Date.parse(user.last_sign_in_at ?? "");
  return (
    Number.isFinite(confirmed) &&
    Number.isFinite(last) &&
    Math.abs(last - confirmed) < FIVE_SECONDS
  );
}

function toSessionUser(user: UserLike, fallback: Locale): SessionUser | null {
  if (!user.email) return null;
  const preferred = user.user_metadata?.locale;
  return {
    id: user.id,
    email: user.email,
    locale: typeof preferred === "string" && isLocale(preferred) ? preferred : fallback,
  };
}

export function createSupabaseAuthProvider(clients: SupabaseAuthClients): AuthProvider {
  /** A cookie bridge that records what Supabase wants set, as ready-to-use cookies. */
  const bridge = (request: AuthRequest) => {
    const cookies: CookieToSet[] = [];
    const cookieBridge: CookieBridge = {
      getAll: () => [...request.cookies],
      setAll(list) {
        for (const cookie of list) {
          cookies.push({
            name: cookie.name,
            value: cookie.value,
            // The browser never needs these tokens (the server makes every call), so keep them
            // out of reach of page scripts.
            options: { ...cookie.options, httpOnly: true, secure: request.secure },
          });
        }
      },
    };
    return { cookies, cookieBridge };
  };

  const finish = (
    result: Awaited<ReturnType<AuthClientLike["auth"]["verifyOtp"]>>,
    cookies: CookieToSet[],
    locale: Locale,
  ): VerifyOutcome => {
    if (result.error) {
      if (result.error.code && NOT_USABLE.has(result.error.code)) return { ok: false };
      // 4xx without a known code (expired, used or wrong token): not an outage either.
      if (result.error.status !== undefined && result.error.status < 500)
        return { ok: false };
      throw new AuthProviderError("verify", result.error.code ?? "auth_error");
    }
    const user = result.data.user ? toSessionUser(result.data.user, locale) : null;
    if (!user || !result.data.user) return { ok: false };
    return { ok: true, user, isNewUser: isFirstSession(result.data.user), cookies };
  };

  return {
    name: "supabase",

    async sendCode({ email, locale, next, origin }) {
      const redirect = `${origin}/${locale}/auth/confirm?next=${encodeURIComponent(next)}`;
      const { error } = await clients.anon().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirect, data: { locale } },
      });
      // Supabase allows one email per minute per address: the service already hides a second
      // request inside that minute, so a rate-limit answer here is not an error for the person.
      if (error && error.code !== "over_email_send_rate_limit") {
        throw new AuthProviderError("send", error.code ?? "auth_error");
      }
    },

    async verifyCode({ email, code, locale, request }) {
      const { cookies, cookieBridge } = bridge(request);
      const result = await clients
        .session(cookieBridge)
        .auth.verifyOtp({ email, token: code, type: "email" });
      return finish(result, cookies, locale);
    },

    async verifyToken({ tokenHash, locale, request }) {
      const { cookies, cookieBridge } = bridge(request);
      const result = await clients
        .session(cookieBridge)
        .auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      return finish(result, cookies, locale);
    },

    async rotateCode({ email }) {
      // Generating a new link issues a new one-time token and, as far as the docs say, makes
      // the previous one unusable (spike S7). The link is thrown away: it is never emailed.
      const { error } = await clients
        .admin()
        .auth.admin.generateLink({ type: "magiclink", email });
      if (error) throw new AuthProviderError("rotate", error.code ?? "auth_error");
    },

    async currentUser({ request }): Promise<CurrentUser> {
      if (request.cookies.length === 0) return { user: null, cookies: [] };
      const { cookies, cookieBridge } = bridge(request);
      const { data, error } = await clients.session(cookieBridge).auth.getUser();
      if (error || !data.user) return { user: null, cookies };
      return { user: toSessionUser(data.user, "pt"), cookies };
    },

    async signOut({ request }) {
      const { cookies, cookieBridge } = bridge(request);
      await clients.session(cookieBridge).auth.signOut({ scope: "local" });
      return cookies;
    },
  };
}

/** The real clients, from the three Supabase variables `parseEnv` already checked. */
export function realSupabaseClients(options: {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}): SupabaseAuthClients {
  return {
    anon: () =>
      createClient(options.url, options.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: "implicit",
        },
      }) as unknown as AuthClientLike, // reason: the SDK type is a superset of AuthClientLike
    session: (bridge) =>
      createServerClient(options.url, options.anonKey, {
        cookies: {
          getAll: () => bridge.getAll(),
          setAll: (list) => bridge.setAll(list),
        },
      }) as unknown as AuthClientLike, // reason: the SDK type is a superset of AuthClientLike
    admin: () =>
      createAdminClient({
        url: options.url,
        serviceRoleKey: options.serviceRoleKey,
      }) as unknown as AuthClientLike, // reason: the SDK type is a superset of AuthClientLike
  };
}
