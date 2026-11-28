import { handleHealth } from "@/lib/health";
import { version } from "../../../../package.json";

/**
 * GET /api/health: liveness and data check for uptime monitors (UptimeRobot, Better Stack, ...).
 * It pings the data adapter, reports no configuration or secrets, and never touches other
 * third-party services (Stripe, Resend), so a failing vendor cannot make it flap. The logic
 * lives in src/lib/health.ts.
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleHealth(request, version);
}

export function HEAD(request: Request) {
  return handleHealth(request, version);
}
