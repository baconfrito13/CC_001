import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // `server-only` throws outside a React Server Components build: stub it for unit tests.
      "server-only": path.resolve(import.meta.dirname, "tests/support/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    // unit: pure logic; contract: memory vs SQL; rls: row level security on PGlite;
    // engine: the pure measurement engine (pdfjs-dist, synthetic PDF fixtures).
    include: ["tests/{unit,contract,rls,engine}/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    // PGlite boots a WASM Postgres per file: give the first query room on a busy machine.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
