import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * The service-role Supabase client: it bypasses RLS, so it exists only in server code (this
 * module imports `server-only`, which fails the build if a client component pulls it in) and
 * its key never gets a NEXT_PUBLIC_ prefix (SR-07, T-03). Every query made with it must filter
 * by the authenticated user explicitly.
 */
export function createAdminClient(options: { url: string; serviceRoleKey: string }) {
  return createClient(options.url, options.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export type AdminClient = ReturnType<typeof createAdminClient>;
