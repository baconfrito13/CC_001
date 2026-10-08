# Recipe: api

## When to use

`type: api`: the product is an HTTP API consumed by developers or other software (data/enrichment API,
conversion/rendering service, webhook relay, AI wrapper with a stable contract). Customers get API keys,
usage is metered, docs are public. A UI-first product with a thin API → `web-saas.md`. A customer portal
(sign-up, key management, billing) is a second component: `web-saas` in `app/`, the API in `api/`.

## Default stack

| Concern | Choice | Why | Free-tier limits (verify at execution time) |
|---|---|---|---|
| Runtime/framework | Hono 4 on Cloudflare Workers (TypeScript) | Tiny, fast, edge-global, Web-standard APIs | Workers Free: 100k req/day, 10 ms CPU, 50 subrequests |
| Contract | `@hono/zod-openapi` (`OpenAPIHono`, `createRoute`) → `/openapi.json` | One zod schema = validation + docs + types | free |
| Docs UI | `@scalar/hono-api-reference` at `/docs` | Try-it console, themable | free |
| Relational data | D1 (keys, customers, usage rollups) | SQL, migrations, same account | 5M rows read/day, 100k written/day, 5 GB |
| Cache/config | KV (read-heavy: key cache, feature flags) | Global reads | 100k reads/day, **1,000 writes/day** |
| Files | R2 (exports, uploads) | Free egress | 10 GB, 1M class A, 10M class B ops/month |
| Rate limiting | Workers Rate Limiting binding or Durable Object counter | Not KV (write limit) | verify binding config |
| Billing | Stripe Billing Meters (usage) + Checkout/Portal; or MoR with credit packs | Usage-based pricing | Stripe fees: see `stacks/README.md` |
| Errors/logs | `@sentry/cloudflare` + Workers Logs (`observability.enabled`) | Traces + tail | Sentry free 5k errors |
| Tests | Vitest 5 + `@cloudflare/vitest-pool-workers` | Runs in workerd | free |

## Scaffold

```bash
npm create cloudflare@latest api -- --framework=hono --lang=ts --no-deploy --no-git --no-open --no-agents < /dev/null
# (run inside products/<slug>/; verified 2026-10-08: creates src/index.ts, wrangler.jsonc, package.json)
cd api && npm i zod@latest @hono/zod-openapi@latest @scalar/hono-api-reference@latest @sentry/cloudflare@latest
npm i -D typescript vitest@latest @cloudflare/vitest-pool-workers@latest @biomejs/biome@latest
npx wrangler types --env-interface CloudflareBindings        # regenerate after every binding change
npx wrangler d1 create <slug>-db                              # prints binding JSON → wrangler.jsonc "d1_databases"
```

If the CLI cannot reach its template source, `npm init -y && npm i hono wrangler` and write `src/index.ts`,
`wrangler.jsonc` (`"name"`, `"main"`, `"compatibility_date"` = today, `"compatibility_flags": ["nodejs_compat"]`) by hand.
Add `lint`, `typecheck` (`tsc --noEmit`), `test`, `check` scripts equal to the web starter's names so CI and `05-build` stay uniform.
Generators change flags often: run `npm create cloudflare@latest -- --help` first.

## Project structure

```
products/<slug>/api/
├── src/index.ts                  OpenAPIHono app, middleware order: requestId → secureHeaders → cors → auth → rateLimit → routes
├── src/routes/v1/*.ts            one file per resource; createRoute() with zod request/response + error schemas
├── src/middleware/{apiKey,rateLimit,problem,idempotency}.ts
├── src/lib/{keys,usage,stripe,env}.ts   env validated with zod from c.env
├── src/scheduled.ts              cron: flush usage → Stripe meter events, purge expired
├── migrations/*.sql              wrangler d1 migrations
├── test/*.test.ts · openapi.json (generated, committed) · wrangler.jsonc
└── .dev.vars.example             local secrets, never .dev.vars
```

## Auth

- Machine auth = API keys: `Authorization: Bearer sk_live_<prefix>_<secret>` (never in query strings). Generate 32 random bytes
  (`crypto.getRandomValues`), show the full key **once**, store `prefix`, `last4`, `sha256(secret + PEPPER)` (high-entropy keys do not need
  bcrypt, which would also blow the 10 ms CPU budget), `scopes`, `created_at`, `revoked_at`, `last_used_at`. Lookup by prefix, compare in constant time.
- Test keys `sk_test_…` hit sandbox data and never bill. Scopes per route (`read`, `write`, `admin`). Per-key rate limit + monthly quota by plan.
- Human/portal auth is the portal's job (`web-saas`); portal ↔ API through `/internal/*` protected by a service secret (`INTERNAL_SECRET`) or Cloudflare Access, never public.
- CORS: allow-list per customer origin only if browser use is a PRD story; default server-to-server only.

## Data

D1 tables: `customers`, `api_keys`, `usage_events` (or hourly rollups `usage_hourly(customer_id, hour, route, count)`), `webhook_endpoints`,
`idempotency_keys`. Migrations: `npx wrangler d1 migrations create <slug>-db <name>` / `… apply <slug>-db --local|--remote`.
Write budget: D1 free tier allows 100k writes/day: do **not** write one row per request beyond ~50k req/day; aggregate in a Durable Object or
buffer and flush in `scheduled()`. Pagination = opaque cursors; errors = RFC 9457 `application/problem+json`; versioning = `/v1` prefix; `Idempotency-Key` on POST.
Exports (R2) expire via lifecycle rules. PII minimal: IPs hashed with a daily salt.

## Payments

Stripe Billing Meters: create a meter (`stripe.billing.meters.create`, `event_name: 'api_requests'`, `default_aggregation.formula: 'sum'`), a price with
metered usage linked to the meter, subscribe the customer via Checkout. Report with `stripe.billing.meterEvents.create({ event_name, payload: { stripe_customer_id, value }, identifier })`
from the cron flush; `identifier` = deterministic hash of customer + hour for idempotency. Verify the Stripe v23 API shape and the Workers fetch client
(`Stripe.createFetchHttpClient()`) in the installed package types. Alternative: prepaid credit packs through an MoR (webhook adds credits; the API decrements).
Free plan: N requests/month, no card. Flag `BILLING_LIVE=false` → usage is recorded, nothing is sent to Stripe.

## Email

Transactional only (key created, quota 80%/100%, payment failed) via Resend HTTP API from the Worker (`fetch`); `EMAIL_ADAPTER=resend|console`.

## Analytics & monitoring

Workers Logs on; structured JSON logs (`requestId`, `customerId`, `route`, `status`, `latencyMs`; no bodies/keys). `@sentry/cloudflare` `withSentry`.
Product metrics from `usage_hourly`: active keys, requests, p95 latency, error rate, signup→first-call time (activation). Public `/health` and `/v1/status`.
Uptime monitor on `/health` (founder task for the account).

## Testing

- Unit/integration in workerd (`@cloudflare/vitest-pool-workers`; check the package README for the config shape that matches Vitest 5): every route
  success, 400 validation, 401 missing key, 403 wrong scope, 404, 429, idempotent replay, key rotation/revocation.
- Contract: generate `openapi.json` in CI and fail on diff; lint with `npx @redocly/cli lint openapi.json`. Examples in the spec are executed as tests.
- Load smoke: `npx autocannon -c 20 -d 15 <preview-url>/health` — p99 < 300 ms; no 5xx.
- Security (`06-qa`): key brute-force throttling, SSRF if the API fetches URLs (block private ranges), request size limits, auth bypass on `/internal/*`.

## Deploy

```bash
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID           # from the environment, never from chat
npx wrangler d1 migrations apply <slug>-db --remote
for s in STRIPE_SECRET_KEY INTERNAL_SECRET KEY_PEPPER RESEND_API_KEY SENTRY_DSN; do printf %s "${!s}" | npx wrangler secret put "$s"; done
npx wrangler deploy --dry-run && npx wrangler deploy         # Worker URL https://<name>.<subdomain>.workers.dev
npx wrangler tail --format pretty                            # logs while smoke testing
```

Custom domain: add `"routes": [{ "pattern": "api.<domain>", "custom_domain": true }]` to `wrangler.jsonc` (zone on the founder's Cloudflare account). Staging: a second Worker name or `--env staging`.
Rollback: `npx wrangler rollback`. Docs site: `/docs` on the same Worker, marketing site from `web-static` on `<domain>`.

## Costs

| Users (customers) | Monthly estimate (verify prices) |
|---|---|
| 0 | €0 (Workers Free) + domain |
| 100 (~1M req/month) | Workers Paid ~$5 (verify; Free's 100k req/day may suffice) + Stripe fees |
| 10,000 customers (~200M req/month) | ~$5 + request/CPU overage + D1 rows + R2 (low tens to low hundreds of $); Stripe fees dominate |

## Gotchas

- Free Workers CPU limit is 10 ms/request: no heavy crypto/parsing; use `ctx.waitUntil` for non-critical work.
- KV writes (1,000/day free) make it useless for counters; D1 writes (100k/day) cap per-request logging.
- `nodejs_compat` is required for some Node APIs (Stripe, Buffer); avoid Node-only dependencies.
- D1 is regional-primary: read replication/sessions API needed for global read-after-write (verify).
- Never log `Authorization` headers; Sentry `beforeSend` must scrub them.
- Wrangler is moving fast (`wrangler.jsonc` is the default; `types` must be regenerated after binding edits).
