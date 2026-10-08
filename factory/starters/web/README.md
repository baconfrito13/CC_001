# Web launch starter

A production-grade, minimal Next.js starter for the factory's web products: a bilingual
(English + European Portuguese) marketing site with legal pages, consent-first analytics, a
waitlist, a pricing page and payments. It is configured mostly by editing a few config and
content files. It is fully tested: lint, typecheck, unit tests, production build and
end-to-end tests (including accessibility checks) all run from a clean install.

**Never edit a product inside `factory/starters/web/`.** Copy the folder (see below).

## What is included

| Area | What you get |
|---|---|
| Stack | Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4 (CSS-first), npm + committed lockfile |
| Pages | `/` (redirect to the best locale), `/[locale]` home (hero, problem, features, how it works, pricing teaser, FAQ, waitlist CTA), `/[locale]/pricing`, `/[locale]/legal/[doc]`, localized 404 |
| i18n | `en` and `pt` (European Portuguese, `<html lang="pt-PT">`), sub-path routing, Accept-Language negotiation in `src/proxy.ts`, hreflang alternates |
| SEO | `sitemap.xml` with alternates, `robots.txt`, canonical URLs, Open Graph image per locale (`next/og`), JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage), `noindex` on previews |
| Legal | Markdown templates (privacy, terms, cookies, withdrawal, legal notice) in both locales, rendered at build time from `{{placeholders}}`, EU/Portugal-aware (RGPD, ePrivacy, consumer law, Livro de Reclamações, RAL) |
| Consent | Cookie banner with equal-weight Accept/Reject, stored in `localStorage` + `consent` cookie, re-openable from the footer, `useConsent()` hook |
| Analytics | Plausible or PostHog, loaded only after consent (Plausible may run cookieless), `track()` helper for product events |
| Waitlist | `POST /api/waitlist`: zod validation, explicit consent + timestamp, honeypot, rate limit, adapters (Resend, webhook, console) |
| Payments | `checkoutUrl` (Merchant of Record / Payment Link) or Stripe Checkout (`POST /api/checkout`, `POST /api/webhooks/stripe` with an `onPaymentEvent` hook), optional Stripe Managed Payments |
| Consumer law | Livro de Reclamações button in the footer of every page (all locales), online **withdrawal function** (`/[locale]/withdraw`, `POST /api/withdrawal`) when selling to consumers |
| Ops | `GET /api/health`, security headers + CSP, `.env.example`, deploy notes |
| Quality | Biome (lint + format), Vitest unit tests, Playwright e2e against a production build, axe accessibility checks |

## Commands

```bash
npm ci                 # install exactly what the lockfile says
npm run dev            # http://localhost:3000
npm run lint           # biome check (lint + format + import order)
npm run format         # biome check --write
npm run typecheck      # tsc --noEmit
npm test               # vitest (unit tests)
npm run build          # next build
npm run test:e2e       # playwright against `next build && next start` on :3100
npm run test:smoke     # read-only smoke tests (see "Production smoke test")
npm run check          # lint + typecheck + test + build
npm run brand:apply -- ../brand/tokens.json
```

Everything green from a clean checkout: `npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`.

In a sandbox that has a different Chromium than Playwright expects, run e2e with
`CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`. In GitHub Actions use
`npx playwright install --with-deps chromium` instead and leave the variable unset:

```yaml
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }
- run: npm ci
- run: npm run check
- run: npx playwright install --with-deps chromium
- run: npm run test:e2e
```

## Customize for a product

1. **Copy** the folder: `cp -r factory/starters/web products/<slug>/app` (then `npm ci` there).
2. **`src/config/site.ts`**: the single source of truth, validated with zod (a typo fails the
   build). Set `site` (name, tagline, description, domain), `company` (legal name, NIF, VAT,
   registry, address), `contact`, `legal` (dates, governing law, RAL entity, `sellsToConsumers`),
   `social`, `pricing.plans`, `analytics`, `payments` and `features`.
3. **Copy**: edit `src/content/en.ts` and `src/content/pt.ts` (all UI text; both files must have
   the same shape, TypeScript enforces it). Final landing copy comes from the GTM phase.
4. **Brand**: `npm run brand:apply -- ../brand/tokens.json` regenerates `src/app/tokens.css`
   from the brand phase's tokens (shape: `brand/tokens.example.json`; WCAG AA contrast is
   checked and warned about, `--strict` fails). Then replace `src/app/icon.svg` with
   `brand/logo-mark.svg` and the shape in `src/components/Logo.tsx` with the real logo.
5. **Legal**: the files in `src/content/legal/{en,pt}/*.md` are *templates*, marked as such at
   the top. The legal phase replaces them (same file names) using only the placeholder keys
   below, and removes the template banner. A leftover or unknown `{{key}}` fails the build.
6. **Environment**: copy `.env.example` to `.env.local` and set what you use (see the file for
   purpose, source and "required for" of every variable). At least set `NEXT_PUBLIC_SITE_URL`
   in production.
7. **Analytics**: set `NEXT_PUBLIC_ANALYTICS_PROVIDER` (`plausible` | `posthog`) and its
   domain/key. Add your PRD events to `AnalyticsEvents` in `src/lib/track.ts`.
8. **Payments**: pick one per plan (below). With neither, the plan button leads to the waitlist.
9. **Waitlist and withdrawals**: set `RESEND_API_KEY` (+ `RESEND_SEGMENT_ID`, and `RESEND_FROM` for the
   withdrawal acknowledgement emails) or `WAITLIST_WEBHOOK_URL` (/ `WITHDRAWAL_WEBHOOK_URL`).
10. **Features**: switch `features.waitlist` / `features.pricing` off in `site.ts` if the product
    does not need them (CTAs adapt; the pricing route returns 404 when off).
11. Run `npm run check && npm run test:e2e`, update tests that mention Acme copy, commit.

Legal placeholder keys (`{{key}}` in the markdown; exact and flattened from the config):
`site.name`, `site.url`, `site.domain`, `company.legalName`, `company.taxId`, `company.vatId`,
`company.registration`, `company.address`, `company.country`, `contact.email`,
`contact.supportEmail`, `contact.privacyEmail`, `legal.effectiveDate`, `legal.lastUpdated`,
`legal.governingLaw`, `legal.jurisdiction`, `legal.ralEntityName`, `legal.ralEntityUrl`,
`legal.complaintsBookUrl`, `legal.supervisoryAuthority`, `legal.supervisoryAuthorityUrl`.
Dates and `governingLaw`/`jurisdiction` are rendered in the reader's language.
The `withdrawal` document is published only when `legal.sellsToConsumers` is true.

## Consumer-law features (Portugal / EU)

- **Livro de Reclamações.** DL 156/2005 (art. 5.º-B) requires a visible, prominent link to the
  electronic complaints book on the website of a provider established in Portugal, whatever the
  visitor's language. The footer of **every** page in **every** locale shows a button-styled
  link named "Livro de Reclamações" (an English hint is added for screen readers in `en`) to
  `legal.complaintsBookUrl`; the legal notice repeats it with the RAL entity. No page links to
  the EU ODR platform, which was discontinued on 20 July 2025 (a test enforces it).
- **Online withdrawal function** (Art. 11a of Directive 2011/83/EU, added by Directive (EU)
  2023/2673, applicable from 19 June 2026). Only when `legal.sellsToConsumers` is true: a
  clearly labelled footer link ("Withdraw from contract" / "Cancelar contrato (livre
  resolução)") leads to `/[locale]/withdraw`, a short form (name, email, order/contract
  reference, optional message, honeypot) that posts to `POST /api/withdrawal`. The consumer
  then sees a confirmation with the time of receipt and is told an acknowledgement will be
  emailed. With `sellsToConsumers: false` the link, the page and the API do not exist (404).
  - Validation, same-origin check and an in-memory rate limiter (own bucket, 5 per 10 minutes
    per IP) work like the waitlist. Production without an adapter answers `503` and logs an error.
  - Delivery uses the waitlist's adapter choice. **Resend** (needs `RESEND_API_KEY` and
    `RESEND_FROM`) emails the statement to `contact.supportEmail` first, then sends the consumer
    the acknowledgement of receipt in their language. **Webhook** (`WITHDRAWAL_WEBHOOK_URL`, else
    `WAITLIST_WEBHOOK_URL`) receives `{ type: "withdrawal", name, email, reference, message,
    locale, submittedAt, source, acknowledgement: { subject, text } }`: **the receiving
    automation must send the acknowledgement**. **Console** (development only) prints it.
  - If delivery fails the page tells the consumer to email `contact.supportEmail` instead:
    a technical failure must never block the right of withdrawal.
  - Email copy lives in the dictionaries (`withdrawal.email`); the legal phase reviews it.

## Payments

| Option | When | How |
|---|---|---|
| **`checkoutUrl`** on the plan | Fastest, no backend: Lemon Squeezy, Paddle, Polar (Merchants of Record) or a Stripe Payment Link | The pricing button opens the link. Nothing else to configure. |
| **`stripePriceId`** on the plan | You want Stripe Checkout inside your own flow | Set `STRIPE_SECRET_KEY`; the button calls `POST /api/checkout` (subscription for `month`/`year`, one-time payment for `one_time`) and redirects. Return URLs are localized and built from `NEXT_PUBLIC_SITE_URL`. Without the key the endpoint answers `501` with a clear message. |
| Neither | Pre-launch | The button leads to the waitlist. |

A plan can have `checkoutUrl` **or** `stripePriceId`, not both (validated).

**Webhooks**: create a Stripe webhook endpoint `https://<domain>/api/webhooks/stripe` for
`checkout.session.completed` and `customer.subscription.created|updated|deleted`, and set
`STRIPE_WEBHOOK_SECRET`. The signature is verified against the raw body. Implement your logic in
`onPaymentEvent` (`src/lib/payments.ts`); it receives typed, normalized events and must be
idempotent (Stripe retries on failure).

**Stripe Managed Payments (Stripe as Merchant of Record).** The installed SDK (`stripe@23`)
supports it on Checkout Sessions as `managed_payments: { enabled: true }` (verified in
`node_modules/stripe/esm/resources/Checkout/Sessions.d.ts`). Set
`payments.stripeManagedPayments: true` in `src/config/site.ts` and `/api/checkout` creates its
sessions with it. Your Stripe account must be eligible and have Managed Payments enabled in the
Dashboard (https://docs.stripe.com/payments/managed-payments). For a Payment Link used through
`checkoutUrl`, enable Managed Payments on the link in the Dashboard (the SDK also exposes
`managed_payments` on Payment Link creation). When Stripe is the Merchant of Record the terms,
withdrawal and privacy documents must say so: adjust them in the legal phase.

## Consent and analytics

- The banner appears on first visit; Accept and Reject are the same size, weight and style
  (an e2e-tested property). The choice lasts 180 days, is stored in
  `localStorage` and in a first-party `consent` cookie, and can be changed from the footer
  ("Cookie settings"). `useConsent()` (in `src/components/CookieConsent.tsx`) exposes it.
- `Analytics` loads **Plausible** after consent, or immediately when `analytics.cookieless`
  is true (no cookies, no personal data on the device); **PostHog** always needs consent.
  Nothing else (no fonts, no images) is fetched from third parties.
- Product events: `track("waitlist_signup", { locale })` from any client code. It is a no-op
  without a provider or consent. Add events to `AnalyticsEvents` in `src/lib/track.ts`
  (Plausible: create a matching Goal; PostHog: events appear automatically).
- Update `src/content/legal/*/cookies.md` to list the real analytics tool in the legal phase.

## Search engines and previews

Only production is indexable. `robots.txt` disallows everything, pages carry
`<meta name="robots" content="noindex, nofollow">` and responses get `X-Robots-Tag: noindex`,
**unless** `VERCEL_ENV=production` (set automatically by Vercel) or `NEXT_PUBLIC_INDEXABLE=true`.
`NEXT_PUBLIC_INDEXABLE=false` hides even a production deployment (useful before launch day).
On Cloudflare or self-hosting you **must** set `NEXT_PUBLIC_INDEXABLE=true` for production, or
the site stays hidden from search engines. Rules live in `src/lib/indexing.ts`.

## Security headers and CSP

`next.config.ts` sends HSTS (2 years, subdomains, no `preload`), `X-Content-Type-Options`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`
and `Cross-Origin-Opener-Policy: same-origin-allow-popups`.

In production it also sends a **Content-Security-Policy** that works with the statically
rendered pages and hydration (verified by the e2e suite): `default-src 'self'`, `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, network access only to the site
and the configured analytics provider. `script-src` needs `'unsafe-inline'` because static pages
cannot carry a per-request nonce. For a strict nonce-based policy (no `'unsafe-inline'`) follow
`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`: generate the nonce in
`src/proxy.ts`; this forces dynamic rendering of every page, so only do it if the product needs it.
If you add a third-party script, image host or form target, add its origin to the policy.

## Fonts

The default is the system font stack (set in `tokens.css`, no network at build or run time).
To use a web font, switch to `next/font` in `src/app/[locale]/layout.tsx`:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// <html lang=... className={inter.variable}>
```

then reference it in the brand tokens: `"sans": "var(--font-inter), ui-sans-serif, system-ui, sans-serif"`
(`var(--name)` references are accepted by `brand:apply`). `next/font` downloads the font at build
time and self-hosts it, so visitors never contact Google, and the CSP's `font-src 'self'` covers it.

## Deploy

**Vercel** (default): import the repository, set **Root Directory** to the app folder
(`products/<slug>/app`), framework preset Next.js, then add the environment variables from
`.env.example` (at least `NEXT_PUBLIC_SITE_URL`, a waitlist adapter, analytics and Stripe if used).
Add the domain, check `/api/health`, then run the smoke test below. Preview deployments are
automatically `noindex`.

**Cloudflare** (Workers): use the OpenNext adapter (`@opennextjs/cloudflare`) with
`wrangler`; follow https://opennext.js.org/cloudflare. Not wired in here. Notes: set
`NEXT_PUBLIC_INDEXABLE=true`, provide the env vars as Worker variables/secrets, and re-run the
e2e and smoke tests against the Workers URL. The in-memory rate limiter is per isolate, so add a
Cloudflare rate-limit rule for `/api/waitlist`.

## Production smoke test

`npm run test:smoke` runs `tests/e2e/smoke.spec.ts` (read-only: health, both locales, legal pages
without placeholders, consent banner, robots/sitemap, security headers, 404). Point it at a
deployment with `BASE_URL`; no local server is started:

```bash
BASE_URL=https://my-product.vercel.app npm run test:smoke
```

Do not run the full e2e suite against a live site: it submits the waitlist form and expects the
test configuration of the local build.

## Versions and why

Verified with `npm view` on 2026-10-08 and pinned exactly in `package.json` / `package-lock.json`.

| Package | Version | Note |
|---|---|---|
| next | 16.4.0 | `middleware.ts` is now `proxy.ts`; `next lint` no longer exists, so Biome does lint and format |
| react / react-dom | 19.3.0 | |
| typescript | 7.0.2 | The native compiler works with Next 16.4: `next build` type-checks with the project's `tsc` CLI (see `node_modules/next/dist/docs/.../typescript.md`). No fallback to TS 5/6 was needed. The JS compiler API is not available in TS 7, so do not set `experimental.useTypeScriptCli: false`. |
| tailwindcss + @tailwindcss/postcss | 4.3.3 | CSS-first: no `tailwind.config.js`; tokens in `src/app/tokens.css` feed `@theme inline` |
| @biomejs/biome | 2.5.15 | |
| vitest | 5.0.3 | node environment, `tests/unit` |
| @playwright/test / @axe-core/playwright | 1.64.0 / 4.13.0 | |
| stripe | 23.0.0 | API version is the SDK's own pinned one; none is set in code |
| zod | 4.6.5 | |
| resend | 6.32.1 | Audiences were renamed to **segments**; the adapter uses `contacts.create({ segments })` |
| marked | 18.1.0 | legal markdown at build time (trusted content, HTML passes through) |

## Gotchas

- **Next.js 16 is not the Next.js you know.** Read the docs shipped with the installed version
  in `node_modules/next/dist/docs/` before changing framework-level code (`params` are promises,
  `proxy.ts`, root params, ...). `agentRules: false` stops `next dev` from writing an `AGENTS.md`.
- **404 pages are rendered by the browser.** With Next 16.4, `notFound()` answers with a real
  `404` status but sends an empty HTML shell and renders the localized 404 after hydration (same
  in a plain Next app; the root layout lives in `[locale]`). Crawlers see the status and
  `noindex`; the e2e tests assert the status and the visible heading.
- **Keep `dynamicParams` on for `legal/[doc]`.** With `false`, Next 16.4 answered RSC requests for
  unknown documents with a 307 redirect loop. Unknown documents call `notFound()` instead. The
  locale switcher links use `prefetch={false}` for the same reason.
- **Never give a script element the id of a global.** Browsers expose elements by id on
  `window`, so `<script id="plausible">` shadows `window.plausible` and `<script id="posthog">`
  breaks the PostHog loader. The analytics scripts use `analytics-*` ids; `track()` also copes.
- **Stale `.next` breaks `typecheck`.** `tsconfig.json` includes `.next/dev/types`; after deleting
  or renaming routes run `rm -rf .next`.
- **`NEXT_PUBLIC_*` and indexing variables are build-time.** Change them, then redeploy.
- The footer year and legal "effective date" are fixed at build time; redeploy to refresh.
- The waitlist rate limit is in memory (per server instance): use a firewall rule for real abuse
  protection. The `console` adapter logs e-mail addresses: development and tests only.
- In production without a waitlist adapter `/api/waitlist` answers `503` and logs an error: set
  `RESEND_API_KEY` or `WAITLIST_WEBHOOK_URL` before launch.
- Resend contacts record the signup time (`created_at`) as the consent timestamp; the webhook
  adapter sends `consentAt` explicitly. Add a Resend contact property if you need both.
- Legal documents are templates, not legal advice. The `legal` phase must review and replace them.
- `src/proxy.ts` redirects every path without a locale to `/<best-locale><path>`, including
  unknown ones (they end in the localized 404). Files and `/api` are excluded by the matcher.
