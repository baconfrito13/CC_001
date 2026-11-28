import type { PGlite } from "@electric-sql/pglite";
import type { RpcCaller } from "@/lib/data/rpc";

/** Postgres named-argument call: `select fn(p_a => $1, p_b => $2)`. */
export function namedCall(fn: string, args: Record<string, unknown>) {
  const names = Object.keys(args);
  const placeholders = names.map((name, index) => `${name} => $${index + 1}`);
  return {
    text: `select public.${fn}(${placeholders.join(", ")}) as result`,
    values: names.map((name) => args[name]),
  };
}

/** An RpcCaller backed by a PGlite database, running as the superuser (the service role). */
export function pgliteRpc(db: PGlite): RpcCaller {
  return async (fn, args) => {
    const { text, values } = namedCall(fn, args);
    const result = await db.query<{ result: unknown }>(text, values);
    return result.rows[0]?.result;
  };
}
