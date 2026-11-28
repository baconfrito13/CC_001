import { type Env, getEnv } from "@/lib/env";
import { loadDemoData } from "./demo";
import { MemoryDataStore } from "./memory";
import type { DataStore } from "./types";

/**
 * Pick the data store from the environment. `memory` (the default) is for development and
 * tests and starts with the demo accounts; `supabase` needs the three SUPABASE_* variables,
 * which `parseEnv` already checked. The Supabase module is imported lazily so that test mode
 * never loads the client library.
 */
export async function createDataStore(
  env: Env,
  now: Date = new Date(),
): Promise<DataStore> {
  if (env.DATA_ADAPTER === "supabase") {
    const { createSupabaseDataStore } = await import("./supabase");
    return createSupabaseDataStore({
      // reason: parseEnv guarantees these when DATA_ADAPTER=supabase.
      url: env.NEXT_PUBLIC_SUPABASE_URL as string,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
    });
  }
  const store = new MemoryDataStore();
  await loadDemoData(store, now);
  return store;
}

// One store per server process. Next bundles route handlers separately, so a module-level
// variable could be instantiated more than once: the globalThis slot is shared by all of them.
const SLOT = Symbol.for("rastoplan.dataStore");
type Slot = { [SLOT]?: Promise<DataStore> };

/** The process-wide data store (created on first use, from the validated environment). */
export function getDataStore(): Promise<DataStore> {
  const holder = globalThis as unknown as Slot; // reason: attaching a private symbol slot
  holder[SLOT] ??= createDataStore(getEnv());
  return holder[SLOT];
}

/** Tests only: drop the cached store so the next call builds a fresh one. */
export function resetDataStoreForTests(): void {
  (globalThis as unknown as Slot)[SLOT] = undefined; // reason: same private slot
}
