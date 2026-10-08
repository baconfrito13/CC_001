import { version } from "../../../../package.json";

/**
 * GET /api/health: liveness endpoint for uptime monitors (UptimeRobot, Better Stack, ...).
 * It reports no configuration or secrets and never touches third-party services, so a
 * failing dependency cannot make it flap.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", version },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export function HEAD() {
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
