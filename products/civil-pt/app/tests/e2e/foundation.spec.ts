import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * A client address nobody else used in the last minute. The server (and its in-memory rate
 * limiter) outlives test workers and repeated runs, so a per-worker counter would repeat
 * addresses; 24 random bits make a collision practically impossible.
 */
const uniqueIp = () => {
  const octet = () => Math.floor(Math.random() * 256);
  return `10.${octet()}.${octet()}.${octet()}`;
};

/**
 * Slice S-01 (foundation): what is observable from outside the server. The ledger, RLS and the
 * environment rules are covered by the SQL, contract and unit suites; here we prove the pieces
 * that only exist in a running production build: the health route with its database check, the
 * Content-Security-Policy, and the boot refusal of test adapters.
 */

test.describe("S-01: /api/health", () => {
  test("answers 200 with the database check and nothing that reveals configuration", async ({
    request,
  }) => {
    const response = await request.get("/api/health", {
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({
      status: "ok",
      version: expect.stringMatching(/^\d+\.\d+\.\d+/),
      db: "ok",
    });
    const text = JSON.stringify(body).toLowerCase();
    for (const secret of ["memory", "supabase", "adapter", "key", "secret", "postgres"]) {
      expect(text).not.toContain(secret);
    }
  });

  test("HEAD answers 200 with no body", async ({ request }) => {
    const response = await request.head("/api/health", {
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("");
  });

  test("limits one client to 60 checks a minute with a problem+json 429", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": uniqueIp() };
    for (let i = 0; i < 60; i += 1) {
      expect(
        (await request.get("/api/health", { headers })).status(),
        `check ${i + 1}`,
      ).toBe(200);
    }
    const blocked = await request.get("/api/health", { headers });
    expect(blocked.status()).toBe(429);
    expect(blocked.headers()["content-type"]).toBe("application/problem+json");
    expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
    expect(await blocked.json()).toMatchObject({ status: 429, code: "rate_limited" });
    // another client is unaffected
    const other = await request.get("/api/health", {
      headers: { "x-forwarded-for": uniqueIp() },
    });
    expect(other.status()).toBe(200);
  });
});

test.describe("S-01: SR-13 Content-Security-Policy", () => {
  test("lets pdf.js start a worker from a blob and limits connect-src to known services", async ({
    request,
  }) => {
    const csp = (await request.get("/en")).headers()["content-security-policy"] ?? "";
    const directive = (name: string) =>
      csp
        .split("; ")
        .find((part) => part.startsWith(`${name} `))
        ?.slice(name.length + 1)
        .split(" ");
    expect(directive("worker-src")).toEqual(["'self'", "blob:"]);
    expect(directive("frame-ancestors")).toEqual(["'none'"]);
    // this site, the analytics provider the suite configures, and the Supabase project
    expect(directive("connect-src")).toEqual([
      "'self'",
      "https://plausible.io",
      "https://demo-project.supabase.co",
    ]);
    expect(csp).not.toMatch(/\*|unsafe-eval/);
  });

  test("API responses carry the same policy", async ({ request }) => {
    const csp = (
      await request.get("/api/health", { headers: { "x-forwarded-for": uniqueIp() } })
    ).headers()["content-security-policy"];
    expect(csp).toContain("worker-src 'self' blob:");
  });
});

test.describe("S-01: SR-08 test adapters are refused in production", () => {
  // The suite's own server runs with ALLOW_TEST_ADAPTERS=true. A production server started
  // WITHOUT it must not serve anything: Next.js keeps the process up but answers 500 to every
  // request after the boot check (src/instrumentation.ts) fails.
  // One port per Playwright worker, so repeated or parallel runs never fight over it.
  let PORT = 3200;
  let child: ChildProcess | undefined;
  let log = "";

  test.beforeAll(async () => {
    PORT = 3200 + test.info().parallelIndex;
    // The switch the suite's own server uses is left out on purpose.
    const { ALLOW_TEST_ADAPTERS: _switch, ...inherited } = process.env;
    const env = { ...inherited, NODE_ENV: "production" as const, PORT: String(PORT) };
    const server = spawn(
      process.execPath,
      [
        path.join(process.cwd(), "node_modules/next/dist/bin/next"),
        "start",
        "-p",
        String(PORT),
      ],
      { env, stdio: ["ignore", "pipe", "pipe"] },
    );
    child = server;
    server.stdout?.on("data", (chunk) => {
      log += String(chunk);
    });
    server.stderr?.on("data", (chunk) => {
      log += String(chunk);
    });
    await expect
      .poll(() => log, { timeout: 30_000 })
      .toContain("Failed to prepare server");
  });

  test.afterAll(() => {
    child?.kill("SIGKILL");
  });

  test("every route answers 500 and the log names what to fix, the response does not", async ({
    request,
  }) => {
    expect(log).toContain("DATA_ADAPTER=memory: test adapter, not allowed in production");
    expect(log).toContain("AUTH_ADAPTER=mock");
    for (const route of ["/api/health", "/en", "/pt/pricing"]) {
      const response = await request.get(`http://localhost:${PORT}${route}`);
      expect(response.status(), route).toBe(500);
      const body = await response.text();
      expect(body, route).not.toContain("DATA_ADAPTER");
      expect(body, route).not.toContain("adapter");
    }
  });
});
