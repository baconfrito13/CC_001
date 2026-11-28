# Rastoplan (app)

Quantity takeoff from vector PDF plans, with a trace from every quantity back to the sheet.
Portuguese market (pt-PT, EUR) with an English interface. Product docs: `../docs/` (the build
status, run instructions, flags and environment variables are in `../docs/05-build.md`, in
Portuguese).

Built on the factory's web starter (Next.js 16, React 19, Tailwind 4, Biome, Vitest,
Playwright + axe). Everything runs in **test mode** with no external account: adapters default to
`memory`/`mock`/`console` and are refused in production.

## Run

```bash
npm ci
cp .env.example .env.local        # every variable is optional in test mode
npm run dev                       # http://localhost:3000
```

## Checks

```bash
npm run check                                                  # lint + typecheck + unit tests + production build
CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e       # Playwright + axe against a production build on :3100
npm run brand:apply -- ../brand/tokens.json                    # regenerate src/app/tokens.css from the brand tokens
```

Leave `CHROMIUM_PATH` unset where Playwright's own Chromium is installed (CI).

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Single source of truth: company, contact, legal, locales, pricing, flags |
| `src/content/{en,pt}.ts` | All UI copy (a key-parity test keeps both locales identical in shape) |
| `src/content/legal/` | Legal documents rendered from `{{placeholders}}` at build time |
| `src/app/tokens.css` | Brand tokens, generated: never edit by hand |
| `tests/unit`, `tests/e2e` | Vitest and Playwright (one e2e file per story from the first product slice on) |

## Product decisions that differ from the starter

- B2B only: `legal.sellsToConsumers` is `false`, so the online withdrawal function does not exist.
- Default locale is `pt`; `en` is the secondary locale.
- Company identity values only the founder knows are the exact token `[A PREENCHER PELO FUNDADOR]`;
  QA and launch fail while it is present.
- Dependencies are pinned to the exact versions in `package.json` (the starter's Next.js 16.4.0
  and zod 4.6.5 have published advisories; see `../docs/05-build.md`, section 8).
