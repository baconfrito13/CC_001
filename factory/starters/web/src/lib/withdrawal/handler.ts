import { contact, site } from "@/config/site";
import { getEnv } from "@/lib/env";
import { getClientIp, isSameOrigin, json, readJsonBody } from "@/lib/http";
import { createRateLimiter, type RateLimiter } from "@/lib/waitlist/rate-limit";
import { selectWithdrawalAdapter, type WithdrawalAdapterSelection } from "./adapters";
import { withdrawalEnabled } from "./enabled";
import { renderWithdrawalMessages } from "./messages";
import { parseWithdrawalRequest } from "./schema";

export interface WithdrawalDeps {
  enabled: boolean;
  select: () => WithdrawalAdapterSelection;
  limiter: RateLimiter;
  now: () => Date;
  logError: (message: string, error?: unknown) => void;
}

/** Same mechanism as the waitlist limiter, with its own bucket per IP: 5 per 10 minutes. */
const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

const logError: WithdrawalDeps["logError"] = (message, error) =>
  console.error(message, error ?? "");

const defaultDeps: WithdrawalDeps = {
  enabled: withdrawalEnabled(),
  select: () =>
    selectWithdrawalAdapter(getEnv(), { notifyTo: contact.supportEmail, logError }),
  limiter: defaultLimiter,
  now: () => new Date(),
  logError,
};

/**
 * POST /api/withdrawal  { name, email, reference, message?, locale, website }
 *
 * 200 {ok:true, submittedAt}    delivered to the adapter (or silently dropped: honeypot)
 * 400 {error:"validation"}      with `fieldErrors`
 * 403 / 413 / 415               cross-origin request / oversized body / not JSON
 * 404                           the site does not sell to consumers (no withdrawal function)
 * 429                           rate limited (Retry-After)
 * 502 {error:"upstream"}        the adapter failed (the page tells the consumer to e-mail support)
 * 503 {error:"not_configured"}  production without an adapter (also logged as an error)
 */
export async function handleWithdrawal(
  request: Request,
  overrides: Partial<WithdrawalDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps, ...overrides };

  if (!deps.enabled) return json({ error: "withdrawal_disabled" }, { status: 404 });
  if (!isSameOrigin(request.headers))
    return json({ error: "forbidden" }, { status: 403 });

  const limit = deps.limiter.check(getClientIp(request.headers));
  if (!limit.allowed) {
    return json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonBody(request, 12_000);
  if (!body.ok) return json({ error: body.error }, { status: body.status });

  const parsed = parseWithdrawalRequest(body.data);
  if (!parsed.ok) {
    if (parsed.reason === "honeypot") {
      return json({ ok: true, submittedAt: deps.now().toISOString() });
    }
    return json(
      { error: "validation", fieldErrors: parsed.fieldErrors },
      { status: 400 },
    );
  }

  const selection = deps.select();
  if (!selection.ok) {
    deps.logError(`[withdrawal] ${selection.message}`);
    return json({ error: "not_configured" }, { status: 503 });
  }

  const entry = {
    ...parsed.data,
    submittedAt: deps.now().toISOString(),
    source: site.domain,
  };
  try {
    await selection.adapter.submit(entry, renderWithdrawalMessages(entry));
  } catch (error) {
    deps.logError(`[withdrawal] adapter "${selection.adapter.name}" failed`, error);
    return json({ error: "upstream" }, { status: 502 });
  }
  return json({ ok: true, submittedAt: entry.submittedAt });
}
