# 04 · Architecture (`architecture`)

> **Owner:** `solution-architect` · **Inputs:** `docs/02-product.md` (PRD), `docs/02-business.md`, `docs/01-research.md` (risks), `docs/03-brand.md` (optional, runs in parallel), `product.json`, `FOUNDER.md`, `factory/stacks/` · **Outputs:** `docs/04-architecture.md` (template `factory/templates/architecture.md`), `docs/adr/0001-*.md` … (template `factory/templates/adr.md`), `product.json` `stack.*` · **Gate:** Definition of Done "architecture" in `factory/PIPELINE.md` (stack from `factory/stacks/` or justified ADR; data model; integrations; hosting; cost at 0 / 100 / 10k users; threat model; observability; ADRs)

## Objective

Turn the PRD and business model into a design the builder can execute without asking questions:
the right recipe, a data model with access rules, an API surface, an auth model, integrations with
test-mode substitutes, environments, a costed bill of materials, a threat model, and the personal-data
map that `legal` needs. Cheapest thing that works, secure by default, EU-resident by default.

## Before you start

1. Read `CLAUDE.md`, `FOUNDER.md` (budget, risk appetite, `go_live`), `factory/LEARNINGS.md`, `factory/stacks/README.md` and the candidate recipe(s).
2. Read `products/<slug>/docs/02-product.md` (must/should/won't, story ids, NFRs), `docs/02-business.md` (pricing, ARPU, cost model, 12-month projection), risks in `docs/01-research.md`. Brand runs in parallel: you only need name, locales and tone.
3. Run `python3 factory/scripts/factory.py doctor` to learn which tokens/tools exist (decides what can be provisioned now vs. test mode + founder task).
4. Rule zero: never trust remembered versions, prices or APIs. `npm view <pkg> version`, fetch pricing pages (WebFetch) and record URL + access date for every number.
5. Depth comes from `product.json` `depth`; if unset use `standard`.

## Procedure

### Step 1 — Extract architecture drivers

Write the drivers table (feeds §2 of the document). One row per item with the PRD source (story id/section):

| Driver | Question | Default if the PRD is silent |
|---|---|---|
| Type & platforms | `product.json` type; web/iOS/Android/browser/chat | from `type` |
| Locales & markets | languages, countries, currencies | `en` + `pt-PT`, EU, EUR |
| Accounts & roles | who signs in, roles, teams? | none unless a must-story needs it |
| Personal data | categories; **special categories or children → stop** (set status `needs-founder`, write why) | email only |
| Money | payment model, who is merchant of record, currencies | MoR, EUR |
| AI | which features call an LLM, expected tokens/request | none |
| Scale (12 months) | users, requests/day, data size, from `02-business` projection | 1k users, 10 req/user/day, < 1 GB |
| Availability & latency | uptime target, p95 | 99.5%, API p95 ≤ 300 ms, LCP ≤ 2.5 s |
| Budget ceiling | infra € per month pre-revenue and at 100 paying users | ≤ €50 pre-revenue; infra + AI ≤ 30% of revenue |
| Compliance flags | health/finance/legal claims, minors, biometric | none → else ADR + escalate |

### Step 2 — Choose the recipe

1. Apply the ordered decision list in `factory/stacks/README.md` §2; hybrids get a main recipe plus `stack.components`.
2. Record: `python3 factory/scripts/factory.py set <slug> stack.recipe web-saas` (also `stack.app_dir`, `stack.components`, `stack.hosting`, `stack.payments`, `stack.database`, `stack.auth`).
3. For every place the PRD cannot be met by the recipe default, score ≥ 2 options 1–5 on: meets story · cost at 10k users · time to build · lock-in/exit cost · EU residency · maintenance/health (last release, downloads). Pick the highest total; ties go to the recipe default. Each deviation = one ADR (Step 16). Reasons not allowed: novelty, preference.
4. Check the hosting licence rule: Vercel Hobby is non-commercial; a monetized product needs Pro or Cloudflare (`stacks/README.md`).

### Step 3 — Component map and diagram

List components (web app, API, DB, storage, auth, email, payments, analytics, errors, AI, jobs, CDN/DNS) with owner (factory-provisioned vs founder-provisioned 💳). Draw a mermaid `flowchart LR` with subgraphs for client, edge/hosting, backend/data, third parties; label arrows with protocol and data class; mark trust boundaries. Keep ≤ 15 nodes; split into two diagrams otherwise.

### Step 4 — Data model

1. Entities from PRD nouns; attributes with type, nullability, **PII flag**; relationships; ownership column (`user_id`, or `org_id` + membership only if teams are a must-story).
2. Conventions: UUID primary keys, `created_at`/`updated_at` `timestamptz` UTC, money as integer minor units + ISO currency, enums as text + CHECK, hard delete by default (soft delete only when a story needs undo), per-locale content in separate columns/tables, indexes for the top-5 queries.
3. Output a mermaid `erDiagram`, an entity table, and for Postgres/Supabase an **access-rule table** (table × select/insert/update/delete × who × rationale). Every table has RLS enabled; "public read" must be justified.
4. Plan migrations (timestamped SQL in git), seed/demo data, and the GDPR hooks (export, delete cascade, retention job). Non-database types (static, extension, local-first mobile): document the local storage schema and say "no server data" explicitly.

### Step 5 — API surface and contracts

Table: Method + path (or server action / bot command / extension message) · purpose · story id · auth · input schema (zod name) · output · rate limit · idempotency · notes. Include inbound webhooks (signature scheme) and outbound webhooks. Fix conventions: JSON errors as RFC 9457 problem details, `/v1` versioning for public APIs, pagination by cursor, idempotency keys on POST that move money or send email. `api` type: also the OpenAPI plan (generated from zod, committed).

### Step 6 — Authentication and authorization

Identity provider and flows (OTP/magic link, OAuth, passkeys), session mechanism and lifetime, MFA decision, account recovery, roles and a permission matrix (role × resource × action), admin access path, service-to-service secrets, abuse controls (rate limit, CAPTCHA threshold), and where each rule is **enforced** (DB policy, route handler, UI is never enforcement).

### Step 7 — Integrations and test-mode plan

| Service | Purpose | Tier & cost | Env vars | Founder task? | Test-mode substitute | Failure behaviour |
|---|---|---|---|---|---|---|

Every integration needing a founder account gets: a feature flag, an adapter with a `console`/`mock`/`memory` implementation so the app runs fully without it, and an entry for `HUMAN_TASKS.md` (draft text in the hand-off). Keep ≤ 8 external services in the MVP; each one adds a failure mode, a DPA and a bill.

### Step 8 — Hosting, environments, CI/CD

1. Environments: **local** (memory/mock adapters), **preview** (per branch/PR, isolated data, `noindex`, never the production DB), **production**. Table of env vars × environment × secret?. Domains, regions (EU, same region for app and DB).
2. Deploy flow per recipe (CLI commands with token variables from the recipe), rollback method, DB migration strategy (expand → deploy → contract; migrations before app).
3. CI: `npm ci`, lint, typecheck, unit, e2e, build, `npm audit --omit=dev`, secret scan; path-filtered to `products/<slug>/**`.

### Step 9 — Cost model

For each line item (hosting, DB, storage, email, analytics, monitoring, AI tokens, payment fees, domain, store fees) fetch the current price page, then compute monthly cost at **0 / 100 / 10,000 users** with stated assumptions (active ratio, requests per user, data per user, conversion, ARPU from `02-business`). Separate fixed vs variable, give variable cost per user, list **free-tier cliffs** ("first thing that breaks: Supabase pause at 1 week idle, Workers 100k req/day"). Decision rules: variable infra + AI cost > 30% of ARPU (AI > 25%) → cache, cheaper model, quotas, or flag for repricing in a note to `product-strategist`; fixed cost pre-revenue > ceiling → cut or defer. Mark every figure "verify at execution time" with URL and date.

### Step 10 — Threat model (STRIDE-lite)

1. List assets (accounts, payment state, personal data, secrets, content, compute/AI budget), entry points (UI, API, webhooks, uploads, admin, prompts, supply chain, CI) and trust boundaries from the diagram.
2. Per entry point walk S-T-R-I-D-E and write only credible threats. Table: ID · asset/entry · STRIDE letter · threat · likelihood × impact (L/M/H) · design mitigation · verified by (QA test id or checklist item in `factory/checklists/security.md`).
3. Minimum set: broken access control/IDOR, webhook forgery/replay, secret leakage, injection (SQL/XSS/prompt), account takeover, payment/entitlement bypass, cost-exhaustion abuse (economic DoS), PII in logs/analytics, dependency/supply-chain compromise, mock/test adapters reachable in production.
4. Convert each H/M threat into a **security requirement** line the builder must satisfy.

### Step 11 — Observability and operations

Structured logs (fields, no PII/secrets), error tracking, **event dictionary** (name · properties · trigger · consent class) derived from PRD success metrics, uptime/synthetic checks (`/api/health`), alerts with thresholds and recipient (founder email), cost alerts (provider spend limits), SLOs, and seeds for the `09-launch` runbook (deploy, rollback, rotate secret, restore, incident template).

### Step 12 — Backups, recovery, retention

Per datastore: mechanism, frequency, **RPO/RTO** (defaults: RPO 24 h / RTO 4 h; deep with paid plan: RPO ≤ 1 h via point-in-time recovery), restore procedure and who tests it, retention per data class (logs 30 d, analytics 14 months max, user data until deletion + 30 d backup lag), account-deletion semantics.

### Step 13 — Personal-data map (feeds `legal`)

Table: data category · examples · source · purpose · suggested legal basis (legal decides) · stored where (service, region) · processor · transfer outside EEA + mechanism · retention · export/delete mechanism. Add: tracker/cookie inventory (name, purpose, provider, duration, consent needed), draft subprocessor list (name, service, region, DPA link), flags for special categories, minors, AI processing (provider, training use, retention). `legal` consumes this for RoPA, subprocessors, privacy and cookie policies, so omissions here become compliance bugs later.

### Step 14 — Scalability limits and growth triggers

Table: component · current limit (cited) · metric and trigger (act at 70% of limit) · action · cost delta. Include performance budgets and the architecture's first bottleneck at ~10× load, with the cheapest remedy.

### Step 15 — Build plan for `05-build`

1. Walking skeleton definition (landing + health + one authenticated round trip in test mode).
2. Work packages `WP-01…`: scope, story ids, directories owned (disjoint between packages so builders can run in parallel), dependencies, size (≤ 1 day of agent work).
3. Feature flags and env vars list, seed data plan, test strategy per layer, and **spikes**: time-boxed (≤ 1 h) validation of the riskiest unknown (scaffolder runs, critical library works with current versions, webhook signature check). Run them now when cheap and record results.

### Step 16 — ADRs

Write `docs/adr/NNNN-<slug>.md` from `factory/templates/adr.md`: context, options (≥ 2, with cost), decision, consequences, revisit trigger. Mandatory: `0001-stack-recipe` (recipe + every deviation), hosting/region, auth+database, payments model, analytics/consent, AI provider/model policy (ai-app), and any choice that contradicts a default in `factory/stacks/`. Accepted ADRs are immutable; change = new ADR that supersedes.

### Step 17 — Review and finish

1. Self-check against the Definition of Done below.
2. standard/deep: spawn `devils-advocate` with the document and "name the five weakest decisions, with evidence"; deep also `security-auditor` on the threat model. Fix or answer each objection in an ADR "consequences" line.
3. `python3 factory/scripts/factory.py set-phase <slug> architecture done --summary "<recipe>; <cost@100>; <top risk>"` then `factory.py validate <slug>`. The orchestrator commits `<slug>: architecture — …`.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Recipe & alternatives | recipe only, no comparison | deviation scoring only where needed | scoring table for hosting, DB, auth, payments |
| Data model | ERD + access rules | + indexes, migrations, GDPR hooks | + volume estimates, partitioning/archival |
| Threat model | ≥ 6 threats | ≥ 10 threats + security requirements | ≥ 15, FMEA-lite failure-mode table, abuse-case stories |
| Cost model | 3 columns, main lines | all lines, cliffs, ±2× sensitivity | + break-even users, scenario table, repricing note |
| ADRs | 1–2 | 3–5 | every medium+ decision |
| Spikes | none | riskiest unknown | all unknowns |
| Review | self | `devils-advocate` once | + `security-auditor`, second round |

## Decision rules & defaults

| Topic | Default | Deviate when |
|---|---|---|
| Recipe | `factory/stacks/README.md` matrix | a must-story is unmeetable (ADR) |
| Region | EU (`eu-central-1` Frankfurt), app and DB co-located | audience outside EU only (ADR) |
| Database | Postgres with RLS (Supabase); D1 for Workers APIs | no persistent data → none |
| Tenancy | row-level by `user_id`; `org_id` only for team stories | regulated isolation → separate DB (ADR) |
| Architecture shape | one deployable per component, monolith first | measured bottleneck |
| Sync vs async | synchronous; queue/cron only for tasks > 10 s | webhooks needing fast ack |
| Caching | HTTP/ISR first; Redis only with measured need | p95 breach with profile evidence |
| Realtime | none | story requires live updates |
| Buy vs build | buy if non-core and ≤ $20/month | core differentiator |
| Dependencies | maintained (release < 12 months), MIT/Apache/BSD, official SDK preferred | AGPL/GPL never in a closed product |
| Availability | 99.5% | paid B2B → 99.9% |
| Provisioning | create paid resources only within `FOUNDER.md` budget; else test mode + `HUMAN_TASKS.md` | — |
| Escalate (`needs-founder`) | special-category data, minors, health/finance advice, Connect/money transmission, licences | — |

## Output specification

`docs/04-architecture.md`, sections in this order (template `factory/templates/architecture.md`, in pt-PT): 1 Resumo e decisões-chave · 2 Condicionantes (drivers) · 3 Stack escolhida (recipe, deviations) ·
4 Diagrama · 5 Modelo de dados (ERD, tables, access rules) · 6 API · 7 Autenticação e autorização · 8 Integrações (test-mode) · 9 Alojamento e ambientes · 10 Custos (0/100/10k) · 11 Modelo de ameaças ·
12 Observabilidade · 13 Cópias de segurança e recuperação · 14 Mapa de dados pessoais · 15 Limites de escala · 16 Plano de construção (WPs, flags, env) · 17 Riscos técnicos e spikes · 18 Índice de ADRs.
Every table row cites its PRD story or source URL + date. `docs/adr/NNNN-<slug>.md` per decision. `product.json` `stack` filled via `factory.py set`.

## Definition of Done

- [ ] Recipe chosen from `factory/stacks/` (or deviation ADR with ≥ 2 scored options) and recorded in `product.json`.
- [ ] Every PRD must-story maps to at least one component, endpoint/screen and data entity (traceability table).
- [ ] ERD + access rules; every table has RLS/ownership rule; GDPR export/delete hooks defined.
- [ ] Every founder-dependent integration has flag + test-mode substitute + draft `HUMAN_TASKS` entry.
- [ ] Cost table at 0 / 100 / 10k users with sources/dates; margin check against `02-business` done.
- [ ] Threat model ≥ depth minimum; each H/M threat has a mitigation and a verification reference.
- [ ] Observability, backup/RPO-RTO, retention, scalability triggers written.
- [ ] Personal-data map complete enough for `legal` (categories, processors, regions, retention, trackers).
- [ ] Work packages with disjoint directories; env vars and flags listed; spikes done or listed.
- [ ] ADRs written; `factory.py validate <slug>` passes.

## Anti-patterns

- Choosing tech from memory (versions, free-tier limits, prices) without checking the source.
- Microservices, Kubernetes, queues or Redis "for scale" before a measured need.
- Designing around a paid account the founder has not created, without a test-mode path.
- Tenancy enforced only in the UI or in client code.
- Cost table with only the happy path (ignoring free-tier cliffs, AI tokens, payment fees).
- Threat model that lists generic OWASP items without assets or verification.
- Putting PII into analytics, logs or prompts "just for debugging".
- Deviating from a recipe without an ADR, or writing ADRs for trivial choices.
- Leaving the data map for `legal` to reverse-engineer from code.

## Tools & sources

- `python3 factory/scripts/factory.py doctor | set | set-phase | validate`; `npm view <pkg> version time.modified`; WebFetch for pricing/limits pages (record URL + date).
- Diagrams: mermaid (`flowchart`, `erDiagram`); Figma MCP `generate_diagram` optional for polished diagrams.
- STRIDE: https://owasp.org/www-community/Threat_Modeling · ASVS: https://owasp.org/www-project-application-security-verification-standard/ · ADR format: https://adr.github.io/
- Provider docs named in the recipes (Supabase, Cloudflare, Vercel, Stripe, Expo).

## Hand-off

- **build:** recipe, work packages, env var and flag lists, test-mode adapters, security requirements, seed plan.
- **legal:** §14 data map, tracker inventory, draft subprocessors, AI/minor flags (write these into the hand-off note at the end of the doc).
- **gtm:** event dictionary (what can be measured), analytics tool, landing technical constraints.
- **qa:** threat model with verification references; cost-abuse and RLS test expectations.
- **launch:** environments, domains/DNS needs, runbook seeds, rollback path.
- **founder:** draft `HUMAN_TASKS.md` entries (accounts, tokens, spend limits, DNS) with exact steps and ≤ 5 min each.
