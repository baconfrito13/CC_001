import { createHash, timingSafeEqual } from "node:crypto";
import { errorCode, type Logger, logger } from "@/lib/core/logger";
import { problem } from "@/lib/core/problem";
import type { DocumentsService } from "./service";

/** How many dead uploads one run removes; the next run (a minute later) takes the rest. */
export const MAINTENANCE_BATCH = 200;

export interface MaintenanceDeps {
  documents: () => Promise<DocumentsService>;
  /** CRON_SECRET, or undefined when it is not configured. */
  secret: () => string | undefined;
  log: Logger;
}

async function defaultDeps(): Promise<MaintenanceDeps> {
  const [{ getDocumentsService }, { getEnv }] = await Promise.all([
    import("./context"),
    import("@/lib/env"),
  ]);
  return {
    documents: getDocumentsService,
    secret: () => getEnv().CRON_SECRET,
    log: logger,
  };
}

/** Constant-time comparison of two secrets of any length (T-16). */
function sameSecret(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * GET /api/cron/maintenance (Vercel calls it every minute with `Authorization: Bearer
 * $CRON_SECRET`). Without the secret configured, or with a wrong one, it answers 401 and does
 * nothing (T-16). It is idempotent. Slice S-04 adds the stuck-processing sweep.
 */
export async function handleMaintenance(
  request: Request,
  overrides: Partial<MaintenanceDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const secret = deps.secret();
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || !given || !sameSecret(given, secret))
    return problem(401, "unauthorized");

  try {
    const reapedUploads = await (await deps.documents()).reapAllStale({
      limit: MAINTENANCE_BATCH,
    });
    return Response.json({ reapedUploads }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    deps.log.error("maintenance_failed", {
      route: "/api/cron/maintenance",
      error_code: errorCode(error),
    });
    return problem(500, "internal");
  }
}
