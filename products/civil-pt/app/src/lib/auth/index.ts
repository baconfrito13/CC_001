import "server-only";
import { cookies } from "next/headers";
import { logger } from "@/lib/core/logger";
import { getDataStore } from "@/lib/data";
import { MemoryDataStore } from "@/lib/data/memory";
import { getEmailSender } from "@/lib/email";
import { type Env, getEnv } from "@/lib/env";
import { getEvents } from "@/lib/events";
import { authRequestFrom } from "./cookies";
import { MockAuthProvider } from "./mock";
import { type AuthService, createAuthService } from "./service";
import type { AuthProvider, AuthRequest, SessionUser } from "./types";

export { authRequestFrom } from "./cookies";
export { SESSION_COOKIE, type SessionUser } from "./types";

/** Signs the mock session when HASH_SALT is not set (production forbids both). */
export const DEV_SESSION_SECRET = "rastoplan-dev-session-secret";

export async function createAuthProvider(env: Env): Promise<AuthProvider> {
  if (env.AUTH_ADAPTER === "supabase") {
    const { createSupabaseAuthProvider, realSupabaseClients } = await import(
      "./supabase"
    );
    return createSupabaseAuthProvider(
      realSupabaseClients({
        // reason: parseEnv guarantees these when AUTH_ADAPTER=supabase.
        url: env.NEXT_PUBLIC_SUPABASE_URL as string,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
      }),
    );
  }
  const store = await getDataStore();
  if (!(store instanceof MemoryDataStore)) {
    // parseEnv refuses AUTH_ADAPTER=mock without DATA_ADAPTER=memory; this is the belt.
    throw new Error("AUTH_ADAPTER=mock needs DATA_ADAPTER=memory");
  }
  return new MockAuthProvider({
    store,
    email: getEmailSender(),
    secret: env.HASH_SALT ?? DEV_SESSION_SECRET,
    trial: { sheets: env.TRIAL_SHEETS, days: env.TRIAL_DAYS },
  });
}

const SLOT = Symbol.for("rastoplan.authProvider");
type Slot = { [SLOT]?: Promise<AuthProvider> };

/** The process-wide provider (shared by every route bundle through globalThis). */
export function getAuthProvider(): Promise<AuthProvider> {
  const holder = globalThis as unknown as Slot; // reason: attaching a private symbol slot
  holder[SLOT] ??= createAuthProvider(getEnv());
  return holder[SLOT];
}

/** Used only when HASH_SALT is not set, which production forbids. */
const DEV_SALT = "rastoplan-dev-hash-salt";

export async function getAuthService(): Promise<AuthService> {
  const env = getEnv();
  return createAuthService({
    provider: await getAuthProvider(),
    store: await getDataStore(),
    events: getEvents().tracker,
    log: logger,
    now: () => new Date(),
    salt: env.HASH_SALT ?? DEV_SALT,
  });
}

/** The signed-in person for an API request, or null. */
export async function userFromRequest(request: Request): Promise<SessionUser | null> {
  const provider = await getAuthProvider();
  const { user } = await provider.currentUser({
    request: authRequestFrom(request),
    now: new Date(),
  });
  return user;
}

/** The signed-in person for a server component or a layout (reads the request's cookies). */
export async function userFromCookies(): Promise<SessionUser | null> {
  const jar = await cookies();
  const request: AuthRequest = {
    cookies: jar.getAll().map(({ name, value }) => ({ name, value })),
    secure: true,
  };
  const provider = await getAuthProvider();
  const { user } = await provider.currentUser({ request, now: new Date() });
  return user;
}
