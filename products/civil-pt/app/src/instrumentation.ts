/**
 * Runs once when a Next.js server instance starts, before it serves a request.
 *
 * It validates the environment at boot (docs/04-architecture.md section 9): a missing or
 * malformed variable, a test adapter in production (T-10, SR-08) or a live payment flag
 * without live keys makes `register` throw, so the process fails to start instead of serving
 * traffic in an unsafe configuration. `next build` does not trigger the production rules
 * (see `parseEnv`).
 *
 * Slice S-08 adds Sentry here.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("./lib/env");
    getEnv();
  }
}
