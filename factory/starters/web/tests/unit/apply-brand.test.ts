import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  BrandTokensError,
  COLOR_KEYS,
  checkContrast,
  contrastRatio,
  parseTokens,
  renderTokensCss,
  run,
} from "../../scripts/apply-brand.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const examplePath = path.join(root, "brand", "tokens.example.json");
const example = JSON.parse(readFileSync(examplePath, "utf8"));

function clone() {
  return structuredClone(example) as Record<string, any>;
}

describe("parseTokens", () => {
  it("accepts the documented example", () => {
    const tokens = parseTokens(example);
    expect(Object.keys(tokens.color.light).sort()).toEqual([...COLOR_KEYS].sort());
    expect(Object.keys(tokens.color.dark).sort()).toEqual([...COLOR_KEYS].sort());
    expect(tokens.radius).toBe("0.75rem");
  });

  it("normalises hex colours to lower-case #rrggbb", () => {
    const input = clone();
    input.color.light.brand = "#ABC";
    input.color.light.accent = "#0F766E";
    const tokens = parseTokens(input);
    expect(tokens.color.light.brand).toBe("#aabbcc");
    expect(tokens.color.light.accent).toBe("#0f766e");
  });

  it("lists every missing key in the error", () => {
    const input = clone();
    delete input.color.light["brand-foreground"];
    delete input.color.dark.card;
    delete input.font.display;
    delete input.radius;
    let error: unknown;
    try {
      parseTokens(input);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(BrandTokensError);
    const message = (error as Error).message;
    expect(message).toContain('missing "color.light.brand-foreground"');
    expect(message).toContain('missing "color.dark.card"');
    expect(message).toContain('missing "font.display"');
    expect(message).toContain('missing "radius"');
  });

  it("reports missing top-level sections", () => {
    expect(() => parseTokens({})).toThrow(/missing "color" object/);
    expect(() => parseTokens({ color: { light: example.color.light } })).toThrow(
      /color\.dark/,
    );
    expect(() => parseTokens(null)).toThrow(/JSON object/);
    expect(() => parseTokens([])).toThrow(/JSON object/);
  });

  it("rejects invalid colours, font stacks and radii", () => {
    const badColor = clone();
    badColor.color.dark.background = "rgb(0,0,0)";
    expect(() => parseTokens(badColor)).toThrow(/color\.dark\.background/);

    const badInjection = clone();
    badInjection.font.sans = "Inter; } body { display: none";
    expect(() => parseTokens(badInjection)).toThrow(/font\.sans/);

    const withVar = clone();
    withVar.font.sans = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
    expect(parseTokens(withVar).font.sans).toBe(withVar.font.sans);
    withVar.font.sans = "var(--x; } body { display: none), serif";
    expect(() => parseTokens(withVar)).toThrow(/font\.sans/);

    const badRadius = clone();
    badRadius.radius = "12";
    expect(() => parseTokens(badRadius)).toThrow(/radius/);
  });
});

describe("renderTokensCss", () => {
  it("defines light tokens on :root and dark tokens under prefers-color-scheme", () => {
    const css = renderTokensCss(parseTokens(example));
    expect(css).toMatch(/:root \{[^}]*--brand: #4f46e5;/);
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{[^}]*--brand: #818cf8;/,
    );
    for (const key of COLOR_KEYS) expect(css).toContain(`--${key}:`);
    expect(css).toContain("--font-sans:");
    expect(css).toContain("--font-display:");
    expect(css).toContain("--radius: 0.75rem;");
  });

  it("is deterministic and matches the committed src/app/tokens.css", () => {
    const css = renderTokensCss(parseTokens(example));
    expect(renderTokensCss(parseTokens(example))).toBe(css);
    expect(readFileSync(path.join(root, "src", "app", "tokens.css"), "utf8")).toBe(css);
  });
});

describe("contrast", () => {
  it("computes WCAG ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it("the default palette passes WCAG AA in light and dark", () => {
    expect(checkContrast(parseTokens(example))).toEqual([]);
  });

  it("flags low-contrast pairs", () => {
    const input = clone();
    input.color.light["muted-foreground"] = "#cccccc";
    const failures = checkContrast(parseTokens(input));
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0]).toMatchObject({ mode: "light", foreground: "muted-foreground" });
  });
});

describe("run (CLI behaviour)", () => {
  let dir: string;
  let out: string;
  let stdout: string[];
  let stderr: string[];
  const io = () => ({
    cwd: dir,
    stdout: (s: string) => stdout.push(s),
    stderr: (s: string) => stderr.push(s),
  });

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "apply-brand-"));
    out = path.join(dir, "out", "tokens.css");
    stdout = [];
    stderr = [];
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("writes tokens.css for valid input", () => {
    const input = path.join(dir, "tokens.json");
    writeFileSync(input, JSON.stringify(example));
    expect(run([input, "--out", out], io())).toBe(0);
    expect(readFileSync(out, "utf8")).toBe(renderTokensCss(parseTokens(example)));
    expect(stdout.join("\n")).toContain("Wrote");
    expect(stderr).toEqual([]);
  });

  it("resolves the input path relative to the working directory", () => {
    writeFileSync(path.join(dir, "tokens.json"), JSON.stringify(example));
    expect(run(["tokens.json", "--out", "css/out.css"], io())).toBe(0);
    expect(readFileSync(path.join(dir, "css", "out.css"), "utf8")).toContain(
      "--brand: #4f46e5;",
    );
  });

  it("fails with a clear message and writes nothing when keys are missing", () => {
    const broken = clone();
    delete broken.color.dark.foreground;
    delete broken.radius;
    const input = path.join(dir, "tokens.json");
    writeFileSync(input, JSON.stringify(broken));
    expect(run([input, "--out", out], io())).toBe(1);
    const message = stderr.join("\n");
    expect(message).toContain('missing "color.dark.foreground"');
    expect(message).toContain('missing "radius"');
    expect(message).toContain("tokens.example.json");
    expect(() => readFileSync(out)).toThrow();
  });

  it("fails on unreadable files, invalid JSON and bad usage", () => {
    expect(run([path.join(dir, "nope.json")], io())).toBe(1);
    expect(stderr.join("\n")).toContain("Cannot read");

    const input = path.join(dir, "bad.json");
    writeFileSync(input, "{ not json");
    expect(run([input], io())).toBe(1);
    expect(stderr.join("\n")).toContain("not valid JSON");

    expect(run([], io())).toBe(2);
    expect(run([input, "--wat"], io())).toBe(2);
    expect(run([input, "--out"], io())).toBe(2);
  });

  it("warns about low contrast and fails with --strict", () => {
    const lowContrast = clone();
    lowContrast.color.light.brand = "#a5b4fc";
    const input = path.join(dir, "tokens.json");
    writeFileSync(input, JSON.stringify(lowContrast));
    expect(run([input, "--out", out], io())).toBe(0);
    expect(stderr.join("\n")).toContain("warning: light brand-foreground on brand");

    stderr.length = 0;
    expect(run([input, "--out", out, "--strict"], io())).toBe(1);
    expect(stderr.join("\n")).toContain("error:");
  });

  it("runs as a real command (npm run brand:apply uses the same entry point)", () => {
    const input = path.join(dir, "tokens.json");
    writeFileSync(input, JSON.stringify(example));
    const ok = spawnSync(
      process.execPath,
      [path.join(root, "scripts", "apply-brand.mjs"), input, "--out", out],
      {
        encoding: "utf8",
      },
    );
    expect(ok.status).toBe(0);
    expect(readFileSync(out, "utf8")).toContain("--brand: #4f46e5;");

    const broken = path.join(dir, "broken.json");
    writeFileSync(broken, JSON.stringify({ color: {} }));
    const fail = spawnSync(
      process.execPath,
      [path.join(root, "scripts", "apply-brand.mjs"), broken],
      {
        encoding: "utf8",
      },
    );
    expect(fail.status).toBe(1);
    expect(fail.stderr).toContain("Invalid brand tokens");
  });
});
