/**
 * `npm run fixtures`: regenerate the small synthetic PDF sheets in fixtures/*.pdf.
 *
 * The files are plain ASCII PDF (no compression), so they are byte-for-byte reproducible and a
 * diff shows exactly what changed. `--check` exits 1 when a committed file is out of date. The
 * large sheets (50 000 and 38 000 elements) are generated in memory by the tests; pass
 * `--large <dir>` to write them to a folder outside the repository for inspection.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  COMMITTED_FIXTURES,
  evenSheet50k,
  poorStyleSheet38k,
} from "../fixtures/sheets.ts";

const outDir = path.join(import.meta.dirname, "../fixtures");
const small = COMMITTED_FIXTURES;

const check = process.argv.includes("--check");
let stale = 0;
for (const [name, build] of Object.entries(small)) {
  const target = path.join(outDir, name);
  const bytes = build();
  if (check) {
    const same = existsSync(target) && Buffer.from(bytes).equals(readFileSync(target));
    if (!same) {
      console.error(`fixtures/${name} is out of date: run \`npm run fixtures\`.`);
      stale++;
    }
  } else {
    writeFileSync(target, bytes);
    console.log(`Wrote fixtures/${name} (${bytes.length} bytes)`);
  }
}
if (check) {
  if (stale > 0) process.exit(1);
  console.log("fixtures/*.pdf are up to date.");
}

const largeAt = process.argv.indexOf("--large");
if (largeAt !== -1) {
  const dir = process.argv[largeAt + 1];
  if (!dir) throw new Error("--large needs a target folder");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "even-50k-6styles.pdf"), evenSheet50k());
  writeFileSync(path.join(dir, "poor-style-38k.pdf"), poorStyleSheet38k());
  console.log(`Wrote the large sheets to ${dir}`);
}
