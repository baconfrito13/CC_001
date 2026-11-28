import { createSqlHarness, type Harness } from "../contract/harness";
import { defineStoreContract } from "../contract/ledger.contract";
import { defineWorkspaceContract } from "../contract/workspace.contract";
import { createPgDatabase } from "../support/pg";

// The very same scenarios as memory.test.ts and sql.test.ts, on a real Postgres with a pool of
// real connections: here "parallel" means parallel.
defineStoreContract("real Postgres", async (): Promise<Harness> => {
  const database = await createPgDatabase();
  const harness = await createSqlHarness(database.pool);
  return {
    ...harness,
    label: "postgres",
    async close() {
      await database.close();
    },
  };
});

defineWorkspaceContract("real Postgres", async (): Promise<Harness> => {
  const database = await createPgDatabase();
  const harness = await createSqlHarness(database.pool);
  return {
    ...harness,
    label: "postgres",
    async close() {
      await database.close();
    },
  };
});
