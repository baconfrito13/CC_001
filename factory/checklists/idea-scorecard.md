# Idea scorecard — G1 rubric

> **Used by:** `01-research` (synthesis + critic), pivot re-scoring, any review of a `/continuar --forcar` override. **Authority:** weights, thresholds and verdict names live in `factory/PIPELINE.md` (G1). If this file ever disagrees with PIPELINE.md, PIPELINE.md wins — fix this file in a factory PR.

## 1. Scoring rules

1. Score each of the 9 criteria with an **integer 1–5**. Anchors are written for 1, 3 and 5; **2** = between 1 and 3, **4** = between 3 and 5. No half points.
2. Every score cites evidence IDs (`S#` from the track notes) and carries a **confidence** (H / M / L, §2).
3. **Caps by confidence:** L → max 3 · M → max 4 · H → up to 5. A criterion with no evidence scores **2 with confidence L** (never "3 to be safe") and is listed under *Gaps* with the cheapest test that would close it.
4. **Score = Σ(weight% × criterion score) ÷ 100.** Integer inputs give an exact two-decimal result — no rounding ambiguity at the 2.8 / 3.5 / 4.0 boundaries.
5. **Verdict** (PIPELINE.md G1): `GO` score ≥ 3.5 and no knockout · `PIVOT` 2.8 ≤ score < 3.5 and no knockout · `KILL` score < 2.8 **or** any confirmed knockout (§4).
6. **Pessimistic check:** recompute with every confidence-L criterion minus 1 (floor 1). If the verdict changes (e.g. GO → PIVOT), mark the verdict **fragile** and put the cheapest validation experiment in `docs/01-research.md` (the GTM phase turns it into a smoke test). Fragile does not change the verdict or the depth.
7. Score what the evidence says about the **idea as it will be built** (the wedge), not the generic category.

```python
# python3 score.py  — keep this file in the scratchpad, not in the repo
W = {"pain": 15, "demand": 15, "wtp": 15, "distribution": 15, "gap": 10,
     "feasibility": 10, "revenue_time": 10, "risk": 5, "fit": 5}          # sums to 100
s = {"pain": 4, "demand": 4, "wtp": 3, "distribution": 4, "gap": 3,
     "feasibility": 5, "revenue_time": 4, "risk": 4, "fit": 3}            # <- your integer scores
assert set(s) == set(W) and all(isinstance(v, int) and 1 <= v <= 5 for v in s.values())
x = sum(W[k] * v for k, v in s.items()) / 100
print(f"{x:.2f}", "kill" if x < 2.8 else "go" if x >= 3.5 else "pivot")    # apply knockouts separately
```

## 2. Evidence classes and confidence

| Class | What it is | Examples |
|---|---|---|
| **A — money / usage** | Behaviour that costs the actor something | Paid gigs and their volume, marketplace sales counts, competitor revenue or customer counts they state publicly, public install/download/MAU numbers, pre-orders, price pages with paying tiers |
| **B — revealed intent** | Unprompted public signals | Search volume and autocomplete, community size **and weekly activity**, complaint threads, 1–3★ reviews, job posts, GitHub issues/stars, app-store rank, tool adoption stats |
| **C — stated opinion** | People saying what they would do | Surveys, interviews, "I'd pay for this" comments, waitlist sign-ups without payment |
| **D — inference** | No direct observation | Analyst reports, top-down market sizes, LLM knowledge, analogies to other markets, your own reasoning |

**Confidence:** **H** = ≥ 2 independent sources, at least one class A or B · **M** = 1 class A/B source, or ≥ 2 class C · **L** = class D only, or a single weak/old (> 24 months) source.
**Independent** = different publishers and different underlying data (ten blogs quoting one report = one source).
Scores of 4 need ≥ 1 class A or ≥ 2 independent class B items. Scores of 5 need ≥ 1 class A **and** ≥ 1 class B, independent. Prefer sources < 12 months old; older evidence is flagged and discounted one confidence level.

## 3. The rubric

### 3.1 Problem pain & frequency — 15%
| | Anchor |
|---|---|
| **1** | Vitamin, not painkiller: occasional (less than yearly), no complaints found, no workaround, people shrug when it is described |
| **3** | Real annoyance, monthly or in bursts; ≥ 10 independent complaints/reviews in the last 12 months; tolerated workarounds (spreadsheet, manual process) |
| **5** | Acute (costs money, time or stress) and weekly+ frequency; ≥ 30 independent complaints or high-engagement threads; people already pay for tools/freelancers or maintain elaborate hacks |

Counts: dated verbatim complaints with URLs, 1–3★ reviews naming the problem, shared workaround artefacts (templates, scripts, repos), freelance gigs for the job, quantified time/cost of the problem. Does not count: "this is a common problem" (D), asking friends (C).

### 3.2 Demand evidence — 15%
| | Anchor |
|---|---|
| **1** | No measurable searches or communities; flat/declining trend; **no competitors and no adjacent products** (absence is not opportunity) |
| **3** | Core query cluster ≈ 1k–10k searches/month (EN, or EN+PT combined) **or** communities of 5k–50k active members; stable trend; ≥ 3 competitors alive (shipped in the last 6 months) |
| **5** | Cluster ≥ 10k searches/month **or** ≥ 50k-member communities active weekly; 12-month or 5-year trend up ≥ 20%; competitors with visible traction (≥ 100k visits/month, ≥ 1k reviews, funding, or paid-acquisition ads) |

Price-aware cross-check (use when volume anchors conflict with price level): `required_visits = target_new_customers_per_month ÷ visit→paid conversion` (defaults: 20 customers/month at 1% for B2C; 3 customers/month at 2% for B2B with ACV ≥ €1k); `capturable_visits = (monthly searches in the core cluster + reachable community members) × 5–10%`. Ratio capturable ÷ required: ≥ 2 → supports 4–5 · 0.5–2 → 3 · < 0.5 → 1–2.
Counts: Trends (relative, 5y), autocomplete/PAA breadth, keyword tools' volumes (label the tool), subreddit/forum sizes and posts/week, competitor traffic estimates (label as estimate). Does not count: global "market will reach $X bn" figures.

### 3.3 Willingness to pay / monetization clarity — 15%
| | Anchor |
|---|---|
| **1** | Users expect it free; payer unclear; comparables are free or ad-funded; no price analogue |
| **3** | Payer identified; ≥ 3 comparables charge but prices vary widely or segment is price-sensitive; revenue needs two steps (audience first, then monetize) |
| **5** | Clear payer with budget; ≥ 5 comparables at consistent price points; observed paying behaviour (reviews mention price/value, paid gigs, marketplace sales); checkout possible on day 1 through an available payment rail (`factory/playbooks/monetization.md`) |

Counts: competitor pricing pages (URL + date), review text about price/value, Fiverr/Upwork gig prices and order counts, Gumroad/Etsy/app-store paid listings with review counts, budget owners' job posts. Does not count: "people will pay for convenience".

### 3.4 Distribution — 15%
| | Anchor |
|---|---|
| **1** | No identifiable channel; paid-only with CAC ≥ first-year revenue per customer; needs network effects or a cold-start marketplace; depends on a closed platform |
| **3** | 1–2 plausible channels with evidence (SEO gap, one community that allows promotion, one directory), but effort-heavy or CAC uncertain |
| **5** | ≥ 3 independent low-cost channels with evidence, including one demand-capture channel (SEO long-tail, store search, marketplace) and one community channel that permits promotion; weak SERP (forums, thin or old pages in the top 10) or low-competition store category |

Counts: SERP inspection of top-10 for 5+ target queries, subreddit/forum rules on self-promotion, directory listings of competitors, competitors' referral sources (label as estimate), store category rank data. Does not count: "go viral", "post on LinkedIn".

### 3.5 Competitive gap — 10%
| | Anchor |
|---|---|
| **1** | Crowded and commoditised; incumbents free, strong or about to bundle the feature; no differentiation beyond "nicer/cheaper" |
| **3** | Clear differentiation but small or copyable in < 1 month; niche partly served |
| **5** | Sharp wedge with evidence: ≥ 3 unmet-need themes from reviews that no incumbent solves, **or** an underserved segment (language, compliance, size, vertical), **or** ≥ 10× on one axis (price, time, effort) verified against competitor numbers |

Counts: review-theme counts across ≥ 3 competitors, feature matrix built from product pages, pricing gaps in the ladder, missing locale/compliance support. Does not count: "no one does exactly this" without a search log.

### 3.6 Build feasibility — 10%
| | Anchor |
|---|---|
| **1** | Needs hardware, licences, partnerships, regulated data, heavy human ops (moderation, support SLAs) or novel R&D; > 4 weeks of factory build |
| **3** | Standard stack with 1–2 hard parts (third-party API approval, data sourcing, uncertain AI quality); MVP in ~2–3 weeks of factory build; light ops |
| **5** | Fits a `factory/stacks/` recipe; MVP in days; no licences; no manual ops; dependencies have free/cheap tiers and stable public APIs |

Counts: matching stack recipe, API docs and pricing pages (URL + date), a working proof (script that calls the API and returns usable output), cost-per-use estimate for AI/API calls. Does not count: "should be easy".

### 3.7 Time to first revenue — 10%
| | Anchor |
|---|---|
| **1** | > 6 months after launch (audience building, ad-network approval, enterprise sales cycle, uncertain store review) |
| **3** | 1–3 months (SEO ramp, community building, SMB sales cycle of weeks) |
| **5** | ≤ 3 weeks after launch: checkout live on day 1, buyers reachable immediately, impulse price (≤ €50) or paid pilot, pre-sell possible |

Counts: analogue timelines (competitor launch stories with dates), channel lead times (SEO indexing, store review times — verify), sales-cycle evidence. Does not count: optimism about virality.

### 3.8 Risk (inverted) — 5%
| | Anchor |
|---|---|
| **1** | High legal/regulatory exposure (health or financial claims, minors' data, special-category data, scraping against ToS, AI Act high-risk) **or** single-platform dependency that can switch the product off |
| **3** | Moderate: ordinary personal data under GDPR, one platform dependency with alternatives, ToS grey areas that can be mitigated |
| **5** | Low: no personal data beyond account, no regulated claims, multiple substitutable platforms, Merchant of Record available |

Counts: quoted clauses from ToS/policies (URL + date), regulation texts (EUR-Lex), regulator guidance. Does not count: "it should be fine".

### 3.9 Founder fit — 5%
| | Anchor |
|---|---|
| **1** | Conflicts with `FOUNDER.md` (excluded topic, reputation risk) or needs skills/audience the founder lacks and agents cannot supply |
| **3** | Neutral: no interest, no audience, nothing against |
| **5** | Matches stated interests and existing audience/assets/skills; founder can credibly be the face of it |

Counts: explicit lines in `FOUNDER.md` (quote them). Does not count: guesses about the founder's taste.

## 4. Knockouts (any confirmed → KILL regardless of score)

| # | Knockout | Check |
|---|---|---|
| K1 | Illegal in Portugal/EU or the target market | Statute or regulator text, not opinion |
| K2 | Requires a licence/authorisation the founder cannot get, and no licensed partner or rail exists (investment/financial advice, payment or e-money institution, medical device, legal practice, regulated brokerage, pharma/alcohol/tobacco sales…) | Regulator page + checked-for-partners note |
| K3 | Core function violates a platform rule the product depends on and there is no alternative platform | Quoted policy clause |
| K4 | Clear ethical harm: targets vulnerable people, deceptive patterns/scams, non-consensual surveillance or deepfakes, fake reviews, impersonation, content involving minors | Description of the harm mechanism |
| K5 | No viable payment rail and no alternative monetization (category prohibited by Merchant-of-Record providers, Stripe and app stores; ads/affiliate impossible) | Prohibited-business lists (URLs + date) |
| K6 | Excluded by `FOUNDER.md` | Quote the line |
| K7 | Core value depends on content/data/IP the product may not lawfully use | Licence or ToS clause |
| K8 | Structurally negative unit economics: variable cost per paying customer ≥ 70% of the best realistic price with no cost lever | The arithmetic, with sources |

Procedure: flag → verify with a second independent source → if confirmed, check whether a variant that **keeps the founder's intent** removes it (drop the regulated feature, change platform, change payer). If yes, treat the variant as a PIVOT candidate and record the knockout it removes; if no, KILL. Only the founder can override a KILL (`/continuar <slug> --forcar`); agents never do. For K1 and K4 the founder-facing message must name the legal/ethical problem explicitly.

## 5. Pivot heuristics (2.8 ≤ score < 3.5)

Rank criteria by **gap to 5 × weight** and attack the top two with the matching levers. Generate 3 variants; every variant must keep at least one of: the founder's core audience, the founder's core job-to-be-done (check against the verbatim idea).

| Weak criterion | Levers |
|---|---|
| Pain & frequency | Narrow to the segment where pain is acute and frequent; switch to the costlier adjacent job; add a recurring trigger |
| Demand | Move to the adjacent query cluster with volume; consumer → small business; EN-first with PT as secondary |
| Willingness to pay | Change the payer (consumer → professional/business); sell the outcome not the tool; premium niche + higher price; productize a service first |
| Distribution | Choose a distribution-native form (browser extension, marketplace/app-store listing, template/directory, programmatic SEO); target a community with an owned channel; partner/affiliate |
| Competitive gap | Sub-niche ("X for Y"), localisation/compliance as wedge (PT/EU, RGPD-first), integration wedge, price disruption on the ladder's empty rung |
| Build feasibility | Single workflow only; concierge/manual first; replace build with integration; cut data requirements |
| Time to revenue | Pre-sell, paid pilot, digital product first (template/pack), founding-member lifetime offer |
| Risk | Drop the regulated feature, human-in-the-loop, B2B only, no personal data, Merchant of Record |
| Founder fit | Re-aim at the founder's audience/assets |

Re-scoring rules: use the same rubric; a criterion may rise **only** with evidence specific to the variant (new queries, new competitors, new pricing); without it the maximum gain is +1. Extra research budget: ≤ 25% of the original. Choose the highest-scoring variant that passes the intent test; it must reach **≥ 3.5** to continue, otherwise KILL with 3 alternative angles. Record the pivot prominently (README decision log, PR description, top of `docs/01-research.md`).

## 6. Adaptive-depth rule (PIPELINE.md G1)

| Condition after G1 | Set `depth` to |
|---|---|
| verdict GO and score ≥ 4.00 | `deep` |
| verdict GO and 3.50 ≤ score ≤ 3.99 | `standard` |
| PIVOT variant re-scored | the band of the **variant's** score, same two rows |
| Founder chose a depth explicitly (brief field "Profundidade definida pelo fundador: sim") | keep it; if the band differs, add one line to the README decision log ("score would suggest deep") |

`lean` is never selected automatically — only the founder can ask for it. Research itself runs at the depth in `product.json` before G1 (`standard` by default). Apply with `python3 factory/scripts/factory.py set <slug> depth <value>`.

## 7. Decision record

```
python3 factory/scripts/factory.py set <slug> decision '{"verdict":"go","score":3.80,"rationale":"<wedge in one clause>; <top risk>; <fragile?>"}'
```
`rationale`: pt-PT, ≤ 2 sentences. The same numbers appear in `docs/01-research.md` (table, §Scorecard). After a founder override add `"rationale": "forçado pelo fundador; veredicto original: kill 2.60"` — never overwrite the original score.

## 8. Illustrative example (not a real product)

| Criterion | W | Score | Conf. | Evidence |
|---|---|---|---|---|
| Pain & frequency | 15 | 4 | M | 22 complaint threads/12 mo (S3–S9); monthly task |
| Demand | 15 | 4 | H | 14k searches/mo cluster (S1, S2); +25% 5-yr trend |
| Willingness to pay | 15 | 3 | M | 4 comparables at 8–15 €/mo (S11–S14) |
| Distribution | 15 | 4 | M | weak SERP on 6/8 queries; 2 communities allow posts |
| Competitive gap | 10 | 3 | M | PT-language gap, copyable in weeks |
| Build feasibility | 10 | 5 | H | stack recipe `web-saas`; MVP ≈ 4 days |
| Time to first revenue | 10 | 4 | M | checkout day 1; first sales ≈ 3–5 weeks |
| Risk (inverted) | 5 | 4 | M | account data only; MoR available |
| Founder fit | 5 | 3 | M | neutral |

Score = (60 + 60 + 45 + 60 + 30 + 50 + 40 + 20 + 15) ÷ 100 = **3.80 → GO → depth `standard`**. Pessimistic (no L criteria here) = 3.80 → not fragile.
