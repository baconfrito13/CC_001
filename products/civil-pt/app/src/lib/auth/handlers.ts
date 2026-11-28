import { NextResponse } from "next/server";
import { site, supportedLocales } from "@/config/site";
import { errorCode, type Logger, logger } from "@/lib/core/logger";
import { problem, zodErrors } from "@/lib/core/problem";
import { getClientIp, isSameOrigin, readJsonBody } from "@/lib/http";
import { authRequestFrom } from "./cookies";
import type { AuthService } from "./service";
import {
  type AuthProvider,
  ConfirmSchema,
  type CookieToSet,
  OtpRequestSchema,
  VerifyCodeSchema,
} from "./types";

/**
 * Request handlers of the sign-in routes (docs/04-architecture.md section 6). Each validates
 * the request, calls `AuthService` and shapes the response; the routes in src/app/api/auth only
 * forward to them. Dependencies are injectable so the handlers run in tests without Next.
 */

export interface AuthHandlerDeps {
  service: () => Promise<AuthService>;
  provider: () => Promise<AuthProvider>;
  log: Logger;
  /** `https://host` used in the link of the email: configuration, never the Host header. */
  origin: () => string;
}

async function defaultDeps(): Promise<AuthHandlerDeps> {
  // Imported here so that tests of the handlers never load the server-only module.
  const { getAuthProvider, getAuthService } = await import("./index");
  return {
    service: getAuthService,
    provider: getAuthProvider,
    log: logger,
    origin: () => site.url,
  };
}

const BODY_LIMIT = 2_000;

function applyCookies(
  response: NextResponse,
  cookies: readonly CookieToSet[],
): NextResponse {
  for (const cookie of cookies) {
    const { sameSite, ...rest } = cookie.options;
    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      ...rest,
      ...(sameSite === undefined || sameSite === false
        ? {}
        : { sameSite: sameSite === true ? "strict" : sameSite }),
    });
  }
  return response;
}

async function jsonBody(request: Request) {
  const body = await readJsonBody(request, BODY_LIMIT);
  if (body.ok) return { ok: true as const, data: body.data };
  const code =
    body.status === 413
      ? "payload_too_large"
      : body.status === 415
        ? "unsupported_media_type"
        : "invalid_request";
  return { ok: false as const, response: problem(body.status, code) };
}

/** 303 to a path of this site. The Location is relative, so no Host header ever builds it. */
function see(path: string): NextResponse {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path, "Cache-Control": "no-store" },
  });
}

function retryHeaders(seconds: number): HeadersInit {
  return { "Retry-After": String(seconds) };
}

/** POST /api/auth/otp: email the code and the link. 202 whether or not the account exists. */
export async function handleOtp(
  request: Request,
  overrides: Partial<AuthHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  if (!isSameOrigin(request.headers)) return problem(403, "forbidden");
  const body = await jsonBody(request);
  if (!body.ok) return body.response;

  const parsed = OtpRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    const emailProblem = parsed.error.issues.some((issue) => issue.path[0] === "email");
    return emailProblem
      ? problem(400, "invalid_email")
      : problem(400, "invalid_request", { errors: zodErrors(parsed.error) });
  }

  try {
    const result = await (await deps.service()).requestCode({
      ...parsed.data,
      ip: getClientIp(request.headers),
      origin: deps.origin(),
    });
    if (!result.ok) {
      return problem(429, "rate_limited", {
        headers: retryHeaders(result.retryAfterSeconds),
      });
    }
    return Response.json(
      { status: "sent" },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    deps.log.error("auth_otp_failed", {
      route: "/api/auth/otp",
      error_code: errorCode(error),
    });
    return problem(503, "service_unavailable");
  }
}

/** POST /api/auth/verify: finish with the 6-digit code. */
export async function handleVerify(
  request: Request,
  overrides: Partial<AuthHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  if (!isSameOrigin(request.headers)) return problem(403, "forbidden");
  const body = await jsonBody(request);
  if (!body.ok) return body.response;

  const parsed = VerifyCodeSchema.safeParse(body.data);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return field === "email"
      ? problem(400, "invalid_email")
      : field === "code"
        ? problem(400, "invalid_code")
        : problem(400, "invalid_request", { errors: zodErrors(parsed.error) });
  }

  try {
    const result = await (await deps.service()).verifyCode({
      ...parsed.data,
      ip: getClientIp(request.headers),
      request: authRequestFrom(request),
    });
    if (result.ok) {
      const response = NextResponse.json(
        { redirectTo: result.redirectTo },
        { headers: { "Cache-Control": "no-store" } },
      );
      return applyCookies(response, result.cookies);
    }
    if (result.error === "rate_limited") {
      return problem(429, "rate_limited", {
        headers: retryHeaders(result.retryAfterSeconds),
      });
    }
    return result.error === "locked"
      ? problem(429, "too_many_attempts", { headers: retryHeaders(900) })
      : problem(400, "invalid_code");
  } catch (error) {
    deps.log.error("auth_verify_failed", {
      route: "/api/auth/verify",
      error_code: errorCode(error),
    });
    return problem(503, "service_unavailable");
  }
}

const isLocale = (value: unknown): value is (typeof supportedLocales)[number] =>
  typeof value === "string" && (supportedLocales as readonly string[]).includes(value);

/**
 * POST /api/auth/confirm: the button of the confirmation page. This is the only request that
 * uses the token of the link; the GET of the page never does (US-01 criterion 3). It answers
 * with a redirect either way: to the app, or back to the sign-in page with the reason.
 */
export async function handleConfirm(
  request: Request,
  overrides: Partial<AuthHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  if (!isSameOrigin(request.headers)) return problem(403, "forbidden");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return problem(415, "unsupported_media_type");
  }
  const raw = Object.fromEntries(
    [...form.entries()].filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  const locale = isLocale(raw.locale) ? raw.locale : "pt";
  const back = (reason: "expired" | "busy" | "link") =>
    see(`/${locale}/entrar?erro=${reason}`);

  const parsed = ConfirmSchema.safeParse(raw);
  if (!parsed.success) return back("link");

  try {
    const result = await (await deps.service()).confirmToken({
      ...parsed.data,
      ip: getClientIp(request.headers),
      request: authRequestFrom(request),
    });
    if (result.ok) {
      return applyCookies(see(result.redirectTo), result.cookies);
    }
    return back(result.error === "rate_limited" ? "busy" : "expired");
  } catch (error) {
    deps.log.error("auth_confirm_failed", {
      route: "/api/auth/confirm",
      error_code: errorCode(error),
    });
    return problem(503, "service_unavailable");
  }
}

/** POST /api/auth/signout: end the session (204). Safe to repeat. */
export async function handleSignOut(
  request: Request,
  overrides: Partial<AuthHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  if (!isSameOrigin(request.headers)) return problem(403, "forbidden");
  try {
    const cookies = await (await deps.provider()).signOut({
      request: authRequestFrom(request),
    });
    return applyCookies(
      new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }),
      cookies,
    );
  } catch (error) {
    deps.log.error("auth_signout_failed", {
      route: "/api/auth/signout",
      error_code: errorCode(error),
    });
    return problem(503, "service_unavailable");
  }
}
