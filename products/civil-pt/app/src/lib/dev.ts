import type { Env } from "@/lib/env";

/**
 * The development routes (`/api/dev/*`: the signed storage URLs of the memory adapter, the
 * outbox of the console email, the event buffer) exist only while ALL the test adapters are
 * active. Production refuses those adapters at boot (T-10, SR-08), so these routes cannot
 * answer there: they return 404 like any unknown address.
 */
export function devRoutesEnabled(env: Env): boolean {
  return (
    env.DATA_ADAPTER === "memory" &&
    env.STORAGE_ADAPTER === "memory" &&
    env.AUTH_ADAPTER === "mock" &&
    env.EMAIL_ADAPTER === "console"
  );
}
