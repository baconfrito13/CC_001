import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("vercel.json (ADR 0002: functions next to the database)", () => {
  const raw: unknown = JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../../vercel.json"), "utf8"),
  );
  const config = z
    .object({
      regions: z.array(z.string()),
      crons: z.array(z.object({ path: z.string(), schedule: z.string() })).optional(),
    })
    .passthrough()
    .parse(raw);

  it("pins the functions to Frankfurt (fra1), the region of the Supabase project", () => {
    expect(config.regions).toEqual(["fra1"]);
  });

  it("runs the maintenance route every minute (dead uploads are removed within 10 minutes; Vercel sends CRON_SECRET)", () => {
    // Replaces the S-01 expectation "no cron yet": the route exists since slice S-03 (US-02.4).
    expect(config).toHaveProperty("crons");
    expect(config.crons).toEqual([
      { path: "/api/cron/maintenance", schedule: "* * * * *" },
    ]);
  });
});
