# 02 · Strategy (`strategy`)

> **Owner:** `product-strategist` (+ `devils-advocate`; deep: 3 proposal agents + 3 judges) · **Inputs:** `docs/00-brief.md`, `docs/01-research.md`, `docs/research/*.md`, `FOUNDER.md`, `factory/playbooks/monetization.md`, `factory/stacks/`, `factory/LEARNINGS.md`, `product.json` (`decision`, `depth`) · **Outputs:** `docs/02-product.md` (PRD), `docs/02-business.md`, founder tasks in `HUMAN_TASKS.md` · **Gate:** strategy Definition of Done (`factory/PIPELINE.md`) — the MVP fits the build budget for the depth.

## Objective

Decide what to build first and how it earns money, for a bootstrapped solo founder who needs revenue fast. Output a PRD that agents can build and test without asking, and a business model with numbers (pricing, unit economics, costs, 12-month projections in three scenarios, break-even) whose assumptions are visible. The MVP is **the smallest product that someone will pay for**, sized to what the factory can build in days, and it takes money from day one unless research proved a free wedge is required (then the exact upgrade trigger is specified).

## Before you start

1. Confirm G1: `docs/01-research.md` verdict is GO or PIVOT-continued; `product.json` has `decision` and `depth`. If KILL/needs-founder: stop.
2. Read in full: the brief, `docs/01-research.md` (wedge, MVP and monetization hypotheses, first channel, top risks, competitor prices, unmet needs, assumptions with status, fragile/L-confidence items), the four notes, `FOUNDER.md` (`monthly_budget_per_product_eur` = ceiling for recurring costs before revenue, `paid_ads_budget_eur`, `product_locales`, preferred revenue model, "Identidade legal e fiscal" = entity/tax status, "Contas que já tens" = accounts to reuse instead of asking for new ones), `factory/playbooks/monetization.md` (rails, fees, rules — it wins over this file if they disagree), `factory/stacks/` (what the factory builds fast), and the web starter's `factory/starters/web/src/` (what it already includes, see Step 3).
3. `python3 factory/scripts/factory.py set-phase <slug> strategy in_progress --summary "strategy started"`.
   **Execution modes:** inside the `idea-to-product` workflow your task prompt says "do NOT run git commit/push": the checkpoint step runs `set-phase … done`, `validate`, `render-status`, commit and push (skip Step 12.3–12.4 there). Interactive runs do them.
4. Evidence rules from `01-research.md` still apply: every external number has `[source](url) — accessed date`; tag **FACTO / ESTIMATIVA / PRESSUPOSTO**. Fees, prices, tax rates and store commissions change: **verify at execution time** on the official page and cite it.
5. Templates (pt-PT): `factory/templates/prd.md` → `docs/02-product.md`; `factory/templates/business.md` → `docs/02-business.md`. Delete guidance comments when filled.

## Procedure

### Step 1 — Extract the strategic frame (≤ 20 min)
From research, write 10 lines at the top of your scratch notes: segment, wedge statement, the ONE job to win, first channel and its 30-day test, competitor price median/P25/P75, top 5 risks, the unmet needs to exploit, constraints (budget, locales, founder time), and the riskiest assumption. Everything below must trace back to these lines (the PRD has a *traceability* table).

### Step 2 — Competing proposals (deep only; standard/lean: skip to Step 3)
1. Launch 3 `product-strategist` agents in parallel, each with a different lens and the same inputs. Each returns a **proposal card** ≤ 1 page: positioning, persona, MVP Must list with sizes, monetization + price, first channel and 30-day plan, base-case MRR at M3/M6/M12 (with assumptions), top 3 risks.
   - **user-first:** maximise job completion and retention; **revenue-first:** shortest path to € and pricing power; **distribution-first:** built-in SEO/marketplace/community loop.
   - Instruct each to make the proposal genuinely different from the others (different MVP shape, not wording).
2. Launch 3 judges (separate agents: *skeptical investor*, *target user*, *factory builder*), each scoring all three cards 1–5 per criterion with one-line justification:
   | Criterion | Weight |
   |---|---|
   | Speed to first revenue | 25% |
   | Wedge strength vs research evidence | 20% |
   | Distribution fit | 20% |
   | Build-budget fit | 15% |
   | Retention / LTV | 10% |
   | Risk | 10% |
3. Total = Σ(weight × mean judge score). **Synthesis rule:** base = highest total; import ≤ 2 elements from the others that raise the base's weakest criterion and still fit the budget; record a `taken / left` table. A tie within 0.15 → prefer the proposal with the earlier first revenue. The workflow stores the cards as `docs/strategy/proposal-<n>-<angle>.md` and may ask judges for a 1–10 scale on its own criteria: follow the task prompt's scale if it differs, but always record per-criterion scores, the winner and the graft list. Summarize cards, scores and the `taken / left` table in `docs/02-business.md` §Alternativas consideradas.

### Step 3 — Size the MVP and set the build budget
Sizing units: **S = 1** (one screen or endpoint with tests, ≈ ≤ 1 agent-hour) · **M = 3** (feature with data model + UI + tests) · **L = 8** (multi-part feature or integration needing external approval/credentials). Split anything above L. Defaults — calibrate with `factory/LEARNINGS.md` (record actual vs. estimated after each build):

| depth | Must ≤ | Must + Should ≤ | Could (polish, onboarding, admin) |
|---|---|---|---|
| lean | 15 | — (Must only) | none |
| standard | 25 | 40 | none |
| deep | 30 | 55 | up to 70 total |

Factory-standard inclusions are **not** counted when the starter has them. For `web-*`/`ai-app` products the web starter (verify in `factory/starters/web/src` at execution time) ships: landing sections, pricing with `checkoutUrl`/Stripe checkout and webhook, waitlist API, legal pages, cookie consent, analytics adapter, i18n (`en`, `pt`), SEO (sitemap, OG image, JSON-LD) and brand tokens. It does **not** ship accounts/auth, a database, dashboards or product features: those are counted as stories. Other types use their `factory/stacks/` recipe the same way.
**Cut order when over budget:** (1) secondary persona, (2) admin tooling → use the database console, (3) automation → manual/concierge ("Wizard of Oz") for the expensive step, (4) integrations → export/import file, (5) extra platforms → web only, (6) extra locale for long-form content only. Never cut: the payment path, the activation step, analytics events of the funnel, accessibility basics.

### Step 4 — PRD (`docs/02-product.md`)
Write in this order; each part is concrete enough to test.
1. **Vision & positioning:** one-sentence positioning (wedge statement), the 5-second understanding test ("what is it, for whom, why now?"), differentiation vs the 3 closest competitors.
2. **Personas** (1 primary, ≤ 2 secondary; B2B: buyer ≠ user → both): context, goals, pains in their own words (verbatim quotes from `audience.md`), trigger, current solution, objections, budget, channels, locale. No invented demographics.
3. **JTBD:** main job as "When … I want … so I can …", 2–3 related jobs, and a forces table (push / pull / anxiety / habit).
4. **User journey:** discover → land → sign up → **activation ("aha")** → pay → retain → refer; per stage: action, emotion, touchpoint, metric, main drop-off risk. Define the **activation event** and a time-to-value target (default < 5 min to first value).
5. **MVP scope (MoSCoW):** table `ID · story · priority · size · persona · analytics event`; Must/Should/Could/Won't with the budget total and remaining margin. *Won't* items state why and the trigger to revisit.
6. **User stories:** `US-01…` "Como ⟨persona⟩, quero ⟨ação⟩, para ⟨benefício⟩". Each Must story has ≥ 2 acceptance criteria in **Given/When/Then** (Dado/Quando/Então) that an e2e test (Playwright) can assert: include one error/edge case, concrete data and a measurable threshold (time, count, message). No vague words ("fast", "easy").
7. **Non-goals** (explicit), **non-functional requirements** (performance budget, WCAG 2.2 AA, i18n en + pt-PT, privacy by default, SEO, uptime expectations, data retention), **dependencies & integrations** (payment rail, auth, email, AI provider with cost per call).
8. **Success metrics:** one **north star** tied to value and revenue (e.g. "paying customers who completed ⟨activation⟩ in the last 7 days"), input metrics (visit→signup, signup→activation, activation→paid, retention W1/W4), guardrails (refund rate, support tickets/100 users, p95 latency, error rate), targets for day 30/90/365 taken from the base projection, and **post-launch kill/pivot triggers** (e.g. "day 60: < 1% visit→signup or 0 paid → run the pivot checklist").
9. **Analytics event plan:** `event_name (snake_case, object_action past tense) · trigger · properties (no PII) · story · funnel step`. Mandatory: `page_viewed`, `signup_started`, `signup_completed`, `activation_reached`, `checkout_started`, `purchase_completed` (server-side from the payment webhook), `subscription_canceled`, plus one per Must story. Tool choice is architecture's; events are tool-agnostic and consent-aware.
10. **Risks → mitigations** (from research) and **traceability**: wedge → stories, unmet needs → stories, risks → NFRs/stories.

### Step 5 — Choose the monetization model
Score each candidate on: value-metric fit, time to first revenue, COGS fit, EU compliance burden, payer clarity (research). Choose **one primary model + at most one bridge revenue** (a faster, smaller revenue while the primary ramps). This table is the decision summary; thresholds and edge cases live in `factory/playbooks/monetization.md` Step 1 — **it wins on any difference** (read it before choosing).

| Model | Choose when | Avoid when |
|---|---|---|
| **Subscription** | Recurring value, usage ≥ monthly, expected retention > 3 months, prosumer/B2B | One-off jobs (→ one-time or annual pass) |
| **Usage-based / credits** | Marginal cost is material (LLM/API/SMS) or usage varies > 5× between users; prepaid credits + a small subscription that includes monthly credits; margin per credit ≥ 60% after rail fees | Buyers need predictable budgets |
| **One-time / lifetime** | Single-use or low-update tools (extensions, desktop, templates), early cash need. Price = 6–12× the monthly equivalent, seat-capped | Ongoing COGS: never sell lifetime on AI products with per-use cost |
| **Freemium** | Free-tier cost ≤ €0.05/user/month, activation < 5 min, SEO/viral loop, plausible 2–5% free→paid | Otherwise a 7–14 day (reverse) trial; trials fit prices ≥ €15/month or B2B |
| **Marketplace take rate** | Two-sided liquidity is the product and one side can be seeded; 10–20% take; needs Stripe Connect | v1 (payout KYC/tax duties); no single-player mode |
| **Ads / affiliate / sponsorship** | Content/SEO products expecting ≥ 10k monthly sessions (sponsorship: ≥ 1k engaged niche users); pair with a digital product as bridge; ads need a consent banner, affiliate links need disclosure | Little organic reach; never primary for `web-saas` |
| **In-app purchase / store subscription** | Mobile digital goods consumed in-app (store rules require it; commissions 15–30%, verify at <https://developer.apple.com/app-store/small-business-program/> and <https://support.google.com/googleplay/android-developer/answer/112622>) | Web alternative is allowed and cheaper |
| **Digital product** (ebook, template, course) | Fast first revenue; one-time through Merchant of Record | — |
| **Margin on goods** | Physical e-commerce; target gross margin ≥ 50% after shipping and returns | Thin margins, high returns |
| **Concierge / productized service (bridge only)** | Validate willingness to pay before building automation: fixed scope, fixed price, ≤ 10 h/week founder time; not Merchant-of-Record eligible (invoice via Stripe) | Cannot be delivered within the founder-time limit |

### Step 6 — Pricing
1. **Anchor:** from `competitors.md` compute median, P25, P75 of comparable plans (same value metric, EUR, VAT-consistent). Include the free alternative and the status-quo cost (time × hourly rate).
2. **Value metric:** the unit that scales with customer value, is easy to understand and cheap to measure (seats, projects, exports, contacts, credits). Test: grows with value? predictable? measurable by events? Pick one.
3. **Three tiers** (Good-Better-Best; names that describe the buyer, not metals): entry (removes the "no"), **target** (where ≥ 60% should land), anchor (high-price decoy with real extras). Position: new entrant with a narrow wedge → P25–median; ≥ 10× better on one axis → median–P75. Feature fences follow stories (reference `US-xx`).
4. **Annual discount:** annual = 10× monthly (2 months free, ~17%) by default; up to 30% for high-churn products; show the per-month equivalent. **Floor:** with a fixed-fee Merchant of Record do not price below €9/month or €29 one-time unless the model is volume/ads (fixed fees dominate; see the net-fee table in `monetization.md` Step 3).
5. **Currency & VAT:** price in EUR (+ USD via the rail's local-currency features if global). **Consumer prices are shown VAT-inclusive** (EU); B2B may show net with "+IVA" and say so. Do not hard-code a VAT rate; the rail computes it (verify the PT rate on <https://info.portaldasfinancas.gov.pt/> if needed).
6. **Trial/refund:** default 14-day money-back or trial; note the EU 14-day withdrawal right and the explicit-consent waiver for immediate digital supply (legal phase writes the policy).
7. **Launch offer:** "founding member" price with a count or date cap and grandfathering. Never show a struck-through reference price that was not really charged: any announced reduction must cite the lowest price of the previous 30 days (EU Omnibus rules; see `monetization.md` Step 7) and no countdown timers or fake scarcity. Define the first price test and the sample needed (≥ 300 visitors per variant, else treat as directional).
8. Output: tiers table (name, price/month, price/year VAT-incl., value-metric limits, features, target persona, story refs) and the price-test plan.

### Step 7 — Payment-rail decision (`factory/playbooks/monetization.md` is authoritative)
| Situation | Default rail |
|---|---|
| B2C or mixed digital goods / SaaS sold in the EU or worldwide | **Merchant of Record** — the MoR is the legal seller and handles VAT/OSS, invoices, fraud and refunds. Pick one in the order of `monetization.md` Step 2 (Stripe Managed Payments by default on the Stripe path; Paddle when MB WAY/local methods matter; Polar for developer tools/licence keys; Gumroad for simple downloads; Lemon Squeezy not for new products). Eligibility and fees change: follow its Step 3 |
| B2B only, VAT-registered buyers, invoices, contracts | **Stripe (Billing + Tax) as seller of record** (reverse charge on valid VAT IDs) |
| Services / productized consulting | Stripe invoices/Payment Links as seller; *fatura-recibo*; no MoR available |
| Marketplace / paying out third parties | Stripe Connect (MoR does not fit; flag regulatory scope) |
| Mobile digital goods consumed in-app | Apple App Store / Google Play billing (+ optional subscription SDK) |
| Physical goods | Shopify (verify Shopify Payments availability for the founder's country via the Shopify MCP `search_docs_chunks` or <https://help.shopify.com>) |
| Ads / affiliate only | No payment rail; ad-network/affiliate accounts |
| Category restricted on every rail | Knockout K5 — stop and report |
Record in `docs/02-business.md` §Meio de pagamento: chosen rail and why, **fee snapshot verified at execution time** (fetch the pages listed in `monetization.md` "Tools & sources"; compute net per sale at each tier price with its fee script; cite URL + date), payout currency/schedule, KYC the founder must complete, webhooks needed (architecture), tax notes for the accountant, and the fallback rail. The architecture phase turns it into the ADR (`docs/adr/NNNN-payment-rail.md`, `monetization.md` Step 10): do not write ADRs here. Set it in `product.json`: `python3 factory/scripts/factory.py set <slug> stack.payments "<rail>" --string`.

### Step 8 — Unit economics (`docs/02-business.md`)
Compute with a script, never by head. Definitions:
- `ARPA = Σ(tier price × tier mix) / month` (net of VAT); `GM% = (revenue − COGS)/revenue` where COGS = payment/MoR fees + variable hosting + AI/API cost per active user + email + support allowance + refunds/chargebacks.
- `CAC` per channel: paid = CPC ÷ visit→paid; organic/community = tooling cost ÷ customers (founder time valued at €0 by default; show hours/week separately).
- `churn` default when unsourced (PRESSUPOSTO, replace after launch): B2C 7–10%/mo, SMB B2B 3–5%/mo, mid-market 1–2%/mo. `LTV = ARPA × GM% ÷ churn` (cap lifetime at 36 months). `Payback (months) = CAC ÷ (ARPA × GM%)`.
- **Thresholds** (aligned with `monetization.md` Step 5): contribution margin after rail fees, hosting, AI cost and support ≥ 70% (≥ 50% for AI products); CAC payback ≤ 6 months for self-serve (≤ 3 for paid acquisition in a bootstrapped product); LTV:CAC ≥ 3 once data exists. If missed → change price, channel or model **before launch**, or record an explicit risk. One-time products: contribution margin per order and refund rate instead of LTV.

### Step 9 — Cost model, projections, break-even
1. **Costs** at 0 / 100 / 1k / 10k users: fixed (domain, hosting floor, email, monitoring, analytics, tool subscriptions) and variable (payment fees, per-user infra, AI/API, email volume, support). Cite free-tier limits with URL + date. Show founder time (hours/week) separately.
2. **12-month projection, three scenarios** from the model below. Base inputs come from the research channel plan (month-1 visitors, growth) and Step 8 defaults; scenario multipliers (the `MULT` dict; "conversions" = end-to-end visit→paid): pessimistic traffic ×0.4, conversions ×0.6, churn ×1.5; optimistic traffic ×2, conversions ×1.3, churn ×0.8. **Sanity bounds:** base-case month-12 revenue must not exceed the research SOM; a base-case MRR > €5k at month 12 for a brand-new product with no audience needs evidence (existing audience, proven paid CAC, marketplace placement).
3. **Break-even:** fixed monthly cost ÷ contribution per customer = customers needed; month reached per scenario; **peak cumulative cash need** (maximum burn: money the founder must advance). Check the monthly run-rate at 0/100 users against `monthly_budget_per_product_eur` and any paid acquisition against `paid_ads_budget_eur` (0 = organic only: no paid CAC in any scenario); if higher, adjust scope/costs before finishing. Every euro the founder must advance becomes a founder task, never an assumption.
4. Sensitivity: top 3 drivers (±30%) and their effect on month-12 result; "what must be true" list.

```python
# $SCRATCH/projection.py — edit BASE with sourced values; paste the printed tables into docs/02-business.md
BASE = dict(v1=800, growth=0.20, c1=0.04, c2=0.05, conv=1.0, arpa=9.0, churn=0.07, gm=0.88, fixed=45.0, ads=0.0, setup=150.0)
# v1 visitors month 1 · growth monthly visitor growth · c1 visit→signup · c2 signup→paid · conv scenario multiplier on end-to-end conversion · arpa €/month · churn monthly · gm gross margin · fixed €/month · ads €/month · setup one-off €
MULT = {"pessimista": dict(v1=.4, conv=.6, churn=1.5), "base": {}, "otimista": dict(v1=2, conv=1.3, churn=.8)}
def run(p):
    paying = 0.0; cash = -p["setup"]; rows = []
    for m in range(1, 13):
        vis = p["v1"] * (1 + p["growth"]) ** (m - 1); new = vis * p["c1"] * p["c2"] * p["conv"]
        paying = paying * (1 - p["churn"]) + new; rev = paying * p["arpa"]
        profit = rev * p["gm"] - p["fixed"] - p["ads"]; cash += profit
        rows.append((m, round(vis), round(new, 1), round(paying, 1), round(rev), round(profit), round(cash)))
    return rows
for name, mult in MULT.items():
    rows = run({k: v * mult.get(k, 1) for k, v in BASE.items()})
    print(f"\n### {name}\n| Mês | Visitantes | Novos pagantes | Pagantes | Receita € | Resultado € | Caixa acum. € |\n|---|---|---|---|---|---|---|")
    for r in rows: print("| " + " | ".join(map(str, r)) + " |")
    print("primeiro mês com resultado ≥ 0:", next((r[0] for r in rows if r[5] >= 0), "—"))
```
Adapt for one-time products (no churn: `paying` = cumulative buyers; revenue = new × price) and usage-based (revenue per active user × active share).

### Step 10 — Founder tasks (batched, ≤ 5 min each)
Add to `HUMAN_TASKS.md` (format in `factory/templates/HUMAN_TASKS.md`):
- 🔴/🟡 **Create the payment-rail account and start verification** — use the per-rail onboarding table in `monetization.md` Step 3 for the exact founder/Claude split; exact signup link, the values to paste (business description in one sentence, product category, price list, support email, website URL placeholder, statement descriptor), cost 0 €, unblocks live payments; verification waits happen in the background while test mode continues.
- 🟡 **Confirm tax/entity status** only if `FOUNDER.md` does not already state it (open activity in the Portal das Finanças, accountant confirmation): a short "reply with yes/no + date" task, with the link and the question for the accountant.
- Anything else only if it is truly founder-only (accounts, money, contracts, public actions, secrets). No task for decisions an agent can take.

### Step 11 — Devil's-advocate review (standard and deep; lean = self-check list below)
Launch `devils-advocate` on `docs/02-product.md` + `docs/02-business.md`. Required lenses: **scope** (is every Must needed for the first sale? what would you cut?), **pricing** (versus anchors; will the target tier convert?), **math** (independently recompute the projections and unit economics), **assumptions** (which single number, if wrong by 2×, flips the break-even?), **pre-mortem** (why does month 3 look like failure?). The critic appends `## Objeções do advogado do diabo` to `docs/02-product.md` (workflow behaviour). Answer under **each** objection (Aceite → edit the docs and say what changed; Refutada → evidence; Mitigada → named mitigation); keep exactly one objections section, and copy only the pricing/economics ones (with their answers) into the short table in `docs/02-business.md` §12. Deep: one more round on the synthesized result.
**Lean self-check:** Must list ≤ budget; each Must story has 2 acceptance criteria; the price sits inside the anchor range or the deviation is justified; LTV:CAC and payback computed; base ≤ SOM; run-rate ≤ `monthly_budget_per_product_eur`; every euro the founder must advance is a task; every metric has an event.

### Step 12 — Consistency, state, commit
1. Cross-checks: tiers' limits map to stories and events; value metric is measurable by an event; every research risk has a mitigation; scenario numbers re-run from the script reproduce the tables; no `{{`, `TODO` or guidance comments (`grep -nE '\{\{|TODO' docs/02-product.md docs/02-business.md`).
2. README decision log rows: monetization model, rail, tiers/prices, MVP cuts, rejected alternatives.
3. Close the phase:
```bash
python3 factory/scripts/factory.py set-phase <slug> strategy done --summary "<model> · <price> · MVP <n> units · base M12 <€>"
python3 factory/scripts/factory.py validate <slug> && python3 factory/scripts/factory.py render-status <slug> --write
```
4. Commit `<slug>: strategy — <summary>`, push. Tell the founder in pt-PT: the MVP in one paragraph, the price table, the riskiest assumption and the open tasks.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Process | single draft + self-check | draft + 1 critic round | 3 competing proposals → 3 judges → synthesis → critic (2 rounds) |
| MVP budget (units) | Must ≤ 15 | Must ≤ 25, +Should ≤ 40 | Must ≤ 30, total ≤ 70 |
| Personas | 1 | 1 + 1 secondary | 1 + 2 secondary |
| Stories with G/W/T | Must only | Must + Should | all |
| Pricing | anchors + 3 tiers | + value-metric test + price-test plan | + 2 pricing scenarios compared |
| Projections | base + 2 scenarios | 3 scenarios + sensitivity | + channel-level CAC model |

## Decision rules & defaults

- **Monetize from day one.** Free-only MVP requires a research-backed reason and a written upgrade trigger (metric + date).
- **Default price position:** P25–median of anchors; round B2B prices, charm B2C (x,99 optional); never below the point where LTV:CAC < 3 at the base CAC.
- **Default rail:** per `monetization.md` Step 2 (MoR for B2C/mixed digital, Stripe direct for B2B-only, IAP for in-app mobile goods, Shopify for physical); deviations need a line in the decision log.
- **Default churn/conversion** are PRESSUPOSTO until launch data; mark them and schedule replacement in `docs/10-growth.md`.
- **Locales:** `en` + `pt-PT` UI; prices EUR first. PT-only products must pass the PT-SAM check from research.
- **Scope arbitration:** a story stays Must only if removing it makes the first sale impossible or the wedge invisible.
- **Founder time:** assume ≤ 5 h/week unless `FOUNDER.md` says otherwise; features needing founder operations (support calls, manual fulfillment) are cut or priced accordingly.
- **AI products:** price must clear cost per use at P90 usage with ≥ 50% contribution margin; add usage caps/credits in the tiers; no lifetime deals.

## Output specification

| File | Template | Must contain |
|---|---|---|
| `docs/02-product.md` | `factory/templates/prd.md` | vision, personas, JTBD, journey, MVP MoSCoW with sizes and budget, user stories with G/W/T, non-goals, NFRs, metrics, analytics events, risks, traceability |
| `docs/02-business.md` | `factory/templates/business.md` | lean canvas, revenue model and rail, pricing tiers, unit economics (ARPA, CAC, LTV, GM, payback), cost model 0/100/1k/10k, 12-month table × 3 scenarios, break-even and peak cash, sensitivities, pricing/economics objections and answers, (deep) alternatives and judging |
| `HUMAN_TASKS.md` | — | payment-rail (and tax) tasks, each ≤ 5 min |
| `product.json` | CLI | `stack.payments` set, phase done |

## Definition of Done

- [ ] PRD: personas, JTBD, journey, MVP (must/should/won't) within the budget for the depth, stories with testable G/W/T, success metrics, event plan.
- [ ] Business: model chosen with rationale, 3 tiers priced against cited anchors (VAT-inclusive for consumers), unit economics, cost model, 12-month projection × 3 scenarios, break-even and peak cash.
- [ ] Payment rail chosen and consistent with `monetization.md`; founder tasks created with exact steps.
- [ ] Every assumption visible and tagged; projections reproduce from the script; base ≤ SOM.
- [ ] Critic run (standard/deep) and every objection answered under it (one objections section).
- [ ] No placeholders or guidance comments; `validate <slug>` passes; committed and pushed.

## Anti-patterns

- Feature-first MVP: everything "nice" in Must; no payment path; no activation definition.
- Pricing from cost-plus or vibes instead of anchors and value metric; hiding VAT in B2C prices.
- Unit economics with 0% churn, free founder time presented as zero cost, or CAC = 0 for a paid channel.
- Hockey-stick projections not tied to a channel plan; base scenario above the researched SOM.
- Acceptance criteria that cannot be automated ("works well").
- Copying a competitor's tiers without checking the value metric.
- Proposals that differ only in wording (deep); judges seeing author names.
- Giving the founder decisions an agent could take; asking for >5-minute tasks.
- Quoting fees/rates from memory.

## Tools & sources

`factory/playbooks/monetization.md`, competitor pricing pages (URLs in `competitors.md`), payment-rail pricing pages (URLs in Step 7), Apple/Google commission pages (Step 5), Portal das Finanças <https://info.portaldasfinancas.gov.pt/>, ECB rates <https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html>, provider pricing for AI/API/hosting, Python stdlib for the model, Agent tool for proposals/judges/critic (`product-strategist`, `devils-advocate`).

## Hand-off

To `03-brand` and `04-architecture` (they run in parallel): **brand** gets positioning, personality hints from persona and wedge, locales, competitor names to avoid; **architecture** gets Must stories and budget, NFRs, integrations (rail, auth, email, AI), data entities implied by stories, the analytics event plan, cost constraints and the 0/100/10k-user cost targets. `product.json`: `stack.payments` set, `phase: brand`.
