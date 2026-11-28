import { type Env, getEnv } from "@/lib/env";
import { MemoryObjectStorage } from "./memory";
import type { ObjectStorage } from "./types";

/** Development salt for signed memory URLs. Production never uses the memory adapter. */
const DEV_SECRET = "rastoplan-dev-storage-secret";

/** Pick the file storage from the environment (memory by default, Supabase Storage in production). */
export async function createObjectStorage(env: Env): Promise<ObjectStorage> {
  if (env.STORAGE_ADAPTER === "supabase") {
    const { createSupabaseObjectStorage } = await import("./supabase");
    return createSupabaseObjectStorage({
      // reason: parseEnv guarantees these when STORAGE_ADAPTER=supabase.
      url: env.NEXT_PUBLIC_SUPABASE_URL as string,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
    });
  }
  return new MemoryObjectStorage(env.HASH_SALT ?? DEV_SECRET);
}

const SLOT = Symbol.for("rastoplan.objectStorage");
type Slot = { [SLOT]?: Promise<ObjectStorage> };

/** The process-wide file storage (shared by every route bundle through globalThis). */
export function getObjectStorage(): Promise<ObjectStorage> {
  const holder = globalThis as unknown as Slot; // reason: attaching a private symbol slot
  holder[SLOT] ??= createObjectStorage(getEnv());
  return holder[SLOT];
}
