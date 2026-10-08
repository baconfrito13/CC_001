# Recipe: content

## When to use

`type: content`: the product is content that earns through traffic: niche blog/magazine, guides,
directories, comparison/calculator pages generated from data (programmatic SEO), newsletters, curated
resources. Monetization: ads, affiliate, sponsorships, paid newsletter/membership, lead gen. Sign-in or
per-user data → `web-saas.md`. A 5–10 page marketing site → `web-static.md`. Use this recipe when
> ~50 pages, MDX authoring, or page generation from datasets is in the PRD.

## Default stack

| Concern | Choice | Why | Limits/prices (verify at execution time) |
|---|---|---|---|
| Framework | Astro 7 + `@astrojs/mdx` + `@astrojs/sitemap`, content collections, TypeScript strict | Zero-JS pages, best Lighthouse, native Markdown/MDX | free |
| Alternative | Web starter + MDX (`@next/mdx`) when the site is mainly a product landing with a small blog | Reuse legal/consent/pricing | ADR |
| Styling | Tailwind v4 via `@tailwindcss/vite`; brand tokens from `brand/tokens.json` | Same tokens as web starter | free |
| Hosting | Cloudflare Workers static assets (`wrangler deploy ./dist`) or Vercel Pro (monetized) | Free commercial tier; Vercel Hobby is non-commercial | CF Free 100k req/day |
| Search | Pagefind (`npx pagefind --site dist`) | Static, no server | free |
| Newsletter | Buttondown (free to 100 subscribers) or Beehiiv; Resend for transactional only | Double opt-in, exports, EU-friendly | https://buttondown.com/pricing |
| Ads | Google AdSense or Ezoic/Mediavine later, via a certified CMP in the EEA (verify requirement) | Consent is mandatory for personalised ads | AdSense approval needs real content + legal pages |
| Affiliate | Programs per niche (Amazon Associates, Awin, Impact, direct) | Revenue before traffic scale | disclose on every page |
| Analytics | Plausible (cookieless) or PostHog EU after consent; Search Console (DNS TXT, founder) | Query data drives the roadmap | Plausible from $9/mo |
| Errors | none server-side; Sentry optional for forms | static site | — |

## Scaffold

`npm create astro@latest` downloads templates from GitHub, which the cloud proxy blocks (verified 2026-10-08: "Template … could not be found").
Scaffold by hand (verified working with astro 7.3 on Node 22):

```bash
mkdir -p products/<slug>/app && cd products/<slug>/app
npm init -y >/dev/null && npm pkg set type=module scripts.dev=astro scripts.build="astro build" scripts.preview="astro preview" scripts.check="astro check && astro build" >/dev/null
npm i astro@latest && npm i -D @astrojs/check typescript
mkdir -p src/pages src/content/posts && printf '{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }\n' > tsconfig.json
npx astro add mdx sitemap --yes && npm i -D tailwindcss @tailwindcss/vite @biomejs/biome vitest @playwright/test
```

If `create-astro` works in the environment (`npm create astro@latest -- --template blog --no-install --no-git --yes --no-ai`), prefer it and keep its structure.
Set `site: 'https://<domain>'` in `astro.config.mjs` (the sitemap integration is skipped without it), `i18n: { defaultLocale: 'en', locales: ['en', 'pt-PT'], routing: { prefixDefaultLocale: false } }`
and, if legal/consent pages are needed, port `src/content/legal/*.md` placeholders from the web starter (rendered from a `site.ts`-like config).

## Project structure

```
src/content.config.ts                     collections with zod schema (import { z } from 'astro/zod'; glob from 'astro/loaders')
src/content/{posts,guides}/{en,pt-PT}/*.mdx   frontmatter: title ≤ 60, description ≤ 160, date, updated, author, tags, draft, canonical?
src/data/*.json|csv                       datasets for programmatic pages (one source of truth, versioned)
src/pages/[...locale]/…                   index, [collection]/[id].astro with getStaticPaths(), tags/, authors/, search, legal/
src/components/{Seo,Ad,AffiliateLink,Newsletter,Toc,Breadcrumbs}.astro
src/lib/{seo,jsonld,affiliate}.ts · scripts/{lint-content,og-images}.mjs · public/ads.txt, robots.txt
```

Collection snippet (verified to build): `defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }), schema: z.object({ … }) })`, page via
`getCollection('posts', p => !p.data.draft)` + `render(post)` from `astro:content`.

## Auth

None for readers. Admin/editing happens in git (PR). Paid membership → newsletter provider's paywall (Beehiiv/Buttondown/Ghost-like) or `web-saas` component; no custom auth here.

## Data

Content is files in git. Programmatic SEO: dataset rows → pages via `getStaticPaths()`; each page must carry **unique, useful data or analysis** (≥ 3 data points not shared with siblings,
original summary, FAQ from the data), else mark `noindex` or merge. Sitemap files ≤ 50,000 URLs each. Never publish bulk AI-generated pages without a human-quality gate
(`scripts/lint-content.mjs` + sampling review): Google's spam policies on scaled content abuse (verify current wording) can deindex the whole domain. Facts need sources; update dates real.

## Payments

Default none. Optional: paid tier via newsletter provider; digital products via MoR `checkoutUrl`; sponsorship slots sold manually (founder). Affiliate and ads are the primary revenue; keep disclosure text in `AffiliateLink`
(`rel="sponsored nofollow noopener"`, visible "affiliate link" label, site-wide disclosure page; legal reviews wording, consumer-protection rules apply).

## Email

Newsletter capture form posts to the provider (double opt-in on); consent text per locale; unsubscribe in every email; welcome email set up in the provider (content from `marketing/email/`).
Contact/transactional through Resend if a form needs it (via a Worker endpoint). Add the provider to subprocessors.

## Analytics & monitoring

Plausible script deferred; goals: `newsletter_signup`, `affiliate_click`, `outbound`. Search Console + Bing Webmaster (DNS verification = founder task) → weekly query/CTR review into `docs/10-growth.md`.
Ads and any cookie-setting analytics load only after consent (CMP). Uptime monitor on `/`. Core Web Vitals via CrUX in Search Console.

## Testing

- `npm run check` = `astro check` + `astro build` + content lint (frontmatter limits, unique titles/slugs, ≥ 1 internal link/page, images have alt, no `draft` in build, dates ≤ today).
- Links: `npx linkinator ./dist --recurse --skip "^https?://(?!localhost)"` for internal links; outbound links sampled monthly.
- Playwright on `astro preview`: nav, search (Pagefind), language switch + hreflang, newsletter form (mocked), consent banner blocks ads/analytics, 404.
- Lighthouse ≥ 95 SEO/performance is realistic here; axe zero serious/critical; sitemap/robots/canonical/JSON-LD (Article, BreadcrumbList) validated per `factory/checklists/seo.md`.

## Deploy

```bash
npm run build && npx pagefind --site dist
npx wrangler@latest deploy ./dist --name <slug> --compatibility-date "$(date +%F)"      # CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env
# or Vercel: npx vercel@latest deploy --prebuilt … / link + deploy --token "$VERCEL_TOKEN" (Pro if monetized)
```

Custom domain + redirects (`public/_redirects` or Worker config), `www` → apex, HTTPS only, `ads.txt` after ad approval. Preview hosts get `X-Robots-Tag: noindex`. Submit sitemap in Search Console (founder).

## Costs

| Monthly visitors | Estimate (verify) |
|---|---|
| 0–1k | €0 + domain; newsletter free tier |
| 10k | €0 hosting; Plausible $9–19; newsletter free→$9+; revenue from ads RPM ~$5–20 (very niche-dependent) |
| 100k–1M | Cloudflare still free/low (static assets); consider Workers Paid ~$5; newsletter $29–100; CMP/ads manager fees |

## Gotchas

- Astro template CLI fails behind the cloud proxy: scaffold by hand as above.
- `@astrojs/sitemap` silently skips without `site`; canonical URLs and OG tags need the same base.
- AdSense/CMP: no ads and no personalised-ad cookies before consent in the EEA/UK; AdSense approval needs About/Contact/Privacy pages (from `legal`).
- Thin or duplicate programmatic pages cause deindexing: quality gate before publish; start with 20–50 pages, measure indexing, then scale.
- Dates: show real `updated`; evergreen content needs a review calendar in `marketing/seo/`.
- Affiliate programs forbid some placements (emails, PDFs, cloaked links): read each program's terms.
