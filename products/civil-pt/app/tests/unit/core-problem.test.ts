import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError, problem, toProblem } from "@/lib/core/problem";

async function body(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("problem+json", () => {
  it.each([
    [400, "invalid_request", "Bad Request"],
    [401, "unauthorized", "Unauthorized"],
    [403, "forbidden", "Forbidden"],
    [404, "not_found", "Not Found"],
    [429, "rate_limited", "Too Many Requests"],
    [500, "internal", "Internal Server Error"],
  ] as const)("%i has the RFC 9457 shape", async (status, code, title) => {
    const response = problem(status, code);
    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await body(response)).toEqual({ type: "about:blank", title, status, code });
  });

  it("adds detail and extra headers when given", async () => {
    const response = problem(429, "rate_limited", {
      detail: "Try again later.",
      headers: { "Retry-After": "30" },
    });
    expect(response.headers.get("retry-after")).toBe("30");
    expect((await body(response)).detail).toBe("Try again later.");
  });

  it("maps a thrown AppError to its status and code", async () => {
    const response = toProblem(new AppError(404, "not_found"));
    expect(response.status).toBe(404);
    expect((await body(response)).code).toBe("not_found");
  });

  it("maps a ZodError to 400 with paths and rules but never the rejected value", async () => {
    const parsed = z.object({ email: z.email() }).safeParse({ email: "secret-value" });
    if (parsed.success) throw new Error("expected a validation error");
    const response = toProblem(parsed.error);
    expect(response.status).toBe(400);
    const json = await body(response);
    expect(json.code).toBe("invalid_request");
    expect(json.errors).toEqual([{ path: "email", message: expect.any(String) }]);
    expect(JSON.stringify(json)).not.toContain("secret-value");
  });

  it("hides everything about an unexpected error", async () => {
    const response = toProblem(new Error("connect ECONNREFUSED db.internal:5432 password=hunter2"));
    expect(response.status).toBe(500);
    expect(await body(response)).toEqual({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      code: "internal",
    });
  });
});
