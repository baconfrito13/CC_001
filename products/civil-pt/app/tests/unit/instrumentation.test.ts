import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * SR-08 / T-10 at boot: `register()` is what Next.js runs before the first request. With a test
 * adapter in production it must throw, so the server does not start.
 */

async function boot() {
  vi.resetModules();
  const { register } = await import("@/instrumentation");
  return register();
}

describe("boot check (src/instrumentation.ts)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NEXT_PHASE", "");
    for (const name of [
      "DATA_ADAPTER",
      "STORAGE_ADAPTER",
      "AUTH_ADAPTER",
      "EMAIL_ADAPTER",
      "PAYMENTS_ADAPTER",
      "WAITLIST_ADAPTER",
      "ALLOW_TEST_ADAPTERS",
      "VERCEL_ENV",
      "CRON_SECRET",
      "HASH_SALT",
    ]) {
      vi.stubEnv(name, "");
    }
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("SR-08: refuses to boot with the default test adapters in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(boot()).rejects.toThrow(
      /DATA_ADAPTER=memory.*not allowed in production/s,
    );
  });

  it("names every offending adapter, so the fix is one edit", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const error = await boot().catch((e: Error) => e);
    for (const name of [
      "DATA_ADAPTER",
      "STORAGE_ADAPTER",
      "AUTH_ADAPTER",
      "EMAIL_ADAPTER",
      "PAYMENTS_ADAPTER",
    ]) {
      expect((error as Error).message).toContain(name);
    }
  });

  it("boots in development and test with the defaults", async () => {
    for (const nodeEnv of ["development", "test"]) {
      vi.stubEnv("NODE_ENV", nodeEnv);
      await expect(boot()).resolves.toBeUndefined();
    }
  });

  it("boots a production build in CI with the explicit switch, but never on Vercel production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_TEST_ADAPTERS", "true");
    await expect(boot()).resolves.toBeUndefined();
    vi.stubEnv("VERCEL_ENV", "production");
    await expect(boot()).rejects.toThrow(/ALLOW_TEST_ADAPTERS/);
  });

  it("does nothing outside the Node.js runtime", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_RUNTIME", "edge");
    await expect(boot()).resolves.toBeUndefined();
  });
});
