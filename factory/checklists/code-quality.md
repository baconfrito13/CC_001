# Checklist · Code quality

Used by: builders (★ = every slice, before commit), `qa-engineer` in `06-qa` (full pass, with `/code-review` and `/simplify` on the diff), `fullstack-engineer` during the fix loop.
Each item is verifiable by a command or a short review. Fix root causes; never silence a rule to pass (no `eslint-disable`/`biome-ignore`/`@ts-ignore` without a one-line `reason:` comment, and zero of them in tests that hide failures).
Commands assume the web starter's scripts (`lint`, `typecheck`, `test`, `test:e2e`, `build`, `check`); other recipes have equivalents named in their `Testing` section.

## 1. Automated gates (must be green)

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-01 ★ | Lint clean (Biome `biome check .` in the starter; ESLint 10 elsewhere); formatter applied | `npm run lint` exit 0 | P2 |
| CQ-02 ★ | Typecheck clean under `strict`; no new `tsc` errors; if TypeScript 7 breaks a tool, the pinned version is recorded in `docs/05-build.md` | `npm run typecheck` | P1 |
| CQ-03 ★ | Unit tests pass, none skipped (`.skip`, `.todo`, `xit`) or focused (`.only`) | `npm test`; Grep tool in `tests/` for `.only(`, `.skip(`, `xit(`, `fit(`: no hits | P1 |
| CQ-04 ★ | e2e passes from a clean build, zero flaky | `CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`; `npx playwright test --repeat-each=3` | P1 |
| CQ-05 ★ | Production build succeeds with no warnings about missing env, deprecated APIs or oversized pages | `npm run build` | P1 |
| CQ-06 | CI runs the same commands as local and is green | read `.github/workflows`; latest run via GitHub MCP `actions_list` | P2 |

## 2. Type safety and boundaries

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-10 ★ | No `any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error` without a justification comment | Grep tool for `: any`, `as any`, `@ts-ignore`, `@ts-expect-error`; each hit justified | P2 |
| CQ-11 ★ | All boundaries validated with zod (env, requests, webhooks, third-party responses, stored JSON, LLM output); schema types are the source of the TS types (`z.infer`) | Grep `req.json(`, `JSON.parse(`, `await res.json(`: each is parsed | P1 |
| CQ-12 | Public module APIs have explicit types; no implicit `any` from untyped imports; `noUncheckedIndexedAccess` on if the scaffold allows | `tsconfig.json` review | P3 |
| CQ-13 | Money is integer minor units + currency; dates UTC ISO strings; ids are opaque strings/UUIDs | review data layer | P2 |

## 3. Errors, logging and resilience

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-20 ★ | No empty `catch`, no floating promises, no swallowed errors; errors carry context and are mapped to localized user messages | Biome `noFloatingPromises`-style rules (enable if available) or review of `catch` blocks | P1 |
| CQ-21 | One error-response shape for APIs (problem+json) and one error boundary per app section; 404/500 pages localized | trigger each; tests | P2 |
| CQ-22 | Structured logger used instead of `console.log` in server code; no PII/secrets logged | Grep `console.log(` in `src` (allow in scripts/tests only) | P2 |
| CQ-23 | External calls have timeouts, bounded retries with backoff, and a defined fallback (adapter, message) | review fetch/SDK usage | P2 |
| CQ-24 | Idempotent handlers for webhooks, payments, emails (event id stored) | tests with duplicate events | P1 |

## 4. Structure and readability

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-30 ★ | Follows the recipe's project structure; domain logic in `src/lib` (pure, testable), UI thin, no business rules in components or route handlers beyond orchestration | review tree vs recipe | P2 |
| CQ-31 | Files ≤ ~300 lines, functions ≤ ~50 lines, nesting ≤ 3, parameters ≤ 4 (use objects) | `find src -name '*.ts' -size +12k -o -name '*.tsx' -size +12k` lists files above ~300 lines; review each | P3 |
| CQ-32 | No dead code, unused exports or dependencies | `npx knip` (verify config for Next); remove findings or justify | P3 |
| CQ-33 | No copy-paste blocks > 15 lines duplicated | `npx jscpd src --min-lines 15 --threshold 3` | P3 |
| CQ-34 | No circular imports | `npx madge --circular --extensions ts,tsx src` | P2 |
| CQ-35 | Names come from the domain; comments explain *why*; TODOs carry an id and owner (`TODO(S-12): …`), none left in must-story code | Grep `TODO` and `FIXME` in `src` | P3 |
| CQ-36 | Configuration lives in one place (`site.ts`, env module); no magic numbers/strings (prices, emails, URLs, limits) in code | Grep for `@` emails, `https://`, currency symbols outside config/content | P2 |

## 5. Product requirements embedded in code

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-40 ★ | i18n complete: no user-facing literals in components; en/pt key parity test exists and passes; dates/numbers via `Intl` | parity unit test; Grep for quoted sentences in `src/components` | P2 |
| CQ-41 ★ | Accessibility basics in components: semantic elements, labels, alt, focus styles; axe run in e2e | `factory/checklists/accessibility.md` ★ rows | P1 |
| CQ-42 | Feature flags: every founder-dependent capability has a flag + test-mode adapter; default = safe; production guard test exists | tests; `.env.example` defaults | P1 |
| CQ-43 | Security basics per slice: `factory/checklists/security.md` ★ rows | run those rows | P1 |
| CQ-44 | Performance basics: server components by default, `next/image`, no unbounded lists/queries | `factory/checklists/performance.md` ★ rows | P2 |

## 6. Tests

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-50 ★ | Each must-story has tests named with its id; each bug fix has a regression test | Grep story ids in `tests/`; fix-loop commits contain tests | P1 |
| CQ-51 | Tests assert behavior and outputs (not implementation details); no snapshots of large blobs; one reason to fail per test | review sample of 10 tests | P3 |
| CQ-52 | Tests deterministic: fixed clocks (`vi.useFakeTimers`), seeded data, no real network, no `sleep` | Grep `setTimeout` and `waitForTimeout` in `tests` | P2 |
| CQ-53 | Failure paths covered: validation errors, 401/403/404/429, provider outage, empty states | review per route | P1 |
| CQ-54 | Core logic mutation spot-check: temporarily break three core functions; at least one test fails each time | manual, revert with `git checkout -- <file>` | P2 |

## 7. Repository hygiene and docs

| ID | Check | How to verify | Sev |
|---|---|---|---|
| CQ-60 ★ | Nothing generated or secret is tracked: `node_modules`, `.next`, `out`, `dist`, `.env*` (except example), coverage, large binaries | `git ls-files` review; size listing in `factory/checklists/performance.md` §5 | P1 |
| CQ-61 | `README.md` lets a stranger run, test and deploy in test mode in ≤ 10 commands; `.env.example` complete with comments | follow it on a clean clone | P2 |
| CQ-62 ★ | Commits are small and named `<slug>: build — <slice>`; one concern each; no unrelated reformatting | `git log --oneline` | P3 |
| CQ-63 | `docs/05-build.md` is current: story status, deviations, flags, last check results | compare with repo state | P2 |
| CQ-64 | Dependencies minimal and justified; versions come from the registry/scaffolder, not memory; `npm outdated` reviewed; `npm audit --omit=dev` clean of high/critical | commands | P2 |
| CQ-65 | Comments, identifiers and commit messages in English; user-facing text per locale | review | P3 |

## 8. Review routine (QA and fix loop)

1. `git diff main...HEAD --stat` to scope the review; run `/code-review` (correctness bugs, high effort for standard/deep) and `/simplify` (reuse/simplification) on the product diff; reproduce every claimed bug before filing.
2. Run the sections above top to bottom, recording `pass` / `fail (D-nnn)` / `N/A` in `docs/06-qa-report.md`.
3. After fixes, re-run §1 completely and the specific item that failed.
