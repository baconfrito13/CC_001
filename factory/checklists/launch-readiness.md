# Launch-readiness checklist — G2

> **Used by:** `06-qa` (G2: every row **pass** or **N/A**), `09-launch` (re-run at T-1 on production). **Authority:** `factory/PIPELINE.md` (G2). If this file disagrees with PIPELINE.md, PIPELINE.md wins — fix this file in a factory PR. Thresholds below were set 2026-10; platform-specific numbers are re-verified in the playbooks.

## How to use it

1. Copy the tables into `docs/06-qa-report.md` (appendix "Launch readiness") and add two columns: **Result** (`pass` · `fail` · `N/A`) and **Evidence** (command output, URL, screenshot path, report line). Run the checks against the **production build** (preview URL when it exists, else `npm run build && npm start` locally).
2. **Pass** = verified in this run with evidence; "should be fine" is a fail. **N/A** = only under the row's N/A condition, with the reason written. **Fail** = defect with the severity in brackets: **[P0]** blocks launch and is fixed now (security, payments, legal, data loss); **[P1]** blocks G2; **[P2]** may ship if logged in `docs/06-qa-report.md` with an owner.
3. Rows tagged **[L]** can only be fully verified after the founder acts (domain, DNS, live keys, accounts). At G2 they **pass when prepared**: configuration/test exists, the founder task is open in `HUMAN_TASKS.md`, and the verification step is written in `docs/09-launch.md`. Phase 09 re-verifies them on production; a failed [L] row at go-live is a **no-go**.
4. Run order: product → legal → payments → security → performance → accessibility → SEO → analytics → monitoring → email → backups → support → founder tasks. Fix loop per depth (lean 1, standard 3, deep 5 rounds); re-run only failed rows plus anything touched.

## 1. Product

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| P1 | Lint, typecheck, unit, e2e and production build all pass **[P0]** | `npm run check` (lint + typecheck + unit + build) and `npm run test:e2e`, or the commands in `docs/05-build.md`; attach summary lines | never |
| P2 | Every PRD "must" story works end to end **[P1]** | story table in `docs/05-build.md` + e2e names | never |
| P3 | No placeholders in shipped output **[P1]** | `grep -rniI -e '{{' -e lorem -e TODO -e FIXME -e 'example\.com' -e your-domain -e placeholder <app_dir>/src marketing/copy` → only intentional hits | never |
| P4 | All locales complete: no missing keys, `lang`/hreflang right, switcher works **[P1]** | Playwright visits each page per locale; compare key sets; pt-PT grep from `08-gtm.md` Step 4 clean | single-locale product |
| P5 | Empty, loading, error, 404 and 500 states exist, localized, with a way out **[P2]** | visit unknown URL, force an API error | never |
| P6 | Waitlist/sign-up: validation, explicit consent checkbox, consent timestamp stored (starter: `consentAt`), duplicate handling, rate limit, unsubscribe path works (confirmation email if the product requires double opt-in) **[P0]** | submit twice, hit the endpoint in a burst, unsubscribe from the provider's link | no collection of emails |
| P7 | Mobile/extension: installs on device/emulator, permissions minimal and justified **[P1]** | EAS preview build / unpacked extension run; permission list reviewed | `type` is not mobile/extension |

## 2. Legal and privacy

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| L1 | Privacy policy, terms, cookie policy (+ refund/withdrawal policy if selling) live in **every locale**, linked from footer, sign-up and checkout **[P0]** | `curl -s -o /dev/null -w "%{http_code}"` each URL = 200; Playwright finds links | never |
| L2 | Legal identification data real (name, NIF/entity, address, contact email), no placeholders **[P0]** | read the pages; founder task for missing data | never |
| L3 | Consent: no analytics/ads/non-essential cookies or requests before consent; reject as easy as accept **[P0]** | Playwright on a fresh context: assert no analytics requests/cookies pre-consent | no non-essential tracking at all (then state it in the policy) |
| L4 | `legal/` records (RoPA, subprocessors) match the real third parties (hosting, email, analytics, error monitoring, payments) **[P1]** | diff vendor list vs `docs/04-architecture.md` | never |
| L5 | Consumer-law basics: VAT-inclusive consumer prices, withdrawal/refund text, renewal and cancellation terms, no fake discounts, price-history log started **[P0]** | read pricing + checkout; `docs/10-growth.md` price table exists | no paid offer |
| L6 | AI features disclosed; AI-Act/transparency note in `legal/`; user-facing "AI-generated" labelling where needed **[P1]** | read `docs/07-compliance.md` | no AI |
| L7 | `docs/07-compliance.md` open items are founder tasks or closed **[P1]** | list vs `HUMAN_TASKS.md` | never |

## 3. Payments

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| M1 | Monetization path configured: plans in `src/config/site.ts` with env-driven `checkoutUrl` or `stripePriceId` (or documented free model) **[P1]** | read config; env names in `docs/05-build.md` | free product with no payment |
| M2 | Test-mode flow passes twice: purchase → webhook/redirect → access → receipt → refund → access revoked → cancel **[P0]** | Playwright + provider test dashboard; evidence per step | no payment |
| M3 | Webhook verifies the signature on the raw body (starter does) and `onPaymentEvent` is implemented and idempotent (replaying an event does not double-grant) **[P0]** | unit test + `stripe trigger` / provider replay | no webhook (pure `checkoutUrl`, access managed outside the app) |
| M4 | Price shown on the site = price at checkout, VAT-inclusive for consumers; currency correct **[P0]** | compare pricing page to hosted checkout in test mode | B2B-only with explicit "sem IVA" labelling |
| M5 | Failure paths: declined card, abandoned checkout, delayed payment method, provider outage show a clear message **[P1]** | test cards / forced errors | no payment |
| M6 | No secret keys or webhook secrets in client bundle or repo **[P0]** | `grep -rE -e 'sk_live_' -e 'sk_test_' -e 'whsec_' .next/static public` and a history scan (gitleaks / GitHub secret scanning) = none | never |
| M7 | **[L]** Live-mode checklist ready: account verification task, live products script, live webhook, tax setup, real-purchase + refund drill (`monetization.md`, `09-launch.md` Step 10) | `docs/09-launch.md` §9 complete | no payment |

## 4. Security

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| K1 | `npm audit --omit=dev --audit-level=high` shows 0 high/critical (or a dated, justified exception) **[P1]** | command output | never |
| K2 | Secret scan clean on working tree and history; `.env*` untracked **[P0]** | GitHub MCP `run_secret_scanning` or gitleaks; `git ls-files -- '.env*'` prints nothing | never |
| K3 | Security headers on HTML responses: HSTS (prod), CSP (no `unsafe-eval`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`/`X-Frame-Options` **[P1]** | `curl -sI <url>`; securityheaders.com style review | static page with no scripts (still HSTS) |
| K4 | Every API route authenticates/authorizes and checks ownership; rate limits on auth, waitlist, contact, checkout (HTTP 429) **[P0]** | route table review + scripted bursts | no API |
| K5 | Inputs validated server-side (zod); CSRF/Origin checks on state changes; CORS not `*` for credentialed routes **[P1]** | tests + header check | no state-changing routes |
| K6 | Cookies `Secure; HttpOnly; SameSite` where auth exists **[P1]** | Playwright cookie dump | no cookies |
| K7 | Database row-level security on all tables exposed to clients; anon key cannot read others' data **[P0]** | RLS policy listing + cross-user test | no database |
| K8 | `docs/06-qa-report.md` security audit has 0 open P0/P1 **[P0]** | read report | never |

## 5. Performance

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| F1 | Lighthouse **mobile**, 3 key pages (home, pricing, one content page): Performance ≥ 90; LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 **[P1]** | Lighthouse CLI with Chromium `/opt/pw-browsers/chromium` against the production build; median of 3 runs | native mobile app (use store vitals) |
| F2 | First-load JS ≤ 200 KB gzipped on the home page; no unused large dependencies **[P2]** | `next build` output / bundle analyzer | not a JS web app |
| F3 | Images optimized and sized, fonts self-hosted with `font-display`, no render-blocking third-party scripts **[P2]** | Lighthouse audits | never |
| F4 | Static assets cached (immutable), compression on **[P2]** | `curl -sI` | never |

## 6. Accessibility

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| X1 | axe: 0 serious/critical on every key page, in each locale, light and dark **[P1]** | `@axe-core/playwright` in e2e | never |
| X2 | Whole core flow works with keyboard only; visible focus; skip link; logical order **[P1]** | Playwright keyboard script | never |
| X3 | Contrast AA for text and UI components (tokens verified in brand phase); `prefers-reduced-motion` respected **[P1]** | token check + axe | never |
| X4 | Forms have labels, programmatic errors, correct `autocomplete`; `lang` set per locale; images have alt **[P1]** | axe + review | never |
| X5 | EU accessibility-law applicability (e.g. European Accessibility Act, micro-enterprise exemptions) decided and recorded in `docs/07-compliance.md` **[P2]** | read doc | never |

## 7. SEO

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| S1 | Unique `<title>` ≤ 60 and meta description ≤ 155 per page **and** locale; one `<h1>` per page **[P1]** | crawl script over sitemap URLs | never |
| S2 | `hreflang` pairs + canonical correct; `sitemap.xml` lists every indexable URL per locale; `robots.txt` allows production and **preview is `noindex`** (the starter's `robots.ts` allows everything: add a `noindex` header for non-production hosts) **[P1]** | fetch files; check `X-Robots-Tag` on the preview URL | single locale (still canonical/sitemap) |
| S3 | OG/Twitter image 1200×630 per page; share preview correct **[P2]** | fetch `og:image`; Playwright screenshot | never |
| S4 | JSON-LD valid (`Organization`, `SoftwareApplication`/`Product`, `FAQPage` where FAQ exists) **[P2]** | schema validator output | never |
| S5 | Unknown URLs return HTTP 404; redirects are 301/308; no broken internal links **[P1]** | link crawler (e.g. `linkinator`) = 0 broken | never |
| S6 | **[L]** Search Console + Bing property ready, sitemap submitted at launch | task open; steps in `09-launch.md` | never |

## 8. Analytics, monitoring, email, backups

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| A1 | Analytics provider loads only per consent; page views and the planned events (`cta_click`, `waitlist_joined`/`signup`, `checkout_started`, `purchase`) arrive, with `locale` and `utm_*`; no PII in events (the starter itself only sends page views — custom events are added at Integration) **[P1]** | Playwright run + provider query/API | analytics deliberately off (state it in the privacy policy) |
| A2 | UTM captured on first visit and persisted to signup/purchase **[P2]** | e2e with `?utm_source=test` | no signup/purchase |
| O1 | Error monitoring enabled by env DSN; a deliberate test error appears; PII scrubbed **[P1]** | Sentry event id in evidence | never |
| O2 | `/api/health` returns 200 and checks dependencies without leaking secrets; log access documented **[P1]** | `curl` | static site with no backend |
| O3 | **[L]** ≥ 3 uptime monitors planned (home, health, checkout) with alert destination = founder email; SSL/domain expiry watched | monitor list in `docs/09-launch.md` | never |
| E1 | **[L]** Sending domain verified (SPF, DKIM, return-path) and DMARC TXT present (`p=none` minimum) **[P1]** | Resend domain status; `dig TXT _dmarc.<domain>` | product sends no email |
| E2 | Test mail reaches Gmail and Outlook inboxes with `spf=pass dkim=pass dmarc=pass` **[P1]** | "Show original" headers | product sends no email |
| E3 | Transactional mails localized, plain-text part, no promotion; marketing mails have consent basis + unsubscribe **[P0]** | read templates; send tests | no email |
| E4 | Send limits fit launch volume (Resend free: 100/day, 3,000/month) or a plan/stagger is set **[P2]** | compare waitlist size to limits | no bulk email |
| B1 | Database backup method exists and one restore was rehearsed with timing (RPO ≤ 24 h, RTO ≤ 4 h) **[P1]** | restore into scratch project; log minutes | no persistent data |
| B2 | Code in a Git remote; deploy steps reproducible from `docs/05-build.md`; secrets inventory with owner and rotation date **[P1]** | fresh clone build | never |
| B3 | **[L]** Registrar auto-renew + 2FA on; payment/provider data exportable **[P2]** | founder task | no domain/payments yet |

## 9. Support and founder tasks

| ID | Check (pass when) | How to verify | N/A when |
|---|---|---|---|
| C1 | **[L]** Contact route works: `support@`/`hello@` receives a test email and the founder can reply; contact page or form works **[P1]** | send a test; check routing rule | never |
| C2 | FAQ and policies answer billing, refund, privacy, cancellation; support hours/SLA stated; feedback route creates a `feedback` issue **[P2]** | read pages; submit test feedback | never |
| C3 | Incident message templates (pt-PT/en) and a rollback plan exist in `docs/09-launch.md` **[P1]** | read doc | never |
| H1 | `HUMAN_TASKS.md` lists every founder-only launch item grouped 🔴/🟡/🟢, each ≤ 5 min, with link, values, cost, what it unblocks, completion signal **[P1]** | read; `python3 factory/scripts/factory.py validate <slug>` | never |
| H2 | Resumo line (counts, time, cost) in sync; no secrets or private personal data **[P0]** | read file | never |
| H3 | Go-live path is explicit: `FOUNDER.md` `go_live` read; approval task exists unless `auto` **[P1]** | read both | never |
| H4 | New monthly cost total shown to the founder (hosting plan, domain, email, monitoring) **[P2]** | `docs/09-launch.md` §1 | never |
| H5 | Every public action (posts, submissions, outreach) is scheduled in `marketing/launch/schedule.md` with Europe/Lisbon time and an `HT-xx`; nothing was posted or sent **[P1]** | read file | never |
| G1 | Final landing copy integrated for every locale and matches `marketing/copy/landing.<locale>.md` **[P1]** | diff headings/CTA strings | never |
| G2 | Links in `marketing/launch/links.csv` valid; Product Hunt/Show HN eligibility decided (Show HN only if tryable now) **[P2]** | script over links; read kits | no public launch planned |

**G2 verdict:** all rows pass or N/A (with [L] rows prepared), 0 open P0/P1, `docs/09-launch.md` runbook drafted → set `qa` done and hand over to `launch`.
