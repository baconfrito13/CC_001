import { ZodError } from "zod";

/**
 * One error shape for every API route: RFC 9457 `application/problem+json`.
 *
 * `code` is a stable machine-readable member the UI maps to a localized message; `detail` is a
 * short developer-facing sentence. Neither ever carries a stack trace, a secret, user input or
 * personal data (SR-09).
 */
export type ProblemCode =
  | "invalid_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "payload_too_large"
  | "unsupported_media_type"
  | "rate_limited"
  | "no_balance"
  | "invalid_email"
  | "invalid_code"
  | "too_many_attempts"
  | "upload_rejected"
  | "upload_interrupted"
  | "service_unavailable"
  | "not_implemented"
  | "internal";

export interface ProblemBody {
  type: "about:blank";
  title: string;
  status: number;
  code: ProblemCode;
  detail?: string;
  errors?: { path: string; message: string }[];
  [extension: string]: unknown;
}

const TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  422: "Unprocessable Content",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  413: "Content Too Large",
  415: "Unsupported Media Type",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  503: "Service Unavailable",
};

export interface ProblemOptions {
  detail?: string;
  errors?: ProblemBody["errors"];
  headers?: HeadersInit;
  /** Extension members (RFC 9457 section 3.2): short machine-readable values, never user input. */
  extra?: Record<string, string | number | boolean>;
}

/** An error a handler throws on purpose; `toProblem` turns it into a response. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ProblemCode,
    detail?: string,
  ) {
    super(detail ?? code);
    this.name = "AppError";
  }
}

export function problem(
  status: number,
  code: ProblemCode,
  options: ProblemOptions = {},
): Response {
  const body: ProblemBody = {
    ...options.extra,
    type: "about:blank",
    title: TITLES[status] ?? "Error",
    status,
    code,
    ...(options.detail ? { detail: options.detail } : {}),
    ...(options.errors ? { errors: options.errors } : {}),
  };
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/problem+json");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

/** Field paths and rule messages only: the rejected values are never echoed back. */
export function zodErrors(error: ZodError): NonNullable<ProblemBody["errors"]> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Map anything thrown at a boundary to a problem response. Unknown errors become a bare 500:
 * the caller logs the cause (with `errorCode`) and the client learns nothing about it.
 */
export function toProblem(error: unknown): Response {
  if (error instanceof AppError) return problem(error.status, error.code);
  if (error instanceof ZodError) {
    return problem(400, "invalid_request", { errors: zodErrors(error) });
  }
  return problem(500, "internal");
}
