import { describe, expect, it } from "vitest";
import { GET, HEAD } from "@/app/api/health/route";
import pkg from "../../package.json";

describe("GET /api/health", () => {
  it("answers 200 with status and version only", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok", version: pkg.version });
  });

  it("supports HEAD for monitors that use it", () => {
    expect(HEAD().status).toBe(200);
  });
});
