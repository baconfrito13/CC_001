import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * `npm run test:pg`: the SQL suites against a REAL Postgres (`PG_TEST_URL`), where connections
 * truly run in parallel. PGlite is one connection, so it cannot prove that the ledger holds
 * under concurrent requests (SR-02, T-06); this suite can. It is not part of `npm test`
 * because it needs a server; the README shows how to start a throwaway Postgres 16.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "tests/support/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/pg/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
