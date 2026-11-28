import type { RpcCaller } from "@/lib/data/rpc";
import type { SqlRunner } from "./sql-runner";

/** Postgres named-argument call: `select fn(p_a => $1, p_b => $2)`. */
export function namedCall(fn: string, args: Record<string, unknown>) {
  const names = Object.keys(args);
  const placeholders = names.map((name, index) => `${name} => $${index + 1}`);
  return {
    text: `select public.${fn}(${placeholders.join(", ")}) as result`,
    values: names.map((name) => args[name]),
  };
}

/** An RpcCaller backed by any SQL runner (PGlite or a pg pool) acting as the service role. */
export function runnerRpc(db: SqlRunner): RpcCaller {
  return async (fn, args) => {
    const { text, values } = namedCall(fn, args);
    const result = await db.query<{ result: unknown }>(text, values);
    return result.rows[0]?.result;
  };
}
