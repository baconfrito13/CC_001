# 09 · Launch (`launch`)

> **Owner:** `devops-engineer` (+ `growth-marketer` for launch-day assets, `qa-engineer` for the post-launch smoke test) · **Inputs:** `product.json` (`stack`, `type`), `docs/04-architecture.md`, `docs/05-build.md` (env vars, run/deploy notes), `docs/06-qa-report.md` (G2), `docs/07-compliance.md`, `docs/08-gtm.md` + `marketing/launch/*`, `HUMAN_TASKS.md`, `FOUNDER.md` (`go_live`), env tokens (`factory.py doctor`), `factory/checklists/launch-readiness.md`, `factory/playbooks/monetization.md` · **Outputs:** `docs/09-launch.md` (from `factory/templates/launch.md`: runbook + live status), preview and production deployments, DNS/email/monitoring configured, store submission packages, updated `HUMAN_TASKS.md`, `product.json` `links.*` · **Gate:** `launch` Definition of Done (`factory/PIPELINE.md`) on top of **G2**; production go-live is a **founder approval** unless `FOUNDER.md` sets `go_live: auto`.

## Objective

Take a QA-passed product from "works on my branch" to "a stranger can find it, understand it, pay and be supported — and we find out within minutes if it breaks". Prepare everything that can be prepared with tokens (preview, config, monitoring, store packages), batch what only the founder can do into ≤ 5-minute tasks, and execute a rehearsed runbook for the day. Never print or commit secrets; never switch payments to live or submit to a store without the approval path in Step 13.

## Before you start

1. `python3 factory/scripts/factory.py doctor` — lists which credentials exist (names only). Map them: `VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_ACCESS_TOKEN`, `STRIPE_SECRET_KEY` (test key until Step 10), `LEMONSQUEEZY_API_KEY`/`POLAR_ACCESS_TOKEN`/`PADDLE_API_KEY`, `RESEND_API_KEY`, `SENTRY_AUTH_TOKEN`, `POSTHOG_PERSONAL_API_KEY`/`PLAUSIBLE_API_KEY`, `EXPO_TOKEN`. Missing token = prepare everything else and open one founder task for it (HT, `SETUP.md` explains how to add env vars). Test presence with `[ -n "$VERCEL_TOKEN" ] && echo set`, never `echo $VAR`.
2. Confirm **G2 passed** (`docs/06-qa-report.md`, every row of `factory/checklists/launch-readiness.md` pass or N/A, no open P0/P1). If not, stop and return to `qa`.
3. Read `product.json` `stack.hosting/payments/database` and `docs/05-build.md` env table. Read `FOUNDER.md` for `go_live` (default `approve`) and preferred registrar.
4. **Verify every CLI flag with `--help` before use** (flags below were verified against Vercel CLI 63.1.0, Wrangler 4.148.0, EAS CLI 24.12.0, Supabase CLI 2.120.0 on 2026-10-08; versions move: check `npm view <pkg> version`). Run CLIs with `npx <pkg>@<version>`; always pass tokens through env/flags, never into files.
5. `python3 factory/scripts/factory.py set-phase <slug> launch in_progress --summary "launch started"`.

## Procedure

### Step 1 — Hosting plan and licence check
- **Vercel Hobby teams are restricted to non-commercial personal use**; Vercel's own examples of commercial use include requesting or processing payment, **advertising the sale of a product or service**, ads, affiliate-first sites and being paid to build the site (donation asks are not commercial) — <https://vercel.com/docs/limits/fair-use-guidelines>. So a product meant to earn money needs **Pro** from the first public deployment (per-seat price — verify at <https://vercel.com/pricing>); a private preview for the founder is fine on Hobby. Either make "Vercel Pro" a 💶 founder task (cost shown) or deploy to Cloudflare (Workers/Pages free tier; re-read its terms) — record the choice in an ADR.
- Check platform quotas against the cost estimate in `docs/04-architecture.md` (build minutes, function invocations, bandwidth; Cloudflare Pages free: 500 builds/month; Supabase free projects have no backups — Step 8).

### Step 2 — Environments
| Env | Purpose | Data/keys | URL |
|---|---|---|---|
| local | dev + e2e | `.env.local` (never committed), test keys | localhost |
| preview | every branch/PR, smoke tests, founder review | **test-mode** payments, separate DB (Supabase branch or a staging project), Resend test domain/sandbox sender, analytics off or separate site id | `*.vercel.app` / `*.pages.dev` |
| production | customers | live keys only after Step 10, prod DB, real domain | `https://<domain>` |
Rules: no shared database between preview and production; preview deployments must not email real people; set `NEXT_PUBLIC_SITE_URL`/`SITE_URL` per environment; if Vercel Deployment Protection covers previews, give Playwright the automation bypass secret (verify in project settings) instead of disabling protection.

### Step 3 — Deploy the preview (when tokens exist)
**Vercel**
```bash
npx vercel@<ver> project create <name> --token "$VERCEL_TOKEN"            # first time (check `vercel project --help`)
vercel link --yes --project <name> --token "$VERCEL_TOKEN"                # add --team <slug> for a team scope
vercel env add <NAME> preview --value "<test-value>" --yes --token "$VERCEL_TOKEN"   # repeat per variable; --sensitive for secrets; --force to overwrite
vercel deploy --token "$VERCEL_TOKEN"                                     # preview; prints the URL (add --no-wait/--json if scripting)
vercel inspect <url> --wait --token "$VERCEL_TOKEN"                       # block until READY
```
**Cloudflare:** `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in env; Pages: `wrangler pages project create <name>` then `wrangler pages deploy <dir> --project-name <name> --branch <branch>`; Workers/static assets: `wrangler deploy` (`--name`, `--var K:V`, `--secrets-file`, `--dry-run`); secrets: `wrangler secret put <KEY>` (stdin) or `wrangler secret bulk <file>`.
**Supabase:** `SUPABASE_ACCESS_TOKEN` in env; `supabase link --project-ref <ref>`; `supabase db push --dry-run` then `supabase db push` (migrations must be backward compatible — Step 14); `supabase functions deploy [name]`; `supabase secrets set NAME=VALUE` (or `--env-file`).
**Expo/EAS (mobile):** `EXPO_TOKEN` in env; `eas build -p all --profile preview --non-interactive` (internal distribution), `eas update --channel preview --message "…"` for JS-only changes; env vars via `eas env:set` (the older `env:create` is deprecated).
Smoke the preview: run the Playwright e2e suite with `PLAYWRIGHT_BASE_URL=<preview-url>` plus the checks in Step 15 (home in each locale, sign-up/waitlist, checkout redirect in test mode, legal pages, 404, `/sitemap.xml`, `/robots.txt`). Save the URL: `python3 factory/scripts/factory.py set <slug> links.preview <url> --string`.

### Step 4 — Environment variables and secrets
1. Build the matrix from `docs/05-build.md`: `name · public/secret · where used · preview value · production value · who provides · rotation`. `NEXT_PUBLIC_*` are public by design; everything else is secret.
2. Set via CLI per platform (Step 3) or in the dashboard; mark secrets sensitive (`vercel env add … --sensitive`). Verify with `vercel env ls production` (names only) and by a deploy that boots.
3. Production secrets provided by the founder (payment live keys, `STRIPE_WEBHOOK_SECRET`, third-party API keys) are one founder task that points to the exact variable names; the founder sets them in the platform UI or `SETUP.md` flow — never in chat. Document names only in `docs/09-launch.md`.
4. Rotation: record the date each secret was created; rotate on suspected leak (secret scanning is in the launch-readiness checklist).

### Step 5 — Domain, DNS, HTTPS
1. **Registrar** (founder pays → task with the exact domain from `docs/03-brand.md`): `.com`/`.app`/`.dev`/`.io` → **Cloudflare Registrar** (sells at wholesale cost; confirm the TLD is on <https://www.cloudflare.com/tld-policies/> and that it supports your name — no IDN/accents), **Porkbun** or **Namecheap** as alternatives; compare **renewal** price, not the first-year promo; WHOIS privacy on; auto-renew on; 2FA on. **`.pt`**: must be registered through a registrar accredited by DNS.PT (list at <https://www.dns.pt>; retail prices vary widely, ≈ €11–40/year from OVH, Dynadot, EuroDNS, INWX in the 2026-10-08 check; Cloudflare `.pt` support **not verified**); no nationality restriction; the registry may ask for a NIF. Use the Shopify MCP `generate-domain-names` result from phase 03 as availability evidence.
2. **DNS host:** default Cloudflare DNS (free, fast, API) if the registrar allows nameserver change; otherwise the registrar's DNS. Set `links.domain` only after the founder confirms the purchase.
3. **Records (use the values shown by the platform, not memory):** Vercel — `vercel domains add <domain> <project>` then `vercel domains inspect <domain>`/`vercel domains verify <domain>` print the A/CNAME targets; Cloudflare Pages — add the custom domain in the project, CNAME to `<project>.pages.dev`. Apex vs www: **canonical = apex** (`example.com`) with `www` redirecting 308 to it (use `www` as canonical only if the DNS host cannot flatten CNAME at the apex). On Cloudflare DNS keep records pointing at Vercel **DNS-only (grey cloud)**; proxying is for Cloudflare-hosted origins.
4. **HTTPS:** certificates are issued automatically after DNS verifies; check `curl -sI https://<domain>` (200, `strict-transport-security`), `http://` redirects to `https://`, `www` redirects, no mixed content. Add HSTS `max-age` 6 months after verifying subdomains; preload only later.
5. Update `SITE_URL`, canonical/hreflang, OG URLs, Search Console, store listings and `marketing/launch/links.csv` (`{{domain}}` placeholders) to the final domain.

### Step 6 — Email: sending (Resend) and receiving (Cloudflare Email Routing)
1. **Sending domain:** in Resend add the domain (recommended: a subdomain such as `updates.<domain>` to isolate reputation) — the dashboard/API (`GET /domains/{id}`) lists the exact **SPF, DKIM and return-path MX** records; add them at the DNS host, verify, wait for `verified` (minutes to hours). Free plan (checked 2026-10-08): 3,000 emails/month, **100/day**, 3 domains — a launch-day waitlist blast above 100 recipients needs Pro (≈ $20/month) or a staggered send.
2. **DMARC:** add TXT `_dmarc.<domain>` = `v=DMARC1; p=none; rua=mailto:dmarc@<domain>;` (Resend's guide); after 2–4 weeks of clean reports (all legit sources `dmarc=pass`) move to `p=quarantine`, later `p=reject`. Only one SPF TXT per name — merge includes instead of adding a second record.
3. **Inbound mailboxes** (`hello@`, `support@`, `privacy@`, `legal@`, `press@`, `dmarc@`): **Cloudflare Email Routing** (free; needs Cloudflare DNS): dashboard → Email Routing → onboard domain (adds MX + SPF + DKIM TXT records) → add destination address (the founder clicks the verification email: 1-minute task) → routing rules per alias. Receive-only: replies are sent from the founder's mail client with "send as", or through Resend if a support tool is added. `wrangler email routing …` exists (open beta) for scripting. Conflict warning: Email Routing owns the MX records; do not add another mailbox provider on the same domain without a plan.
4. **Test deliverability:** send a real message from the app to a Gmail and an Outlook inbox; open "Show original" → `spf=pass dkim=pass dmarc=pass`; check spam placement; confirm unsubscribe/consent text on marketing mail; transactional and marketing streams use different subdomains/addresses.

### Step 7 — Analytics, search and error monitoring
1. **Analytics** (provider from `docs/04-architecture.md`): set the production site/project key; load only after consent where required; drive the live site with Playwright (accept cookies → page view → waitlist/sign-up → checkout start) and confirm the events arrive (Plausible `POST https://plausible.io/api/v2/query` with `Authorization: Bearer $PLAUSIBLE_API_KEY` — Stats API is a Business-plan feature, 600 req/h; PostHog `POST <host>/api/projects/:id/query/` with a personal API key (Query Read), EU cloud host per project settings). Record the baseline in `docs/09-launch.md`.
2. **Search Console:** add the domain property (DNS TXT verification — if DNS is on Cloudflare Claude can add the TXT with the API token; the Google login is a founder task), submit `https://<domain>/sitemap.xml`; add Bing Webmaster Tools by importing from Search Console. Request indexing of the home page after launch.
3. **Sentry:** DSN as env var; source maps via `SENTRY_AUTH_TOKEN` at build; trigger a deliberate test error on preview (not production traffic) and confirm it arrives; alert rule "new issue" → email. Free Developer plan (checked 2026-10-08): 5,000 errors/month, 1 user, 30-day retention. Scrub PII (`sendDefaultPii=false`), no request bodies.
4. Error budget: after launch, any unhandled exception on checkout/auth is P0.

### Step 8 — Uptime and backups
- **Uptime:** prefer **Better Stack** free tier (checked 2026-10-08: 10 monitors + heartbeats, 1 status page, Slack/email alerts); UptimeRobot's free plan is for hobby/non-profit use (50 monitors, 5-minute interval) — avoid for a commercial product unless its terms are re-read. Monitors: home (200 + keyword), `/api/health` (add if missing: checks DB reachability, returns no secrets), pricing/checkout route (302 or 200), webhook endpoint (heartbeat from the payment test event), SSL expiry, domain expiry. Alerts to the founder's email and (optional) push; status page only if customers need it.
- **Backups:** Git is the code backup. **Supabase Free has no automatic backups** — schedule `supabase db dump` weekly/daily to private storage (GitHub Actions secret `SUPABASE_DB_URL`; encrypt or use a private bucket; never commit dumps); **Pro** has 7 daily backups (PITR add-on ≈ $100/month, only if RPO < 24 h matters). Payment history lives in the provider: export customers/subscriptions monthly. Defaults: RPO 24 h, RTO 4 h. Do one **restore drill** into a scratch project before launch (deep depth) and log the time taken.

### Step 9 — Legal and contact wiring (verify, do not draft)
Confirm live in every locale: privacy, terms, cookies, refund/withdrawal policy, imprint/identification data, cookie banner behaviour, a working `privacy@`/`support@` address (Step 6), footer links, checkout links to terms/refund text. Dead links or placeholder identification data are 🔴 blockers.

### Step 10 — Payments go-live (decision rules in `factory/playbooks/monetization.md`)
Perform in this order; stop at the first failure.
1. **Test mode, end-to-end on preview:** purchase → redirect/webhook → access granted → receipt → refund → access revoked → cancel; failed payment (card `4000 0000 0000 0341`-style decline per provider docs) → grace period; run twice.
2. **Founder activation (task, ≤ 5 min each, may wait days for KYC):** account verification (identity, IBAN, NIF, business description, public website with legal pages and pricing); accept the MoR/Managed Payments terms (Stripe: Dashboard → Settings → Managed Payments); for Paddle/Polar the review of product and website. Meanwhile keep the CTA in waitlist mode.
3. **Live objects:** recreate products/prices in live mode with the same setup script (idempotent), eligible tax codes for Managed Payments, **tax-inclusive prices** for consumers, statement descriptor, support email, branding, receipt settings, Customer Portal (cancel/update card).
4. **Webhook:** register `https://<domain>/api/webhooks/stripe` in live mode with the events the code handles (`checkout.session.completed`, `checkout.session.async_payment_succeeded|failed`, `customer.subscription.updated|deleted`, `invoice.paid`, `invoice.payment_failed`); copy the live signing secret into `STRIPE_WEBHOOK_SECRET` (founder/env flow); send a test event and confirm 2xx. MoR webhooks likewise (events per provider docs).
5. **Keys:** swap to live `STRIPE_SECRET_KEY`/provider keys in **production only**; re-deploy; `grep` the build output and client bundle for `sk_live`/secret patterns (must be absent).
6. **Real transaction:** founder buys the cheapest plan with their own card (task, 5 min), Claude verifies access/receipt/webhook/analytics `purchase`, founder refunds it (fees are not returned — state the cost); confirm refund email and access revocation.
7. **Tax and invoicing:** MoR → confirm payout details and who invoices whom (monetization.md Step 8); direct Stripe → Stripe Tax registrations (PT home + OSS) and invoice settings; flag "confirmar com um contabilista certificado".
8. **Refund flow:** documented in `docs/09-launch.md` — who refunds (founder in dashboard, or the MoR/Link support within its window), SLA 48 h, template reply in the product languages.

### Step 11 — Mobile store submission (`type: mobile`)
| Item | Apple App Store | Google Play |
|---|---|---|
| Account & fee | Apple Developer Program **US$99/year** (individual or organization; organizations may need a D-U-N-S number — verify at enrolment) | **US$25 one-time**; ID + card in legal name; verify an Android device via the Play Console app |
| Founder tasks | enrol (identity), accept agreements, App Store Connect access for the `EXPO_TOKEN`/API key | register, verify identity and device, create the app, add testers |
| Build & upload | `eas build -p ios --profile production --non-interactive` → `eas submit -p ios --latest --non-interactive` (TestFlight first; `eas submit` can add the build to an internal group) | `eas build -p android --profile production` → `eas submit -p android --latest` to the **internal** track, then closed → production |
| Store config as code | `eas metadata:push` (lint with `eas metadata:lint`) with the copy from `marketing/copy/store.<locale>.md` | same via listing fields in Play Console |
| Pre-submit gates | privacy policy URL; **privacy "nutrition labels"** covering your and your SDKs' data; age rating; demo account with working back end (guideline 2.1); in-app account deletion if accounts exist (5.1.1); IAP for digital goods (3.1.1/3.1.2); not a thin web wrapper (4.2); UGC controls (1.2) | **Data safety** form, content rating questionnaire, target audience, ads declaration, app-access instructions, privacy policy URL, target-API-level requirement (verify) |
| Assets | iPhone 6.9" screenshots (1260×2736 / 1290×2796 / 1320×2868), iPad 13" if universal, icon 1024², optional previews | icon 512², feature graphic 1024×500, 2–8 screenshots/type, optional YouTube video |
| Testing rule | TestFlight beta review for external testers | **New personal accounts (created after 2023-11-13): a closed test with ≥ 12 testers opted in for 14 consecutive days before applying for production** (review usually ≤ 7 days). **Start recruiting testers at T-21** — it is the longest lead time of the whole launch |
| Review time | typically days; allow 3 days, rejections common on first submit (verify) | production access review ≤ 7 days after the test period |
**Submitting for review and releasing are irreversible public actions → founder tasks** ("Carregar em Submit for Review", 2 min) with the exact version/build number. Use phased release/staged rollout where offered. Link the store URLs in `product.json` `links` and the site. RevenueCat/IAP products created and sandbox-tested first (monetization.md Step 4).

### Step 12 — Browser-extension store submission (`type: extension`)
- **Chrome Web Store:** developer registration is a **one-time fee (US$5 since 2020 per press coverage — confirm the amount and the 2-step-verification requirement in the dashboard)**; package a zip (`manifest.json` MV3, no remotely hosted code), single purpose, minimum permissions each justified in the "Privacy practices" tab, privacy policy URL, screenshots (1280×800 or 640×400) and small promo tile (440×280) — verify sizes in the dashboard — and store copy from `marketing/copy`. Upload to a draft first (an automated install check runs on upload), then submit; reviews take hours to days and broad host permissions (`<all_urls>`, `tabs`) slow them — Google reported longer review times in Aug 2026 (<https://developer.chrome.com/blog/cws-review-updates-2026>). Use staged percentage rollout for updates.
- **Edge Add-ons** (free) reuse the Chrome package; **Firefox AMO** (free) needs a signed build and source code if minified.
- Founder tasks: create the developer account (identity, fee), click Submit. Claude prepares the package, listing, privacy answers and test instructions for reviewers.

### Step 13 — Go-live gate and approval
1. Preconditions all true: G2 passed; Steps 2–10 done (payments may stay in waitlist mode if verification is pending — go live as a waitlist and switch later); `docs/09-launch.md` runbook complete; founder tasks 🔴 closed or explicitly waived.
2. **`go_live: auto`** in `FOUNDER.md` → proceed to Step 14 yourself and tell the founder afterwards. Otherwise send **one** pt-PT message: product, what goes live (URL, domain, payments mode), what was verified, costs, and "responde «lançar» para publicar"; set `status: needs-founder` with that single 🔴 task `HT-xx · Aprovar o lançamento (1 min)`. Do not post, email or submit to stores before the answer.
3. Push notification when the tool exists (see CLAUDE.md).

### Step 14 — Launch-day runbook (T-7 → T+7) and rollback
| When | Action | Owner | Check / command |
|---|---|---|---|
| T-7 | Freeze scope (bug fixes only); store submissions in review; domain/DNS/email live; monitors green | Claude | readiness checklist re-run |
| T-5 | Founder batch A done (accounts, keys, domain, payments activation); waitlist email #1 scheduled (draft) | Founder | `HUMAN_TASKS.md` all 🔴 closed |
| T-3 | Dress rehearsal on preview = production config in test mode; restore drill; load test the checkout path lightly | Claude | e2e + Lighthouse; logs clean |
| T-2 | Final copy/legal review; PH/Show HN/Reddit/directory kits finalised in `marketing/launch/schedule.md`; support inbox tested | Claude | links valid, UTM list complete |
| T-1 | Production deploy **without announcing** (`vercel deploy --prod`), smoke, verify analytics/Sentry/uptime; revoke test data; backups taken | Claude | Step 15 smoke; `vercel inspect` READY |
| T0 | Approval received → switch payments mode to live (if ready) → posts at the scheduled Lisbon times (Product Hunt 08:01) — **founder posts** from `schedule.md` | Founder + Claude | monitor errors, checkout, replies |
| T0 +1 h / +4 h / +24 h | Smoke test, metrics snapshot (visits, signups, purchases, errors, Sentry, uptime), reply log | Claude | numbers into `docs/09-launch.md` |
| T+1 | Thank-you posts, fix top 3 issues, update FAQ from questions | Claude/Founder | |
| T+3 | Review channel results vs `docs/08-gtm.md` tests; apply stop-losses | Claude | |
| T+7 | Retrospective: what broke, what converted, lessons → `factory/LEARNINGS.md`; hand to growth | Claude | `set-phase growth in_progress` |
**Rollback plan** (write it in `docs/09-launch.md`): triggers — checkout failing > 5 min, error rate > 2× baseline for 10 min, data corruption, a legal/security issue. Steps: (1) `vercel rollback <previous-deployment-url> --yes` (Cloudflare: `wrangler rollback <version-id>`; EAS: `eas update:rollback`); (2) kill-switch env `CHECKOUT_ENABLED=false` (or equivalent) → CTA falls back to waitlist; (3) DB: migrations must be **expand/contract** (additive, backward-compatible) so code rollback never needs a down-migration; restore from backup only for corruption; (4) pause paid campaigns; (5) pt-PT status message to the founder + status page; (6) post-mortem in `factory/LEARNINGS.md`. `vercel promote <url>` re-promotes a good deployment; `vercel project pause` is the last resort to stop traffic.

### Step 15 — Post-launch smoke test (run at T0, +1 h, +24 h; also after every production deploy)
Automate as `smoke.prod.spec.ts` in the app's e2e directory (Playwright, Chromium at `/opt/pw-browsers/chromium`, `baseURL` = production, read-only, no real purchases): every locale home returns 200 with the correct `<title>`/hreflang; hero CTA works; waitlist/sign-up accepts a test address and the confirmation email arrives (use a tagged test inbox); pricing renders VAT-inclusive prices; checkout button redirects to the provider (stop before paying); legal pages 200; `/robots.txt`, `/sitemap.xml`, 404 page, security headers (`strict-transport-security`, `x-content-type-options`, CSP/frame-ancestors, `referrer-policy`); analytics event visible; Sentry test event received then silenced; `/api/health` OK; webhook test event 2xx; Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility/SEO/best-practices on the home page.

### Step 16 — Founder tasks, batched (each ≤ 5 min; format `factory/templates/HUMAN_TASKS.md`)
| Batch | Typical tasks (time) |
|---|---|
| **A · T-14 accounts & money (🔴)** | Buy domain (4 min) · create/verify payment account (5 min, KYC may wait) · Vercel Pro if needed (3 min) · Apple/Google developer accounts (5 min each + fee) · add env tokens (3 min) |
| **B · T-5 verify & approve (🟡)** | Click the email-routing verification (1 min) · Search Console login/verify (3 min) · accept MoR/Managed Payments terms (2 min) · live-mode secrets via `SETUP.md` (3 min) · real €-purchase and refund test (5 min) · approve go-live (1 min) |
| **C · T0 public actions (🟡/🟢)** | Submit apps/extension for review (2 min each) · post the launch batch from `schedule.md` (5 min) · send partner/press messages (5 min) · pay directory/BetaList fees (3 min each) |
Each task: why, exact links, values to paste, cost, what it unblocks, what Claude does meanwhile, how to signal completion. Update the **Resumo** line.

### Step 17 — Go-live and close
1. After approval (or `auto`): `vercel deploy --prod --token "$VERCEL_TOKEN"` (Cloudflare: `wrangler pages deploy … --branch main` / `wrangler deploy`), `vercel inspect <url> --wait`, run Step 15, then announce.
2. State: `python3 factory/scripts/factory.py set <slug> links.production https://<domain> --string`, `set <slug> links.domain <domain> --string`, `set <slug> status launched --string`; `set-phase <slug> launch done --summary "live at <domain>; payments <live|waitlist>; monitors on"`; `set-phase <slug> growth in_progress`; `validate <slug>`; `render-status <slug> --write`; commit `<slug>: launch — live at <domain>`; push; refresh the PR status block.
3. Message the founder (pt-PT, short): URL, what is live, first-hour numbers, open tasks.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Environments | preview + prod | + staging DB, protection bypass for e2e | + restore drill, load test |
| Monitoring | Sentry + 3 uptime monitors | + status page, heartbeat on webhooks, DMARC reports | + synthetic checkout monitor, log drains |
| Email | Resend + Email Routing | + DMARC progression plan | + dedicated marketing subdomain, warm-up plan |
| Payments | test e2e + live checklist | + real purchase/refund drill | + tax-code/inclusive-price audit, dunning simulation |
| Stores | prepared package | + TestFlight/internal tracks + metadata as code | + phased release + review-risk audit |
| Runbook | T-1 → T+1 | T-7 → T+7 | + rehearsal + rollback drill |

## Decision rules & defaults

- Production go-live needs founder approval unless `go_live: auto`; **payments live only after Step 10 passes**; a verified waitlist launch beats a delayed launch.
- Defaults: apex canonical, DNS-only records for Vercel, DMARC `p=none` → `quarantine` after 2–4 weeks, RPO 24 h / RTO 4 h, previews on test keys, Better Stack + Sentry, Cloudflare Registrar for supported TLDs and a DNS.PT-accredited registrar for `.pt`.
- **No-go** if any: legal page missing in a locale, checkout untested, email auth failing (`dmarc=fail`), analytics or Sentry silent, secrets in the bundle, P0/P1 open, rollback path untested.
- Cost guard: sum the new recurring costs (hosting plan, domain, email, monitoring) in `docs/09-launch.md` and show the founder the monthly total before they pay anything.
- Mobile: start the Google closed test at T-21; never promise a store date to the founder — give the range.

## Output specification

| Artifact | Content |
|---|---|
| `docs/09-launch.md` | pt-PT per `factory/templates/launch.md`: environments, deploy log, env matrix (names), DNS/email records (values public by nature), monitoring, backups, payments checklist state, store status, runbook T-7→T+7 with owners, rollback plan, post-launch metrics, founder batches |
| Deployments | preview URL (always), production URL (after approval) in `product.json` `links` |
| `<app_dir>/e2e/smoke.prod.spec.ts` | production smoke test |
| `marketing/launch/schedule.md` | updated with final domain and times |
| `HUMAN_TASKS.md` | batches A/B/C with times and costs |
| `factory/LEARNINGS.md` | one-line lessons from the launch |

## Definition of Done

- [ ] Preview deployed (when tokens exist) and smoke-tested; production runbook complete; domain + DNS plan documented.
- [ ] Monitoring (Sentry, uptime, analytics) verified with real events; email auth `spf/dkim/dmarc=pass`; inbound aliases work.
- [ ] Payments: test e2e passed; live checklist completed or consciously deferred (waitlist) with a task.
- [ ] Store packages prepared and tasks written (mobile/extension); long-lead items scheduled.
- [ ] Founder tasks batched with time estimates; approval requested (or `go_live: auto` recorded).
- [ ] After go-live: smoke test green, `product.json` updated (`launched`, links), growth phase started.

## Anti-patterns

- Printing, logging or committing tokens/keys; asking for secrets in chat; using live keys on previews.
- Deploying to production before the founder's approval; announcing before the smoke test; launching on a Friday evening or without a rollback path.
- Hobby-plan hosting for a monetized product; one SPF record per tool; DMARC `p=reject` on day one; proxying Vercel through Cloudflare without a reason.
- Trusting memorized DNS targets or CLI flags; skipping `--help`.
- Down-migrations as the rollback plan; shared DB between preview and production; no backup on a free DB.
- Submitting to stores without privacy labels/data-safety, demo account, or the 14-day closed test (Google).
- Founder tasks that need more than 5 minutes or ask for the same thing twice.

## Tools & sources

Vercel CLI (`link`, `env add`, `deploy [--prod]`, `inspect --wait`, `rollback`, `promote`, `domains add|verify|inspect`), Wrangler (`pages deploy`, `deploy`, `secret`, `rollback`, `email routing`), Supabase CLI (`link`, `db push`, `functions deploy`, `secrets set`, `db dump`), EAS CLI (`build`, `submit`, `update`, `metadata`, `env:set`), Playwright, `curl`, Lighthouse. Docs (accessed 2026-10-08): Vercel fair use <https://vercel.com/docs/limits/fair-use-guidelines> · Resend domains <https://resend.com/docs/dashboard/domains/introduction>, DMARC <https://resend.com/docs/dashboard/domains/dmarc>, pricing <https://resend.com/pricing> · Cloudflare Email Routing <https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/> · Sentry pricing <https://sentry.io/pricing/> · Better Stack <https://betterstack.com/pricing> · UptimeRobot <https://uptimerobot.com/pricing/> · Supabase backups <https://supabase.com/docs/guides/platform/backups> · Apple Developer Program <https://developer.apple.com/programs/whats-included/>, App Review Guidelines <https://developer.apple.com/app-store/review/guidelines/>, privacy details <https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy> · Google Play testing requirement <https://support.google.com/googleplay/android-developer/answer/14151465>, Data safety <https://support.google.com/googleplay/android-developer/answer/10787469> · Chrome Web Store <https://developer.chrome.com/docs/webstore/register>, review updates <https://developer.chrome.com/blog/cws-review-updates-2026> · DNS.PT registrars <https://www.dns.pt>. Agents: `devops-engineer`, `qa-engineer`, `growth-marketer`.

## Hand-off

**Growth (10):** baseline metrics from the first 24 h, analytics/Search Console/Stripe access notes, channel results vs tests, open issues, the live price history table. **Founder:** the pt-PT launch message and remaining tasks. **Foreman:** `status: launched`, `links.*` set, autopilot weekly `/crescer` eligible. `factory/LEARNINGS.md`: lessons added.
