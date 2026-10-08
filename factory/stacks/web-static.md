# Recipe: web-static

## When to use

`type: web-static`: landing page, waitlist, brochure, calculator or single-purpose tool with **no
user accounts and no per-user database**. Pages are prerendered at build time; the only server code
is the three small API routes the starter ships (`/api/waitlist`, `/api/checkout`,
`/api/webhooks/stripe`). Also the base layer for every other web recipe. If the PRD has > ~50
content pages or MDX authoring → `content.md`. If users sign in → `web-saas.md`.

## Default stack

| Concern | Choice | Why | Free-tier limits (verify at execution time) |
|---|---|---|---|
| Framework | `factory/starters/web` (Next.js App Router, TS strict, Tailwind v4, Biome, Vitest, Playwright) | Tested, config-driven, legal/SEO/consent included | n/a |
| Hosting | Cloudflare Workers static assets (default) · Vercel Pro (if streaming/ISR needed) | Free tier allows commercial use; Vercel Hobby is non-commercial only | CF: 100k req/day, 10 ms CPU (https://developers.cloudflare.com/workers/platform/limits/) |
| Waitlist storage | Resend audience, or webhook adapter to the founder's tool, or console in test mode | No DB needed | Resend 3,000 emails/month, 100/day |
| Payments | `checkoutUrl` of an MoR or Stripe Payment Link (starter `pricing.plans[].checkoutUrl`) | Zero backend; tax handled by MoR | MoR fees ~5% + $0.50 (see README) |
| Analytics | Plausible or PostHog EU, behind the consent banner | Starter supports both | Plausible trial 30 d then $9/mo; PostHog 1M events/mo |
| Errors | Sentry (`@sentry/nextjs`), optional for pure static | DSN via env | 5k errors/mo |
| DNS/TLS | Cloudflare DNS or registrar DNS (founder task) | Free TLS | free |

## Scaffold

```bash
# from the repo root; slug = product.json slug
mkdir -p products/<slug>/app
tar -C factory/starters/web --exclude=node_modules --exclude=.next --exclude=out -cf - . \
  | tar -C products/<slug>/app -xf -
cd products/<slug>/app && npm install
npm run check          # baseline must be green BEFORE customizing
```

Equivalent: `cp -r factory/starters/web products/<slug>/app` then `rm -rf products/<slug>/app/{node_modules,.next,out}`.
Then follow the **customization checklist in the starter's `README.md`** (read it fully first):
`src/config/site.ts` (site, locales, company, contact, legal, pricing, analytics, flags),
`src/content/{en,pt}.ts` (copy), `npm run brand:apply -- ../brand/tokens.json`, replace the OG
image/logo, delete unused sections. Run `npm outdated` and `npm audit --omit=dev`; bump only what
`npm run check` still passes with.

Pure-static variant (PRD needs zero server): set `output: 'export'` in `next.config.ts`, delete
`src/app/api/**`, point the waitlist form to an external endpoint (a Cloudflare Worker or form
service) and re-run `npm run check`. Verify against the starter README before choosing it.

## Project structure

```
products/<slug>/app/
├── src/app/[locale]/…       pages (landing, pricing, legal/*, 404)
├── src/app/api/…            waitlist, checkout, webhooks/stripe
├── src/config/site.ts       single source of truth (company, legal, pricing, flags)
├── src/content/{en,pt}.ts   UI + landing copy; src/content/legal/{en,pt}/*.md
├── src/components/ · src/lib/ · tests/ (unit) · e2e/ (Playwright)
├── .env.example             every env var, documented
└── README.md                customization checklist (from the starter)
```

## Auth

None. Admin-only views (if any) use a secret header checked in the route + `noindex`. Otherwise go to `web-saas.md`.

## Data

No database. Waitlist emails live in the provider chosen by the adapter (`WAITLIST_ADAPTER=resend|webhook|console`).
Document each adapter's processor and region in `docs/04-architecture.md` (data map) so `legal` can list it.
Test mode = `console` adapter (writes to server log, no persistence).

## Payments

Preferred: `checkoutUrl` per plan (MoR hosted checkout), flag `payments.live=false` until the founder
completes the MoR account (`HUMAN_TASKS.md`): while false, the CTA joins the waitlist. Stripe path:
`stripePriceId` + `/api/checkout` + `/api/webhooks/stripe` (verify signature with
`STRIPE_WEBHOOK_SECRET`; test with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
only when the Stripe CLI and a test key exist; otherwise unit-test the handler with signed fixtures).

## Email

Waitlist confirmation (double opt-in when `legal` requires) through Resend: `RESEND_API_KEY`,
`RESEND_FROM`. Domain DNS (SPF/DKIM/DMARC) is a founder task. Without the key the adapter logs only.

## Analytics & monitoring

`site.analytics.provider = 'plausible' | 'posthog'`; scripts load only after consent unless the
provider runs cookieless and `legal` agrees (record in ADR). Events: `cta_click`, `waitlist_submit`,
`checkout_start` (names from the PRD success metrics). Sentry optional; uptime monitor on `/` (founder task).

## Testing

`npm run check` (lint, typecheck, unit tests, production build) then
`CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` (starter e2e serves the production build on port 3100). e2e must cover: landing renders in both locales, language switch, waitlist submit (console
adapter), pricing CTA behaviour with `payments.live` off and on (mocked), consent banner blocks
analytics until accepted, legal pages reachable from footer, 404. Axe + Lighthouse in `06-qa`.

## Deploy

Cloudflare (static export variant or OpenNext):

```bash
# static assets only (output: 'export' → out/)
npm run build
npx wrangler@latest deploy ./out --name <slug> --compatibility-date "$(date +%F)"   # needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
# Next.js server features: npm i -D @opennextjs/cloudflare@latest wrangler@latest and follow its README (verify Next 16 support)
```

Vercel (preview first; production only after founder approval or `go_live: auto`):

```bash
npx vercel@latest link --yes --project <slug> --token "$VERCEL_TOKEN"
printf %s "$VALUE" | npx vercel@latest env add NAME production --token "$VERCEL_TOKEN"   # repeat per variable, stdin keeps secrets out of argv
npx vercel@latest deploy --token "$VERCEL_TOKEN"            # preview URL on stdout → products/<slug>/product.json links.preview
npx vercel@latest deploy --prod --token "$VERCEL_TOKEN"     # production
```

Smoke test the printed URL: `curl -sI <url>` 200, `/sitemap.xml`, `/robots.txt`, `/en`, `/pt`, legal pages.

## Costs

| Users/month | Cloudflare path | Vercel path |
|---|---|---|
| 0 (pre-launch) | €0 + domain (~€10–15/yr, founder) | Hobby €0 for non-monetized previews only |
| 100 | €0 | Pro $20/month once monetized |
| 10,000 | €0–5 (stays inside 100k req/day if cached; static asset requests are cheap, verify) + Resend free/Pro $20 | $20 + overages (bandwidth > 1 TB included on Pro, verify) |

## Gotchas

- Vercel Hobby forbids commercial use: do not put a monetized production site there.
- `output: 'export'` breaks API routes, `next/image` default optimizer (set `images.unoptimized`) and middleware.
- Placeholder `{{…}}` left in legal markdown ships as visible text: `grep -rn "{{" src/content` must be empty.
- Dates and prices in copy go stale: render from `site.ts`, not literals.
- Preview deployments are public by default on Cloudflare; add `noindex` headers on non-production hosts.
- Analytics before consent is a compliance bug (P0 in `06-qa`).
