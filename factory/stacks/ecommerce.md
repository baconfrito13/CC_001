# Recipe: ecommerce

## When to use

`type: ecommerce`: the product is a store. Two paths, chosen by what is sold:

| Sells | Path | Why |
|---|---|---|
| Physical goods (own stock, print-on-demand, dropshipping, bundles) | **A. Shopify** | Inventory, shipping, tax, returns, checkout, apps; no custom checkout to secure |
| Digital goods (templates, ebooks, presets, courses, license keys) | **B. MoR checkout + web starter** (or Shopify digital downloads if the founder already has a store) | MoR handles VAT/invoices for digital sales; no inventory/shipping |
| Services, subscriptions of software | not ecommerce → `web-saas.md` / `web-static.md` | |

Marketplace with sellers (Connect) → `web-saas.md` + Stripe Connect via ADR.

## Default stack

| Concern | Path A (Shopify) | Path B (digital) | Limits/prices (verify at execution time) |
|---|---|---|---|
| Storefront | Shopify theme (Online Store 2.0, Liquid/JSON templates), customized via admin/CLI | Web starter (`web-static.md`) with product pages from `site.ts` | Shopify Basic $39/mo monthly or $29/mo annual; 3-day trial then $1/mo for 3 months (https://www.shopify.com/pricing, 2026-10-08) |
| Checkout/payments | Shopify Checkout + Shopify Payments (card 2.9% + 30¢ on Basic, US rates; Portugal rates differ) | MoR (Paddle/Lemon Squeezy/Polar ~5% + $0.50) or Stripe Checkout + Stripe Tax | see `stacks/README.md` |
| Catalog management | Shopify MCP tools + Admin GraphQL | `src/config/site.ts` products + MoR product ids | free |
| Fulfilment | Founder's supplier/POD app or own shipping; shipping profiles | Instant download / license key by MoR | apps cost extra |
| Email | Shopify Email / Klaviyo (founder) + transactional by Shopify | Resend + MoR receipts | Resend free 3,000/mo |
| Analytics | Shopify analytics + `run-analytics-query` (ShopifyQL); GA4/Plausible via consent | Plausible/PostHog EU | — |
| Landing/brand microsite | Optional web starter at the brand domain, pointing to the store | is the store | Cloudflare free |

## Scaffold

**Path A — Shopify.** The session has the Shopify MCP (load with ToolSearch `select:mcp__Shopify__*` names when needed).

1. Naming/domain: `generate-business-names`, `generate-domain-names` (availability is only true if the tool checked it).
2. Store creation is a **founder action** (creating an account/store): call `get-new-store-previews` with the PRD's one-line description; put the preview signup
   links in `HUMAN_TASKS.md` (🔴, ≤ 5 min: "pick a theme, sign up, then run `switch-shop`/confirm"). Until the store exists, build the catalog as code.
3. Catalog as code: `products/<slug>/shop/catalog/{products,collections,discounts}.json` (title, description per locale, price, SKU, images, variants, tags, SEO title/description).
4. After the store is connected (`get-shop-info` succeeds): create collections (`create-collection`), products (`create-product`; digital: `create-digital-product`, `upload-digital-product-file`,
   `publish-digital-product`), assign (`add-to-collection`), discounts (`create-discount`), inventory (`set-inventory`), keep products `DRAFT` until QA passes (`bulk-update-product-status`).
   For anything without a dedicated tool (pages, menus, markets, metafields, policies, shipping): the GraphQL workflow in this order only: `graphql_schema` → write the operation →
   `validate_graphql_codeblocks` → `graphql_query`/`graphql_mutation`. Never guess field names.
5. Legal pages: take `legal/public/<doc>.<locale>.md` (privacy, terms, refund/returns, shipping, legal notice) and publish as shop policies/pages (verify the mutation for shop policies with `graphql_schema`).
6. Theme: start from the preview theme; edit via admin or `npx @shopify/cli@latest theme …` (needs a theme-access password: founder task). Apply `brand/tokens.json` colors/fonts in theme settings.

**Path B — digital.** Scaffold the web starter (`web-static.md`), add products to `site.ts` `pricing.plans[]` with MoR `checkoutUrl`, a `/products/<slug>` page per product, instant-delivery
explained on the page, license-key or download delivery handled by the MoR. Needs: MoR account + product ids (founder), `payments.live` flag off until then (waitlist/"notify me").

## Project structure

```
products/<slug>/
├── shop/                       app_dir for Path A: catalog/*.json, policies/ (from legal), theme/ (only if customised), scripts/seed.mjs (idempotent GraphQL upserts)
└── app/                        Path B (web starter) or optional brand microsite for Path A
```

Record `stack.app_dir` (`shop` or `app`) and `stack.components` via `factory.py set`.

## Auth

Customer accounts: Shopify customer accounts (new customer accounts, passwordless) for Path A; Path B has no accounts (MoR customer portal for downloads/licences).
Admin access stays with the founder; the MCP uses the authenticated staff token, never stored in the repo.

## Data

Source of truth is the shop (A) or the MoR (B); the repo keeps catalog JSON as reproducible seed. Orders/customers are personal data: do not export them into git. The data map lists Shopify (or the MoR) as processor/controller as appropriate.

## Payments

A: Shopify Payments (founder KYC/bank: founder task) or another gateway; test with a development store/Bogus gateway or test mode (verify). VAT: enable Shopify Markets/tax settings for the EU (OSS)
with the founder's tax details. B: MoR is the seller of record; no VAT work, but terms must reflect it (legal).

## Email

Order/shipping notifications are Shopify's (customise templates with brand + both locales). Abandoned-cart and marketing email only with opt-in consent (checkout checkbox).

## Analytics & monitoring

Shopify analytics + weekly `run-analytics-query` (ShopifyQL: sales, AOV, conversion, top products) logged to `docs/10-growth.md`. Plausible/GA4 after consent. Uptime = Shopify's. Path B as `web-static.md`.

## Testing

- Catalog lint (script): every product has title, description, price > 0, image with alt, SEO fields, both locales, weight/shipping profile (physical), tax class.
- Storefront e2e (Playwright against the preview URL; password-protected stores need the storefront password via env): home → collection → product → add to cart → cart totals → checkout page loads
  with shipping/tax lines; stop before payment unless test mode exists. Discount code works. Policies pages reachable from the footer; cookie banner behaves.
- Performance/a11y: Lighthouse + axe on home, collection, product (themes often fail contrast and image dimensions).
- Orders flow in test mode: place test order → `list-orders`/`get-order` shows it → refund test.

## Deploy

A: the store is live when the founder removes the storefront password and connects the domain (founder task: DNS records exact values from admin; ≤ 5 min). Publish products from `DRAFT` to `ACTIVE` with `bulk-update-product-status` only at go-live.
B: as `web-static.md` (Vercel Pro/Cloudflare) + MoR checkout links switched live.
Policies, shipping rates, return address and tax registrations must be complete before enabling payments (checklist `factory/checklists/launch-readiness.md`).

## Costs

| Orders/month | Path A | Path B |
|---|---|---|
| 0 | $1–39/mo (trial then plan) + domain | €0 + domain |
| 100 (€3k GMV) | ~$29–39 + 2.9% + 30¢ per order + apps | MoR ~5% + $0.50 per order (~€180 on €3k) |
| 10,000 (€300k GMV) | Basic→Grow/Advanced ($79–299/mo annual) + ~2.5–2.9% + 30¢ + apps (€8–10k fees) | MoR fees ~5% (€15k), negotiate custom rate |

## Gotchas

- Consumer law: EU 14-day withdrawal for physical goods; digital content needs express consent + acknowledgement at checkout to waive it; prices displayed incl. VAT for B2C; returns address required (legal decides wording).
- Shopify "Bogus"/test gateways only exist on dev stores/trial setups; do not try live cards.
- Dropshipping: supplier lead times and product claims are legal risks (safety marks, CE, EPR): flag in `docs/07-compliance.md`.
- Product images need alt text and consistent ratios; theme defaults often fail a11y.
- Publishing products live before policies/payments exist breaks G2: keep `DRAFT`.
- Do not store customer data from the shop in the repo or in prompts.
