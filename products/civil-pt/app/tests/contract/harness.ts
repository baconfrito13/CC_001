import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";
import { MemoryDataStore } from "@/lib/data/memory";
import { createRpcDataStore } from "@/lib/data/rpc";
import type { DataStore } from "@/lib/data/types";
import { createMigratedDb } from "../support/pglite";
import { pgliteRpc } from "../support/sql-rpc";

/**
 * What the contract suite needs besides the store itself: a way to create the rows the SQL
 * side requires (an account, a sheet that belongs to it, a purchase) and the memory side
 * mirrors with its registries. Users created here never carry the automatic trial lot of the
 * SQL trigger: tests grant trials explicitly, with their own clock.
 */
export interface Harness {
  readonly label: string;
  readonly store: DataStore;
  newUser(options?: { email?: string }): Promise<string>;
  newSheet(userId: string): Promise<string>;
  newPurchase(userId: string): Promise<string>;
  setFrozen(userId: string, frozen: boolean): Promise<void>;
  deleteSheet(sheetId: string): Promise<void>;
  close(): Promise<void>;
}

export function createMemoryHarness(): Harness {
  const store = new MemoryDataStore();
  return {
    label: "memory",
    store,
    async newUser() {
      const id = randomUUID();
      store.addUser(id);
      return id;
    },
    async newSheet(userId) {
      const id = randomUUID();
      store.addSheet(id, userId);
      return id;
    },
    async newPurchase() {
      return randomUUID();
    },
    async setFrozen(userId, frozen) {
      store.setFrozen(userId, frozen);
    },
    async deleteSheet(sheetId) {
      store.removeSheet(sheetId);
    },
    async close() {},
  };
}

/** The SQL functions of the migration, run on PGlite as the service role. */
export async function createSqlHarness(existing?: PGlite): Promise<Harness> {
  const db = existing ?? (await createMigratedDb());
  const store = createRpcDataStore(pgliteRpc(db), "supabase");
  return {
    label: "sql",
    store,
    async newUser(options) {
      const id = randomUUID();
      await db.query("insert into auth.users (id, email) values ($1, $2)", [
        id,
        options?.email ?? `${id}@example.test`,
      ]);
      // The signup trigger granted a trial with the real clock: remove it, tests grant their own.
      await db.query("delete from public.sheet_lots where user_id = $1", [id]);
      await db.query("delete from public.trial_grants where user_id = $1", [id]);
      return id;
    },
    async newSheet(userId) {
      const projectId = randomUUID();
      const documentId = randomUUID();
      const sheetId = randomUUID();
      await db.query(
        "insert into public.projects (id, user_id, name) values ($1, $2, 'Contract')",
        [projectId, userId],
      );
      await db.query(
        `insert into public.documents (id, project_id, user_id, storage_path, file_name, size_bytes)
         values ($1, $2, $3, $4, 'contract.pdf', 1000)`,
        [documentId, projectId, userId, `${userId}/${projectId}/${documentId}.pdf`],
      );
      await db.query(
        `insert into public.sheets (id, document_id, project_id, user_id, page_no, width_pt, height_pt)
         values ($1, $2, $3, $4, 1, 1190.55, 841.89)`,
        [sheetId, documentId, projectId, userId],
      );
      return sheetId;
    },
    async newPurchase(userId) {
      const id = randomUUID();
      await db.query(
        `insert into public.purchases (id, user_id, kind, pass_size, amount_minor, stripe_ref)
         values ($1, $2, 'pass', 20, 5900, $3)`,
        [id, userId, `pi_${id}`],
      );
      return id;
    },
    async setFrozen(userId, frozen) {
      await db.query("update public.profiles set frozen = $2 where id = $1", [
        userId,
        frozen,
      ]);
    },
    async deleteSheet(sheetId) {
      await db.query("delete from public.sheets where id = $1", [sheetId]);
    },
    async close() {
      if (!existing) await db.close();
    },
  };
}
