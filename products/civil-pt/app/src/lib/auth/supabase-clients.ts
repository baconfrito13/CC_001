import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AuthClientLike, SupabaseAuthClients } from "./supabase";

/**
 * The real Supabase clients behind `createSupabaseAuthProvider`. No `server-only` marker here
 * on purpose: the proxy loads this module too, and it passes no service-role key (so `admin()`
 * cannot work there). The key reaches this module only from `src/lib/auth/index.ts`, which is
 * server-only.
 */
export function realSupabaseClients(options: {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}): SupabaseAuthClients {
  return {
    anon: () =>
      createClient(options.url, options.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: "implicit",
        },
      }) as unknown as AuthClientLike, // reason: the SDK client is a superset of AuthClientLike
    session: (bridge) =>
      createServerClient(options.url, options.anonKey, {
        cookies: {
          getAll: () => bridge.getAll(),
          setAll: (list) => bridge.setAll(list),
        },
      }) as unknown as AuthClientLike, // reason: the SDK client is a superset of AuthClientLike
    admin: () => {
      if (!options.serviceRoleKey)
        throw new Error("the service-role key is not available here");
      return createClient(options.url, options.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }) as unknown as AuthClientLike; // reason: the SDK client is a superset of AuthClientLike
    },
  };
}
