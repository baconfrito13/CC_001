# Monetization reference

> **Owner:** `product-strategist` (model + pricing in phase 02, price tests in phase 10), `devops-engineer` (payment go-live in phase 09), `growth-marketer` (pricing page, offers) · **Inputs:** `docs/01-research.md` (willingness to pay, competitor prices), `docs/02-product.md`, `docs/02-business.md`, `docs/04-architecture.md`, `FOUNDER.md` (country, tax status, risk appetite), `product.json` (`type`, `stack.payments`) · **Outputs:** pricing/model/rail section of `docs/02-business.md`, `plans` in `src/config/site.ts` (web), rail recorded in `product.json` `stack.payments` + an ADR, tax/invoicing notes for `docs/07-compliance.md`, founder tasks · **Gate:** G2 "payments work end-to-end in test mode (or the monetization path is configured)" + the payments go-live checklist in `factory/playbooks/09-launch.md`.

## Objective

Pick the simplest revenue model that fits how the product creates value, pick the payment rail that removes the most legal/tax work from a solo founder in Portugal, set prices that survive the unit-economics check, and wire it into the product with the least code. Used by phases 02 (decide), 05 (implement), 08 (pricing page copy), 09 (go-live) and 10 (price experiments). Everything time-sensitive below was verified on **2026-10-08**; re-verify fees and rules at execution time (links in Tools & sources).

## Before you start

1. Read `docs/02-business.md` draft (if phase 02 is running you are writing it), `FOUNDER.md` (tax residence = Portugal; sole trader unless stated; `go_live`), competitor prices from `docs/research/competitors.md`.
2. Classify what is sold: **digital good/SaaS** (web) · **digital good inside a mobile app** · **physical goods** · **services** · **content/ads**. Classify the buyer: **B2C** (consumers), **B2B** (companies with VAT IDs), mixed. Classify the delivery: instant/automated vs human-in-the-loop.
3. Check which payment env vars exist (`python3 factory/scripts/factory.py doctor`: `STRIPE_SECRET_KEY`, `POLAR_ACCESS_TOKEN`, `PADDLE_API_KEY`); absence never blocks design, only live setup (founder task).
4. Load `ToolSearch select:WebSearch,WebFetch`; re-fetch the fee pages in Tools & sources before quoting a number to the founder.

## Procedure

### Step 1 — Choose the revenue model
| Model | Choose when | Defaults / thresholds |
|---|---|---|
| **Subscription** (SaaS) | Value recurs monthly (workflow, monitoring, content access, ongoing AI usage) | Monthly + annual (annual = 10× monthly, "2 months free"); 2–3 tiers; the default model for `web-saas`/`ai-app` |
| **Usage-based / credits** | Marginal cost is material (LLM inference, SMS, compute) or usage varies >5× between users | Prepaid credit packs + small subscription that includes monthly credits; margin per credit ≥ 60% after rail fees; credits must not expire for mobile IAP (Apple 3.1.1) |
| **One-time / lifetime** | Low ongoing cost (templates, downloads, desktop/offline tools, extensions without server cost) or you need cash fast | Price = 6–12× the monthly equivalent; cap seats for any "lifetime" deal on products with running costs; licence keys via the MoR; never sell lifetime on AI products with per-use cost |
| **Freemium** | Strong SEO/viral loop, activation in <5 min, free-tier cost ≤ €0.05/user/month | Expect 2–5% free→paid; gate by limits (usage, history, export), not by crippling the core job |
| **Free trial** | Higher price (≥ €15/mo) or B2B | 7–14 days; card-required typically converts ~2–3× better per trialist (published benchmarks vary; measure your own) but lowers sign-ups: card-less for consumer/low price, card-required for B2B; consider a **reverse trial** (full features then downgrade) |
| **Marketplace take rate** | Two-sided liquidity is the product | 10–20%; needs Stripe Connect (incompatible with Managed Payments); avoid in v1, supply-side payouts add KYC/tax duties |
| **Ads & affiliate** (content/SEO sites) | Product is content/tools with ≥ 10k monthly sessions expected | Revenue is a lottery below that; EU needs a consent banner (CMP) for ads; disclose affiliate links ("#publicidade"/"link de afiliado"); never primary model for `web-saas` |
| **Sponsorships** | Newsletter/community/tool with ≥ 1k engaged users in a niche | Fixed-fee slots; founder-signed deal → founder task |
| **In-app purchases** | Digital goods consumed inside iOS/Android apps | Step 4; RevenueCat |
| **Digital downloads** | PDFs, templates, presets, courses | Polar or Gumroad (Step 2); bundle + upgrade path to subscription |
| **API credits** | `type: api` | Prepaid credits + metered overage; free tier of ~100 calls; per-key limits; rail: Polar (usage meters) or Stripe Billing meters (direct) |
| **Services / productized consulting** (bridge) | No product revenue yet, validated pain, founder accepts hours | Fixed-scope, fixed-price offer ("auditoria X em 5 dias, 490 €"); ≤ 10 h/week; invoice via *fatura-recibo* (Step 8); **not** MoR-eligible (Stripe MP excludes professional services); sunset when MRR ≥ 3× the bridge income |

Rule: the model must match the buyer's mental model of value ("I use it every week" → subscription; "I need it once" → one-time). Hybrid (subscription + one-time add-ons) only after 30 paying customers.

### Step 2 — Choose the payment rail (decision tree; stop at the first match)
1. **Physical goods** → Shopify (Shopify MCP; Shopify Payments/Tax handle checkout; you are the seller of record, so OSS applies for EU B2C distance sales above the threshold). Not a MoR path.
2. **Digital goods consumed inside a mobile app** → Apple IAP / Google Play Billing via **RevenueCat** (Step 4). Web checkout only for what the stores allow.
3. **Services, productized consulting** → Stripe Payment Links/Invoices as seller, issue *fatura-recibo*; no MoR available.
4. **B2B only, buyers with VAT IDs, invoices/seats/annual contracts** → **Stripe (Billing + Tax) as seller of record**: reverse charge on valid VAT IDs, invoices, PO numbers. Choose Stripe Managed Payments only if you also sell to consumers.
5. **B2C or mixed digital sales to the EU/world (default)** → **a Merchant of Record (MoR)**: the MoR is the legal seller, collects/remits VAT/sales tax worldwide, handles fraud, chargebacks, receipts and (mostly) refund support. Reasons for a Portugal-based sole trader: no VAT registration or OSS return per EU country, no US sales-tax nexus tracking, no checkout invoicing logic. Pick **one**, in this order:
   - **a. Stripe Managed Payments (MP)** — default when the product uses the starter's Stripe path (`stripePriceId`), the product is digital/automated, and the Stripe account is eligible (Portugal is a supported business location). One vendor, one dashboard, Stripe API/webhooks.
   - **b. Paddle** — choose when you need **MB WAY** and other local methods for PT/EU customers, mature subscription dunning/B2B invoices, or MP is unavailable. Approval review before go-live.
   - **c. Polar** — choose for developer tools, open-source-adjacent products, licence keys/downloads, usage meters; fastest zero-code `checkoutUrl`. Newer organisations pay the Starter rate.
   - **d. Gumroad** — creators selling one-off digital downloads where simplicity beats fees (10% + fixed).
   - **e. Lemon Squeezy** — **do not start new products here** unless the founder already has an approved store: Stripe owns it and has been moving merchants to Managed Payments (Step 3).
6. **Marketplaces/platform payouts** → Stripe Connect (not a MoR; you carry tax duties). Last resort; needs a legal review (`legal-counsel`).

**Switch rule (MoR → direct Stripe + Stripe Tax):** only when fee savings ≥ €300/month **and** the founder has a *contabilista* who accepts OSS filing **and** MRR ≥ €5k. Direct sales mean VAT per customer country, quarterly OSS returns, VAT-compliant invoices, US/other tax registrations as thresholds are crossed.

### Step 3 — Verify and compare fees (do it every time; numbers change)
Fetch each pricing page, fill the table in `docs/02-business.md` with the date, and compute the **net per sale at each price point** (tools: `python3`).

| Rail | Verified fee (2026-10-08) | Notes that change the decision |
|---|---|---|
| **Stripe Managed Payments** | **3.5% of the full amount (VAT included) on top of normal Stripe fees**; EEA standard cards 1.5% + €0.25, premium EEA 2.8% + €0.25, international 3.15% + €0.25, +2% FX; Billing PAYG 0.7% if subscriptions; dispute fee €20 (Stripe handles evidence) | Business location PT is **supported**; indirect tax (VAT/GST/sales tax) is handled in 80+ countries — elsewhere you stay responsible (Stripe Tax computes it at no extra charge). Digital only (software, SaaS, courses, digital media); **no physical goods, no professional services, no Connect, no Elements/custom checkout UI**; hosted Checkout/Payment Links only; **no custom domain** on checkout; customer sees "Sold through Link", receipts come from Link; methods: cards, Apple/Google Pay, Link (local methods mostly US/KR/IN/BR/BE — no MB WAY/Multibanco in the list); Stripe may refund within 60 days; Dashboard activation + ToS + eligibility review; every product needs an eligible `tax_code`; API `2025-03-31.basil` or later; Checkout Session param `managed_payments[enabled]=true`; tax is added **on top** unless price `tax_behavior=inclusive` |
| **Paddle** | **5% + 50¢** per checkout transaction, no monthly fee; custom pricing for products under $10 | MoR; supports **MB WAY**; payouts monthly (balance converts on the 1st, paid by the 15th; threshold default $100, verify); wire in local currency typically free, some countries $15 SWIFT; verify Portugal payout terms in the dashboard; application review |
| **Polar** | Orgs created **on/after 2026-05-27**: Starter **5% + 50¢**; paid plans Pro $20/mo 3.8% + 40¢, Growth $100/mo 3.6% + 35¢, Scale $400/mo 3.4% + 30¢; **+1.5%** international cards; **$15** per dispute; Early Member (older orgs) 4% + 40¢ + 0.5% subscriptions | MoR; payouts via Stripe Connect Express (Portugal listed), Stripe payout fees apply ($2/month active, 0.25% + $0.25 per payout, 0.25% cross-border EU); sanctioned countries blocked; strong API/webhooks, licence keys, meters |
| **Lemon Squeezy** | 5% + 50¢ per transaction; payouts twice a month (bank wire or PayPal) | Stripe-owned; CEO post 2026-01-28 admits slower support/releases and points to Managed Payments migration; treat as legacy for new products |
| **Gumroad** | 10% + 50¢ on direct sales; 30% on Discover sales; MoR for VAT | Simple, expensive for >€20 items |
| **Stripe direct** (seller of record) | 1.5% + €0.25 EEA standard cards; Stripe Tax 0.5%/txn (no-code) or €0.45/txn (API); Billing 0.7% | Cheapest per sale; you own tax, invoices, OSS, disputes |

Fee as a percentage of the gross price per sale (EEA standard card, computed from the table above): at **€9** — Stripe MP 7.8%, Paddle/Polar Starter 10.1%, Gumroad 15.1%; at **€29** — Polar Pro 5.1%, Stripe MP 5.9%, Paddle/Polar Starter 6.6%, Gumroad 11.6%; at **€99** — Stripe MP 5.3%, Paddle/Polar Starter 5.5%, Gumroad 10.5%. Fixed fees punish prices under €10: **minimum MoR price €9/month or €29 one-time** unless the model is volume/ads.

Reproduce the table with the current numbers (edit the constants from the pages above; USD fixed fees converted at today's rate):
```python
# python3 fees.py — scratchpad only
usd = 0.92  # EUR per USD, update
rails = {
  "stripe_mp_eea": lambda p: .035*p + .015*p + .25,            # MP 3.5% + standard EEA card
  "paddle":        lambda p: .05*p + .50*usd,
  "polar_starter": lambda p: .05*p + .50*usd,                  # +1.5% on international cards
  "polar_pro":     lambda p: .038*p + .40*usd,                 # + $20/month fixed
  "gumroad":       lambda p: .10*p + .50*usd,
  "stripe_direct": lambda p: .015*p + .25,                     # + Tax 0.5% + your OSS/accounting time
}
for price in (9, 19, 29, 49, 99):
    print(price, {k: f"{100*f(price)/price:.1f}%" for k, f in rails.items()})
```
Per-rail onboarding (what the founder does once, what Claude does after):
| Rail | Founder (≤ 5 min each, `HUMAN_TASKS.md`) | Claude (env tokens) |
|---|---|---|
| Stripe MP | Create/activate the Stripe account (identity, IBAN, NIF, support email); in Dashboard → Settings → Managed Payments accept the terms; add `STRIPE_SECRET_KEY` (test first) | Create products with eligible `tax_code`, prices with `tax_behavior=inclusive`, webhook endpoint, test with card `4242 4242 4242 4242` |
| Paddle | Apply (business details, product description, website with legal pages and pricing live); set payout details | Create products/prices via API (`PADDLE_API_KEY`), overlay/hosted checkout link, webhooks |
| Polar | Create the organisation, connect payouts (Stripe Connect Express onboarding), pass product review | Create products/benefits via API (`POLAR_ACCESS_TOKEN`), checkout links → `checkoutUrl` |
| Gumroad / Lemon Squeezy | Create store + payout method; (LS only if an approved store already exists) | Create the product page and copy the checkout URL |
| RevenueCat | Apple Developer + Play Console accounts first, then RevenueCat project | Configure offerings, entitlements, SDK keys as env |

### Step 4 — Mobile in-app purchases (`type: mobile`, in-app digital goods)
1. **Rule:** digital features, subscriptions, premium content, currencies and credits sold in the app must use the store's billing (Apple App Review 3.1.1/3.1.2; Google Play Billing). Credits may not expire (Apple). Subscriptions ≥ 7 days and valuable on all the user's devices.
2. **RevenueCat** as the entitlement layer (SDK, webhooks, one dashboard): free until **$2,500 monthly tracked revenue**, then **1% of MTR** (gross, on the whole amount) — verify at <https://www.revenuecat.com/pricing>. Create products in App Store Connect and Play Console first (founder accounts), then map offerings in RevenueCat; test with sandbox testers + `eas build --profile preview`.
3. **Commissions (verify in each console):** Apple standard 30%, **15%** under the Small Business Program (< $1M proceeds in the prior year; enrol in App Store Connect), 15% for subscriptions after year one. **EU storefronts, new unified terms effective 2026-10-01 (Apple notice dated 2026-08-18):** IAP **26%** (15% for Small Business Program / Mini Apps / Video Partner participants and for auto-renewing subscriptions after year one); alternative in-app payment processor **20%** (10% for those programs/after year one); link-out to web purchase **15%** (10% for programs), only for sales within **7 days** of the tap; **Core Technology Commission 5%** for alternative marketplaces / Web Distribution; payment-option choices must be kept **12 months**; alternative-payment sales reported monthly (within 15 days); parental gates required for under-18 flows with alternative payments/link-outs, none for Kids category. Google Play: **$25** one-time developer fee; service-fee table is region-dependent and changed in 2026 (page shows EEA subscriptions 10% + 5% billing fee, other transactions 20–25% + 5%; "all other markets" 15% on the first $1M) — **verify in Play Console before pricing**; EEA developers may offer alternative billing / external offers under Google's programs.
4. **Decision:** default = IAP via RevenueCat, 15% programs enrolled on day one. Use EU alternative payments or link-outs only if (a) margin analysis shows ≥ 8 points saved on ≥ €2k/month of EU revenue **and** (b) the founder accepts the reporting/compliance load. Companion app for a web SaaS: no purchase UI in the app unless the store rules for that storefront allow it; verify the current external-link rules (US storefront and EU) at execution time; never route around them quietly.
5. Price tiers: set store prices by tier (the stores localise them); keep **price parity** with the web by default, since the store fee comes out of the same price; price the web lower only where the storefront rules allow external purchases and the founder chooses to; keep the same plan names everywhere.

### Step 5 — Set the prices
1. **Anchors:** median competitor price for the same job (`competitors.md`) × 0.5–1.5; value anchor = 10% of the quantified monthly value; the price at which ≥ 30% of survey respondents say "good value" (Van Westendorp/Gabor-Granger with ≥ 30 answers from the waitlist or community, when available).
2. **Unit-economics gate (from `docs/02-business.md`):** contribution margin after rail fees, hosting, AI cost, support ≥ 70% (≥ 50% for AI products); CAC payback ≤ 6 months for self-serve; LTV:CAC ≥ 3 once data exists. If the gate fails, change price/model before launch, not marketing.
3. **Packaging:** good–better–best; the middle tier highlighted and ≈ 2–3× the entry price; entry tier prevents "cheapest = junk" by capping the single biggest value driver (seats, projects, credits, history); features that cost you money live in higher tiers.
4. **Psychology (apply, then test):** charm endings in B2C (€9, €19, €29), round numbers in B2B; annual toggle defaulting to annual with the saving stated in euros ("poupa 18 €"); say the price per month for annual plans; one decoy only if honest; no countdown timers or fake scarcity (unfair commercial practice in the EU).
5. **Launch pricing:** a time-boxed founding-member price is allowed, but the strike-through reference price must be the real lowest price of the previous 30 days (Step 7). For brand-new products show "Preço de lançamento até <data>" with no struck-through number unless the higher price will really be charged afterwards.
6. **Refunds:** default **14-day money-back** on first purchase for every plan (reduces disputes; MoRs often refund inside 60 days anyway). State it on the pricing page and in checkout.
7. **Trials/dunning:** MoR/Stripe Billing built-in retries and emails ON; card-expiry reminder ON; cancellation in ≤ 2 clicks (EU rules on easy cancellation — confirm current text with `legal-counsel`).

### Step 6 — Implement in the web starter (zero or minimal code)
Plans live in `src/config/site.ts` → `pricing.plans[]` (zod-validated at build; fields: `id` kebab-case, localized `name`/`description`/`features`, `price` in major units, `currency`, `interval` `month|year|one_time`, `highlighted`, and **either** `checkoutUrl` **or** `stripePriceId`, never both). The pricing button is chosen by `src/lib/plans.ts`: `checkoutUrl` → link, `stripePriceId` → `POST /api/checkout`, neither → waitlist. Do not invent fields: if the starter lacks something, record a factory improvement. Two paths, per plan:
- **`checkoutUrl`** — a hosted checkout/Payment Link from the MoR (Polar, Paddle, Lemon Squeezy, Gumroad, or a Stripe Payment Link with Managed Payments enabled). **No server code, no webhook**; entitlement is granted manually or via the MoR's licence-key/webhook if needed. Use for waitlist→launch, downloads, one-off sales, and v1 SaaS where access is managed by email/licence.
- **`stripePriceId`** — Stripe Checkout through `/api/checkout` (`src/lib/checkout.ts`: creates a hosted Checkout Session, `allow_promotion_codes: true`, `planId`/`locale` metadata) and fulfilment through `/api/webhooks/stripe` (`src/lib/stripe-webhook.ts`: raw-body signature check with `STRIPE_WEBHOOK_SECRET`; forwards `checkout.session.completed` and `customer.subscription.created|updated|deleted` to the **extension point `onPaymentEvent` in `src/lib/payments.ts`, which is a no-op in the starter** — granting access is the build phase's job). **Stripe Managed Payments:** the starter's `/api/checkout` does **not** send `managed_payments: { enabled: true }` (needed with Stripe API ≥ `2025-03-31.basil`) or `automatic_tax`; so with MP prefer a **Payment Link with Managed Payments enabled in `checkoutUrl`** (no code), or extend `CheckoutClient`/`handleCheckout` behind an env switch and log a factory improvement. Product tax codes and `tax_behavior` are set on the Stripe product/price, not in code.
**Webhook/entitlement contract (implement in `onPaymentEvent`; extend `toPaymentEvent` for extra event types):** the starter already verifies the signature on the raw body; make the handler idempotent (on `event.id` or the subscription id); grant access on `checkout.session.completed` (add `checkout.session.async_payment_succeeded` for delayed methods), keep it in sync with `customer.subscription.updated|deleted`, add `invoice.payment_failed` (start a grace period, 7 days default, then downgrade) if you need dunning-driven access changes; revoke on refund/dispute events; never grant access from the success-page redirect alone (Stripe's own advice). Store only the provider customer/subscription ID, plan and status — never card data.
Env names (see `src/lib/env.ts` and `.env.example`), never committed: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; `NEXT_PUBLIC_*` only for non-secrets; MoR checkout links are public URLs and go straight into `checkoutUrl`. Test-mode keys on preview, live keys only after the go-live checklist. Legal pages (terms, refund/withdrawal policy) are linked from the pricing section and from checkout.
**Pricing page best practices:** 1–3 tiers; price + billing period + "IVA incluído" visible; primary CTA names the outcome ("Começar a poupar tempo"), not "Buy"; one FAQ block on billing (VAT, invoices, cancellation, refund, payment methods); trust row (secure payment, refund promise, MoR name when applicable); no hidden fees; compare plans on outcomes; social proof only when real.

### Step 7 — EU/PT consumer price display and discounts
- **B2C prices are shown VAT-inclusive** (EU Price Indication Directive 98/6/EC; Portuguese price-indication rules, DL 138/90 — verify the current text). If the rail adds tax on top (Stripe MP default), set `tax_behavior=inclusive`/"Include tax in prices" so €29 on the page is €29 at checkout; if a rail cannot do inclusive pricing for consumers, target B2B only and label "sem IVA" prominently, or choose another rail.
- **Omnibus (price reductions):** any announced reduction must reference the **lowest price charged in the previous 30 days** (Portugal: DL 70/2007 as amended by DL 109-G/2021, in force since 2022-05-28; applies online; burden of proof on the seller; ASAE enforces; percentage optional). Keep a **price history table** in `docs/10-growth.md`; every promo logs the prior-30-day minimum. No "was/now" pricing without it. Verify the current text at <https://diariodarepublica.pt> before a promo campaign.
- **Right of withdrawal:** consumers have 14 days for distance contracts; for digital content/services it is lost only with prior express consent and acknowledgement at checkout. MoRs handle this in their checkout; with direct Stripe you must add the consent checkbox (owner: `legal-counsel`, doc `docs/07-compliance.md`). Check the EU "withdrawal button" rule for online contracts (Directive (EU) 2023/2673) and its Portuguese transposition — **verify at execution time**.
- Currency default EUR; add USD/GBP only when ≥ 20% of visitors are outside the euro area (Stripe MP's Adaptive Pricing localises automatically).

### Step 8 — Tax and invoicing pointers for a Portuguese sole trader (flag every one to the founder: **"confirmar com um contabilista certificado"**)
- **With a MoR:** the MoR sells to the end customer and pays you; your invoices go **to the MoR** (a B2B supply of services/licences to a foreign company, normally VAT reverse-charged; the MoR usually provides a self-billing statement or asks for an invoice per payout). Issue a *fatura-recibo* in certified software/the AT free invoicing portal with the MoR's legal name, address and VAT number as shown in the dashboard, and communicate it through e-Fatura. Keep MoR payout statements (10-year retention is the safe default).
- **Without a MoR (Stripe direct):** B2C digital services to EU consumers: Portuguese VAT up to the EU-wide €10,000 cross-border threshold, then destination-country VAT through the **OSS "regime da União"** registered in the Portal das Finanças and filed quarterly (deadlines/menus: confirm on the Portal das Finanças and with the accountant); B2B with a valid EU VAT ID verified in VIES → reverse charge ("autoliquidação") on the invoice; non-EU customers: out of scope for Portuguese VAT but local rules (e.g. US states) may apply.
- **Activity and income:** open (or confirm) the right activity code (CAE/IRS Category B), choose simplified vs organised accounting with the accountant, social-security contributions on relevant income, VAT exemption thresholds (art. 53 CIVA) change yearly — never assume.
- **Foreign payouts:** payouts in USD/EUR to a Portuguese IBAN; keep exchange-rate evidence for the accountant.
- The factory states facts and links; it never gives tax advice. Add "tem de confirmar com um contabilista certificado" in `docs/07-compliance.md` and in the founder task for accounts.

### Step 9 — Changing prices later (used by phase 10)
1. New price = **new Price/product object**; never edit a live price. New visitors see the new plan; existing subscribers keep their price (grandfathering) for 12 months unless the terms allow otherwise and the notice period required by the legal pages has passed.
2. Raise prices when: conversion from checkout-start to paid ≥ 60% **and** fewer than 5% of refund reasons cite price, or when the plan is the best-selling one for 8 weeks. Test +20–30% on new visitors for ≥ 30 purchases per variant; keep it if revenue per visitor rises.
3. Lower prices only to fix a documented positioning error, never as a reflex; prefer a cheaper entry tier or annual plan.
4. Log date, old/new price and the 30-day minimum in the price-history table (Step 7).

### Step 10 — Record, test, hand off
1. ADR `docs/adr/NNNN-payment-rail.md`: options considered, fees snapshot with date and URLs, decision, switch triggers. `python3 factory/scripts/factory.py set <slug> stack.payments "<rail>" --string`.
2. Create products/prices through the rail's API/CLI in **test mode** (script saved in the product, idempotent, env-driven), put the IDs/URLs in `site.ts` via env, run the e2e payment test (purchase → webhook/redirect → access → refund → cancel).
3. Founder tasks (≤ 5 min each, `HUMAN_TASKS.md`): create/verify the payment account (identity, IBAN, NIF, business description, support email) 🔴/🟡; accept the MoR/Managed Payments terms; add API keys as env vars (names only); live-mode switch happens in phase 09 only.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Model | one model + price, 2 competitor anchors | model + 2–3 tiers + annual, 5 competitor anchors | + Van Westendorp survey plan, margin model per tier, sensitivity ±30% |
| Rail | decision tree, fee snapshot of the chosen rail | 2 rails compared with net-per-sale table, ADR | 3 rails, switch triggers, MoR vs direct break-even in € MRR |
| Mobile | IAP defaults | RevenueCat setup tasks | EU alternative-payment margin analysis |
| Tests | test-mode purchase | + refund/cancel/failed payment | + tax-code and inclusive-price checks, dunning simulation |

## Decision rules & defaults

- **Default:** B2C/mixed digital → MoR (Stripe Managed Payments first when on the Stripe path; Paddle when MB WAY/local methods matter; Polar for dev tools); B2B-only → Stripe direct + Tax; mobile in-app → IAP + RevenueCat; physical → Shopify.
- **Defaults for prices:** EUR, VAT-inclusive, monthly + annual (10×), 14-day refund, no free trial below €15/month unless freemium, minimum €9/month.
- **Never** collect card data on the product's own forms (use hosted checkout), never store PANs, never hard-code price IDs, never switch to live keys outside phase 09.
- **Zero-code first:** start with `checkoutUrl`; add `stripePriceId` + webhooks only when automatic access control is part of the PRD "must" stories.
- **Re-check rail every 6 months** or when fees/eligibility change; log in `factory/LEARNINGS.md`.
- **Conflicts:** consumer-law doubts → `legal-counsel` decides; tax doubts → founder task to the accountant, product proceeds on MoR.

## Output specification

| Artifact | Location | Content |
|---|---|---|
| Model + pricing + fee table | `docs/02-business.md` | model choice, tiers, anchors, margin per tier, rail fee snapshot with date + URLs |
| Rail ADR | `docs/adr/NNNN-payment-rail.md` | decision, alternatives, switch triggers |
| `plans[]` | `src/config/site.ts` | `checkoutUrl` or `stripePriceId` per plan, env-driven |
| Setup script | `<app_dir>/scripts/` | idempotent product/price creation in test mode |
| Tax/invoicing notes | `docs/07-compliance.md` | MoR/OSS/fatura-recibo summary with the accountant flag |
| Founder tasks | `HUMAN_TASKS.md` | account verification, terms acceptance, keys |

## Definition of Done

- [ ] Model, tiers, prices and unit-economics check recorded with sources and date.
- [ ] Rail chosen by the decision tree; fees verified within the last 7 days; ADR written; `stack.payments` set.
- [ ] Test-mode purchase, webhook (if any), refund and cancellation pass in e2e.
- [ ] Prices VAT-inclusive for consumers; Omnibus price-history table started; refund/withdrawal text matches `docs/07-compliance.md`.
- [ ] Tax/invoicing section flags the accountant; no tax advice stated as fact.
- [ ] Mobile: IAP products, RevenueCat mapping and store-fee assumptions documented (if applicable).

## Anti-patterns

- Choosing Stripe direct "because it is cheaper" and ignoring VAT/OSS work; or choosing a MoR for physical goods or consulting (not eligible).
- Quoting fees from memory or from competitor blogs (several sources in this space are rival vendors); using stale "4% + 40¢" Polar numbers for new organisations.
- Starting a product on Lemon Squeezy now; relying on a payment method (MB WAY, Multibanco) the chosen MoR does not offer.
- Pricing under €9 with a fixed-fee MoR; tax-exclusive consumer prices; fake discounts or countdowns; "lifetime" deals on products with running costs.
- Selling digital goods in a mobile app with Stripe/MoR links without checking the storefront rules; letting credits expire in iOS.
- Giving tax advice; issuing invoices to end customers of a MoR; putting live keys in preview environments.

## Tools & sources

Fee/status pages (accessed 2026-10-08): Stripe Managed Payments <https://docs.stripe.com/payments/managed-payments> · eligibility <https://docs.stripe.com/payments/managed-payments/eligibility> · how it works <https://docs.stripe.com/payments/managed-payments/how-it-works> · set-up <https://docs.stripe.com/payments/managed-payments/set-up> · pricing <https://support.stripe.com/questions/managed-payments-pricing> · Stripe PT pricing <https://stripe.com/en-pt/pricing> · Paddle <https://www.paddle.com/pricing> and payouts <https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts> · Polar <https://polar.sh/docs/merchant-of-record/fees>, countries <https://polar.sh/docs/merchant-of-record/supported-countries> · Lemon Squeezy <https://www.lemonsqueezy.com/pricing>, 2026 update <https://www.lemonsqueezy.com/blog/2026-update> · Gumroad <https://gumroad.com/pricing> · RevenueCat <https://www.revenuecat.com/pricing> · Apple EU terms <https://developer.apple.com/support/apps-in-the-eu/> · App Review Guidelines <https://developer.apple.com/app-store/review/guidelines/> · Google Play fees <https://support.google.com/googleplay/android-developer/answer/112622> · Portugal Omnibus (DL 109-G/2021) <https://diariodarepublica.pt/dr/detalhe/decreto-lei/109-g-2021-175744207> · OSS guidance (Portal das Finanças) <https://info.portaldasfinancas.gov.pt>. Tools: `WebFetch`, `python3`, Shopify MCP (physical goods), `stripe`/MoR SDKs, RevenueCat dashboard. Agents: `product-strategist`, `devops-engineer`, `legal-counsel`.

## Hand-off

**Build (05):** `plans[]` shape, env var names, webhook events, entitlement rules, refund/cancel behaviour. **Legal (07):** rail, MoR legal name, refund/withdrawal policy text, price display rules, tax notes. **GTM (08):** price points, offer, guarantee wording, payment methods list for the pricing FAQ. **Launch (09):** go-live checklist inputs (accounts, live products, webhook URL, tax codes). **Growth (10):** price history table, experiment constraints (Omnibus), unit-economics targets. `HUMAN_TASKS.md`: payment account, terms, keys.
