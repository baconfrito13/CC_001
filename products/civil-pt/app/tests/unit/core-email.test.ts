import { describe, expect, it } from "vitest";
import { normalizeEmail, trialEmailHash } from "@/lib/core/email";

describe("normalizeEmail (US-08.6: one trial per normalised email)", () => {
  it.each([
    ["Ana@Example.PT", "ana@example.pt"],
    ["  ana@example.pt  ", "ana@example.pt"],
    ["ana+concurso1@example.pt", "ana@example.pt"],
    ["ana.silva@example.pt", "ana.silva@example.pt"], // dots only matter at Gmail
    ["Ana.Silva+x@gmail.com", "anasilva@gmail.com"],
    ["ana.silva@googlemail.com", "anasilva@gmail.com"],
    ["+tag@example.pt", "+tag@example.pt"], // nothing left of the tag: keep the address
  ])("%s -> %s", (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });

  it("gives the same hash to every spelling of one Gmail address", () => {
    const hashes = new Set(
      ["a.b.c@gmail.com", "abc+1@gmail.com", "ABC@googlemail.com"].map(trialEmailHash),
    );
    expect(hashes.size).toBe(1);
    expect(trialEmailHash("abc@gmail.com")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps different people apart", () => {
    expect(trialEmailHash("ana@example.pt")).not.toBe(trialEmailHash("bruno@example.pt"));
  });
});
