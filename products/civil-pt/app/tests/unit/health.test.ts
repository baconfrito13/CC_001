import { describe, expect, it, vi } from "vitest";
import { GET, HEAD } from "@/app/api/health/route";
import { createLogger, type LogLevel } from "@/lib/core/logger";
import { MemoryDataStore } from "@/lib/data/memory";
import type { DataStore } from "@/lib/data/types";
import { HEALTH_LIMIT, handleHealth } from "@/lib/health";
import pkg from "../../package.json";

const NOW = new Date("2026-03-01T10:00:00.000Z");

function capture() {
  const lines: { level: LogLevel; entry: Record<string, unknown> }[] = [];
  const log = createLogger((level, line) =>
    lines.push({ level, entry: JSON.parse(line) }),
  );
  return { log, lines };
}

const request = (init: RequestInit & { ip?: string } = {}) =>
  new Request("http://localhost/api/health", {
    method: init.method ?? "GET",
    headers: init.ip ? { "x-forwarded-for": init.ip } : {},
  });

const deps = (store: DataStore, log = capture().log) => ({
  store: async () => store,
  now: () => NOW,
  salt: () => "test-salt-0123456789",
  log,
});

describe("GET /api/health", () => {
  it("answers 200 with status, version and the database check only (route wiring)", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      status: "ok",
      version: pkg.version,
      db: "ok",
    });
  });

  it("supports HEAD for monitors that use it, with no body", async () => {
    const response = await HEAD(request({ method: "HEAD" }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});

describe("handleHealth", () => {
  it("returns 503 when the data adapter fails, and logs a code but never the cause", async () => {
    const { log, lines } = capture();
    const store = new MemoryDataStore();
    store.ping = async () => {
      throw Object.assign(
        new Error("connect ECONNREFUSED db.internal password=hunter2"),
        {
          code: "ECONNREFUSED",
        },
      );
    };
    const response = await handleHealth(request(), "1.2.3", deps(store, log));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ status: "degraded", version: "1.2.3", db: "error" });
    expect(JSON.stringify(body)).not.toMatch(/hunter2|ECONNREFUSED|db\.internal/);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      level: "error",
      entry: { msg: "health_check_failed", error_code: "ECONNREFUSED", check: "data" },
    });
    expect(JSON.stringify(lines)).not.toMatch(/hunter2|db\.internal/);
  });

  it("keeps answering when the rate limiter itself is down, and reports the outage", async () => {
    const { log, lines } = capture();
    const store = new MemoryDataStore();
    store.security.rateLimitHit = async () => {
      throw new Error("limiter down");
    };
    const response = await handleHealth(request(), "1.2.3", deps(store, log));
    expect(response.status).toBe(200);
    expect(lines.map((l) => l.entry.msg)).toEqual(["health_rate_limit_unavailable"]);
  });

  it("limits each client to 60 checks a minute with a 429 problem+json and Retry-After", async () => {
    const store = new MemoryDataStore();
    // 45 s into a one-minute window: a blocked client is told to wait the remaining 15 s.
    const d = { ...deps(store), now: () => new Date("2026-03-01T10:00:45.000Z") };
    for (let i = 0; i < HEALTH_LIMIT; i += 1) {
      expect((await handleHealth(request({ ip: "203.0.113.7" }), "1", d)).status).toBe(
        200,
      );
    }
    const blocked = await handleHealth(request({ ip: "203.0.113.7" }), "1", d);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("content-type")).toBe("application/problem+json");
    expect(blocked.headers.get("retry-after")).toBe("15");
    expect(await blocked.json()).toMatchObject({ status: 429, code: "rate_limited" });
    // another client is not affected
    expect((await handleHealth(request({ ip: "203.0.113.8" }), "1", d)).status).toBe(200);
  });

  it("never hands the raw client address to the store: only a keyed hash", async () => {
    const store = new MemoryDataStore();
    const hit = vi.spyOn(store.security, "rateLimitHit");
    await handleHealth(request({ ip: "198.51.100.23" }), "1", deps(store));
    const key = hit.mock.calls[0]?.[0].key ?? "";
    expect(key).toMatch(/^health:[0-9a-f]{16}$/);
    expect(key).not.toContain("198.51.100.23");
  });

  it("is a 503 too when the store cannot even be created", async () => {
    const response = await handleHealth(request(), "1", {
      store: async () => {
        throw new Error("no database configured");
      },
      log: capture().log,
    });
    expect(response.status).toBe(503);
  });
});
