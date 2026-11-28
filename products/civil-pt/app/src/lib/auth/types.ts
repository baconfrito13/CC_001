import { z } from "zod";
import { supportedLocales } from "@/config/site";

/** The signed-in person, as every page and route sees them. */
export interface SessionUser {
  id: string;
  email: string;
  locale: (typeof supportedLocales)[number];
}

export interface CookieToSet {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none" | boolean;
    path?: string;
    maxAge?: number;
    expires?: Date;
    domain?: string;
  };
}

/** What a provider needs from the incoming request: its cookies and whether it is HTTPS. */
export interface AuthRequest {
  cookies: readonly { name: string; value: string }[];
  secure: boolean;
}

export type VerifyOutcome =
  | { ok: true; user: SessionUser; isNewUser: boolean; cookies: CookieToSet[] }
  | { ok: false };

export interface CurrentUser {
  user: SessionUser | null;
  /** Refreshed session cookies the caller must put on the response (the proxy does). */
  cookies: CookieToSet[];
}

/**
 * Sign-in without a password (US-01): a 6-digit code and a link that both finish the same
 * one-time token. `mock` is for tests and development; `supabase` is Supabase Auth. Both are
 * driven by `AuthService`, which owns the rate limits, the lock after five wrong codes and the
 * identical answer for known and unknown emails.
 */
export interface AuthProvider {
  readonly name: "mock" | "supabase";
  /** Emails the code and the confirmation link. */
  sendCode(input: {
    email: string;
    locale: SessionUser["locale"];
    /** Where to go after signing in: an allowed relative path. */
    next: string;
    /** `https://host` of this site, for the link in the email. */
    origin: string;
    now: Date;
  }): Promise<void>;
  /** Finish with the 6-digit code. A wrong, used or expired code is `{ ok: false }`. */
  verifyCode(input: {
    email: string;
    code: string;
    now: Date;
    request: AuthRequest;
  }): Promise<VerifyOutcome>;
  /** Finish with the token of the link. Called only by the POST of the confirmation page. */
  verifyToken(input: {
    tokenHash: string;
    now: Date;
    request: AuthRequest;
  }): Promise<VerifyOutcome>;
  /** Make the code issued last unusable (after five wrong tries). */
  rotateCode(input: { email: string; now: Date }): Promise<void>;
  currentUser(input: { request: AuthRequest; now: Date }): Promise<CurrentUser>;
  /** Cookies that end the session. */
  signOut(input: { request: AuthRequest }): Promise<CookieToSet[]>;
}

export const SESSION_COOKIE = "rp_session";
/** US-01: the code and the link are valid for 10 minutes. */
export const CODE_TTL_SECONDS = 600;
/** The session lasts 30 days unless the person signs out. */
export const SESSION_TTL_SECONDS = 30 * 86_400;

const email = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email())
  .transform((value) => value.toLowerCase());

const locale = z.enum(supportedLocales);

/** POST /api/auth/otp */
export const OtpRequestSchema = z.strictObject({
  email,
  locale,
  next: z.string().max(512).optional(),
});

/** POST /api/auth/verify */
export const VerifyCodeSchema = z.strictObject({
  email,
  code: z.string().regex(/^\d{6}$/),
  locale,
  next: z.string().max(512).optional(),
});

/** POST /api/auth/confirm (the form of the confirmation page) */
export const ConfirmSchema = z.strictObject({
  token_hash: z
    .string()
    .min(16)
    .max(256)
    .regex(/^[A-Za-z0-9._~-]+$/),
  type: z.literal("email"),
  locale,
  next: z.string().max(512).optional(),
});

export type OtpRequest = z.output<typeof OtpRequestSchema>;
export type VerifyCodeRequest = z.output<typeof VerifyCodeSchema>;
export type ConfirmRequest = z.output<typeof ConfirmSchema>;
