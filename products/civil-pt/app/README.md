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

### Tests

| Command | What it proves |
|---|---|
| `npm test` | Unit, contract and RLS suites. No service needed: the SQL runs on PGlite (Postgres in WebAssembly). |
| `npm run test:pg` | The same ledger contract and a concurrency suite on a **real** Postgres 16 (`PG_TEST_URL`), where parallel connections really run in parallel (SR-02, T-06). Not part of `npm run check`. |
| `npm run seed` | Regenerates `supabase/seed.sql` from `src/lib/data/fixtures.ts` (a test fails if it is stale). |

A throwaway Postgres 16 for `test:pg` (the sandbox ships the binaries; `initdb` refuses to run as root):

```bash
sudo -u postgres /usr/lib/postgresql/16/bin/initdb -D /var/lib/postgresql/rastoplan-test/data -A trust
sudo -u postgres /usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/rastoplan-test/data \
  -o "-p 54329 -k /var/lib/postgresql/rastoplan-test -c listen_addresses=127.0.0.1" -l /var/lib/postgresql/rastoplan-test/log start
PG_TEST_URL=postgresql://postgres@127.0.0.1:54329/postgres npm run test:pg
```

Each run creates and drops its own database.

## Test mode and adapters

Every capability that needs a founder account sits behind an adapter selected by an environment
variable (`.env.example` lists them all). The defaults are the test-mode choices, so the app
runs with no account:

| Variable | Default (test mode) | Real value | Notes |
|---|---|---|---|
| `DATA_ADAPTER` | `memory` (loads the demo accounts) | `supabase` | the ledger lives in SQL functions (`supabase/migrations`) |
| `STORAGE_ADAPTER` | `memory` | `supabase` | private buckets `uploads` and `geometry` |
| `EMAIL_ADAPTER` | `console` (prints, keeps an outbox) | `resend` | needs `EMAIL_FROM` |
| `AUTH_ADAPTER` / `PAYMENTS_ADAPTER` | `mock` | `supabase` / `stripe` | implemented in slices S-03 / S-07 |

**Production refuses the test adapters**: `src/instrumentation.ts` validates the environment
when the server starts, and every request answers 500 while it is invalid. `next start` always
runs with `NODE_ENV=production`, so local production builds and the e2e suite set
`ALLOW_TEST_ADAPTERS=true` (ignored on a Vercel production deployment). Never set it on a real
deployment.

## Database (`supabase/`)

`migrations/` holds the schema: 20 tables, RLS on every one, column-level grants, the sheet
ledger (lots and reservations) as `SECURITY DEFINER` functions callable by the service role
only, and the storage policies. `tests/shim.sql` stands in for the parts of a Supabase project
the migrations assume (roles, `auth`, `storage`); it is test-only. `seed.sql` is generated.
Apply with `supabase db push --linked` (migrations first, then the app).

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Single source of truth: company, contact, legal, locales, pricing, flags |
| `src/content/{en,pt}.ts` | All UI copy (a key-parity test keeps both locales identical in shape) |
| `src/content/legal/` | Legal documents rendered from `{{placeholders}}` at build time |
| `src/app/tokens.css` | Brand tokens, generated: never edit by hand |
| `src/lib/{core,data,db,storage,email,supabase}` | Foundation: problem+json, structured logger, the data contract (memory and SQL), storage and email adapters |
| `src/lib/env.ts`, `src/instrumentation.ts` | Every variable validated with zod; production boot guard |
| `supabase/` | Migrations, seed, SQL test shim |
| `tests/{unit,contract,rls,pg,e2e}` | Vitest (unit, memory-vs-SQL contract, RLS), real-Postgres suite, Playwright (one e2e file per story from the first product slice on) |

## Product decisions that differ from the starter

- B2B only: `legal.sellsToConsumers` is `false`, so the online withdrawal function does not exist.
- Default locale is `pt`; `en` is the secondary locale.
- Company identity values only the founder knows are the exact token `[A PREENCHER PELO FUNDADOR]`;
  QA and launch fail while it is present.
- Dependencies are pinned to the exact versions in `package.json` (the starter's Next.js 16.4.0
  and zod 4.6.5 have published advisories; see `../docs/05-build.md`, section 8).
