import { describe, expect, it } from "vitest";
import { defaultNext, safeNext } from "@/lib/auth/redirect";

describe("safeNext (T-14, SR-14)", () => {
  it("T-14: keeps a relative path inside the signed-in area", () => {
    for (const ok of [
      "/pt/app",
      "/pt/app/projetos",
      "/en/app/projetos/3f2a1c9e-0000-4000-8000-000000000001",
      "/pt/precos",
      "/pt/pricing?plan=pass-60",
      "/pt/app/projetos?x=1&y=2",
    ]) {
      expect(safeNext(ok, "pt"), ok).toBe(ok);
    }
  });

  it("T-14: falls back to the default for anything else", () => {
    const hostile = [
      "https://evil.example",
      "http://evil.example/pt/app",
      "//evil.example",
      "//evil.example/pt/app",
      "/\\evil.example",
      "/pt/app/..%2F..%2Fadmin",
      "/pt/app/../../admin",
      "%2F%2Fevil.example",
      "javascript:alert(1)",
      "pt/app",
      "/pt/legal/privacy",
      "/xx/app",
      "/pt/app\r\nSet-Cookie: a=b",
      "/pt/app\u0000",
      "/pt/app/%",
      `/pt/app/${"a".repeat(600)}`,
      "",
    ];
    for (const next of hostile) {
      expect(safeNext(next, "pt"), JSON.stringify(next)).toBe("/pt/app");
    }
    expect(safeNext(undefined, "en")).toBe("/en/app");
    expect(safeNext(null, "en")).toBe("/en/app");
    expect(defaultNext("pt")).toBe("/pt/app");
  });
});
