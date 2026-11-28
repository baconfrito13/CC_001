/**
 * `npm run seed`: regenerate supabase/seed.sql from the demo fixtures.
 *
 * The same fixtures feed the in-memory store (DATA_ADAPTER=memory), so test mode and a local
 * Supabase project show the same demo accounts. Apply the file to a LOCAL or PREVIEW project
 * with `supabase db reset` (migrations, then the seed). `--check` exits 1 when the committed
 * file is out of date instead of writing it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DEMO_TRIAL_DAYS,
  DEMO_TRIAL_SHEETS,
  demoFixtures,
} from "../src/lib/data/fixtures.ts";
import { renderSeedSql } from "../src/lib/db/seed-sql.ts";

const target = path.join(import.meta.dirname, "../supabase/seed.sql");
const sql = renderSeedSql(demoFixtures, {
  sheets: DEMO_TRIAL_SHEETS,
  days: DEMO_TRIAL_DAYS,
});

if (process.argv.includes("--check")) {
  const current = readFileSync(target, "utf8");
  if (current !== sql) {
    console.error("supabase/seed.sql is out of date: run `npm run seed`.");
    process.exit(1);
  }
  console.log("supabase/seed.sql is up to date.");
} else {
  writeFileSync(target, sql);
  console.log(
    `Wrote supabase/seed.sql: ${demoFixtures.users.length} accounts, ` +
      `${demoFixtures.projects.length} projects, ${demoFixtures.sheets.length} sheets, ` +
      `${demoFixtures.lots.length} lots (plus one trial lot per account).`,
  );
}
