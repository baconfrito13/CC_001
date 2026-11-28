import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("vercel.json (ADR 0002: functions next to the database)", () => {
  const raw: unknown = JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../../vercel.json"), "utf8"),
  );
  const config = z
    .object({ regions: z.array(z.string()) })
    .passthrough()
    .parse(raw);

  it("pins the functions to Frankfurt (fra1), the region of the Supabase project", () => {
    expect(config.regions).toEqual(["fra1"]);
  });

  it("does not schedule a cron yet: the routes it would call arrive in slices S-04 and S-08", () => {
    expect(config).not.toHaveProperty("crons");
  });
});
