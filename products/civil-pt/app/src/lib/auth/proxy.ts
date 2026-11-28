import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { authRequestFrom } from "./cookies";
import { DEV_SESSION_SECRET, readSession } from "./mock";
import type { CookieToSet } from "./types";
import { SESSION_COOKIE } from "./types";

export interface ProxySession {
  authenticated: boolean;
  /** Session cookies Supabase refreshed: the proxy writes them on its response. */
  cookies: CookieToSet[];
}

/**
 * The proxy's question: is there a session at all? (docs/04-architecture.md section 7.) It is a
 * first gate that saves a render: every page and route asks again with `userFromCookies` /
 * `userFromRequest`, and the data layer enforces the owner in SQL.
 *
 * It shares no memory with the route handlers, so the mock session is a signed value the proxy
 * can verify by itself; Supabase sessions are checked with `getUser()` and refreshed here, the
 * pattern the `@supabase/ssr` docs prescribe for the proxy.
 */
export async function sessionForProxy(request: NextRequest): Promise<ProxySession> {
  const env = getEnv();
  if (env.AUTH_ADAPTER === "mock") {
    const value = request.cookies.get(SESSION_COOKIE)?.value;
    const userId = readSession(value, env.HASH_SALT ?? DEV_SESSION_SECRET, new Date());
    return { authenticated: userId !== null, cookies: [] };
  }
  const { createSupabaseAuthProvider } = await import("./supabase");
  const { realSupabaseClients } = await import("./supabase-clients");
  const provider = createSupabaseAuthProvider(
    realSupabaseClients({
      // reason: parseEnv guarantees these when AUTH_ADAPTER=supabase. No service-role key: the
      // proxy only reads and refreshes sessions.
      url: env.NEXT_PUBLIC_SUPABASE_URL as string,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    }),
  );
  const { user, cookies } = await provider.currentUser({
    request: authRequestFrom(request),
    now: new Date(),
  });
  return { authenticated: user !== null, cookies };
}
