# 05 · Build (`build`)

> **Owner:** `fullstack-engineer` (web, API, bot, extension) or `mobile-engineer` · **Inputs:** `docs/02-product.md` (PRD), `docs/04-architecture.md`, `docs/adr/`, `docs/03-brand.md` + `brand/tokens.json`, the recipe in `factory/stacks/`, `factory/starters/web/` · after `legal` and `gtm`: `legal/public/<doc>.<locale>.md`, `marketing/copy/` · **Outputs:** `<app_dir>/` (code + tests + `.env.example`), `docs/05-build.md` (template `factory/templates/build.md`), integrated legal pages and landing copy · **Gate:** Definition of Done "build" in `factory/PIPELINE.md` (all PRD must-stories implemented with tests; lint, typecheck, unit, e2e and production build pass; `docs/05-build.md` complete)

## Objective

Implement the PRD's must-stories (and the should-stories the depth allows) as working, tested, accessible,
localized software that runs completely in test mode without any founder account, then wire in the final legal
pages and landing copy produced by the parallel `legal` and `gtm` phases. Output is a repository state a stranger
can clone, run in one command, and trust.

## Before you start

1. Read `CLAUDE.md`, `factory/LEARNINGS.md`, the recipe (`factory/stacks/<recipe>.md`), `docs/04-architecture.md` (work packages, flags, env vars, threats → security requirements), the PRD (story ids, acceptance criteria, won't-list), `brand/tokens.json`.
2. **Rule zero:** never trust remembered versions or APIs. Before using any package: `npm view <pkg> version time.modified`, read `node_modules/<pkg>/README.md` and the `.d.ts` types, prefer the official scaffolder at `@latest` (`create-next-app`, `create-expo-app`, `npm create cloudflare@latest`, `wxt init`, `astro`). Next.js scaffolds an `AGENTS.md` and ships docs in `node_modules/next/dist/docs`: read them before routing/caching code. Registry majors move (Next 16, TypeScript 7 native port, Vitest 5, ESLint 10, Zod 4): when a tool breaks on a newer major, pin what the scaffolder installed and record a deviation.
3. `python3 factory/scripts/factory.py doctor` → which tokens exist. Without them everything still builds in test mode.
4. `git status` clean, on the product branch (`produto/<slug>` or the assigned one). Know whether other agents write in parallel (`legal`, `gtm`): they own `legal/` and `marketing/`; you own `<app_dir>/` and `docs/05-build.md` only.
5. Working directory for all commands: `products/<slug>/<app_dir>` unless stated.

## Procedure

### Step 1 — Scaffold and prove the baseline

1. Web recipes: copy the starter, never edit it in place:
   `mkdir -p products/<slug>/app && tar -C factory/starters/web --exclude=node_modules --exclude=.next --exclude=out -cf - . | tar -C products/<slug>/app -xf -`
   (equivalent: `cp -r factory/starters/web products/<slug>/app && rm -rf products/<slug>/app/{node_modules,.next,out}`). Other types: run the recipe's Scaffold block.
2. `npm install`, then the baseline **before changing anything**: `npm run check` (starter: lint + typecheck + unit tests + production build) and `CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` (the starter's Playwright config reads `CHROMIUM_PATH`; e2e builds and serves on port 3100). Both must be green; if the starter itself fails, fix or report to the orchestrator, do not build on red.
3. Read the starter's `README.md` **customization checklist** and execute it in order (site config, content, brand tokens, OG image, unused sections). Apply the brand: `npm run brand:apply -- ../brand/tokens.json`, then verify contrast of text/background pairs ≥ WCAG AA (4.5:1 body, 3:1 large) with a quick script or axe.
4. Add what the architecture requires (database, auth, AI layer) exactly as the recipe says; then re-run the baseline. Commit-ready state: `chore: scaffold` (see Step 8 for commit rules).

### Step 2 — Foundations before stories

Build these once; every story depends on them:

| Foundation | Required content | Verify |
|---|---|---|
| Environment | `.env.example` listing every variable (purpose, example, secret yes/no); `src/lib/env.ts` parses `process.env` with zod and fails fast at boot; client-exposed vars only with the framework's public prefix | `cp .env.example .env.local && npm run build` passes; test that missing required vars throw |
| Config | single source of truth (`src/config/site.ts` for web): company, contact, legal, locales, pricing, flags | no literal prices/emails/company data elsewhere (`grep`) |
| Feature flags + adapters | every founder-dependent capability (payments live, email sending, analytics, AI provider, auth mock) behind a flag with a `console`/`mock`/`memory` adapter; default = test mode | e2e passes with all flags off; boot assertion rejects mock adapters when `NODE_ENV=production` |
| Error handling | one pattern: validated input → typed result/throw at the boundary → localized user message + structured log; route handlers return problem+json (`application/problem+json`); error boundary pages | tests for 400/401/403/404/500 paths |
| i18n | all user-facing strings in `src/content/{en,pt}.ts` (or the recipe's equivalent); key-parity unit test between locales; `Intl` for dates/numbers/currency; `<html lang>`, `hreflang` | parity test passes; `grep -rn` finds no literal UI strings in components |
| Seed/demo data | `npm run seed` (or memory fixtures) giving realistic demo content/users so every screen is non-empty in test mode | screenshots in `06-qa` use it |
| Health + logging | `/api/health` (200, no secrets; the web starter ships none, add it as the first server slice), structured logs without PII | curl in smoke test |
| CI | `.github/workflows` job running `npm ci && npm run check && npm run test:e2e`, path-filtered to `products/<slug>/**` (skip if the starter ships one) | workflow YAML lints (`npx --yes yaml-lint` or read carefully) |

### Step 3 — Slice the PRD into vertical tasks

1. List every story id from the PRD with priority (must/should/won't) and acceptance criteria.
2. Split each into **vertical slices** (UI + logic + data + test, shippable alone), each ≤ 2 hours of work. Write them into the status table in `docs/05-build.md` (`S-01 …`): story id · slice · files/dirs · depends on · tests planned · flag needed.
3. Order: (1) walking skeleton: landing + health + one round trip in test mode; (2) the core value story end to end; (3) auth/accounts; (4) payments in test mode (flag off by default); (5) remaining musts; (6) account/settings/privacy (export, delete); (7) shoulds by value/effort; (8) polish. Never start a "won't".
4. Convert acceptance criteria into test names now (`it('S-03: rejects empty title with localized error')`).

### Step 4 — Implement slice by slice (the loop)

For each slice, in order:

1. **Red:** write failing tests first for logic (Vitest unit; for APIs also request-level tests). UI flows get a Playwright test once the route exists.
2. **Green:** implement the smallest code that passes; follow the recipe's structure; zod-validate every boundary input.
3. **Refactor:** remove duplication, name things from the domain, keep modules small.
4. **Verify:** `npm run lint && npm run typecheck && npm test`; for UI/flow slices `npm run test:e2e -- <file>`; for new pages run axe inside the e2e (`@axe-core/playwright`, zero serious/critical) and take a 360 px and a 1440 px screenshot to eyeball layout.
5. **Record:** update the story row in `docs/05-build.md` (status, test files, notes, deviations).
6. **Commit** (see Step 8). Never carry a red check into the next slice.

If a slice exceeds 4 h or fails the same way 3 times: stop, write down what you know, try one alternative design, and if still blocked within 1 h mark the story `blocked` (reason + what is needed), continue with other stories, and report it.

### Step 5 — Code-quality bar (applies to every slice)

| Rule | How it is enforced / checked |
|---|---|
| TypeScript `strict` (+ `noUncheckedIndexedAccess` where the scaffold allows); no `any`, `@ts-ignore`, `as unknown as` without a one-line `// reason:` | linter rule `noExplicitAny` as error; `git grep -nE ": any\b\|as any\|@ts-ignore"` empty or justified |
| Validate input at every boundary with zod (env, body, query, params, webhook payloads, third-party responses, LLM output, stored JSON) | no `req.json()`/`JSON.parse` result used before `.parse()`/`.safeParse()` |
| Error handling: no empty `catch`, no swallowed promises, no stack traces or secrets in responses/UI | review + tests for failure paths |
| Authorization on the server for every protected route/action, plus DB-level rules (RLS) | negative tests: other user, anonymous |
| i18n: no user-facing literal in components; both locales complete | parity test; grep |
| Accessibility: semantic HTML, labelled inputs, visible focus, alt text, keyboard path, AA contrast, reduced motion | axe in e2e, keyboard e2e for forms |
| Security: no secrets in code, parameterized queries, no `dangerouslySetInnerHTML` without sanitizer, security headers (CSP, HSTS, `X-Content-Type-Options`, frame protection), CSRF safe for cookie sessions, rate limit on auth/forms/AI | `factory/checklists/security.md` quick pass per slice |
| Performance: no client JS where server rendering suffices, `next/image` with dimensions, fonts self-hosted, no unbounded lists | bundle output of `npm run build`; Lighthouse in `06-qa` |
| Tests: no `.skip`/`.only`, no weakened assertions to get green; deterministic (wait for conditions, never `sleep`) | grep in CI step |
| Dependencies: each new one justified (saves > a slice), `npm view` for health/licence, no GPL/AGPL in a closed product | `npm audit --omit=dev` clean of high/critical |
| Comments/identifiers/commits in English; user-facing text per locale | review |

### Step 6 — Test mode, flags and secrets

1. Every external service from the architecture has an adapter pair selected by env/config (e.g. `WAITLIST_ADAPTER=console`, `EMAIL_ADAPTER=console`, `AUTH_ADAPTER=mock`, `AI_PROVIDER=mock`, `PAYMENTS_LIVE=false`). Test mode is the default in `.env.example`.
2. Production safety: a unit test + boot check ensure mock adapters/test keys cannot be active when `NODE_ENV=production`; payments `live` requires live keys present.
3. Never commit `.env*` (only `.env.example`). Real values are environment variables on the host; list the ones the founder must provide in `docs/05-build.md` §3 and as `HUMAN_TASKS.md` drafts (id, why, steps, time, what it unblocks).
4. Stripe/MoR: test mode keys only, webhooks verified with signed fixtures; checkout works end to end in test mode (or the monetization path is configured) because **G2 requires it**.

### Step 7 — Parallel builders (only when it saves time)

1. Eligible only when the work packages in `docs/04-architecture.md` own **disjoint directories**. Shared files (`package.json`, lockfile, `site.ts`, layout, content, CI) belong to one "foundation" owner; others request additions in their report instead of editing.
2. Preferred isolation: git worktrees created by the orchestrator (`git worktree add ../wt-<wp> -b build/<slug>-<wp>`), merged serially. Otherwise agents edit separate directories in the same tree.
3. Parallel agents do **not** run `git commit`; they report changed paths + check results. The orchestrator commits serially (PIPELINE rule).
4. After merging, run the full baseline again; fix integration breaks before the next wave.

### Step 8 — Commits and progress

- Sole writer: commit after every green slice: `git add products/<slug>/<app_dir> products/<slug>/docs/05-build.md && git commit -m "<slug>: build — S-03 <slice title>"`. Push at least every ~30 minutes of work (CLAUDE.md prime directive 5).
- Parallel run: do not commit; hand over (Step 7).
- Never commit `node_modules`, `.next`, `out`, `dist`, `.env*`, coverage, screenshots larger than 500 KB.

### Step 9 — Integration: legal pages and landing copy (run after `legal` and `gtm` are done)

Precondition check: `ls products/<slug>/legal/public/` and `ls products/<slug>/marketing/copy/`. If missing, mark "Integração: pendente" in `docs/05-build.md` §7, finish the rest of the build, and report; the orchestrator re-runs this step before `qa`. The step is idempotent: re-run whenever those folders change.

**9a. Legal pages**
1. Inventory documents and locales: the starter publishes `privacy`, `terms`, `cookies`, `withdrawal` (only when `legal.sellsToConsumers` is true), `legal-notice` (list `LEGAL_DOCS` in `src/lib/legal.ts`). Extras `legal` created (`ai-notice`, `refund`, `acceptable-use`) require adding the slug to `LEGAL_DOCS`, the route/sitemap/footer and tests. File naming `<doc>.<locale>.md`; locale `pt-PT` → starter folder `pt`; `en` → `en`. Another locale needs a dictionary in `src/content`, an entry in `supportedLocales` (`src/config/site.ts`) and legal folders.
2. Copy `legal/public/<doc>.<locale>.md` → `src/content/legal/<loc>/<doc>.md` (replace the starter's template text entirely; keep the frontmatter/heading shape the starter's loader expects: read its loader first). Register extra documents in the legal route list and sitemap.
3. Placeholders: `grep -rhoE "\{\{[A-Za-z0-9_.]+\}\}" src/content/legal | sort -u`; every key must be in `PLACEHOLDER_KEYS` (`src/lib/placeholders.ts`; the `legal` phase relies on exactly that list, so ask `legal` to use it rather than extending it) and have a value in `src/config/site.ts`. The renderer throws `UnreplacedPlaceholderError` on any leftover `{{…}}`, so `npm run build` is the proof. Values the factory cannot know (company registration, address, VAT/NIF, effective date) → set the config value to the exact token `[A PREENCHER PELO FUNDADOR]` and create a `HUMAN_TASKS.md` item. Also replace every starter leftover: `grep -rn "(placeholder)\|acme\.example\|Acme" src`. `06-qa` and `launch` fail the release if that token or a leftover reaches production.
4. Wire links: footer (all docs, each locale), consent banner → cookie policy, signup/checkout consent text → terms + privacy, digital-goods checkout → the withdrawal-waiver wording from `legal`, AI products → in-product AI disclosure + `/ai` page. The cookie policy's tracker table must equal the trackers actually in code and the architecture inventory (diff them).
5. Add/extend tests: every legal doc renders in every locale (HTTP 200, one `<h1>`, no `{{`), footer links present, no `lorem|TODO|FIXME`.

**9b. Landing copy**
1. Read `marketing/copy/` (one file per locale; layout described in `docs/08-gtm.md`). Map sections (hero, proof, features, how it works, pricing, FAQ, final CTA, meta title/description, OG text) onto `src/content/{en,pt}.ts` keys. Keep identical key structure in both locales (parity test).
2. Rules: do not invent claims, numbers, testimonials or logos absent from the copy; prices come from `site.ts` only; one `<h1>`; title ≤ 60 chars, description ≤ 160; every image has alt text; CTA labels match the real flows (waitlist vs. checkout depends on `payments.live`).
3. Check layout with the real text: Playwright screenshots at 360, 768, 1440 px for each locale; fix overflow/truncation by adjusting components, not by cutting copy; if the copy is wrong for the product, note the discrepancy in `docs/05-build.md` §8 for `gtm` instead of rewriting it.

**9c. Verify**
`npm run check && CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`; crawl internal links (all return 200); `git grep -n "A PREENCHER PELO FUNDADOR\|(placeholder)\|acme\.example" -- src` lists only the allowed pending items; update §7 of `docs/05-build.md` with a table doc × locale × status; commit `<slug>: build — integration of legal pages and landing copy`.

### Step 10 — Finish

1. Final gate, from a clean install: `rm -rf node_modules .next && npm ci && npm run check && CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`, then run the production server (`npm run start -- --port 3100 &`; stop it afterwards) and smoke test `/`, `/en`, `/pt`, `/api/health`, `/sitemap.xml`, `/robots.txt`, legal pages.
2. Finish `docs/05-build.md`: how to run, env vars, flags, story-by-story status vs PRD (every must = `done` with test references, or `blocked` with reason), deviations from PRD/architecture (with ADR links), known limitations, last check results (date, versions).
3. Non-web types: the loop and bar are identical; recipe checks replace the npm scripts (mobile: `expo lint`, `tsc`, `jest`, `expo-doctor`, `expo export`; extension: `wxt build` for Chrome and Firefox + Vitest; API/bot: `wrangler deploy --dry-run` + workerd tests). Legal pages for them: mobile settings screens open the hosted pages; extension options page and store listing link them; bot `/privacy` replies with the URL; API docs link them.
4. `python3 factory/scripts/factory.py set-phase <slug> build done --summary "<n>/<m> must-stories, tests <x> unit / <y> e2e"`; `factory.py validate <slug>`.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Scope | must-stories only | must + key should-stories (≤ 40% of build time) | + polish, onboarding, admin/ops tooling |
| Tests | unit for logic, 1 e2e per must-story | + integration tests, axe on every route | + visual regression screenshots, load smoke, mutation spot check on core logic |
| UX | functional, accessible | empty/loading/error states, success feedback | skeletons, micro-interactions, guided onboarding, keyboard shortcuts where useful |
| Ops | health route | + feature-flag docs, seed data, CI | + admin dashboard (users, metrics, flags), export tools, runbook scripts |
| Docs | `05-build.md` | + architecture deltas and deviations table | + contributor guide and ADR for each deviation |

## Decision rules & defaults

| Situation | Rule |
|---|---|
| Requirement is ambiguous | Pick the simplest reading consistent with the PRD and acceptance criteria; record the assumption in `docs/05-build.md` §8; do not ask the founder |
| Need a new dependency | Only if it saves more than one slice; check `npm view <pkg> version time.modified license`, weekly downloads, types; otherwise write ≤ 30 lines |
| Test fails | Fix the root cause in code; change a test only when it encodes a wrong expectation and say why in the commit; never skip, weaken or delete to get green |
| Flaky e2e | Replace sleeps with web-first assertions (`expect(locator)...`), isolate data per test; quarantine is not allowed |
| Tool incompatible with a new major (TS 7, Vitest, ESLint) | Keep the scaffolder's pinned version, record the deviation, retest at the next phase |
| Something needs a founder account | Flag + adapter + `HUMAN_TASKS.md` draft; continue in test mode |
| PRD must-story impossible with the recipe | Open an ADR (`status: proposed`), implement the closest feasible slice behind a flag, report to the orchestrator |
| Coverage | No global % target; every branch of business logic tested; ≥ 80% lines on `src/lib` domain code is a healthy signal, not a gate |
| Bundle/perf regression | Fail the slice if landing JS grows > 20 KB gzip without justification |
| Time | MVP must fit the depth's build budget in the PRD; if > 25% over, cut "should" stories first and tell the orchestrator |

## Output specification

- `products/<slug>/<app_dir>/` runs with `npm install && cp .env.example .env.local && npm run dev` in test mode; contains `README.md` (run, test, deploy, env, flags), `.env.example`, tests, CI workflow, seed script. Components of other roles live in sibling folders (`api/`, `mobile/`, `extension/`).
- `docs/05-build.md` (template `factory/templates/build.md`, pt-PT): 1 Resumo · 2 Como correr · 3 Variáveis de ambiente · 4 Feature flags e modo de teste · 5 Estado das histórias vs PRD · 6 Testes e verificações (última execução) · 7 Integração (legal + copy) · 8 Desvios e pressupostos · 9 Limitações e dívida técnica · 10 Tarefas do fundador relacionadas.
- `product.json`: `stack.*` unchanged unless a deviation changed it (via `factory.py set`).

## Definition of Done

- [ ] Every PRD **must** story is `done` with at least one automated test referencing its id (or `blocked` with a written reason and an ADR/founder task).
- [ ] From a clean clone: `npm ci && npm run check && npm run test:e2e` all pass (check includes the production build); no skipped tests.
- [ ] App runs end to end in test mode with no secrets; mocks cannot run in production (tested).
- [ ] i18n parity (en/pt), axe zero serious/critical on all routes, keyboard path for forms.
- [ ] `.env.example` complete; zod env validation; no secrets in git (`git grep` patterns clean).
- [ ] Legal pages (all docs × locales) and landing copy integrated, or "pendente" recorded with the reason; no `{{` in rendered output.
- [ ] `docs/05-build.md` complete; `HUMAN_TASKS.md` drafts for every founder-dependent item.
- [ ] Phase set to done via `factory.py`; `validate` passes.

## Anti-patterns

- Writing everything, then testing; or writing tests that assert whatever the code does.
- Editing `factory/starters/web` in place instead of copying it into the product.
- Building "won't" or speculative features; polishing before all musts are done.
- Hard-coded UI strings, prices, company data, emails, URLs.
- Mock adapters or test keys reachable in production; payments "live" without live keys.
- `any`/`@ts-ignore`/`eslint-disable` as a way out; catching errors to hide them.
- Copying legal or marketing text from memory instead of integrating what `legal`/`gtm` produced; leaving `{{placeholders}}` or lorem ipsum.
- Parallel agents editing the same files or committing simultaneously.
- Trusting remembered package APIs; bumping React/Expo packages by hand instead of through the SDK's installer.
- Declaring done with a red or skipped check.

## Tools & sources

- Commands: `npm run lint|typecheck|test|test:e2e|build|check`, `npx biome check --write`, `npm view`, `npm audit --omit=dev`, `git grep`, `git worktree`.
- Test stack: Vitest, `@playwright/test` (Chromium preinstalled at `/opt/pw-browsers`; the starter honours `CHROMIUM_PATH=/opt/pw-browsers/chromium`, other projects set `launchOptions.executablePath` to it; never run `playwright install`), `@axe-core/playwright`.
- Skills: `claude-api` for any Anthropic call (model ids, params change), `/simplify` and `/code-review` on your own diff before hand-off.
- Docs: the installed packages' own docs, Next.js docs bundled in `node_modules/next/dist/docs`, recipe pages, https://owasp.org/www-project-cheat-sheet-series/ for security details.

## Hand-off

- **legal:** any new data collection or processor introduced during build (update the data map note in `docs/05-build.md` §8).
- **qa:** how to run (§2), flags and test accounts/seed, story→test map (§5), known limitations (§9), and the list of routes/locales to cover.
- **gtm / growth:** analytics events actually implemented (names/properties), URLs, OG assets.
- **launch:** env var table with where each value comes from, build/start commands, health route, migrations to apply, founder-task drafts.
- **orchestrator:** summary line for `set-phase`, list of blocked stories and open deviations.
