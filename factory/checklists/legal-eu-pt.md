# Legal & compliance checklist — EU / Portugal

Test plan for phase `legal` (`factory/playbooks/07-legal.md`). Mark each item **Cumpre / Parcial / Em falta / N/A** in `docs/07-compliance.md` with evidence. Facts verified **2026-10-08**; anything marked *verify* must be re-checked at the official URL before relying on it. Not legal advice: have a lawyer review high-risk processing or significant revenue. Abbreviations: DL = Decreto-Lei · DR = Diário da República · RGPD = GDPR · LRE = Livro de Reclamações Eletrónico.

## A. Provider identity and consumer information

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| ID-01 | Provider identified permanently online | DL 7/2004 art. 10(1)–(2) | Always | `legal-notice` page: name/denominação social, geographic address, e-mail, public registrations and numbers, NIF; authorising body if the activity is regulated; footer link on every page | `legal-notice.{pt,en}.md` live; footer screenshot |
| ID-02 | Electronic complaints book on the website | DL 156/2005 arts 1(2), 2(2), 5.º-B, 9 (as republished by DL 74/2017); DL 9/2020 (regularisation period — *verify*) | Provider established in Portugal, **including online-only** (art. 2(2): "através de meios digitais") | Register at livroreclamacoes.pt (HT task); show the platform access "em local visível e de forma destacada" (footer of every page, legal notice, terms); keep a mailbox that receives complaints; reply ≤ 15 working days (art. 5.º-B(4)); keep records 3 years; paper book only if a physical establishment open to the public | Registration confirmation; screenshot of footer button → `{{legal.complaintsBookUrl}}` |
| ID-03 | Alternative dispute resolution (RAL) information | Lei 144/2015 art. 18 (amended by DL 102/2017, secondary source); DL 24/2014 art. 4 (extrajudicial redress "quando for o caso") | B2C | Duty is mandatory only if bound to an RAL entity (adhesion or mandatory arbitration). Default: state not bound and name the competent entity (e.g. CNIACC); if bound: entity + website in site and contracts | Text in `terms`/`withdrawal`; decision logged |
| ID-04 | No link to the EU ODR platform | Reg (EU) 2024/3228 repealing Reg (EU) 524/2013; platform closed **20 Jul 2025** | B2C online | Remove ODR link/text from site, e-mails, checkout, store listings | `rg 'consumers/odr'` empty |
| ID-05 | Commercial communications identifiable | DL 7/2004 art. 21 | Any promotional message | Mark as advertising, identify advertiser, conditions of offers clear | E-mail template review |
| ID-06 | Public pages in each target locale | PIPELINE G2; DL 24/2014 art. 5 (info "clara e compreensível") | Always | `pt` (pt-PT) + `en` complete, same facts | `legal/public/` listing |

## B. Data protection (GDPR, Lei 58/2019, supervisory authority CNPD)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| DP-01 | Records of processing | RGPD Art. 30 (exemption for < 250 staff practically never applies) | Always | `legal/ropa.md` reconciled with architecture and code scan | RoPA + scan output |
| DP-02 | Lawful basis per purpose | RGPD Art. 5(1)(a), 6, 7 | Always | Basis per row in RoPA; no bundled consent; legitimate-interest balancing note where used | RoPA column |
| DP-03 | Privacy notice | RGPD Arts 12–14 | Always | `privacy` page: controller, purposes + bases, recipients, transfers, retention, rights, complaint to CNPD, automated decisions | `privacy.{pt,en}.md` |
| DP-04 | Data-subject rights process | RGPD Arts 12, 15–22; Art. 7(3) | Always | Mailbox `contact.privacyEmail`; answer ≤ 1 month (+2 if complex, informed within month 1); self-service export/delete; log | Runbook; DSR drill (deep) |
| DP-05 | Processors under contract | RGPD Art. 28(3) | Any vendor touching personal data | Accept each vendor DPA (HT); `subprocessors.md` | DPA acceptance dates |
| DP-06 | Processor role towards customers | RGPD Art. 28, 30(2) | `processor-role` (B2B SaaS) | `legal/dpa.md` offered/incorporated in Terms; sub-processor list; 48 h breach notice | `dpa.md`, Terms clause |
| DP-07 | International transfers | RGPD Arts 44–49; EU–US DPF adequacy (valid; appeal C-703/25 P pending — *verify*) | Vendor outside EEA | Prefer EU regions; DPF-listed vendor **and** SCCs in DPA; note per US vendor | `subprocessors.md` transfer column |
| DP-08 | Retention limits | RGPD Art. 5(1)(e); tax records usually 10 years (CIVA art. 52 / CIRC art. 130 — *verify with contabilista*) | Always | Concrete periods in RoPA and policy; deletion jobs | Retention table; job/cron |
| DP-09 | Security of processing | RGPD Art. 32, 25 | Always | TLS, encryption at rest, least privilege, MFA for admin, backups, secrets in env, logging; mirror QA/security report | `docs/06-qa-report.md` |
| DP-10 | Breach handling | RGPD Arts 33–34 (72 h to CNPD; users if high risk; internal register) | Always | Runbook + register template; CNPD form page `cnpd.pt/organizacoes/outras-obrigacoes/violacao-de-dados-ou-data-breach/` | Runbook link |
| DP-11 | DPIA screening | RGPD Art. 35; CNPD Regulamento n.º 1/2018; WP248 criteria | Always (screen); DPIA if triggered | `legal/dpia-screening.md`; ≥ 2 criteria or CNPD-list match ⇒ DPIA + lawyer | Screening file |
| DP-12 | DPO need | RGPD Art. 37 | Always (decide) | Document "not required"; re-assess for large-scale monitoring/special categories | Compliance doc |
| DP-13 | Children's data | RGPD Art. 8; **Lei 58/2019 art. 16 (age 13; below 13 parental authorisation)**; Código Civil capacity | `kids` or any open sign-up | Terms age gate (≥ 18 paid, ≥ 16 free); no targeting of minors; escalate if aimed at < 16 | Sign-up copy; Terms |
| DP-14 | Direct marketing consent | Lei 41/2004 art. 13-A; CNPD Diretriz 1/2022; RGPD Art. 7 | Newsletters, promo e-mails/SMS | Opt-in for natural persons; soft opt-in for own similar products with opt-out in every message; consent proof stored | Consent log; e-mail footer |
| DP-15 | Automated decisions / profiling | RGPD Art. 22, 13(2)(f) | `ai` or scoring | Declare in privacy policy; human review route; no solely automated decisions with legal effect | Privacy text |
| DP-16 | Data protection by design/default | RGPD Art. 25 | Always | Minimise fields; no analytics identifiers by default; deletion built-in | Architecture check |
| DP-17 | EU representative | RGPD Art. 27 | Not applicable (established in PT) | Record N/A | — |

## C. ePrivacy and cookies

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| CK-01 | Inventory of storage/SDKs | Lei 41/2004 art. 5; ePrivacy Art. 5(3); EDPB Guidelines 2/2023 | Always | Table from code scan: cookies, localStorage, SDK identifiers, pixels | Scan + table in `cookies` page |
| CK-02 | Prior consent for non-essential storage | Lei 41/2004 art. 5 (consent per RGPD Arts 4(11), 7); EDPB Guidelines 05/2020 | Any analytics with identifiers, ads, pixels, social embeds | Banner: Accept all / Reject all equal prominence on first layer; no pre-ticked boxes; granular; nothing loads before consent; log; withdraw as easy as give; no cookie wall; re-ask ≤ 12 months | Network-log test; consent log |
| CK-03 | Consent-free path documented | Lei 41/2004 art. 5 exemptions (communication transmission; strictly necessary for a service expressly requested) — paragraph number differs between sources, *verify* | Cookieless/essential-only design | Only session/CSRF/consent-choice storage; cookieless analytics (6(1)(f)); self-hosted fonts | RoPA note; test |
| CK-04 | Cookie policy page | RGPD Art. 13; Lei 41/2004 art. 5 | Always | `cookies` page matches reality (list or "none") | `cookies.{pt,en}.md` |
| CK-05 | Third-party embeds | Same as CK-02 | YouTube/maps/social/fonts CDN | Click-to-load, privacy-enhanced mode or self-host | Code scan |
| CK-06 | Watch pending rule changes | Digital Omnibus Arts 88a/88b (proposal only; Council removed cookie articles, Jun 2026 — *verify*) | Review each re-run | Do not rely on proposals; baseline stays Lei 41/2004 | Register entry |

## D. Consumer law (distance contracts, digital content, pricing)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| CL-01 | Pre-contract information | DL 24/2014 arts 4–5 (as amended by DL 109-G/2021) | `b2c` + `sells` or free service against data | Essential features, total price incl. taxes, billing period, duration/renewal/termination, withdrawal info + model form, digital-content functionality/interoperability, complaints and RAL where applicable — shown clearly right before order | Checkout screenshots |
| CL-02 | "Order with obligation to pay" button | DL 24/2014 art. 5 (button text «encomenda com obrigação de pagar» or unambiguous equivalent; otherwise consumer is not bound) | `b2c` + `sells` | Exact label at final step | Screenshot |
| CL-03 | Contract confirmation on a durable medium | DL 24/2014 art. 6 (≤ 5 days and at the latest before the service starts) | `b2c` | Immediate confirmation e-mail with info above | E-mail template |
| CL-04 | 14-day right of withdrawal, information and model form | DL 24/2014 arts 10–11 and annex (parts A and B); 12-month extension if not informed (art. 10(2)) | `b2c` | `withdrawal` page with Annex B form; statement of the right in checkout/confirmation | `withdrawal.{pt,en}.md` |
| CL-05 | Digital waiver / start during withdrawal period | DL 24/2014 arts 15(1),(5), 17(1)(a),(l), 6/9(2) | Immediate access to services or digital content | Unticked required checkbox (express request + acknowledgement of loss of right) + confirmation e-mail; otherwise 14 days remain and no cost is due | Checkout copy; logs of consent text version |
| CL-06 | Withdrawal function ("button") | Art. 11a Dir. 2011/83/EU (Dir. (EU) 2023/2673), applies **19 Jun 2026**; PT transposition not found — *verify* | `b2c` online contracts with withdrawal right | Footer "Resolver o contrato aqui" → two-step form, no login → acknowledgement e-mail | Screenshot; e-mail template |
| CL-07 | Refund | DL 24/2014 art. 12 (≤ 14 days, same payment means; double refund on default) | `b2c` | Process + owner; no refund fees | Runbook |
| CL-08 | Conformity of digital content/services | DL 84/2021 arts 26–39 (conformity 27–30; liability 2 years or contract period 32; proof 33; remedies 35; refund 38; modifications 39); ASAE enforces (art. 47); mandatory | `b2c` digital | Terms section; updates as promised; modification clause with notice + right to terminate; data retrieval at termination (art. 36) | Terms |
| CL-09 | Unfair standard terms | DL 446/85 (CCG), DGC enforcement powers added by DL 109-G/2021 | Always for standard terms | No absolutely prohibited clauses (arts 18, 21); terms communicated and accepted before purchase; liability cap never excludes intent/gross negligence | Terms review |
| CL-10 | Price indication | DL 138/90 art. 1 (price with taxes); DL 70/2007 arts 3–5.º-A | `b2c` | VAT-inclusive consumer prices; B2B prices ex-VAT only on B2B-only sites with explicit notice | Pricing page |
| CL-11 | Discount reference price | DL 138/90 arts 1(2), 2(f); DL 70/2007 as amended by DL 109-G/2021 (in force 28 May 2022): lowest price of previous 30 consecutive days | Any strike-through/"−x %" | Show and prove the 30-day lowest price | Price history log |
| CL-12 | Subscriptions | DL 24/2014 art. 4 (duration, renewal, termination); DFA pending (*verify*) | Recurring billing | State auto-renewal and how to cancel; cancel in ≤ the steps of sign-up; renewal reminder | Checkout + account page |
| CL-13 | Unfair commercial practices | DL 57/2008 (art. 10.º-A search ranking and review authenticity, added by DL 109-G/2021); DL 24/2014 arts 4.º-A, 4.º-B | Rankings, reviews, marketplaces | No fake reviews/urgency; disclose ranking parameters; review checks | Marketing audit |
| CL-14 | Delivery and unavailability | DL 24/2014 art. 19 (30 days; refund on unavailability) | `b2c` | State delivery (instant for digital); refund rule | Terms |

## E. Accessibility

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| AC-01 | EAA scope decision | Dir. (EU) 2019/882 art. 4(5); **DL 82/2022** art. 2(3)(g),(5)(b); effects from **28 Jun 2025**; ASAE | e-commerce services, apps | Document: microenterprise (< 10 persons and turnover or balance sheet ≤ €2m) providing services ⇒ outside scope; re-assess at growth | Compliance doc |
| AC-02 | WCAG 2.2 AA quality bar | EN 301 549 (basis of EAA presumption); Portaria 220/2023 | Always (policy choice) | axe + manual keyboard/screen-reader test in QA | `docs/06-qa-report.md` |
| AC-03 | Accessibility feedback contact | EAA good practice | Always | Contact in legal notice | Legal notice |

## F. AI Act (Reg (EU) 2024/1689, amended by Reg (EU) 2026/1744)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| AI-01 | Role and risk classification | AI Act Arts 3, 5, 6, Annex III | `ai` | `legal/ai-act-note.md`; Annex III high-risk applies from **2 Dec 2027**, Annex I **2 Aug 2028**; if high-risk ⇒ lawyer | Note |
| AI-02 | Prohibited practices screen | Art. 5 (since 2 Feb 2025; non-consensual intimate/CSAM generation from **2 Dec 2026**) | `ai` | Confirm none; block misuse in prompts/terms | Note |
| AI-03 | Chatbot disclosure | Art. 50(1) (applies since **2 Aug 2026**) | Conversational AI | "You are talking to an AI" unless obvious | UI screenshot |
| AI-04 | Marking of synthetic content | Art. 50(2); grace to **2 Dec 2026** only for systems placed on market before 2 Aug 2026; Code of Practice (10 Jun 2026); Guidelines (20 Jul 2026) — *verify* | Generates image/audio/video/text | Machine-readable marking + detectability (metadata/watermark) | Technical note |
| AI-05 | Deepfake/AI-text labelling; emotion recognition notice | Art. 50(3),(4) | Such features | Labels at publication; user notice | UI |
| AI-06 | AI literacy | Art. 4 (softened by Reg 2026/1744) | `ai` | Short internal note on training/awareness | Note |
| AI-07 | AI vendor terms | RGPD Arts 28, 44; vendor ToS | Third-party models | DPA; no training on customer data; region; list as processor | `subprocessors.md` |
| AI-08 | Disclose AI use and limits | RGPD Art. 13; consumer law (no misleading claims) | `ai` | Privacy + Terms paragraphs (accuracy, human review) | Pages |

## G. Digital Services Act (Reg (EU) 2022/2065; PT: Lei 12-A/2026, coordinator ANACOM)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| DSA-01 | Classification | DSA Arts 3, 6, 19, 29 (micro/small exempt from Sections 3–4 only) | `ugc` | Hosting / online platform / marketplace decision | Compliance doc |
| DSA-02 | Contact points | Arts 11–12 (Portuguese + another widely understood language) | `ugc` (any intermediary) | E-mail in legal notice | Legal notice |
| DSA-03 | Terms on moderation | Art. 14 | `ugc` | Terms section: rules, procedures, tools, complaint route, plain language | Terms |
| DSA-04 | Notice and action | Art. 16 | Hosting | Report form, acknowledgement, decision | Screenshots |
| DSA-05 | Statement of reasons | Art. 17 | Hosting | E-mail template per restriction | Template |
| DSA-06 | Criminal-offence notification | Art. 18 | Hosting | Runbook | Runbook |
| DSA-07 | Marketplace/P2B | DSA Art. 30; Reg (EU) 2019/1150 | Traders sell via the product | Trader traceability, ranking and terms transparency (small platforms exempt from DSA Art. 30; P2B still applies) | Terms |

## H. Tax and invoicing (confirm with a contabilista certificado)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| TX-01 | Activity and VAT regime | CIVA art. 53 exemption (threshold €15,000 for 2026 — *verify*) | Sole trader/ENI | Declare activity; choose regime; exemption means no VAT charged/deducted | Finanças certificate |
| TX-02 | Invoicing | CIVA art. 36 ff; AT-certified software or Portal das Finanças; ATCUD; reporting to AT (*verify* dates) | Own sales | Issue fatura-recibo; keep 10 years | Invoice sample |
| TX-03 | EU B2C digital services | VAT Directive; Portal das Finanças OSS: EU-wide threshold €10,000; above ⇒ customer-state VAT via Union OSS | Own sales, no MoR | Track cross-border B2C revenue; register OSS | Revenue tracker |
| TX-04 | EU B2B reverse charge | VAT Directive art. 44; VIES validation; recapitulative statement | B2B customers with VAT ID | Validate ID, invoice without VAT with legal mention, report | Invoice + VIES proof |
| TX-05 | Merchant of Record decision | Commercial | `sells`, B2C cross-border | Default MoR; name seller of record in Terms/withdrawal | ADR in `docs/adr/` |
| TX-06 | Non-EU customers / US sales tax | Outside PT VAT; US state nexus rules | Worldwide sales | Keep proof of customer location; MoR covers US tax | Notes |

## I. App stores and platform rules

| ID | Item | Rule | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| AS-01 | Privacy policy URL | Apple App Store Connect; Google Play | `app` | Public `privacy` URL in listings | Listing |
| AS-02 | Apple App Privacy details | App Store Connect (self-reported, must match SDKs) | iOS | Generate from RoPA + SDK scan | Screenshot |
| AS-03 | Account deletion | Apple Guideline 5.1.1(v) (in-app initiation); Google Play: in-app + web deletion URL | Apps with accounts | Delete account + data; explain retention | Flow test |
| AS-04 | Google Play Data safety form | Play Console | Android | From RoPA; includes deletion answers | Form copy |
| AS-05 | DSA trader status | Apple (EU apps), Google | EU distribution as trader | Public address/phone/e-mail (HT) | Store console |
| AS-06 | Children / ratings / COPPA | COPPA (amended Rule, compliance 22 Apr 2026); store family policies | Child-directed or actual knowledge of < 13 | Not directed at children; block/handle if discovered | Policy |

## J. Product-security and other regimes (rule in/out explicitly)

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| SEC-01 | Cyber Resilience Act reporting | Reg (EU) 2024/2847 Art. 14 (since **11 Sep 2026**; ENISA platform) | Software/app distributed to users (not pure SaaS) | Vulnerability intake, 24 h/72 h/14 d reporting runbook | Runbook |
| SEC-02 | Data Act switching | Reg (EU) 2023/2854 (since 12 Sep 2025) | B2B SaaS/cloud — *verify scope* | Switching/export clause, no lock-in terms | Terms |
| SEC-03 | NIS2 | Directive (EU) 2022/2555 / PT transposition (*verify*) | Rarely (micro/small) | Record the ruling | Compliance doc |

## K. Intellectual property

| ID | Item | Legal basis | Applies when | How to satisfy | Evidence |
|---|---|---|---|---|---|
| IP-01 | Trademark clearance | EU TMR 2017/1001; CPI (PT) | Always | `legal/trademark-check.md`; red ⇒ rename | Check file |
| IP-02 | Third-party licences | OSS/font/image licences | Always | Licence scan; attribution | `THIRD_PARTY.md` |
| IP-03 | User-content licence and takedown | DSA Art. 16; copyright law | `ugc` | Licence clause; takedown route | Terms |

## Sources

DL 7/2004 text: https://www.wipo.int/wipolex/en/legislation/details/5537 · DL 156/2005 as republished: https://www.aiccopn.pt/wp-content/uploads/2021/10/LR-republicacao.pdf · DL 24/2014 (2016 consolidation): https://www.fd.ulisboa.pt/wp-content/uploads/2023/03/Decreto-Lei-24-2014-contratos-celebrados-a-distancia-e-fora-do-estabelecimento-comercial.pdf · DL 109-G/2021: https://diariodarepublica.pt/dr/detalhe/decreto-lei/109-g-2021-175744207 · DL 84/2021: https://data.dre.pt/eli/dec-lei/84/2021/10/18/p/dre · DL 82/2022: https://files.dre.pt/1s/2022/12/23400/0010900132.pdf · Lei 58/2019: https://diariodarepublica.pt/dr/detalhe/lei/58-2019-123815982 · Lei 12-A/2026: https://files.diariodarepublica.pt/1s/2026/04/07301/0000200025.pdf · ODR closure: https://consumer-redress.ec.europa.eu/site-relocation_en · AI Act: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai · EDPB cookie banner taskforce report (Jan 2023): https://www.edpb.europa.eu · CNPD: https://www.cnpd.pt · DPF list: https://www.dataprivacyframework.gov/list · Portal do Consumidor: https://www.consumidor.gov.pt · OSS/VAT: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Comercio_eletronico/
