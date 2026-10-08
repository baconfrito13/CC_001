# 07 · Legal & compliance (`legal`)

> **Owner:** legal-counsel · **Inputs:** `docs/00-brief.md`, `docs/02-product.md`, `docs/02-business.md`, `docs/03-brand.md`, `docs/04-architecture.md`, `product.json`, `FOUNDER.md`, app code in `<app_dir>/` when it already exists, `factory/checklists/legal-eu-pt.md` · **Outputs:** `legal/public/<doc>.<locale>.md` (5 docs × every target locale), `legal/{ropa,subprocessors,dpia-screening,ai-act-note,trademark-check}.md` (+ `legal/dpa.md` for B2B), `docs/07-compliance.md`, legal items in `HUMAN_TASKS.md` · **Gate:** the Definition of Done below; feeds G2 ("legal pages live in every locale").

## Objective

Make the product lawfully sellable and operable by a solo founder in Portugal (EU) towards consumers and businesses in the EU and worldwide. Produce public legal pages that are accurate for *this* product (not generic boilerplate), a verifiable compliance record, and a batch of founder-only actions that each take ≤ 5 minutes. You are an autonomous drafting-and-verification agent, not a law firm: never call a draft "legal advice", never claim "GDPR compliant/certified", and escalate to a human lawyer exactly where Step 8 says so. Decide everything reversible with the defaults below; state assumptions instead of asking.

## Before you start

1. Read `factory/LEARNINGS.md`, `FOUNDER.md` (legal entity: sole trader *ENI/trabalhador independente* or *Sociedade Unipessoal Lda*, VAT regime, mailboxes) and `product.json` (`type`, target locales, `stack.payments`, `stack.components`).
2. Read `docs/00`–`docs/04` end to end. Legal runs in parallel with `build` (PIPELINE.md), so `<app_dir>/` may be incomplete: do the data map from documents first (Step 2a) and repeat it against the code at integration (Step 2c).
3. Read `factory/checklists/legal-eu-pt.md` (your test plan) and every file in `factory/templates/legal/` (your starting texts).
4. Law and platform rules change. The *Volatile facts register* (Tools & sources) was verified on **2026-10-08**. Re-verify any row older than 90 days, and every statement marked "verify at execution time", at the official URL (WebSearch/WebFetch). EUR-Lex pages usually come back empty through WebFetch (bot challenge): use the Commission/DRE page, a `files.dre.pt` PDF with `curl` + `pdftotext`, or cite the ELI URL and mark the statement "secondary source". Record URL + access date in `docs/07-compliance.md`.
5. **Placeholders.** Public templates use `{{key}}` rendered by the app from its config. The closed list is: `site.name`, `site.url`, `site.domain`, `company.legalName`, `company.taxId`, `company.vatId`, `company.registration`, `company.address`, `company.country`, `contact.email`, `contact.supportEmail`, `contact.privacyEmail`, `legal.effectiveDate`, `legal.lastUpdated`, `legal.governingLaw`, `legal.jurisdiction`, `legal.ralEntityName`, `legal.ralEntityUrl`, `legal.complaintsBookUrl`, `legal.supervisoryAuthority`, `legal.supervisoryAuthorityUrl`. Never invent another key; never write real NIF/address/phone values into committed files (CLAUDE.md "Confidentiality": they live in env/config).
6. **Locales.** Always write `pt` (genuine European Portuguese: *utilizador, ecrã, ficheiro, descarregar, palavra-passe, telemóvel, livre resolução*; never *usuário, arquivo, baixar, tela, celular, senha*) and `en`. `product.json` locale `pt-PT` ↔ folder/file suffix `pt`. Any additional locale: translate from `en`, keep the Portuguese legal term in brackets, same facts.

## Procedure

### Step 1 — Classify the product (flags)

Answer from the documents, write the result as the header of `docs/07-compliance.md`. Each "yes" switches on checklist items (column "Applies when"):

| Flag | Question |
|---|---|
| `b2c` / `b2b` | Do consumers (natural persons acting outside a trade) buy or sign up? Businesses? Both? |
| `sells` | Is money taken (one-off, subscription, in-app)? Through a Merchant of Record (MoR) or by the founder's own Stripe account? |
| `processor-role` | Do customers upload *their* end-users' personal data (typical B2B SaaS)? Then you are a processor for that data (needs a DPA, `dpa.md`). |
| `ugc` | Can users publish or store content others can see (hosting service / online platform under the DSA)? Marketplace between traders and consumers? |
| `ai` | Any AI feature (chatbot, generation, classification, recommendations, agents)? Which third-party models? |
| `special-data` | Health, biometrics, minors, finance, location, precise profiling, employment data? |
| `kids` | Directed at, or likely used by, under-18s? (Default: no; see Decision rules.) |
| `app` | Mobile app, browser extension, desktop software (store rules, Cyber Resilience Act, account deletion)? |
| `tracking` | Any analytics, ads, pixels, embeds, A/B testing, session replay? |
| `regulated` | Advice/regulated profession, gambling, crypto, medical claims, financial promotion, alcohol/tobacco-like goods? → knockout/escalation (Step 8). |

### Step 2 — Data map (the backbone of every other document)

**2a. From documents.** From `docs/04-architecture.md` (data model, integrations, hosting, auth, payments, email, analytics, monitoring, AI), `docs/02-product.md` (features, personas) and `docs/02-business.md` (pricing, billing) list every processing activity: *who* (data subjects) – *what* (fields) – *why* (purpose) – *legal basis* – *where it lives* (vendor, region) – *who else sees it* – *retention* – *security*. Write it into `legal/ropa.md` (Art. 30 GDPR) and the vendor view into `legal/subprocessors.md`.

**2b. From code (once `<app_dir>/` exists).** Run and reconcile every hit with a RoPA row or remove the SDK:

```bash
cd products/<slug>
rg -n -i --no-heading -g '!node_modules' -g '!*lock*' -g '!.next' \
 '(stripe|paddle|lemonsqueezy|polar\.sh|resend|postmark|sendgrid|mailgun|mailchimp|brevo|convertkit|supabase|firebase|clerk|auth0|next-auth|@auth/|sentry|posthog|plausible|umami|matomo|gtag|googletagmanager|google-analytics|fbq\(|facebook\.net|hotjar|clarity\.ms|intercom|crisp\.chat|zendesk|openai|anthropic|@google/genai|generativelanguage|replicate|elevenlabs|cohere|mistral|groq|@vercel/analytics|speed-insights|recaptcha|hcaptcha|turnstile|mapbox|maps\.googleapis|fonts\.googleapis|fonts\.gstatic|youtube(-nocookie)?\.com|vimeo|twilio|onesignal|expo-notifications|revenuecat|appsflyer|adjust|branch\.io|uploadthing|cloudinary|upstash|r2\.cloudflarestorage)' \
 <app_dir> docs/04-architecture.md
rg -n '^[A-Z][A-Z0-9_]+=' <app_dir>/.env.example          # every env var = a vendor or a secret
rg -n -i 'localStorage|sessionStorage|document\.cookie|set-cookie|cookies\(\)|indexedDB' <app_dir>/src
rg -n -i 'type="(email|tel|password)"|name="(email|phone|address|birth)' <app_dir>/src   # collected fields
```

Also read: DB schema/migrations (columns holding personal data), webhook handlers, middleware/headers, `layout` files (third-party `<script>`), email templates, logging/monitoring config (what leaves the server), file-upload paths.

**2c. Repeat at integration.** After `build`, diff the code scan against `legal/ropa.md`. Any new vendor/field/cookie → update RoPA, subprocessors, privacy policy, cookie policy, app-store forms. This is the most common source of non-compliance: do not skip it.

### Step 3 — Cookies and tracking posture

Rule of the law: storing or reading information on the user's device (cookies, localStorage, SDK identifiers, fingerprinting, pixels) needs prior consent unless strictly necessary for a service the user asked for (Lei 41/2004 art. 5; ePrivacy Art. 5(3); EDPB Guidelines 2/2023). Portugal's CNPD has announced but (as of 2026-10-08) not published cookie guidelines; use the EDPB cookie-banner taskforce report (Jan 2023) and EDPB Guidelines 05/2020 + 03/2022 as the standard.

1. Inventory every cookie/storage key/SDK from Step 2 and classify: **strictly necessary** (session, auth, CSRF, load balancing, security, cart, storing the consent choice itself) · **preferences the user explicitly set** (only if needed to deliver what they requested, otherwise consent) · **analytics** · **marketing/advertising** · **third-party embeds**.
2. **Default posture ("no banner by design")**: only strictly necessary storage + cookieless first-party analytics (no device storage, no cross-site identifiers, no cross-visit fingerprint beyond a daily-rotating hash, no data sale/reuse by the vendor), self-hosted fonts (never load Google Fonts from Google's CDN), no third-party embeds that set cookies before a click-to-load. Basis for analytics: legitimate interests (Art. 6(1)(f)) with a short balancing test in the RoPA. The Cookie Policy is still published (it says what you do and do not use).
3. If `docs/08-gtm.md` or the product needs ads pixels, GA4, session replay, A/B tools with identifiers, social embeds: a consent mechanism is mandatory (Step 7 gives the spec). Prefer dropping the tool at MVP.
4. The French CNIL analytics exemption is a *French* rule and its tool list was discontinued on 2026-01-01 (secondary source); use it only as a design reference, never as a Portuguese legal basis.

### Step 4 — Processors, transfers, retention

1. One row per vendor in `legal/subprocessors.md`: role (processor / independent controller), data, region, transfer tool, DPA acceptance route, date. Independent controllers (e.g. a payment processor acting for its own AML/fraud duties, or an MoR) are *recipients*, not processors: say so in the privacy policy.
2. Prefer EU regions. For US vendors: confirm the vendor is on the Data Privacy Framework list (https://www.dataprivacyframework.gov/list) **and** that its DPA includes Standard Contractual Clauses as fallback. The DPF adequacy decision is valid today but under appeal (CJEU C-703/25 P, *Latombe*) and under political pressure after *Trump v Slaughter* (see register): record a one-paragraph transfer impact note per US vendor in the RoPA; no further action unless the Commission/EDPB change position.
3. Retention: write concrete periods, never "as long as necessary". Defaults (Decision rules). Invoices/accounting records: usually 10 years in Portugal — verify with the *contabilista certificado*.
4. Processor accepts: for each vendor the founder (or the vendor's click-through in the dashboard) accepts the vendor's DPA. List the exact dashboard path in `HUMAN_TASKS.md` (Step 8) — agents never accept contracts for the founder.

### Step 5 — Screens (do all that the flags switch on)

- **DPIA screening** → `legal/dpia-screening.md`: Art. 35(3) cases + CNPD list (Regulamento n.º 1/2018) + the nine WP248 criteria. ≥ 2 criteria or any CNPD-list match ⇒ DPIA required ⇒ lawyer-review escalation.
- **AI Act** → `legal/ai-act-note.md` if `ai`: role (provider of the system / deployer of a third-party model), Art. 5 prohibitions, Annex III high-risk screen, Art. 50 transparency, Art. 4 AI literacy. State in the note what is in force *today* (see register).
- **DSA** if `ugc`: determine hosting service vs online platform vs marketplace; micro/small enterprises are exempt only from the platform-specific Section 3/4 duties — hosting duties (Arts 11, 12, 14, 16, 17, 18) still apply. Add to Terms + legal notice (contact points) + build a notice-and-action form and statement-of-reasons emails (Step 7).
- **Accessibility (EAA)** → conclusion in `docs/07-compliance.md`: a one-person business is a microenterprise (< 10 persons and turnover or balance sheet ≤ €2m, aggregated with partner/linked enterprises per Recommendation 2003/361). Microenterprises *providing services* (websites, apps, e-commerce) are outside Decreto-Lei n.º 82/2022 (art. 2(5)(b)). Still require WCAG 2.2 AA from QA (B2B buyers, growth, public-sector customers). Re-assess when the entity reaches 10 persons or crosses the €2m limit.
- **Trademark** → `legal/trademark-check.md`: run the sources listed in the template for the chosen name (brand phase already did a sanity check; you do the formal one) and apply the decision rule (green/amber/red). Red ⇒ block and return to `brand` with the conflicting marks.
- **Other regimes to rule in/out explicitly** (one line each in the compliance doc): Cyber Resilience Act reporting (software products distributed to users; applies since 2026-09-11), Data Act switching clauses (B2B SaaS/cloud), NIS2 (micro/small normally out of scope), P2B Regulation 2019/1150 (marketplaces), COPPA (US children under 13), sector rules for `regulated`.

### Step 6 — Draft the public pages

1. For each doc in `privacy, terms, cookies, withdrawal, legal-notice` × locale: copy `factory/templates/legal/<doc>.<locale>.md` to `products/<slug>/legal/public/<doc>.<locale>.md`. `withdrawal` is mandatory when `b2c` and `sells` (or any free consumer service with personal data: DL 24/2014 art. 2(2) covers "data as counter-performance"); omit it only for pure-B2B products and record why.
2. Resolve every `<!-- FILL: … -->` block: replace the *whole* comment with final text (or delete it if not applicable). The example text inside a block is a starting point, not a default to keep. Source every fact from the data map; if a fact is missing, fix the data map, not the page.
3. Delete the first-line `TEMPLATE-NOTICE` comment in published copies. Keep `{{…}}` placeholders exactly as listed.
4. Write `pt` first, then `en` from the same facts (not machine-translated blindly): same sections, same numbers (periods, prices, vendors), no divergence. Plain language, short sentences, no legalese walls.
5. Consistency pass across all five documents: company name, contact emails, vendor list (privacy ↔ cookies ↔ RoPA ↔ app-store forms), retention periods, refund promises (terms ↔ withdrawal ↔ checkout copy ↔ `docs/08-gtm.md` claims), AI statements, minimum age.
6. Run the publish check (all must print nothing):

```bash
cd products/<slug>/legal/public
grep -n 'FILL:\|TEMPLATE-NOTICE\|<!--' *.md
grep -on '{{[^}]*}}' *.md | sed 's/.*{{\(.*\)}}.*/\1/' | sort -u | grep -vxE 'site\.(name|url|domain)|company\.(legalName|taxId|vatId|registration|address|country)|contact\.(email|supportEmail|privacyEmail)|legal\.(effectiveDate|lastUpdated|governingLaw|jurisdiction|ralEntityName|ralEntityUrl|complaintsBookUrl|supervisoryAuthority|supervisoryAuthorityUrl)'
grep -n -i 'ec.europa.eu/consumers/odr\|usuário\|arquivo\|celular\|baixar' *.md
ls   # expect <doc>.pt.md and <doc>.en.md for every doc
```

### Step 7 — Integration requirements (hand to the fullstack-engineer; verify at QA)

Write these into `docs/07-compliance.md` §"Requisitos para a integração" so the integration step cannot miss them:

- **Footer on every page:** Privacy · Terms · Cookies (+ "Cookie settings" if a banner exists) · Withdrawal & refunds (if `b2c`) · Legal notice · the official **Livro de Reclamações** button (image/icon from livroreclamacoes.pt, linking to `{{legal.complaintsBookUrl}}`), visible and prominent (DL 156/2005 art. 5.º-B(2)).
- **Consumer checkout (DL 24/2014 arts 4–6, 15, 17):** price with VAT, currency, billing period, trial → renewal and how to cancel, shown immediately before payment · button text exactly "Encomendar com obrigação de pagar" / "Order with obligation to pay" (or an equally unambiguous wording) · for immediate access, an *unticked, required* checkbox: "I expressly ask that the service/digital content starts now, during the 14-day withdrawal period, and I acknowledge that I lose my right of withdrawal [when the contract is fully performed (services) / once performance has begun (digital content)]" · store checkbox text version, timestamp, user/order id (burden of proof is on the trader, art. 4) · confirmation e-mail on a durable medium immediately, containing the contract summary, withdrawal information + model form, the confirmed consent/acknowledgement, invoice link, how to cancel.
- **Withdrawal function:** Article 11a Directive 2011/83/EU (Directive (EU) 2023/2673) applies since 2026-06-19 to distance contracts concluded through an online interface; Portugal's transposition was not confirmed on 2026-10-08. Default: build it. Persistent footer link "Resolver o contrato aqui" / "Withdraw from contract here" → no login → form (name, contract/order id, e-mail) → second step "Confirmar resolução" / "Confirm withdrawal" → acknowledgement e-mail (date/time, content) without delay. Available for the whole withdrawal period.
- **Consent banner (only if Step 3 requires it):** Accept all and Reject all on the first layer, same size/colour weight; categories off by default; nothing non-essential loads or is written before consent (including via tag managers); granular settings; consent log (timestamp, version, choices); withdrawal as easy as giving (footer "Cookie settings"); re-ask after ≤ 12 months or when purposes change; no cookie wall; keyboard/screen-reader accessible.
- **Account:** in-app account deletion (also an Apple/Google rule) and data export; e-mail unsubscribe link + preference centre; minimum-age statement at sign-up.
- **AI features:** visible "AI" label for chatbots; label + machine-readable marking for synthetic image/audio/video (and text where the Commission guidance requires); no dark patterns that hide that content is AI-generated.
- **UGC:** "Report content" on every item (notice with reason, exact location, name/e-mail of notifier, good-faith statement), receipt acknowledgement, decision e-mail with statement of reasons (Art. 17 DSA), internal appeal route.
- **Prices:** consumer prices VAT-inclusive; any strike-through/"-30 %" shows the lowest price of the previous 30 days (DL 138/90; DL 70/2007).
- **Mobile/stores:** privacy-policy URL, App Privacy / Data safety forms generated from the RoPA, DSA trader status, account deletion paths (Decision rules).

### Step 8 — What requires the founder (batch into `HUMAN_TASKS.md`, never ask one by one)

Prepare each task with exact link, values to paste, ≤ 5 minutes, cost, what it unblocks (format: `factory/templates/HUMAN_TASKS.md`).

| Task | Why only the founder | Colour |
|---|---|---|
| Legal entity & tax identity: *início de atividade* as ENI/trabalhador independente (Portal das Finanças) or Unipessoal Lda; VAT regime; certified invoicing or Portal invoicing | Identity, money, tax — confirm choices with a *contabilista certificado* | 🔴 before charging money |
| Fill public company data in env/config: legal name, NIF, VAT ID, address (a public address is legally required — use the registered business address), registration number, mailboxes `privacy@`, `support@`, `contact@` | Personal/identity data stays out of the repo | 🔴 |
| Register the electronic **Livro de Reclamações** at https://www.livroreclamacoes.pt (Chave Móvel/NIF login; choose regulator ASAE and the CAE) | Account in the founder's name; legal obligation for providers established in Portugal | 🔴 before go-live to PT consumers |
| Accept each processor's DPA (list vendor → dashboard path → date) and any MoR terms | Accepting contracts | 🔴/🟡 |
| RAL: decide whether to adhere to an entity (e.g. CNIACC, https://www.cniacc.pt). Default = no adhesion | Contract + possible cost | 🟢 |
| VAT OSS registration (Portal das Finanças) once EU-wide B2C digital sales near €10,000/year; MoR account + KYC | Tax identity, money | 🟡 |
| App stores: developer accounts, DSA trader status (public address/phone/e-mail), App Privacy / Data safety forms, account-deletion URL | Accounts, public identity | 🟡 |
| Trademark filing (EUIPO and/or INPI) if the name is strategic | Money, public act | 🟢 |
| **Lawyer review** when any trigger fires: special-category data at scale, biometrics, health/finance advice, children, automated decisions with legal effect, high-risk AI, marketplace/UGC at scale, regulated activity, first enterprise contract with custom DPA/liability terms, revenue > ~€100k/year | Professional liability | 🟡/🟢 |

### Step 9 — Compile `docs/07-compliance.md`

Use `factory/templates/compliance.md` (pt-PT). One row per checklist item with status **Cumpre / Parcial / Em falta / N/A**, evidence path or URL, and note. Every "Parcial/Em falta" becomes a numbered open item mapped to a founder task (`HT-xx`) or to an engineering fix for the fix loop. Record assumptions, the volatile-facts you re-verified (URL + date) and review triggers.

### Step 10 — Adversarial self-review

Re-read as a Portuguese consumer-protection inspector (ASAE/DGC), then as a data-protection officer: (1) Could a consumer exercise withdrawal and complaints within two clicks from the footer? (2) Does every vendor in the code appear in the privacy policy, and nothing else? (3) Does any page promise something the product or GTM copy contradicts? (4) Is any statement stronger than the evidence? Fix, then re-run the Step 6 check. `deep`: spawn `devils-advocate` on the five pages and the compliance doc.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Data map | From docs + one code scan | + RoPA complete, subprocessors with DPA route, retention table | + legitimate-interest balancing notes, transfer impact notes, DSR drill (simulated access + erasure) |
| Public pages | 5 docs × 2 locales from templates, all FILL resolved | + competitor policy gap review (read 3, never copy) | + lawyer-review packet (questions, risk list) |
| Screens | Cookie posture, DPIA screening (1 page), trademark exact + similar search | + AI Act note, DSA scan, EAA conclusion, CRA/Data Act/NIS2 ruling in/out | + breach tabletop, `dpa.md` and TIA/LIA documents, 2nd-agent adversarial review |
| Compliance doc | Status table + open items | + volatile facts re-verified with URLs | + review calendar, evidence screenshots |

## Decision rules & defaults

| Topic | Default (reversible; state it as an assumption) |
|---|---|
| Controller / DPO | Founder's entity is controller. No DPO (Art. 37 not met); `contact.privacyEmail` is the contact point. Re-assess for large-scale monitoring or special categories. |
| Lawful bases | Account, service, billing → contract Art. 6(1)(b); invoices/tax → legal obligation (c); security logs, support, product analytics (cookieless) → legitimate interests (f) with a documented balancing test; newsletters/non-essential cookies/AI training on user data → consent (a); existing customers' similar products → soft opt-in (Lei 41/2004 art. 13-A) with opt-out in every message. Never bundle consent into Terms. |
| Retention | Account data: while active + 30 days after deletion; invoices 10 years (verify); support tickets 24 months after closing; server/security logs 90 days; backups ≤ 35 days; analytics (cookieless) 14 months; marketing consent proof until withdrawal + 3 years; DSR records 3 years. |
| DSR handling | Respond within 1 month (Art. 12(3), extendable by 2 months for complex requests, tell the user within the first month); free; verify identity proportionately; log in RoPA appendix. Self-service export/delete preferred. |
| Breach | Internal register for all; CNPD notification within 72 h of awareness unless unlikely to risk rights (form: https://www.cnpd.pt/organizacoes/outras-obrigacoes/violacao-de-dados-ou-data-breach/); notify users without undue delay if high risk (Art. 34). Cyber Resilience Act 24 h/72 h/14 d reporting for software products via ENISA's single reporting platform. |
| Children | GDPR Art. 8 age for consent in Portugal is **13** (Lei 58/2019 art. 16 — primary text verified). Because minors under 18 have limited capacity to contract, Terms require age ≥ 18 for paid products and ≥ 16 for free ones. Not directed at children. Anything aimed at < 16 ⇒ lawyer review, COPPA assessment, age assurance, Families/Kids store policies. |
| Governing law / venue | `legal.governingLaw` = law of Portugal; `legal.jurisdiction` = Portuguese courts (comarca of the founder's seat) for businesses; consumers keep mandatory protections and home-court rights (Rome I Art. 6, Brussels I bis Art. 18). |
| Consumer disputes | Livro de Reclamações link always. RAL: inform as in Lei 144/2015 art. 18 (as amended by DL 102/2017) — mandatory only if bound; default not bound + informational mention of the competent entity (`legal.ralEntityName` = CNIACC unless a regional centre fits). **Never mention the EU ODR platform** (closed). |
| Withdrawal | 14 days from the contract (services/digital content). Continuous SaaS: consumer may withdraw; pays proportional amount if they asked to start immediately. One-off digital content (download): right lost once performance starts with prior express consent + acknowledgement + confirmation. Voluntary extra guarantee only if GTM promises it; then it is written once, in `withdrawal`, and copied everywhere. |
| MoR vs own seller | Selling B2C digital services across the EU as a sole founder ⇒ prefer a Merchant of Record (Paddle, Lemon Squeezy, Polar, Stripe-managed MoR — verify availability, fees and terms) to avoid OSS/VAT registrations and invoicing; Terms/withdrawal then name the MoR as seller of record and keep the founder as service provider. Own Stripe account ⇒ OSS (> €10,000 EU-wide B2C), invoices with correct VAT, VIES checks for B2B reverse charge. |
| VAT quick map (confirm with a contabilista) | B2C digital service to EU consumer: VAT of the customer's state; below €10,000/year EU-wide cross-border B2C (micro-supplier established in one state) Portuguese VAT may apply, above it OSS Union scheme. B2B EU customer with valid VAT ID: reverse charge, no VAT on invoice, mention it, recapitulative statement. Non-EU customer: outside PT VAT, keep proof. Art. 53 CIVA exemption: threshold €15,000 in 2026 (DL 35/2025, Ofício-Circulado 25062/2025). Invoices from certified software or Portal das Finanças, with ATCUD; report to AT. |
| Analytics / ads | Cookieless first-party analytics only; no ad pixels or session replay at MVP. |
| AI | Provider of the AI system (you place it on the market) + deployer of a third-party model. Chatbot ⇒ disclose AI (Art. 50(1)); synthetic image/audio/video/text ⇒ marking + labelling per Art. 50(2),(4) and the Commission guidance; vendor API contracts with no training on customer data; list AI vendors as processors. |
| UGC | Hosting duties always; platform duties only if outside the micro/small exemption; legal-notice contact points; notice-and-action, statement of reasons. |
| Third-party code/assets | Open-source licences checked (no AGPL surprise); fonts/images licensed; keep `THIRD_PARTY.md` if > 0 attribution duties. |
| Regulated / high-risk idea | Do not draft around it: set `needs-founder`, explain in one paragraph, propose compliant variants (CLAUDE.md prime directive 2; PIPELINE G1 knockout). |

## Output specification

All paths relative to `products/<slug>/`.

| File | Content rules |
|---|---|
| `legal/public/{privacy,terms,cookies,withdrawal,legal-notice}.{pt,en}.md` | From templates; no `FILL`, no `TEMPLATE-NOTICE`, only allowed `{{keys}}`; ≤ 6th-grade sentences; headings stable (anchors may be linked from the app); integrated later as `<app_dir>/src/content/legal/{pt,en}/<doc>.md` |
| `legal/ropa.md` | Art. 30(1) controller record (+ 30(2) processor record if `processor-role`), every activity traceable to docs/code; retention and transfer columns complete |
| `legal/subprocessors.md` | Every vendor in code/architecture; DPA route and date; transfer tool; feeds privacy policy and DPA Annex III |
| `legal/dpia-screening.md` | Decision + reasoning; DPIA outline only if required |
| `legal/ai-act-note.md` | Only if `ai`; role, classification, Art. 50 matrix, dates in force today |
| `legal/trademark-check.md` | Searches with dates/queries, results table, decision rule outcome |
| `legal/dpa.md` | Only if `processor-role`; English; Annexes I–III filled; publishable as page/PDF |
| `docs/07-compliance.md` | `factory/templates/compliance.md` in pt-PT, one row per checklist item, open items → HT-xx |
| `HUMAN_TASKS.md` additions | Step 8 rows, correct colour, ≤ 5 minutes each |

## Definition of Done

- [ ] Flags (Step 1) recorded; data map reconciled with architecture **and** code (or flagged "re-run at integration" with the exact command).
- [ ] Five public documents × every target locale in `legal/public/`; publish check (Step 6) prints nothing; `pt` is European Portuguese.
- [ ] Withdrawal/refund page present for any consumer sale, with the digital-content/service waiver wording and the Annex B model form; checkout/withdrawal-function/footer requirements written for integration.
- [ ] Livro de Reclamações, RAL position and "no ODR" decision recorded; legal notice complete per DL 7/2004 art. 10.
- [ ] Cookie posture decided and consistent with the code scan; consent-banner spec issued if needed.
- [ ] Every vendor has a `subprocessors.md` row with a DPA route; US transfers have a tool and a note.
- [ ] DPIA screening done; AI Act note (if `ai`); DSA scan (if `ugc`); EAA conclusion; trademark decision not red.
- [ ] `docs/07-compliance.md` has every checklist item with a status and evidence; no unexplained "Em falta"; open items mapped to `HT-xx` or fix-loop tickets.
- [ ] `HUMAN_TASKS.md` updated; lawyer-review triggers evaluated and stated.
- [ ] Volatile facts older than 90 days re-verified with URL + date.

## Anti-patterns

- Copying a competitor's or a generic generator's policy; pasting US-style CCPA/"do not sell" clutter that does not apply.
- Claiming "GDPR compliant", "certified", "100 % secure", "we never share data" while using processors.
- Leaving any `FILL`/`TEMPLATE-NOTICE`/unknown `{{key}}`; real NIF/address/phone in committed files.
- A cookie banner that hides "Reject", pre-ticks boxes, loads trackers first, or a policy listing cookies that are not used (or omitting ones that are).
- Consent bundled into Terms; "by using this site you consent"; consent as condition for the service.
- Mentioning the EU ODR platform; Brazilian Portuguese; a different retention period in policy vs RoPA.
- Treating the digital-content waiver as automatic: without the unticked checkbox + acknowledgement + confirmation e-mail the consumer keeps 14 days (and may owe nothing).
- Saying the EAA "applies" or "does not apply" without the microenterprise reasoning; claiming WCAG conformance that QA did not measure.
- Accepting a vendor DPA/MoR terms on the founder's behalf; asking the founder to read legal text instead of giving a ≤ 5-minute task.
- Silent assumptions: every default you rely on is written in `docs/07-compliance.md`.

## Tools & sources

**Tools:** WebSearch/WebFetch (official sources first); `curl` + `pdftotext` for DRE PDFs; `rg` for the code scan; `python3 factory/scripts/factory.py` for state; `devils-advocate` in `deep`.

**Official sources:** DRE https://diariodarepublica.pt (SPA; PDFs under https://files.dre.pt) · EUR-Lex https://eur-lex.europa.eu · CNPD https://www.cnpd.pt · DGC / Portal do Consumidor https://www.consumidor.gov.pt · Livro de Reclamações https://www.livroreclamacoes.pt · RAL list https://www.consumidor.gov.pt/pagina-inicial/resolucao-de-litigios/ · CNIACC https://www.cniacc.pt · Portal das Finanças e-commerce/OSS https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Comercio_eletronico/ · Commission AI Act https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai · EDPB https://www.edpb.europa.eu · DPF list https://www.dataprivacyframework.gov/list · Adequacy decisions https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en · EUIPO eSearch https://euipo.europa.eu/eSearch/ and TMview https://www.tmdn.org/tmview/ · INPI https://inpi.justica.gov.pt · WIPO Global Brand Database https://branddb.wipo.int · ENISA CRA reporting https://www.enisa.europa.eu/cra-srp/ · ANACOM (Digital Services Coordinator) https://www.anacom.pt · ASAE https://www.asae.gov.pt.

**Volatile facts register (verified 2026-10-08; P = primary text/page read, S = secondary source, U = could not verify)**

| Fact | Status | Src | Source |
|---|---|---|---|
| EU ODR platform discontinued **20 Jul 2025**; Reg (EU) No 524/2013 repealed by **Reg (EU) 2024/3228** (OJ 30 Dec 2024; new complaints closed 20 Mar 2025). Remove all ODR links. | Done | P | https://consumer-redress.ec.europa.eu/site-relocation_en · https://eur-lex.europa.eu/eli/reg/2024/3228/oj |
| AI Act: prohibitions + AI literacy since 2 Feb 2025; GPAI + governance 2 Aug 2025; **applicable generally 2 Aug 2026 incl. Art. 50 transparency**; Digital Omnibus = **Reg (EU) 2026/1744** (OJ 24 Jul 2026, in force 27 Jul 2026): Annex III high-risk → **2 Dec 2027**, Annex I → **2 Aug 2028**, new prohibition on non-consensual intimate/CSAM generation from **2 Dec 2026**, Art. 50(2) marking grace to **2 Dec 2026** only for systems placed on the market before 2 Aug 2026; Art. 4 AI literacy softened; Art. 50 Guidelines (20 Jul 2026) and Code of Practice on AI-generated content (final 10 Jun 2026) exist | In force | P (dates) / S (details) | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai · https://eur-lex.europa.eu/eli/reg/2026/1744/oj (EUR-Lex not fetchable) |
| EAA: Directive (EU) 2019/882 → **Decreto-Lei n.º 82/2022** (DR 1.ª série n.º 234, 6 Dec 2022; in force next day), effects from **28 Jun 2025**; microenterprises providing services excluded (art. 2(5)(b)); e-commerce services art. 2(3)(g); ASAE enforces; Portaria n.º 220/2023 | In force | P | https://files.dre.pt/1s/2022/12/23400/0010900132.pdf |
| Livro de Reclamações: **electronic book mandatory for all suppliers/providers, also those acting only "através de meios digitais"** (DL 156/2005 art. 2(2)); website must show the platform access "em local visível e de forma destacada" (art. 5.º-B(2)); no website ⇒ complaints e-mail; reply within 15 working days (5.º-B(4)); fines art. 9: €250–3,500 (natural) / €1,500–15,000 (legal persons). DL 9/2020 allows regularisation within 90 days of notice (S) | In force | P (2017 republication) / S (later changes) | https://www.aiccopn.pt/wp-content/uploads/2021/10/LR-republicacao.pdf · https://www.livroreclamacoes.pt |
| GDPR Art. 8 age in PT = **13** (Lei 58/2019 art. 16) | In force | P | https://comarcas.tribunais.org.pt/comarcas/pdf2/evora/pdf/Lei_n_58_2019_08_agosto.pdf (DR 1.ª série n.º 151, 8 Aug 2019) |
| Distance contracts: DL 24/2014 as amended by **DL 109-G/2021** (in force 28 May 2022): withdrawal waiver wording (arts 15, 17), annex model form, 30-day price rule, marketplace info | In force | P | https://diariodarepublica.pt/dr/detalhe/decreto-lei/109-g-2021-175744207 (PDF read via a mirror) |
| Digital content/services conformity: **DL 84/2021** arts 26–39 (2-year / contract-period liability, 14-day refund, modification rules, data retrieval) | In force | P | https://data.dre.pt/eli/dec-lei/84/2021/10/18/p/dre |
| E-commerce: DL 7/2004 art. 10 (identification), arts 21–22, 27–29; amended by **Lei n.º 12-A/2026** (arts 11, 37; new 13.º-A) | In force | P | https://files.diariodarepublica.pt/1s/2026/04/07301/0000200025.pdf |
| DSA in Portugal: **Lei n.º 12-A/2026, de 15 abril**; ANACOM = competent authority and Digital Services Coordinator; repealed DL 20-B/2024 | In force | P | same PDF |
| Withdrawal function (Art. 11a Dir. 2011/83/EU via Dir. (EU) 2023/2673) applies from **19 Jun 2026**; Portuguese transposing act | Not found | S/U | https://eur-lex.europa.eu/eli/dir/2023/2673/oj — verify at execution time in DRE |
| RAL duty only if bound: Lei 144/2015 art. 18 amended by DL 102/2017 | In force | S | https://apcmc.pt/legislacao/resolucao-alternativa-litigios-ral-dispensa-informacao-aos-consumidores-2/ |
| Cookies: Lei 41/2004 art. 5 (consent; exemptions art. 5(2)) as amended by Lei 46/2012 and Lei 16/2022; CNPD cookie guidelines **not published** (announced 2021); direct marketing: art. 13-A + CNPD Diretriz 1/2022 | In force | S | https://diariodarepublica.pt/dr/detalhe/lei/41-2004-480710 |
| ePrivacy/GDPR "Digital Omnibus" cookie rules (Arts 88a/88b): **proposal only**; Council dropped them (Jun 2026), Parliament undecided, no trilogue | Pending | S | verify at https://www.europarl.europa.eu/legislative-train |
| EU–US DPF valid; General Court upheld it (3 Sep 2025); appeal **C-703/25 P** pending; EDPB letter 31 Jul 2026 after *Trump v Slaughter* (29 Jun 2026) | Valid, at risk | S | https://www.dataprivacyframework.gov/list · https://www.edpb.europa.eu |
| Omnibus price rule: lowest price of previous **30 consecutive days** (DL 138/90 arts 1(2), 2(f); DL 70/2007 as amended by DL 109-G/2021) | In force | P | DL 109-G/2021 text |
| Cyber Resilience Act reporting duties (24 h / 72 h / 14 d) apply since **11 Sep 2026**; ENISA platform live; main CRA duties 11 Dec 2027 | In force | S | https://www.enisa.europa.eu/cra-srp/ |
| Digital Fairness Act proposal (subscriptions, dark patterns) expected Q4 2026 | Pending | S | https://commission.europa.eu/law/law-topic/consumer-protection-law_en |
| VAT: B2C digital services EU-wide €10,000 threshold + OSS; art. 53 CIVA threshold €15,000 (2026) | In force | S | Portal das Finanças OSS pages; Ofício-Circulado 25062/2025 |
| COPPA amended rule: effective 23 Jun 2025, compliance 22 Apr 2026; Apple trader status/account deletion; Google Play Data safety + web deletion URL | In force | S | FTC; App Store Connect Help; Play Console Help |

## Hand-off

- **→ fullstack-engineer (integration):** copy `legal/public/<doc>.<locale>.md` to `<app_dir>/src/content/legal/<pt|en>/<doc>.md`; wire footer links, Livro de Reclamações button, cookie settings, checkout checkbox/button/confirmation e-mail, withdrawal function, report-content flow, AI labels (Step 7); supply `legal.*` values through config/env; confirm rendered pages show no raw `{{…}}`.
- **→ qa-engineer / security-auditor:** test every Step 7 item (links in both locales, banner behaviour with network log showing no trackers before consent, deletion/export, e-mail templates, WCAG 2.2 AA); security audit feeds the Art. 32 statements — if the audit changes controls, update the privacy policy.
- **→ growth-marketer:** claims constraints — no "GDPR certified", no fake scarcity/countdowns, no fake reviews or unverifiable testimonials, discounts need the 30-day reference price, AI claims match `ai-act-note.md`, e-mail marketing only with consent/soft opt-in and unsubscribe, no tracking pixels without the consent mechanism.
- **→ devops-engineer (launch):** founder tasks from Step 8 in the launch runbook; DNS for `privacy@/support@` mailboxes (SPF/DKIM/DMARC); legal pages reachable at production URLs before payments go live; breach/DSR runbook link.
- **→ orchestrator:** `factory.py set-phase <slug> legal done --summary "…"`, then validate; list the lawyer-review triggers that fired in the PR status block.
- **Re-run triggers:** new vendor/SDK/field, new market or currency, new AI feature, price/refund change, pivot to B2B or consumers, first user under 18 reported, 90 days since the register was verified.
