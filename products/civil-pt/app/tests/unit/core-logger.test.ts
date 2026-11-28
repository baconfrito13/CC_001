import { describe, expect, it } from "vitest";
import { hmacRef } from "@/lib/core/hash";
import { createLogger, errorCode, type LogLevel } from "@/lib/core/logger";

function capture() {
  const lines: { level: LogLevel; entry: Record<string, unknown> }[] = [];
  const logger = createLogger(
    (level, line) => lines.push({ level, entry: JSON.parse(line) }),
    () => new Date("2026-11-28T12:00:00.000Z"),
  );
  return { logger, lines };
}

describe("logger (SR-09: never emits email, project or file names)", () => {
  it("writes one JSON object with level, timestamp and message", () => {
    const { logger, lines } = capture();
    logger.info("sheet_processed", {
      route: "/api/sheets",
      duration_ms: 1200,
      sheet_id: "s1",
    });
    expect(lines).toEqual([
      {
        level: "info",
        entry: {
          level: "info",
          ts: "2026-11-28T12:00:00.000Z",
          msg: "sheet_processed",
          route: "/api/sheets",
          duration_ms: 1200,
          sheet_id: "s1",
        },
      },
    ]);
  });

  it("drops every field that is not on the allow-list", () => {
    const { logger, lines } = capture();
    const unsafe = {
      route: "/api/projects",
      email: "ana@example.pt",
      project_name: "Moradia do Sr. Silva",
      file_name: "planta-piso-0.pdf",
      pdf_text: "ESC. 1/100",
      user_ref: "a1b2c3",
    };
    logger.warn("upload_rejected", unsafe);
    const text = JSON.stringify(lines);
    expect(text).not.toContain("ana@example.pt");
    expect(text).not.toContain("Moradia");
    expect(text).not.toContain("planta-piso-0");
    expect(text).not.toContain("ESC.");
    expect(lines[0]?.entry).toMatchObject({ route: "/api/projects", user_ref: "a1b2c3" });
  });

  it("redacts an email that slips into an allowed field or the message", () => {
    const { logger, lines } = capture();
    logger.error("failed for ana@example.pt", { error_code: "ana@example.pt" });
    expect(JSON.stringify(lines)).not.toContain("ana@example.pt");
  });

  it("uses the right level for each call", () => {
    const { logger, lines } = capture();
    logger.debug("a");
    logger.info("b");
    logger.warn("c");
    logger.error("d");
    expect(lines.map((l) => l.level)).toEqual(["debug", "info", "warn", "error"]);
  });
});

describe("errorCode", () => {
  it("prefers a short stable code, then the error name, never the message", () => {
    expect(
      errorCode(Object.assign(new Error("boom for ana@example.pt"), { code: "23505" })),
    ).toBe("23505");
    expect(errorCode(new TypeError("secret"))).toBe("TypeError");
    expect(errorCode("not an error")).toBe("unknown");
    expect(errorCode(Object.assign(new Error("x"), { code: "has spaces and @" }))).toBe(
      "Error",
    );
  });
});

describe("hmacRef", () => {
  it("is stable, salted and short", () => {
    expect(hmacRef("user-1", "salt-a")).toBe(hmacRef("user-1", "salt-a"));
    expect(hmacRef("user-1", "salt-a")).not.toBe(hmacRef("user-1", "salt-b"));
    expect(hmacRef("user-1", "salt-a")).not.toBe(hmacRef("user-2", "salt-a"));
    expect(hmacRef("user-1", "salt-a")).toMatch(/^[0-9a-f]{16}$/);
    expect(hmacRef("user-1", "salt-a", 8)).toHaveLength(8);
  });
});
