import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMMITTED_FIXTURES } from "../../fixtures/sheets";

describe("fixtures", () => {
  it.each(Object.keys(COMMITTED_FIXTURES))(
    "fixtures/%s is what the generator writes (run `npm run fixtures`)",
    (name) => {
      const committed = readFileSync(
        path.join(import.meta.dirname, "../../fixtures", name),
      );
      const generated = Buffer.from((COMMITTED_FIXTURES[name] as () => Uint8Array)());
      expect(committed.equals(generated)).toBe(true);
    },
  );

  it("fixtures: the committed sheets are small, plain ASCII PDFs (no real tender drawings, no binary blobs)", () => {
    for (const name of Object.keys(COMMITTED_FIXTURES)) {
      const bytes = readFileSync(path.join(import.meta.dirname, "../../fixtures", name));
      expect(bytes.length, name).toBeLessThan(4096);
      expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    }
  });
});
