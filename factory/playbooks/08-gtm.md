# 08 · Go-to-market (`gtm`)

> **Owner:** `growth-marketer` (+ `brand-designer` for voice and visuals, `legal-counsel` for claims/consent review, `devils-advocate` for the critique pass) · **Inputs:** `docs/00-brief.md`, `docs/01-research.md` + `docs/research/*`, `docs/02-product.md` (personas, locales), `docs/02-business.md` (pricing, **CAC targets**), `docs/03-brand.md` (voice, glossary), `docs/04-architecture.md` (analytics, email), `FOUNDER.md` (audience, hours, budget), `product.json`, `factory/LEARNINGS.md`, `factory/playbooks/monetization.md` · **Outputs:** `docs/08-gtm.md` (from `factory/templates/gtm.md`), `marketing/{copy,social,email,launch,seo,ads,press}/`, founder tasks · **Gate:** `gtm` Definition of Done (`factory/PIPELINE.md`); final landing copy exists in every locale **before** the integration step; nothing has been posted publicly.

## Objective

Decide who the product is for, why it wins, where the first 100 customers come from, and produce every asset needed to reach them — written, localised and copy-paste ready — so the launch is a sequence of ≤ 5-minute founder actions. Claude prepares; **the founder posts** (posting, emailing real people, paying for ads and creating accounts are founder tasks). Runs in parallel with `build` and `legal`; owns `marketing/` only.

## Before you start

1. Read `factory/LEARNINGS.md`, `FOUNDER.md` (own audience, networks, hours/week, budget, `go_live`), `product.json` (`type`, depth), `docs/02-product.md` (locales, default `en` + `pt-PT`), `docs/03-brand.md` (voice, tagline, pt-PT glossary), `docs/02-business.md` (price, `target CAC`, break-even), `docs/research/{competitors,audience}.md` (competitor alternatives, community names, customers' own words).
2. Decide the **mode**: `waitlist` (payments not live; CTA = join the waitlist) or `live` (CTA = start/buy). Write it at the top of `docs/08-gtm.md`; the copy for both CTAs is prepared, the mode switches in phase 09.
3. Tools: `ToolSearch select:WebSearch,WebFetch`. Optional: Figma MCP (`mcp__Figma__whoami`; load the `figma-use` skill before `use_figma`) for social/OG images; OpusClip MCP (`opusclip_whoami`, `opusclip_get_usage`) for clips — **its MCP/API needs a Pro, Max or Enterprise plan** (<https://www.opus.pro/pricing>); if the call fails or the plan lacks it, skip video and note it.
4. Rules of the road: every claim is true and sourced (URL + date) or removed; no invented testimonials, user counts, logos, awards or scarcity; no copy that promises what the PRD does not ship; comply with GDPR/ePrivacy (Step 9) and platform rules (Step 11). `docs/08-gtm.md` is pt-PT (founder-facing); marketing assets are written **natively** in each target locale, never machine-translated.
5. `python3 factory/scripts/factory.py set-phase <slug> gtm in_progress --summary "gtm started"`. Scratch files in `$SCRATCH`.

## Procedure

### Step 1 — Positioning (April Dunford method, adapted to a pre-launch product)
1. **Competitive alternatives** — what the best-fit customer does today if the product did not exist (spreadsheet, manual work, a competitor, doing nothing). Source: `competitors.md`, `audience.md` (customers' words). List 3–6, status quo included.
2. **Unique attributes** — capabilities the alternatives lack, as facts (not adjectives); each traceable to the PRD "must" stories.
3. **Value** — for each attribute, the outcome it enables and the proof (number, demo, sourced claim). Reject attributes with no value.
4. **Best-fit customers** — the segment that cares most about that value (urgent pain, low switching cost, budget); name 1 primary, optionally 1 secondary.
5. **Market category** — the frame that makes the value obvious (e.g. "AI invoice checker for Portuguese freelancers", not "productivity platform"). Choose the category where you win on the unique attributes; test with the 5-second rule (can a stranger repeat it?).
6. Write the positioning statement: *"For `<best-fit customer>` who `<situation/need>`, `<Product>` is a `<category>` that `<key value>`. Unlike `<main alternative>`, it `<unique attribute>`."* Put the canvas (5 components + 1 trend line) in `docs/08-gtm.md`.
Decision rule: if two framings tie, pick the one with the **smaller alternatives set and the clearer price anchor**.

### Step 2 — ICP, personas, triggers
Write a one-page ICP: who (role/situation, size, geography/language), **trigger events** (what makes them search this week), jobs-to-be-done, current workaround and its cost, budget and who pays, objections (top 5), **where they spend time** (communities, newsletters, creators, search terms, events), disqualifiers (anti-ICP). Evidence tags per line (`S#` from research). Keep ≤ 1 page; the primary persona drives every later step.

### Step 3 — Messaging hierarchy → `marketing/copy/messaging.md` (+ section in `docs/08-gtm.md`)
| Level | Content | Rule |
|---|---|---|
| 1 Value proposition | one sentence, outcome + audience | ≤ 12 words, no jargon, passes the 5-second test |
| 2 Pillars | 3 benefits, each = promise + proof + feature behind it | each answers "so what?" for the persona's trigger |
| 3 Proof | numbers, demos, sourced facts, (later) real quotes | only what exists today; mark "TBD after launch" otherwise |
| 4 Objection handling | price, trust, data/privacy, switching, "why not X", refund | each ≤ 2 sentences + where it appears (FAQ, pricing, email) |
| 5 Boilerplates | 10-, 30-, 60-word descriptions, one-liner, elevator pitch | reused by PH, press, store listings, directories |
Voice from `docs/03-brand.md`; keep the glossary. Hooks bank: 10 problem-first hooks, 10 outcome-first hooks (used by social/email/ads).

### Step 4 — Landing copy in every locale → `marketing/copy/landing.<locale>.md`
One file per locale (`en`, `pt-PT`, others from `docs/02-product.md`), final and ready to paste into the web starter's sections. If the starter ships a copy/messages schema (`src/content/**` or i18n messages), match its keys exactly; otherwise use this format (keys on their own line so the lint in Step 18 can count characters):
```
---
locale: pt-PT
mode: waitlist            # or live
---
## seo                    # one block per page: /, /pricing, /blog, /about, /contact (+ legal pages: title/description only)
- page: /
  title: …                # ≤ 60 chars: primary keyword + brand
  description: …          # ≤ 155 chars, benefit + action
  og_title: …
## hero      eyebrow · h1 (≤ 12 words) · subhead (≤ 30 words) · cta_primary · cta_secondary · proof_line
## problem   h2 · 3 pain bullets in the customer's words (PAS: problem, agitate, solve)
## features  h2 · 3–6 × {title ≤ 5 words, body ≤ 25 words, benefit first}
## how-it-works  h2 · 3 steps × {title ≤ 4 words, body ≤ 20 words}
## pricing   h2 · per plan {name, price string "9 € / mês · IVA incluído", 4–6 bullets, cta} · billing note · guarantee · payment methods
## faq       6–8 × {q, a ≤ 60 words}: price/VAT, refund, data & privacy, cancellation, support, "why not X", AI/limits, languages
## cta       h2 · one line · button (same action as the hero) · risk reversal
## waitlist  label · placeholder · button · consent line · success · error · already-registered
```
Rules: one primary action per page; hero says *who + outcome + how in 5 seconds*; benefits before features; reading level ≈ grade 8; second-person singular; specific numbers; no superlatives without proof; the waitlist asks for **email only**, with an explicit consent line (purpose + how to withdraw + link to the privacy policy), double opt-in on; CTA labels name the outcome ("Quero a lista de espera", "Começar grátis"), not "Submit". Prices are VAT-inclusive for consumers (monetization.md Step 7); a launch discount names its end date and uses no fake reference price.
**pt-PT quality gate** (blocking): genuine European Portuguese, AO90 spelling, *tu* for B2C and neutral/impersonal forms for B2B/finance/health/legal, **never "você"**. Banned (Brazilianisms): você/vocês, tela, celular, arquivo, usuário, baixar/download→descarregar/transferir, cadastro/cadastrar→registo/registar, senha→palavra-passe, login→iniciar sessão, assinatura→subscrição, equipe/time→equipa, gerenciar→gerir, deletar→eliminar, salvar→guardar, compartilhar→partilhar, recurso (=feature)→funcionalidade, planilha→folha de cálculo, nota fiscal→fatura, CPF→NIF, "estou fazendo/vou fazendo"→"estou a fazer". Run the check on all pt-PT files (`grep -niE "\b(você|vocês|tela|celular|arquivo|usuário|baixar|cadastr|senha|assinatura|equipe|gerenci|deletar|salvar|compartilh|planilha)\b"`).

### Step 5 — Channel selection (Bullseye framework, 19 traction channels)
1. For each of the 19 channels write one concrete idea for *this* product (or "n/a" with a reason). Channels: viral marketing · publicity (PR) · unconventional PR · SEM · social & display ads · offline ads · SEO · content marketing · email marketing · engineering as marketing (free tools) · targeting blogs/newsletters · business development/partnerships · sales (outbound) · affiliate programs · existing platforms (stores, marketplaces, directories) · trade shows · offline events · speaking/podcasts · community building.
2. Score each 1–5 on **Fit with ICP** (30%), **Reach** (20%), **Speed to a signal ≤ 30 days** (20%), **Cost-efficiency** (15%), **Executable by Claude without founder time** (15%). Rank. Inner ring = top 3 (at least one organic/free; at most one paid), middle ring = next 4, outer = rest. By `type`: `extension` → store listing + SEO + communities first; `mobile` → ASO + short video + communities; `api`/dev tool → docs/SEO + Hacker News/Reddit + GitHub; `content` → SEO + email + social; `ecommerce` → Meta/Google + email + UGC; `ai-app`/`web-saas` → SEO + launch platforms + communities.
3. **Test the inner ring** with the smallest experiment that can show a signal in ≤ 14 days; define in advance `metric · success · stop-loss · budget · owner`:
| Test | Success | Stop-loss | Budget cap |
|---|---|---|---|
| SEO (10 briefs → first articles) | ≥ 3 pages indexed in 14 days, first impressions in Search Console by day 28 | no indexation after 21 days → fix technical issues before writing more | €0 |
| Community / Reddit / forums | ≥ 30 qualified visits and ≥ 5 signups per post or thread | 2 removals/warnings or 0 signups after 3 posts → pause the community | €0, ≤ 5 founder-hours |
| Launch platforms (PH, Show HN, directories) | ≥ 100 visits and ≥ 10 signups on the day | n/a (one-shot) — never relaunch the same product within 30 days | €0–€30 (directory fees only if founder approves) |
| Paid (Step 12) | CPA ≤ `target CAC` with ≥ 10 conversions | 50% of cap spent with 0 conversions or CPA > 3× target after ≥ 50 clicks; policy rejection | **€100 per platform, ≤ €300 total** |
| Email / waitlist nurture | ≥ 40% open, ≥ 5% click, ≥ 10% waitlist→paid in 30 days | spam complaints > 0.1% → stop and audit consent | €0 |
| Partnerships / outreach | ≥ 1 yes in 10 asks | 0 replies after 20 sends → change the offer | €0 |
4. After day 28, **double down on the single best channel** (lowest CAC with volume) and keep one runner-up; record the verdict in `docs/08-gtm.md` and feed it to phase 10.

### Step 6 — SEO plan → `marketing/seo/`
1. **Free keyword research** (no paid tools): (a) seed from `audience.md` phrases and competitor H1/H2s; (b) Google autocomplete + "People also ask" + related searches via `WebSearch` and, if needed, Playwright on `https://suggestqueries.google.com/complete/search?client=firefox&q=<seed>&hl=<lang>` (unofficial endpoint; polite rate); (c) Google Trends for relative demand and seasonality (<https://trends.google.com>); (d) Google Keyword Planner ranges (free with an Ads account, no spend; founder account → task only if volumes are essential); (e) Ahrefs Webmaster Tools and Search Console **after launch** for real queries; (f) competitors' `sitemap.xml` to reveal their page templates; (g) Reddit/Quora/forum threads for the phrasing; (h) `site:competitor.com` searches for their best pages.
2. `marketing/seo/keywords.csv`: `keyword,locale,intent(info|commercial|transactional|nav),volume_band(0–10/10–100/100–1k/1k+ or n/a),difficulty_guess(L/M/H),serp_notes,priority(1–3),cluster,target_url`. Difficulty heuristic: ≥ 3 forum/UGC/thin pages in the top 10 → winnable; page one full of DR 70+ brands → go long-tail or skip. Priority = intent (3 transactional / 2 commercial / 1 info) × fit (1–3) × winnability (1–3).
3. **Topic clusters** in `marketing/seo/clusters.md`: 3–5 pillars; each pillar = 1 pillar page + 6–10 cluster pages linking up and across; start with **bottom-of-funnel**: "`<competitor>` alternatives", "`X` vs `Y`", "best `<category>` for `<persona>`", "how to `<job>`", templates/calculators, glossary. Separate pt-PT keyword research (do not translate keywords; Portuguese users search differently).
4. **Programmatic SEO** (`programmatic.md`): propose only if a template page can carry **unique data or utility per page** (calculators by country/profession, comparison pairs with real feature data, location/profession templates) and ≥ 30 pages are justified; otherwise reject. Thin or templated near-duplicates risk Google's "scaled content abuse" spam policy. Spec the data source, template, uniqueness test, internal linking, and the noindex rule for pages under a quality threshold.
5. **10 article briefs** → `marketing/seo/briefs/NN-<slug>.<locale>.md` (mix: 4 bottom-funnel, 3 mid, 3 top; write in the locale that has demand). Each brief: `keyword`, `secondary`, `locale`, `intent`, `serp_notes` (what the top 5 do, gap to exploit), `title` (≤ 60), `description` (≤ 155), `slug`, outline (H2/H3 with the question each answers), must-include facts + sources, **information gain** (what only this article offers: data, screenshots, a tool, a template), internal links, CTA, schema (`Article`/`FAQPage`/`HowTo`), length, image ideas, `status: brief`. Deep depth: also draft all 10 as `marketing/seo/articles/<slug>.<locale>.md`.
6. Technical SEO checklist handed to build/integration: unique title/description per page and locale, one H1, `hreflang` + canonical, `sitemap.xml`, `robots.txt`, OG images 1200×630, JSON-LD (`Organization`, `SoftwareApplication`/`Product`, `FAQPage`), clean URLs, fast LCP.

### Step 7 — 30-day content calendar → `marketing/social/calendar.md`
Table: `day · date (Europe/Lisbon) · channel · format · topic/hook · asset path · CTA + UTM · status`. Structure around launch day **L**: L-14…L-1 build audience (problem stories, build-in-public, waitlist push, teasers; 1 email/week to the waitlist), **L** launch kit (Step 11), L+1…L+15 social proof, tutorials, articles, answers to launch feedback. Cadence by depth: lean 10 posts · standard 20 · deep 30 (+10 drafted articles); ≥ 1 SEO article/week; 60% value (insights, how-tos), 25% product, 15% story. Pick ≤ 2 platforms where the ICP actually is (B2B → LinkedIn (+ X for devs); consumer → Instagram/TikTok/YouTube Shorts; dev → X, Reddit, dev.to). Never schedule a post without a source asset.

### Step 8 — Social posts and visuals → `marketing/social/posts.<locale>.md`, `image-briefs.md`
Each post: `id · platform · locale · hook (first line ≤ 140 chars) · body · CTA · link with UTM · asset ref · publish slot (Lisbon + UTC)`; ≤ 3 hashtags; one idea per post; threads ≤ 8 posts. Images: brief per post in `image-briefs.md` (size, text, layout) — produce with Figma MCP (OG 1200×630, square 1080×1080, portrait 1080×1350, story 1080×1920) and save under `marketing/social/assets/`. Video: record the demo (Playwright video of the real product at `/opt/pw-browsers/chromium`), then OpusClip (`opusclip_submit_project` → `opusclip_list_clips` → `opusclip_create_social_copy_job`) for short clips **only if the plan supports it**. Do **not** call `opusclip_schedule_publish` / `opusclip_create_post_task` until the founder has approved that exact batch in `HUMAN_TASKS.md` (posting is a public action under their name).

### Step 9 — Email sequences → `marketing/email/{welcome,onboarding,conversion,winback}.<locale>.md`
| Sequence | Trigger | Emails (delay) | Goal |
|---|---|---|---|
| Welcome | waitlist/sign-up | E1 now (confirm + what happens next + one reply-able question), E2 +2d (why we built it + quick win), E3 +5d (proof/FAQ + CTA) | open rate, replies |
| Onboarding | account created | E1 +0 (single first step to the aha), E2 +1d if not activated (tip + help link), E3 +3d (feature 2), E4 +7d (check-in + feedback ask) | activation ≥ 40% |
| Conversion | trial/free user | −3d, −1d before trial end, +0 expired, +3d last reminder; discounts only if real and Omnibus-safe | trial→paid |
| Win-back | cancelled/dormant | +3d (one-question survey), +30d (what's new), +60d (offer or goodbye) | reactivation, learning |
Per email: `id · trigger · delay · exit_condition (purchased/unsubscribed/activated) · subject (≤ 45 chars) · preview (≤ 90) · body (≤ 120 words, one CTA, UTM) · plain-text fallback`. Compliance: marketing email only with opt-in (waitlist consent line stored with timestamp and text version) or the "soft opt-in" for existing customers on similar products (Lei n.º 41/2004 — confirm with `legal-counsel`); sender identity, working unsubscribe link, no misleading subjects; transactional emails (receipts, resets) are separate and carry no promotion; reply-to is a monitored inbox. Implementation (sending via Resend, scheduling) is a phase-05/10 backlog item noted in `docs/08-gtm.md`.

### Step 10 — Press and PR kit → `marketing/press/`
`press-kit.md` (boilerplates 50/100 words, facts sheet, founder bio limited to what `FOUNDER.md` allows, logo/screenshot paths from `brand/`, contact `press@<domain>`), `release.<locale>.md` (150–300 words: news angle, quote, availability, link), `pitches.md` (5 tailored ≤ 120-word pitches, one ask each), `targets.md` (20 outlets/newsletters/podcasts per locale with why-fit and contact page; **verify contact and editorial fit**). Angle must be news (a number, a first, a story, a free tool), not "we launched". Portugal media to check (if `pt-PT`): ECO (eco.sapo.pt), Jornal de Negócios, Observador, Público, Expresso, Shifter, SAPO Tek, Pplware, Exame Informática, Dinheiro Vivo, Executive Digest; startup bodies and communities: Startup Portugal, Beta-i, local meetups (Lisboa/Porto). Sending pitches is a founder task.

### Step 11 — Launch kits → `marketing/launch/`
Prepare one file per platform, copy-paste ready, with the founder's batch ID in the header. Rules below were checked on 2026-10-08; re-verify on the day.

**Product Hunt → `producthunt.md`** (specs: <https://www.producthunt.com/launch/preparing-for-launch>)
- `name` (product name only) · `tagline` **≤ 60 chars** (3 options, character-counted) · `ph_description` **≤ 500 chars** · up to **3** topics · up to 3 shoutouts.
- Thumbnail square (240×240 recommended, < 3 MB). Gallery **≥ 2 images** (1270×760 recommended). Optional video: YouTube link only (30–60 s, understandable on mute).
- **Gallery shot list:** (1) hero: promise + real UI; (2) problem → result, before/after; (3) key feature in action; (4) how it works in 3 steps; (5) offer/pricing or proof; (6) roadmap or "made in Portugal".
- **Maker first comment** (150–250 words): who you are, the pain, what it does, what is free, what is next, one specific feedback question. Ask for feedback, never for upvotes ("the only real rule: you cannot ask people directly to upvote").
- 10 prepared answers to likely questions (price, privacy, alternatives, roadmap, tech, AI use, data location, refunds, support, who is it for).
- Product URL must be **plain: shortened and tracking links are not accepted** — create a dedicated landing path (e.g. `/ph`) for attribution. Accounts are personal (company accounts are prohibited); a hunter is optional; scheduling is possible up to 1 month ahead.
- Timing: the launch day starts at **12:01 AM Pacific = 08:01 Lisbon** (07:01 during the 1–3 weeks when US and EU daylight-saving dates differ). Pick the day you are most prepared; Tue–Thu is the usual heuristic for traffic.
- Launch-day schedule (Lisbon) in `schedule.md`: T-1 final checks · 08:01 live + first comment · reply to every comment within 30 min until 22:00 · 09:00 LinkedIn/X post · 10:30 email to the waitlist · 13:00 community posts · 17:00 progress update · 22:00 thank-you post + metrics snapshot into `docs/10-growth.md`.

**Show HN → `showhn.md`** (rules: <https://news.ycombinator.com/showhn.html>, <https://news.ycombinator.com/newsguidelines.html>)
- **Eligibility test first:** people must be able to **try it now**, ideally without signup or email. Landing pages, waitlists, newsletters, fundraisers and trivial one-off projects do not qualify → record "no Show HN" and skip.
- Title: `Show HN: <Name> – <what it does in plain words>`; no caps, exclamation marks, hype or superlatives; link to the thing itself.
- Content: a top-level author comment with background — what it is, why you built it, how it works, limits, what feedback you want.
- **HN forbids generated or AI-edited text in submissions and comments, and automated posting.** The file is a **fact sheet and talking points** for the founder to write in their own words, not final text. Never ask for upvotes or comment on votes; never delete and repost; stay available for hours.
- Heuristic slot: Tue–Thu ≈ 14:00–15:00 Lisbon (08:00–09:00 ET). One Show HN per major release, not per feature.

**Reddit → `reddit.md`**
- Moderators set the rules per subreddit and sidebar rules always win; the "90/10" guideline is folklore, not a Reddit rule. Niche subs of the ICP convert; generic startup subs rarely do.
- Patterns to **re-verify on the day** (they shift): r/SideProject permissive for builders (needs context and story); r/startups promotion only in its designated share threads; r/SaaS strict and changing (read pinned rules); r/indiehackers prefers journey posts to launches; r/webdev and r/InternetIsBeautiful need a genuinely useful, tryable thing; PT: r/portugal and r/devpt (restrictive, read rules).
- Per target: rule summary + link, post type, title, body (value first, disclose "I built this", ask for feedback), what not to do, timing.
- Founder's own account only; no alt accounts; no identical text across subs; ≤ 1 sub per day; reply to every comment.

**Indie Hackers → `indiehackers.md`:** product page + a milestone/story post (what you built, numbers, lesson, a question); join the relevant group; never beg for upvotes.

**BetaList → `betalist.md`:** per its FAQ submissions are **paid** (price at the end of the form; refunded automatically if not selected); needs your **own domain** (no `vercel.app`, no store links); editors favour a clear value proposition, novelty and a well-designed landing page; pre-launch and recently launched startups; generally featured once. Founder pays → task.

**Directories → `directories.md`** (columns `name · URL · type · cost (verified date) · note · priority`):
- Free or low-cost and relevant first: Uneed, AlternativeTo, SaaSHub, DevHunt (developer tools; free, featured placement paid), Peerlist Launchpad (developers; check terms), Fazier (check tiers), G2/Capterra/GetApp (free vendor profile; reviews later), Crunchbase, GitHub awesome-lists/OpenAlternative (open source), Chrome Web Store/Edge Add-ons/Firefox AMO (extensions), app stores (mobile).
- AI directories often charge (Futurepedia lists ≈ $197 on its submission page; There's An AI For That and Toolify show paid tiers) → only with founder-approved budget and only if the audience uses them.
- Skip dead, spammy or pay-to-play directories; verify that each is alive and its price on the day; use the boilerplates from Step 3 and a unique description per site.

### Step 12 — Paid ads test plan → `marketing/ads/`
- **Preconditions:** analytics and conversion events verified (phase 09); ≥ 200 organic/launch visitors measured for a baseline conversion rate; a `target CAC` from `docs/02-business.md` (default if absent: CAC ≤ ⅓ LTV and payback ≤ 6 months).
- **Plan (`test-plan.md`):** objective (signups or purchases), one platform at a time, **cap €100 per platform, ≤ €300 total**, 7–14 days, 3 ad variants × 1–2 audiences, success/stop-loss as in Step 5, daily review by Claude from platform exports, no scaling before CPA ≤ target at ≥ 10 conversions.
- **Google Search:** bottom-funnel exact/phrase keywords + negatives, geo PT or EU; Responsive Search Ads: up to 15 headlines ≤ 30 chars and 4 descriptions ≤ 90 chars. Search has no fixed minimum budget (Demand Gen through the API has a $5/day floor).
- **Meta:** technical floor $1–5/day, but usable conversion tests need ≈ $20+/day per ad set — a weak fit for a €100 cap; use only for consumer products with a strong visual and a clear one-step conversion.
- **Reddit Ads:** $5/day floor, community targeting, cheap and reliable for niche tests; spend can exceed the set budget by up to ~20%.
- Verify limits and minimums in each ads manager (they change). Files `google.md`, `meta.md`, `reddit.md`: keywords/negatives or audiences, copy per variant, landing URL with UTM, tracking events.
- Creating ad accounts, adding billing and pressing "publish" are founder tasks (🟡, money).

### Step 13 — Partnerships, affiliates, referrals → `marketing/launch/partners.md`
List 10 partner candidates (complementary tools for integrations/co-marketing, newsletters, creators, agencies, communities) with the offer for them, the ask, and a ≤ 120-word message. **Affiliate**: only after payback is proven (≥ 20 paying customers, activation ≥ 30%); 20–30% recurring for 12 months is the usual shape; use the MoR's programme if it has one, otherwise a tool such as Rewardful/FirstPromoter/Tolt (verify price and EU consent handling); affiliates must disclose ("#publicidade"/"link de afiliado"). **Referral** in-product: give-get (e.g. one month each) after the activation moment; abuse limits; Omnibus-safe wording. Founder sends messages.

### Step 14 — Portugal-specific plays (when `pt-PT` is a locale)
Portuguese-language SEO (separate keywords, `google.pt`); local payment methods that lift conversion (MB WAY, Multibanco — depends on the rail: Paddle offers MB WAY; Stripe Managed Payments' list does not); PT media/communities/events from Step 10; LinkedIn for B2B (Portuguese-language posts perform best for local SMEs); price in euros VAT-inclusive; support in Portuguese; founder-led story ("feito em Portugal"); funding/credibility lists (Startup Portugal, Portugal Startups directories — verify); seasonal hooks (IRS season Mar–Jun, back-to-school Sep, Black Friday). Brazil is **not** a free extension of pt-PT: write pt-BR separately or not at all.

### Step 15 — ASO for mobile (`type: mobile`) → `marketing/copy/store.<locale>.md`
- **App Store** (limits checked 2026-10-08): `name` ≤ 30 · `subtitle` ≤ 30 · `keywords` ≤ 100 **bytes**, comma-separated, no spaces, no words already in name/subtitle, no competitor names · `promotional_text` ≤ 170 (editable without a review) · `description` ≤ 4,000 (plain text) · `whats_new` ≤ 4,000.
- **App Store screenshots:** ≥ 1 and up to 10 per device size, PNG/JPEG without alpha; provide the 6.9" set (1260×2736, 1290×2796 or 1320×2868) and iPad 13" (2064×2752) if universal; up to 3 app previews.
- **Google Play:** `title` ≤ 30 · `short_description` ≤ 80 · `full_description` ≤ 4,000 · icon 512×512 PNG · feature graphic 1024×500 · screenshots 2–8 per device type (9:16 or 16:9, ≥ 1080 px recommended) · optional YouTube video.
- **Process:** keyword research from store autocomplete and the top-10 competitors' titles/subtitles; primary keyword in name/title, second in the subtitle; localise `en` + `pt-PT` with separate keyword lists (never translate keywords).
- **Screenshot copy:** 5–8 frames, each a benefit headline ≤ 6 words + real UI; the first three carry the whole message.
- **After launch:** A/B tests (Apple Product Page Optimization, Play store-listing experiments) once ≥ 1k impressions/week; ask for a rating after a success moment, never at first launch. Hand to phase 09.

### Step 16 — KPIs, tracking plan, UTM conventions
1. **North Star** (one metric that tracks delivered value, e.g. weekly active teams, invoices checked per week) + AARRR table with definition, source, baseline `n/a`, week-4 target, owner: **Acquisition** (visitors by channel), **Activation** (% of signups reaching the aha event within 24 h; target ≥ 40%), **Revenue** (trial→paid ≥ 15%; MRR; ARPA), **Retention** (week-4 retention; monthly logo churn ≤ 5%), **Referral** (invites/active user; K). Funnel defaults to sanity-check against (heuristics, not promises): cold visitor→waitlist/signup 2–5%, warm traffic 10%+, waitlist→paid 5–15%.
2. **Tracking plan**: events `page_view`, `cta_click`, `waitlist_joined`, `signup`, `activated`, `checkout_started`, `purchase`, `refund` with properties `locale`, `plan`, `utm_*`; consent-gated; verified in phase 09.
3. **UTM convention** (lowercase, hyphens, no spaces): `utm_source` = platform (`producthunt`, `hackernews`, `reddit`, `linkedin`, `x`, `newsletter-<name>`, `google`, `meta`, `partner-<name>`), `utm_medium` ∈ `social|cpc|email|referral|affiliate|directory|pr|community|video|organic-social`, `utm_campaign` = `<yyyymm>-<slug>` (e.g. `202611-launch`), `utm_content` = variant (`a`,`b`, creative id), `utm_term` = keyword. Never on internal links; not on Product Hunt (use `/ph`) or where platforms strip them. Every outbound link in `marketing/` comes from `marketing/launch/links.csv` (`channel,asset,url,utm_*`).

### Step 17 — Timeline, founder tasks, document
1. Timeline in `docs/08-gtm.md`: L-21 … L+30 aligned with the phase-09 runbook (T-7 → T+7). Fixed lead times: Google Play closed testing 14+ days (mobile), BetaList review, Chrome Web Store review days, domain/email DNS 1–2 days.
2. `marketing/launch/schedule.md`: every public action with `date/time Europe/Lisbon (UTC)`, platform, asset path, `HT-xx`. Group into **founder batches ≤ 5 min** (e.g. "HT-07 · Publicar os 5 posts da semana 1 (copiar/colar)", "HT-08 · Lançar no Product Hunt às 08:01", "HT-09 · Enviar 10 mensagens de parceria"). Add tasks to `HUMAN_TASKS.md` in the format of `factory/templates/HUMAN_TASKS.md` (pt-PT, 🟡 before launch / 🟢 later).
3. Fill `docs/08-gtm.md` from `factory/templates/gtm.md` (pt-PT); remove guidance comments.

### Step 18 — Self-review (blocking), then close the phase
1. **Lint** limits: `python3 - <<'EOF'` … `EOF` with `limits = {"title":60,"description":155,"tagline":60,"ph_description":500,"subject":45,"preview":90}`; for each `marketing/**/*.md` line matching `^\s*-?\s*(title|description|tagline|ph_description|subject|preview):\s*(.+)$` print any value longer than its limit; fix all.
2. **Claims audit**: every number, comparison and "first/best" has a source or is removed; competitor comparisons are factual and dated (`legal-counsel` check for comparative advertising); no health/financial/legal promises.
3. **pt-PT audit** (Step 4 grep) and a native read-through of every pt-PT file.
4. **Adversarial pass**: spawn `devils-advocate` on positioning, ICP, channel ranking and landing copy ("what would make a skeptical customer bounce? which assumption is least supported?"); answer or fix every objection.
5. **Link/UTM check**: all URLs in `links.csv` valid for the planned domain; placeholders only for the domain (`{{domain}}`) and are listed in `docs/08-gtm.md`.
6. `python3 factory/scripts/factory.py set-phase <slug> gtm done --summary "<ICP> · top channels <a,b,c> · <n> assets"`, `validate <slug>`, `render-status <slug> --write`, commit `<slug>: gtm — <summary>`, push.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Positioning, ICP, messaging | 1 page | full canvas + objections | + 2 alternative framings tested by `devils-advocate` |
| Landing copy | all locales, final | + A/B headline alternates | + 3 hero variants per locale |
| Channels | Bullseye ranked, top 3 | + test designs and budgets | + month-2 plan, partner list of 20 |
| SEO | keywords + 3 briefs | 10 briefs, clusters, programmatic verdict | + 10 articles drafted |
| Social / calendar | 10 posts | 20 posts + 30-day calendar | 30 posts + visuals + clips |
| Email | welcome + conversion | all 4 sequences | + lifecycle edge cases, plain-text versions |
| Launch kits | best single platform | PH, Show HN (if eligible), Reddit, IH, BetaList, directories | + press kit, pitches, partner outreach, ad sets (€100–300) |

## Decision rules & defaults

- **≤ 3 channels tested at once**; at least one free; at most one paid; one winner scaled after day 28.
- **Eligibility gates:** no Show HN without a tryable product; no PH before the product works end-to-end (payments may be test mode with a waitlist CTA); no BetaList before own domain; no paid ads before baseline conversion and tracking exist.
- **Budgets:** default total experiment budget standard €100, deep €300 (never above `FOUNDER.md`); all spend is a founder task.
- **Language:** write each locale natively; a locale with < 15% of expected traffic gets landing + legal only.
- **Claims:** unsourced → cut. **Scarcity/urgency:** only real, dated, Omnibus-safe.
- **When the founder has an audience** (`FOUNDER.md`), lead with it: personal LinkedIn/X posts and a direct email to the existing list beat any cold channel.
- **Conflicts** between speed and compliance → compliance wins; between depth and timebox → ship the lean set first.

## Output specification

| Path | Content |
|---|---|
| `docs/08-gtm.md` | pt-PT: mode, positioning canvas, ICP, messaging, channel ranking + tests + budgets, SEO plan, calendar summary, KPIs/UTM, timeline, founder batches, open placeholders |
| `marketing/copy/{landing.<locale>.md, messaging.md, store.<locale>.md}` | final copy (format Step 4); ASO copy for mobile |
| `marketing/seo/{keywords.csv, clusters.md, programmatic.md, briefs/NN-*.md, articles/*}` | Step 6 |
| `marketing/social/{calendar.md, posts.<locale>.md, image-briefs.md, assets/}` | Steps 7–8 |
| `marketing/email/{welcome,onboarding,conversion,winback}.<locale>.md` | Step 9 |
| `marketing/launch/{producthunt,showhn,reddit,indiehackers,betalist,directories,partners}.md, schedule.md, links.csv` | Steps 11, 13, 16–17 |
| `marketing/press/{press-kit.md, release.<locale>.md, pitches.md, targets.md}` | Step 10 |
| `marketing/ads/{test-plan.md, google.md, meta.md, reddit.md}` | Step 12 |
| `HUMAN_TASKS.md` | approval/posting/payment batches |

## Definition of Done

- [ ] Positioning canvas, ICP, messaging hierarchy and top-3 channels with tests, budgets and stop-losses in `docs/08-gtm.md`.
- [ ] `landing.<locale>.md` final for every locale, all sections + SEO per page; limits lint clean; pt-PT audit clean.
- [ ] Keyword plan, clusters, programmatic verdict and 10 briefs (lean: 3).
- [ ] 30-day calendar, posts per depth, four email sequences, launch kits (PH, Show HN verdict, Reddit, IH, BetaList, directories), press kit, ads plan, partnerships, KPIs + UTM, ASO (mobile).
- [ ] Every public action is scheduled in `schedule.md` and wrapped in a founder task ≤ 5 min; nothing was posted, sent or paid.
- [ ] Claims sourced; adversarial pass answered; committed and pushed; phase marked done.

## Anti-patterns

- Posting, emailing or scheduling publicly (including OpusClip `schedule_publish`) without a recorded founder approval.
- "Everyone" as the ICP; a hero that describes the technology instead of the outcome; features before benefits.
- Machine-translated pt-PT, Brazilianisms, "você"; copy that promises roadmap features.
- Fake testimonials, user counts, logos, countdown timers, struck-through reference prices that were never charged.
- Show HN for a landing page or waitlist; AI-written HN comments; asking for upvotes anywhere; tracking links on Product Hunt.
- Launching on every platform on one day; identical posts across subreddits; alt accounts.
- Starting ads before tracking/baseline; scaling a channel on <10 conversions; buying every directory.
- Programmatic pages with no unique data; 50 shallow articles instead of 10 good ones.
- Unverified fees, limits or rules copied from memory or from sellers' blogs.

## Tools & sources

`WebSearch`/`WebFetch`, Playwright (Chromium `/opt/pw-browsers/chromium`), Figma MCP, OpusClip MCP (Pro+ plan), Claude Docs/Artifacts for a shareable plan. Verified 2026-10-08: Product Hunt prep specs <https://www.producthunt.com/launch/preparing-for-launch>, launch guide <https://www.producthunt.com/launch>, duties <https://www.producthunt.com/launch/launch-day-duties>; Show HN <https://news.ycombinator.com/showhn.html>, HN guidelines <https://news.ycombinator.com/newsguidelines.html>; BetaList FAQ <https://betalist.com/faq>; App Store Connect limits <https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information>, name/subtitle <https://developer.apple.com/help/app-store-connect/reference/app-information/app-information>, screenshots <https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications>; Google Play listing limits <https://support.google.com/googleplay/android-developer/answer/9859152>, assets <https://support.google.com/googleplay/android-developer/answer/9866151>; Reddit self-promotion is per-subreddit (read each sidebar). Framework refs: April Dunford *Obviously Awesome*; Weinberg & Mares *Traction* (Bullseye). Agents: `growth-marketer`, `brand-designer`, `legal-counsel`, `devils-advocate`.

## Hand-off

**Integration (fullstack-engineer):** `marketing/copy/landing.<locale>.md` into the starter's sections, SEO titles/descriptions per page, tracking events from Step 16, waitlist consent text, OG images. **Legal:** claims, consent wording, comparative statements, email compliance. **Launch (09):** `marketing/launch/*`, `schedule.md`, `links.csv`, store copy, domain placeholders, founder batches. **Growth (10):** KPIs, UTM scheme, calendar, briefs backlog, channel verdicts. `product.json`: `phase` advances; `HUMAN_TASKS.md` updated.
