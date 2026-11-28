import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRpcDataStore, DataStoreError, type RpcCaller } from "./rpc";
import type { DataStore } from "./types";

/** The slice of the Supabase client the ledger needs: `rpc`. A fake satisfies it in tests. */
export interface RpcClient {
  rpc(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { code?: string; message: string } | null }>;
}

/**
 * Turns `supabase.rpc` into an RpcCaller. The error keeps only the function name and the
 * Postgres/PostgREST code: the message may quote arguments (an email, a sheet id).
 */
export function supabaseRpc(client: RpcClient): RpcCaller {
  return async (fn, args) => {
    const { data, error } = await client.rpc(fn, args);
    if (error) throw new DataStoreError(fn, error.code ?? "rpc_error");
    return data;
  };
}

export function createSupabaseDataStore(options: {
  url: string;
  serviceRoleKey: string;
}): DataStore {
  return createRpcDataStore(supabaseRpc(createAdminClient(options)), "supabase");
}
