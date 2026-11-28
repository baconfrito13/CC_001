import { hmacRef } from "@/lib/core/hash";
import { errorCode, type Logger } from "@/lib/core/logger";
import type { DataStore } from "@/lib/data/types";
import type { Tracker } from "@/lib/events";
import { safeNext } from "./redirect";
import type {
  AuthProvider,
  AuthRequest,
  ConfirmRequest,
  CookieToSet,
  OtpRequest,
  SessionUser,
  VerifyCodeRequest,
} from "./types";

/**
 * The rules of sign-in (US-01, docs/04-architecture.md sections 6, 7 and 11), independent of
 * who sends the email (`AuthProvider`). A route validates the body with zod, calls one method
 * and turns the result into a response; nothing else decides who gets in.
 *
 * - The answer to "send me a code" is the same whether the email has an account or not (T-05).
 * - Five wrong codes for one email lock it for 15 minutes and make the code issued last
 *   unusable (SR-06), so a guess made before the lock cannot be redeemed after it.
 * - Counters hold keyed hashes, never an email or an address (SR-09).
 */

export const AUTH_LIMITS = {
  otpPerEmailPerHour: 5,
  otpPerIpPerHour: 20,
  /** Distinct new accounts one address may start per day. */
  newAccountsPerIpPerDay: 3,
  /** A second code request for the same email inside this window sends nothing new. */
  resendCooldownSeconds: 60,
  verifyPerIpPerWindow: 30,
  confirmPerIpPerWindow: 30,
  shortWindowSeconds: 300,
} as const;

const HOUR = 3600;
const DAY = 86_400;

export interface AuthServiceDeps {
  provider: AuthProvider;
  store: DataStore;
  events: Tracker;
  log: Logger;
  now: () => Date;
  /** HASH_SALT: keys the hashes of emails and addresses. */
  salt: string;
}

export type RequestCodeResult =
  | { ok: true }
  | { ok: false; error: "rate_limited"; retryAfterSeconds: number };

export type VerifyResult =
  | { ok: true; user: SessionUser; redirectTo: string; cookies: CookieToSet[] }
  | { ok: false; error: "invalid_code" | "locked" }
  | { ok: false; error: "rate_limited"; retryAfterSeconds: number };

export function createAuthService(deps: AuthServiceDeps) {
  const { provider, store, events, log, salt } = deps;

  const emailHash = (email: string) => hmacRef(email.trim().toLowerCase(), salt, 32);
  const ipHash = (ip: string) => hmacRef(ip, salt, 16);

  async function hit(key: string, limit: number, windowSeconds: number) {
    const now = deps.now();
    const result = await store.security.rateLimitHit({ key, limit, windowSeconds, now });
    return {
      allowed: result.allowed,
      count: result.count,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000),
      ),
    };
  }

  return {
    /** POST /api/auth/otp */
    async requestCode(
      input: OtpRequest & { ip: string; origin: string },
    ): Promise<RequestCodeResult> {
      const now = deps.now();
      const hashed = emailHash(input.email);
      const client = ipHash(input.ip);

      const perEmail = await hit(
        `otp:email:${hashed}`,
        AUTH_LIMITS.otpPerEmailPerHour,
        HOUR,
      );
      const perIp = await hit(`otp:ip:${client}`, AUTH_LIMITS.otpPerIpPerHour, HOUR);
      for (const limited of [perEmail, perIp]) {
        if (!limited.allowed) {
          return {
            ok: false,
            error: "rate_limited",
            retryAfterSeconds: limited.retryAfterSeconds,
          };
        }
      }

      const known = await store.workspace.userExists(input.email);
      // A new account counts once per address and email: only the first request of the hour for
      // this email counts, so asking again for a code that did not arrive is free.
      if (!known && perEmail.count === 1) {
        const created = await hit(
          `otp:new:${client}`,
          AUTH_LIMITS.newAccountsPerIpPerDay,
          DAY,
        );
        if (!created.allowed) {
          // Use up the email's hourly budget too, so asking again cannot slip past the limit.
          for (let i = 1; i < AUTH_LIMITS.otpPerEmailPerHour; i += 1) {
            await hit(`otp:email:${hashed}`, AUTH_LIMITS.otpPerEmailPerHour, HOUR);
          }
          return {
            ok: false,
            error: "rate_limited",
            retryAfterSeconds: created.retryAfterSeconds,
          };
        }
      }

      // Nothing new is sent while the email is locked or a code was sent a moment ago, and the
      // answer stays the same: the visitor learns nothing about the account.
      const status = await store.security.attemptStatus({ emailHash: hashed, now });
      if (status.locked) return { ok: true };
      const cooldown = await hit(
        `otp:cooldown:${hashed}`,
        1,
        AUTH_LIMITS.resendCooldownSeconds,
      );
      if (!cooldown.allowed) return { ok: true };

      await provider.sendCode({
        email: input.email,
        locale: input.locale,
        next: safeNext(input.next, input.locale),
        origin: input.origin,
        now,
      });
      if (!known) events.track("signup_started", { locale: input.locale });
      return { ok: true };
    },

    /** POST /api/auth/verify */
    async verifyCode(
      input: VerifyCodeRequest & { ip: string; request: AuthRequest },
    ): Promise<VerifyResult> {
      const now = deps.now();
      const hashed = emailHash(input.email);

      const limited = await hit(
        `verify:ip:${ipHash(input.ip)}`,
        AUTH_LIMITS.verifyPerIpPerWindow,
        AUTH_LIMITS.shortWindowSeconds,
      );
      if (!limited.allowed) {
        return {
          ok: false,
          error: "rate_limited",
          retryAfterSeconds: limited.retryAfterSeconds,
        };
      }

      const status = await store.security.attemptStatus({ emailHash: hashed, now });
      if (status.locked) return { ok: false, error: "locked" };

      const outcome = await provider.verifyCode({
        email: input.email,
        code: input.code,
        locale: input.locale,
        now,
        request: input.request,
      });

      if (!outcome.ok) {
        const failure = await store.security.attemptFailed({ emailHash: hashed, now });
        if (failure.justLocked) {
          // The code issued last must not outlive the lock (SR-06). If the provider cannot
          // rotate it, the lock itself still holds for 15 minutes: log and carry on.
          await provider
            .rotateCode({ email: input.email, now })
            .catch((error: unknown) => {
              log.error("auth_rotate_failed", { error_code: errorCode(error) });
            });
        }
        return { ok: false, error: failure.locked ? "locked" : "invalid_code" };
      }

      await store.security.attemptReset({ emailHash: hashed });
      if (outcome.isNewUser) {
        events.track("signup_completed", { method: "code", locale: input.locale });
      }
      return {
        ok: true,
        user: outcome.user,
        redirectTo: safeNext(input.next, input.locale),
        cookies: outcome.cookies,
      };
    },

    /** POST /api/auth/confirm: the button of the confirmation page. */
    async confirmToken(
      input: ConfirmRequest & { ip: string; request: AuthRequest },
    ): Promise<VerifyResult> {
      const now = deps.now();
      const limited = await hit(
        `confirm:ip:${ipHash(input.ip)}`,
        AUTH_LIMITS.confirmPerIpPerWindow,
        AUTH_LIMITS.shortWindowSeconds,
      );
      if (!limited.allowed) {
        return {
          ok: false,
          error: "rate_limited",
          retryAfterSeconds: limited.retryAfterSeconds,
        };
      }

      const outcome = await provider.verifyToken({
        tokenHash: input.token_hash,
        locale: input.locale,
        now,
        request: input.request,
      });
      if (!outcome.ok) return { ok: false, error: "invalid_code" };

      await store.security.attemptReset({ emailHash: emailHash(outcome.user.email) });
      if (outcome.isNewUser) {
        events.track("signup_completed", { method: "link", locale: input.locale });
      }
      return {
        ok: true,
        user: outcome.user,
        redirectTo: safeNext(input.next, input.locale),
        cookies: outcome.cookies,
      };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
