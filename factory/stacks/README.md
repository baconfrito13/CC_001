# Stack Decision Matrix

Product `type` (from `product.json`) → recipe → defaults. The architect (phase `04-architecture`)
picks the recipe; the builder (phase `05-build`) executes it. A recipe is a **default, not a
cage**: deviate only under the rules in "Deviation policy" below, always with an ADR
(`factory/templates/adr.md` → `docs/adr/NNNN-*.md`).

**Rule zero (every build, every recipe).** Never trust remembered versions, flags or APIs.
Before using a package: `npm view <pkg> version`, read the installed package's README/types/
changelog (`node_modules/<pkg>`), and prefer the official scaffolding CLI at `@latest`.
Registry snapshot checked 2026-10-08 (re-check, do not copy): next 16.4, react 19.3,
tailwindcss 4.3, typescript 7.0 (native port; the scaffolders still pin 5.x/6.x, and some tools
may not support 7 yet: keep what the scaffolder installs unless `typecheck` is green on 7),
vitest 5.0, eslint 10, @biomejs/biome 2.5, expo 57, astro 7, hono 4.13, wrangler 4.148,
wxt 0.21, better-auth 1.7, drizzle-orm 0.45, @supabase/supabase-js 2.117, stripe 23, zod 4.6,
@anthropic-ai/sdk 0.132, @playwright/test 1.64.

## 1. Matrix

| `type` | Recipe | Default stack (one line) | Hosting | Default monetization | Deviate when (ADR) |
|---|---|---|---|---|---|
| `web-static` | [web-static.md](web-static.md) | Web starter (Next.js static export) | Cloudflare (Workers static assets) or Vercel Pro | Waitlist → MoR checkout link, ads, affiliate | Content-heavy (> ~50 pages, MDX authoring) → `content` recipe/Astro |
| `web-saas` | [web-saas.md](web-saas.md) | Starter + Supabase (Postgres, Auth, Storage, RLS) + Resend + PostHog EU/Plausible + Sentry | Vercel Pro (or Cloudflare via OpenNext) | Subscription via MoR or Stripe | Need portable auth/DB or non-Supabase Postgres → Better Auth + Drizzle + Neon |
| `ai-app` | [ai-app.md](ai-app.md) | `web-saas` + Anthropic SDK (Claude), streaming, prompt caching, quotas | Vercel Pro (long streaming) | Credits/usage-tier subscription | Pure batch/offline jobs → Workers + Queues; non-text modality → ADR with provider evidence |
| `api` | [api.md](api.md) | Hono on Cloudflare Workers + D1/KV/R2, API keys, Stripe meters, OpenAPI | Cloudflare | Usage-based (Stripe meters) + free tier | Heavy CPU (> 30 s) or Node-only libs → Node container (Fly.io/Railway) |
| `mobile` | [mobile.md](mobile.md) | Expo (Router) + EAS + RevenueCat + Supabase | App Store / Google Play | IAP/subscriptions via RevenueCat | Needs native modules Expo cannot cover → prebuild/bare, still EAS; games → ADR |
| `extension` | [extension.md](extension.md) | WXT + TypeScript, MV3, optional React | Chrome Web Store, Firefox AMO, Edge Add-ons | MoR license keys or ExtensionPay | Needs server state → add `api`/`web-saas` component |
| `ecommerce` | [ecommerce.md](ecommerce.md) | Shopify (physical goods) · MoR/Stripe + starter (digital goods) | Shopify / Vercel | Product sales | Custom logic Shopify cannot do (rare) → headless Hydrogen/Next + Storefront API |
| `content` | [content.md](content.md) | Astro 7 + MDX (or starter blog), programmatic SEO, newsletter | Cloudflare or Vercel | Ads, affiliate, newsletter sponsorship, paid tier | Interactive app-like site → `web-saas` |
| `bot` | [bot.md](bot.md) | Telegram (grammY) / Discord / WhatsApp on Workers or Node, + landing from starter | Cloudflare Workers / Node container | Subscription via MoR, premium tier | Long-lived websocket (Discord gateway) → Node container |
| `desktop` | Section 4 below | Tauri 2 + web UI from the starter | GitHub Releases + MoR license keys | One-time/license key | Electron only if a Node-native dependency is unavoidable |
| `other` | none | Closest recipe above | per ADR | per PRD | ADR mandatory describing the closest recipe and every difference |

## 2. How to choose the recipe (apply in order, first match wins)

1. Primary deliverable installs on a phone → `mobile`. In a browser toolbar → `extension`.
   Runs inside Telegram/Discord/WhatsApp → `bot`. Installs on a PC/Mac → `desktop`.
2. Physical goods or catalogue + checkout is the product → `ecommerce`.
3. Primary deliverable is an HTTP API consumed by developers → `api`.
4. A language model is the core value (generation, extraction, chat, agent) → `ai-app`.
5. Users sign in and own persisted data → `web-saas`.
6. Mostly articles/guides/directories that earn through traffic → `content`.
7. Otherwise (landing, waitlist, brochure, calculator, single tool without accounts) → `web-static`.

Hybrids: the main deliverable gets `stack.recipe` and `app/`; secondary deliverables are sibling
folders listed in `stack.components` (`api/`, `mobile/`, `extension/`), each following its own
recipe. Write the contract between them (API schema, auth model) in `docs/04-architecture.md`.
Record the choice: `python3 factory/scripts/factory.py set <slug> stack.recipe web-saas`
(also `stack.hosting`, `stack.payments`, `stack.database`, `stack.auth`, `stack.components`).

## 3. Cross-cutting defaults (all recipes)

| Concern | Default | Alternative | Rule |
|---|---|---|---|
| Language/tooling | TypeScript strict, Node ≥ 22, npm + committed lockfile, Biome (starter) or ESLint 10 | pnpm | Keep the scaffolder's choice; never mix two linters |
| Validation | zod 4 at every boundary (env, request, webhook, LLM output) | valibot | No unvalidated `req.json()` |
| i18n | `en` + `pt-PT` (starter: `en`/`pt`), all strings in content files | next-intl when > 2 locales | No user-facing literal in components |
| Data residency | EU region for DB, storage, analytics, email | US if the audience is US-only (ADR) | Processors listed in `legal/` (RoPA/subprocessors) |
| Auth | Supabase Auth (web-saas) · Better Auth + Drizzle (alternative) | Clerk/Auth0 only with ADR (cost at 10k MAU) | Passwordless/OAuth first; MFA available |
| Database | Supabase Postgres + RLS mandatory | Neon Postgres + Drizzle; D1 for Workers APIs | Migrations in git, never dashboard-only changes |
| Payments | MoR for digital goods at launch, in the order of `factory/playbooks/monetization.md` (Stripe Managed Payments · Paddle · Polar · Gumroad; not Lemon Squeezy for new products) | Stripe Checkout + Stripe Tax for B2B-only, Billing/Connect/meters | Always behind a feature flag + test mode; see "Payments" below |
| Email | Resend (transactional) | Postmark; Buttondown/Beehiiv for newsletters | SPF, DKIM, DMARC set (founder task for DNS) |
| Analytics | Plausible (cookieless, no consent banner needed for it alone) or PostHog EU | Umami self-hosted | Loaded only after consent when it sets cookies/IDs |
| Errors | Sentry (`@sentry/nextjs`, `@sentry/cloudflare`, `@sentry/react-native`) | — | Enabled by `SENTRY_DSN`; no PII in events |
| Uptime | Free external monitor (Better Stack/UptimeRobot) on `/api/health` | Cloudflare health checks | Founder task: account |
| CI | GitHub Actions: `npm ci && npm run check`, path-filtered to the product | — | Same commands as local |
| Secrets | Env vars only; `.env.example` + zod `env.ts`; platform secret stores | — | Never commit `.env*` |

### Hosting and commercial use

- **Vercel Hobby is restricted to non-commercial, personal use** (Vercel Hobby docs, fetched
  2026-10-08: https://vercel.com/docs/plans/hobby). A product that charges money or shows ads
  needs Vercel Pro (Pro developer seat $20/user/month at that date) or another host.
  Previews for validation are fine on Hobby; production monetized sites are not.
- **Cloudflare Workers/static assets** has a free tier usable commercially (verify the current
  Terms): 100,000 requests/day, 10 ms CPU/request. Default for `web-static`, `content`, `api`, `bot`.
- Next.js on Cloudflare uses `@opennextjs/cloudflare` (verify compatibility with the Next major).
- Decision: zero revenue yet and no ads → Vercel Hobby preview or Cloudflare. Revenue or ads →
  Cloudflare, or Vercel Pro if Next.js server features/streaming need it and `docs/02-business.md`
  cost model absorbs $20/month.

### Payments (verify fees at execution time on the provider pricing page)

| Option | Fees (fetched 2026-10-08) | Handles VAT/sales tax | Pick when |
|---|---|---|---|
| Paddle (MoR) | 5% + $0.50 per checkout (https://www.paddle.com/pricing) | Yes | SaaS/software, B2B+B2C, founder wants zero tax admin |
| Stripe Managed Payments (MoR) | 3.5% on top of Stripe processing (https://support.stripe.com/questions/managed-payments-pricing) | Yes | Default MoR for digital products on the starter's Stripe path (Portugal supported) |
| Lemon Squeezy (MoR) | 5% + $0.50 (https://www.lemonsqueezy.com/pricing) | Yes | Legacy only: do not start new products here (see `monetization.md`) |
| Polar (MoR) | Starter 5% + $0.50 (+1.5% intl cards); Pro $20/mo 3.8% + $0.40 (https://polar.sh/docs/merchant-of-record/fees) | Yes | Developer tools, open-source, usage billing |
| Stripe direct | EEA cards 1.5% + €0.25; UK 2.5% + €0.25; intl 3.15% + €0.25 (https://stripe.com/en-pt/pricing); Stripe Tax 0.5% or €0.45/tx | Only with Stripe Tax + founder registrations | Marketplaces (Connect), metered API billing, high volume, physical goods |
| RevenueCat | Free to $2,500 monthly tracked revenue, then 1% (https://www.revenuecat.com/pricing/) | App stores collect tax | Mobile in-app purchases |
| Shopify Payments | Basic 2.9% + $0.30 online (https://www.shopify.com/pricing) | Shopify Tax/Markets | Physical goods |

Default: MoR for digital goods until MRR passes ~€10k, because it removes EU VAT registration/OSS
filing and invoicing from the founder. Stripe direct when the PRD needs Billing meters, Connect or
the MoR forbids the category. Starter fields: `checkoutUrl` (MoR link / Stripe Payment Link) or
`stripePriceId`. Account creation and going live are founder tasks (`HUMAN_TASKS.md`).

## 4. Desktop (`type: desktop`) — Tauri 2

- Scaffold: `npm create tauri-app@latest <name> -- --template react-ts --manager npm --yes`
  (create-tauri-app 4.7; verify flags with `--help`). Needs Rust (`cargo`) and OS build deps.
- UI: reuse the web starter's components/brand; store config in the Tauri store plugin, never in
  the webview's localStorage for secrets. Allowlist commands/capabilities explicitly (least privilege).
- Build/sign: GitHub Actions matrix (macOS, Windows, Linux) with `tauri-apps/tauri-action`.
  macOS notarization needs an Apple Developer account ($99/year, https://developer.apple.com/programs/whats-included/);
  Windows code-signing certificate cost varies: both are founder tasks.
- Distribution: GitHub Releases + Tauri updater (signed updates) + a landing page from `web-static`.
  Monetization: MoR license keys (Polar or Paddle) validated at startup with offline grace.
- Tests: Vitest for logic, Playwright against the web UI, one smoke test launching the built app (`tauri build --debug`).
- Cloud sessions cannot sign or notarize: prepare the pipeline, mark signing as founder task.

## 5. Free-tier cheat sheet (fetched 2026-10-08; verify before relying)

| Service | Free tier | Source |
|---|---|---|
| Supabase | 2 active projects, paused after 1 week inactivity, 500 MB DB, 1 GB storage, 5 GB egress, 50k MAU. Pro from $25/month | https://supabase.com/pricing |
| Neon | 100 projects, 100 CU-hours/project, 1 GB/project, scale-to-zero after 5 min | https://neon.com/pricing |
| Cloudflare Workers | 100k requests/day, 10 ms CPU, 50 subrequests | https://developers.cloudflare.com/workers/platform/limits/ |
| Cloudflare D1 | 5M rows read/day, 100k rows written/day, 5 GB | https://developers.cloudflare.com/d1/platform/pricing/ |
| Cloudflare KV | 100k reads/day, 1,000 writes/day, 1 GB | https://developers.cloudflare.com/kv/platform/pricing/ |
| Cloudflare R2 | 10 GB-month, 1M class A, 10M class B ops, free egress | https://developers.cloudflare.com/r2/pricing/ |
| Resend | 3,000 emails/month, 100/day, 3 domains. Pro $20/month for 50k | https://resend.com/pricing |
| Sentry | 5k errors/month, 1 user, 30-day retention. Team $26/month (annual) | https://sentry.io/pricing/ |
| PostHog | 1M events, 5k recordings, 1M flag requests per month; EU cloud available | https://posthog.com/pricing (via search 2026-10-08; page was truncated) |
| Plausible | No free plan: 30-day trial, then from $9/month (10k pageviews) | https://plausible.io/#pricing |
| Expo EAS | 15 Android + 15 iOS builds/month, 1,000 update MAU. Starter $19/month | https://expo.dev/pricing |
| Buttondown | Free to 100 subscribers | https://buttondown.com/pricing |
| Apple Developer | $99/year | https://developer.apple.com/programs/whats-included/ |
| Google Play / Chrome Web Store | One-time fees ($25 / $5 as last known) — not verified, check at registration | https://play.google.com/console · https://developer.chrome.com/docs/webstore/register |

## 6. Deviation policy

Allowed reasons (any one): a PRD must-story cannot be met by the recipe; a measured limit is
exceeded (cost, latency, quota) with numbers; a legal/data-residency requirement; a tool is
deprecated/unmaintained (cite date); founder constraint in `FOUNDER.md`. Not allowed: novelty,
personal preference, resume-driven choices, skipping RLS/validation/consent to save time.

Every deviation = `docs/adr/NNNN-<slug>.md` with context, options (≥ 2 with costs), decision,
consequences, revisit trigger. The architect lists deviations in `docs/04-architecture.md` §3.
The builder may not deviate on its own: record a blocker or open an ADR with `status: proposed`
and continue on the recipe path unless the PRD must-story is impossible.

## 7. Founder-account dependencies by recipe

| Recipe | Needs (all batched into `HUMAN_TASKS.md`; app runs in test mode until done) |
|---|---|
| web-static / content | Domain + DNS; Cloudflare or Vercel account/token; analytics account (optional) |
| web-saas / ai-app | + Supabase org (`SUPABASE_ACCESS_TOKEN`), Resend key + domain DNS (SPF/DKIM), MoR/Stripe account, Sentry DSN; ai-app: `ANTHROPIC_API_KEY` + spend limit |
| api | Cloudflare token (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), Stripe account for meters |
| mobile | Apple Developer ($99/yr), Google Play ($25), Expo account (`EXPO_TOKEN`), RevenueCat project, store listings |
| extension | Chrome Web Store + AMO accounts, MoR/ExtensionPay account |
| ecommerce | Shopify store (or MoR account), payment gateway KYC, shipping/returns policy decisions |
| bot | Bot tokens from BotFather / Discord portal / Meta Business verification (WhatsApp) |
| desktop | Apple Developer + Windows signing certificate |

Tokens are environment variables (`VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
`SUPABASE_ACCESS_TOKEN`, `EXPO_TOKEN`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`): run
`python3 factory/scripts/factory.py doctor` to see which exist. Never ask for a token in chat.

## 8. Adding or changing a recipe

Open a factory PR (`🛠️ Fábrica: …`). A recipe must keep the headings of the existing recipes,
every command must have been executed once (note date + versions in the PR), and every price or
limit needs a URL and an access date. Add a lesson to `products/<slug>/docs/lessons.md` when a recipe step failed (the foreman moves it into `factory/LEARNINGS.md`).
