# 03 · Brand (`brand`)

> **Owner:** `brand-designer` (deep: + 3 judge agents, `devils-advocate` on finalists) · **Inputs:** `docs/00-brief.md`, `docs/01-research.md` (competitor names/visuals), `docs/02-product.md` (positioning, persona, locales), `docs/02-business.md`, `FOUNDER.md`, `factory/LEARNINGS.md`, `factory/starters/web/brand/tokens.example.json` (authoritative shape) and `factory/starters/web/scripts/apply-brand.mjs` (the consumer) · **Outputs:** `docs/03-brand.md`, `brand/logo.svg`, `brand/logo-mark.svg`, `brand/tokens.json`, `brand/assets/*`, `legal/trademark-check.md`, founder tasks · **Gate:** brand Definition of Done (`factory/PIPELINE.md`): name with domain check **by tool** and a trademark sanity check; tagline, voice, AA palette, typography, logo, tokens.

## Objective

Give the product a name people remember, a domain it can actually get, a clean accessible identity, and the files the web starter applies with one command (`npm run brand:apply`). Never claim a domain is available unless a tool checked it; never present the trademark check as legal clearance.

## Before you start

1. Read the inputs above. Extract: positioning sentence, personality hints from persona and wedge, locales (default `en` + `pt-PT`), B2B vs B2C, product category, the **competitor names and dominant colours** to stay away from, founder taste and exclusions from `FOUNDER.md` ("Estilo de marca que gostas / detestas", "Setores ou temas a evitar", "Nome ou marca pública"), the accounts already owned ("Contas que já tens": a Cloudflare account means Cloudflare Registrar is the natural registrar) and `product_locales`.
2. Load tools: `ToolSearch` query `select:mcp__Shopify__generate-business-names,mcp__Shopify__generate-domain-names,WebSearch,WebFetch`. Optional: Figma MCP (`mcp__Figma__*`; load the Figma skills named in its instructions before `use_figma`).
3. `python3 factory/scripts/factory.py set-phase <slug> brand in_progress --summary "brand started"`.
   **Execution modes:** inside the `idea-to-product` workflow your task prompt says "do NOT run git commit/push" (brand runs in parallel with architecture): a checkpoint step runs `set-phase … done`, `validate`, `render-status`, commit and push, so skip Step 13.4 there. Still write every file and run the `factory.py set … name/one_liner` commands the prompt asks for. Write only `brand/`, `docs/03-brand.md`, `legal/trademark-check.md` and your own `HUMAN_TASKS.md` lines (other agents write other paths at the same time).
4. Scratch dir `$SCRATCH` for candidate tables and snippets. Facts about prices, TLD rules, fonts and licences: **verify at execution time** on the official page.
5. Templates (pt-PT): `factory/templates/brand.md` → `docs/03-brand.md`. Delete guidance comments when filled.

## Procedure

### Step 1 — Brand strategy mini-brief (≤ 20 min)
Write: positioning sentence, 3–5 personality traits as "we are X, not Y" pairs, the promise (one clause), audience lens, **naming territories** to explore (pick two): *suggestive* (evokes the benefit), *coined/abstract* (invented, best for trademark + domain), *compound*, *metaphor* (real word from another domain), *descriptive* (weak for trademarks; use only for SEO-led content products). Output: top of `docs/03-brand.md`.

### Step 2 — Generate 15–30 name candidates
1. `generate-business-names` (Shopify MCP) with 2–3 different inputs: what it does, who it is for, the feeling/personality. Collect every result.
2. Add your own through patterns: prefix/suffix (`-ly`, `-ify`, `-ora`, `-io`), portmanteau, truncation, borrowed words that work in EN and PT (Latin/Greek roots, Portuguese words with no accents), metaphors. Avoid hyphens, digits, intentional misspellings.
3. Tag each candidate with its territory. Keep all in `$SCRATCH/names.tsv`: `name · territory · source (tool/own)`.

### Step 3 — Hard filters (offline), then shortlist
Eliminate on any **gate**:
| Gate | Test |
|---|---|
| Pronounceable in EN and PT | Say it in both: no letter clusters PT speakers split (`sp-`, `st-` at word start become "esp-/est-"), no silent-letter traps, spelled as heard; ≤ 3 syllables preferred, ≤ 12 letters |
| No negative meaning in PT, EN, ES, FR | Look the name and obvious variants up: Priberam <https://dicionario.priberam.org> and Infopédia (PT), Wiktionary + Urban Dictionary via `WebSearch` (EN), RAE <https://dle.rae.es> (ES), Wiktionnaire (FR); include Brazilian slang (Dicionário Informal) because PT-BR users exist; `WebSearch "<name>" meaning`, `"<name>" slang` |
| Not confusable with a competitor | Edit distance ≥ 3 from every competitor in `competitors.md` **and** different sound |
| Searchable | `WebSearch "<name>"` alone: reject if page one is dominated by a big brand, a celebrity, or a common word that buries you |
| Fits positioning | Does not promise something the product does not do; does not box in the roadmap |
Shortlist size by depth: lean 5 · standard 10–15 · deep 12–16 (8 enter the tournament).

### Step 4 — Domain check with the tool (never claim availability otherwise)
1. For each shortlisted name call `generate-domain-names` with the bare name and with the intended domain (e.g. `acme.com`). Record: `name · domain queried · tool result (available / taken) · price (first year, currency) · tool-suggested alternatives · date`.
2. Only the tool's output counts as availability evidence. If the tool errors or does not cover a TLD (e.g. `.pt`), write **NOT VERIFIED**; the name may proceed as *conditional* and the purchase task must say "confirm availability at the registrar". Negative evidence (the site loads, DNS exists) may eliminate a candidate but never confirms one.
3. **TLD ranking:** `.com` > strong alternatives (`.app`, `.dev` for developer tools, `.io`, `.ai` for AI products, `.eu`, `.pt` for Portugal-first products, `.co`) > prefix/suffix variants on `.com` (`get<name>.com`, `<name>app.com`, `try<name>.com`; −40% on the domain score). **Reject** weak/spammy TLDs (`.xyz`, `.top`, `.info`, `.biz`, `.click`, `.online`, `.site`, `.store`) and hyphenated domains.
4. **Price rule:** first-year **and** renewal ≤ €35/yr (≤ €90 for `.ai`). Premium/aftermarket domains are rejected. Renewal price may differ from the first-year price: say "verify renewal at purchase" in the task.
5. Handles (informational; free means "returned 404 today"): `https://github.com/<name>`, `npm view <name>` (E404 = free), `https://pypi.org/pypi/<name>/json`; for dev products also the package name on the relevant registry; for mobile/extension the store name. Instagram, X, TikTok, LinkedIn, YouTube, Product Hunt usually block bots → **unverified**, covered by a founder task.

### Step 5 — Score and choose
Weighted score (0–100) for names that passed the gates: Memorability & brevity 20 · Fit with positioning/personality 20 · Domain strength (Step 4: `.com` 20, strong TLD 14, variant 12, conditional 8) 20 · Distinctiveness/searchability 15 · Pronunciation/spelling 10 · Handles/packages 10 · Extensibility 5.
- **Deep — name tournament:** 8 finalists in a single-elimination bracket (7 matches). Each match is judged by 3 independent agents with different personas (*target customer*, *brand linguist EN/PT*, *distribution/SEO*), who pick one name per match and give a one-line reason; majority wins; ties → higher weighted score, then shorter name. Keep the bracket table in `docs/03-brand.md`.
- Pick the winner **and a ranked backup**. Run Step 6 on the top 3–5 (lean: top 1–2) **before** committing; a blocked winner is replaced by the next.

### Step 6 — Trademark sanity check (record in `legal/trademark-check.md`)
This is **not legal clearance**; it catches obvious conflicts early. For each finalist, search the exact name and phonetic/visual variants (c/k/q, ph/f, s/z, doubled letters, dropped vowels), in Nice classes **9** (software/apps), **42** (SaaS), **35** (business/online retail), **41** (education/content), **36** (fintech) and the product's own field (verify classes at <https://www.wipo.int/classifications/nice/>), in:
- EUIPO eSearch plus <https://euipo.europa.eu/eSearch/> · TMview <https://www.tmdn.org/tmview/> (may be unreachable from the cloud sandbox) · WIPO Global Brand Database <https://branddb.wipo.int/> · INPI Portugal <https://inpi.justica.gov.pt/> · USPTO <https://tmsearch.uspto.gov/>.
These are JavaScript apps. Try `WebFetch`/`WebSearch` (`site:branddb.wipo.int "<name>"`); otherwise drive them with Playwright using the preinstalled Chromium (`chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })`; the web starter's `node_modules` provides the library — run `npm ci` in `factory/starters/web` first if that folder is missing — then run a CommonJS script from `$SCRATCH` with `NODE_PATH=factory/starters/web/node_modules node script.cjs`) and save screenshots as `brand/assets/trademark/<name>-<db>.png`. Some sites show bot challenges or blank pages: look at each screenshot with the Read tool before citing it. If a database cannot be queried, record the exact search URL, the date and **not verified**.
Record per finalist `name · database · query · date · result · verdict`:
- **Blocked:** identical/confusingly similar live mark for the same or related goods/services in EU, PT or US → drop the name.
- **Caution:** similar mark in an unrelated class, or dormant/expired → allowed; note it and recommend a legal check before paid marketing.
- **Clear (no hit found):** wording "nenhum conflito óbvio encontrado em <bases>, em <data>".
Add a 🟢 optional founder task for filing (EUIPO/INPI) with the official fee page linked (verify fee at execution time).

### Step 7 — Tagline and messaging
5 options per locale (EN; pt-PT **written natively, not translated**): ≤ 7 words, says the benefit or the job, no superlatives without proof, no negatives, passes the 5-second test, and is not an existing slogan (`WebSearch` the exact phrase). Pick one per locale. Also write: one-sentence description (≤ 25 words), meta description (≤ 155 characters), 50-word boilerplate, in both locales.

### Step 8 — Voice and tone
- 3–4 voice attributes with a `do / don't` example in each locale; tone shifts per context (marketing, product UI, errors, billing/legal, support).
- **pt-PT address rule:** B2C consumer brands → informal *tu*; B2B, finance, health, legal → impersonal/neutral forms ("pode…", "o utilizador…"); **never "você"** (reads cold or Brazilian in Portugal). Use AO90 spelling and European vocabulary.
- **Glossary pt-PT** (the i18n copy later follows it): iniciar sessão (not "fazer login"), criar conta, palavra-passe, ecrã, ficheiro, descarregar, definições, guardar, eliminar, subscrição, utilizador, equipa, partilhar, ligação/hiperligação, faturação, fatura, cancelar subscrição, reembolso. Add 10 product-specific terms with their EN counterpart.
- Microcopy rules: sentence case, no exclamation chains, plain verbs, errors say what happened + what to do.

### Step 9 — Palette (light + dark) with computed contrast
1. **Pick the hue** from personality and category conventions, differentiated from the top 2 competitors' dominant hue (≥ 40° apart when brand fit allows). Radius by personality: precise/finance `0.375–0.5rem`, friendly default `0.75rem`, playful `1rem`.
2. **Build the tokens** (helper: `colorsys.hls_to_rgb(h/360, l, s)` → hex). Light: `background` #fff or a faint tint; `foreground` near-black tinted with the hue; `brand` a mid-dark tone (typically L 28–42%) with `brand-foreground` white or near-black; `accent` an analogous/complementary tone with `accent-foreground` near-black; `muted` L ≈ 96%; `muted-foreground` L ≈ 35–40%; `border` a light hairline (advisory ≥ 1.5:1, see the table); `card` = background or a 1–2% lift. Dark: **do not invert** — `background` L 8–11% tinted, `foreground` L ≈ 92% (not pure white), `brand` lifted to L 60–72% with a near-black `brand-foreground`, `muted` L ≈ 14%, `muted-foreground` L ≈ 68–72%, `border` L ≈ 38–45%, `card` L ≈ 12%.
3. **Verify** with the script below (stdlib; WCAG 2.x relative-luminance formula; REQUIRED rows = the starter's `CONTRAST_PAIRS` plus `brand`/`card` and `card-foreground`). Iterate until every REQUIRED row passes in both modes; paste the table into `docs/03-brand.md`. Then confirm with the real consumer (Step 12).

| Pair (each mode) | Min ratio | Kind |
|---|---|---|
| foreground / background, card-foreground / card | 4.5 (aim 7+) | REQUIRED |
| muted-foreground / background, / muted, / card | 4.5 | REQUIRED |
| brand-foreground / brand, accent-foreground / accent | 4.5 | REQUIRED |
| brand / background and / card (brand is used as link/text colour) | 4.5 | REQUIRED |
| accent / background (the starter renders `text-accent` badges; `apply-brand.mjs` checks this pair) | 4.5 | REQUIRED |
| border / background | 1.5 | ADVISORY — in the starter `border` is a decorative hairline (cards, dividers); input outlines and secondary buttons use `muted-foreground` (≥ 4.5, so WCAG 1.4.11's 3:1 holds). Re-check `factory/starters/web/src/components/ui.ts` at execution time: if inputs ever use `border`, require 3.0 |

```python
# $SCRATCH/check_tokens.py — python3 check_tokens.py products/<slug>/brand/tokens.json  (exit 1 on any error)
import json, re, sys
KEYS = ["brand", "brand-foreground", "accent", "accent-foreground", "background", "foreground", "muted", "muted-foreground", "border", "card", "card-foreground"]
def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)); f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def ratio(a, b): hi, lo = sorted((lum(a), lum(b)), reverse=True); return (hi + 0.05) / (lo + 0.05)
t = json.load(open(sys.argv[1], encoding="utf-8")); err = []
if set(t) != {"color", "font", "radius"}: err.append("top-level keys must be exactly color, font, radius")
c = t.get("color", {})
if set(c) != {"light", "dark"}: err.append("color must have exactly light and dark")
for mode in ("light", "dark"):
    m = c.get(mode, {})
    if set(m) != set(KEYS): err.append(f"{mode}: missing {set(KEYS) - set(m)} extra {set(m) - set(KEYS)}")
    err += [f"{mode}.{k}: {v!r} is not #RRGGBB" for k, v in m.items() if not re.fullmatch(r"#[0-9a-fA-F]{6}", str(v))]
f = t.get("font", {})
if set(f) != {"sans", "display"} or not all(isinstance(v, str) and v.strip() for v in f.values()): err.append("font must be {sans, display} non-empty strings")
elif not all(re.fullmatch(r"[A-Za-z0-9 ,\"'._-]+", v.strip()) for v in f.values()): err.append("font stack: only letters, digits, spaces, commas, quotes, dots, hyphens, underscores (apply-brand.mjs rule)")
elif not all(re.search(r"(sans-serif|serif|system-ui|ui-sans-serif|monospace)\s*$", v.strip()) for v in f.values()): err.append("font stacks must end with a generic family")
if not (isinstance(t.get("radius"), str) and re.fullmatch(r"\d+(\.\d+)?(rem|px)", t["radius"])): err.append("radius must be a string like '0.75rem'")
REQ = [("foreground", "background", 4.5), ("card-foreground", "card", 4.5), ("muted-foreground", "background", 4.5), ("muted-foreground", "muted", 4.5), ("muted-foreground", "card", 4.5), ("brand-foreground", "brand", 4.5), ("accent-foreground", "accent", 4.5), ("brand", "background", 4.5), ("brand", "card", 4.5), ("accent", "background", 4.5)]
ADV = [("border", "background", 1.5)]
if not err:
    for mode in ("light", "dark"):
        for label, rows in (("REQ", REQ), ("ADV", ADV)):
            for a, b, need in rows:
                r = ratio(c[mode][a], c[mode][b]); ok = r >= need
                print(f"{label} {mode:5} {a:17} on {b:10} {r:6.2f}:1 (min {need}) {'ok' if ok else 'FAIL' if label == 'REQ' else 'warn'}")
                if label == "REQ" and not ok: err.append(f"{mode}: {a}/{b} {r:.2f} < {need}")
print("\n".join(["ERRORS:"] + err) if err else "tokens.json OK"); sys.exit(1 if err else 0)
```

### Step 10 — Typography
Default: **system stacks** (no requests, no GDPR exposure): `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. A distinct `display` face is optional; when used it must be **open-licence (SIL OFL or equivalent; verify the licence file at the source, e.g. <https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt> for Inter) and self-hosted** (`next/font` self-hosts at build time; the build phase wires it) — loading from Google's CDN sends visitors' IPs to a third party (GDPR risk). Candidates: Inter, Geist, Manrope, DM Sans, Plus Jakarta Sans, Space Grotesk, Fraunces, Source Serif. Test the Portuguese string "Ação, coração, pão, órgão, ênfase, à, ü" in the chosen face. Rules: body ≥ 16 px, line-height 1.5, ≤ 3 weights, modular scale 1.2–1.25. In `tokens.json` the stacks must end with a generic family and may contain only letters, digits, spaces, commas, quotes, dots, hyphens and underscores (the starter's validator rejects anything else); record family, weights, licence URL and who self-hosts it (build phase) in `docs/03-brand.md`.

### Step 11 — Logo (hand-written SVG)
1. **Concept:** write 3 one-line concepts from the name's meaning, the product's core action and the wedge; avoid clichés (lightbulb, rocket, globe, generic sparkles); pick one. Deep: draw **two directions** fully.
2. **Draw the mark** on a `viewBox="0 0 32 32"` grid (same as the starter's `Logo.tsx` and `src/app/icon.svg`): ≤ 3 shapes, ≤ 2 colours, geometric primitives (`circle`, `rect`, `path` with arcs/lines), corner style consistent with the `radius` token, **minimum feature/stroke 2 units** (= 1 px at 16 px), 2-unit padding, no gradients/filters/text/external references, optical balance checked. Prefer the starter's pattern — a `brand` tile with a `brand-foreground` glyph — or a single-colour glyph, so the build phase can paste the paths into `Logo.tsx` and map the colours to `var(--brand)` / `var(--brand-foreground)`.
3. **Wordmark:** convert text to **paths** so it renders identically everywhere. With an open-licence font on disk (`fc-list | grep -i inter`; Inter is often installed under `/usr/share/fonts/opentype/inter/`):
```bash
pip install --quiet --target "$SCRATCH/ft" fonttools      # PyPI is reachable from cloud sessions
```
```python
# $SCRATCH/wordmark.py — PYTHONPATH=$SCRATCH/ft python3 wordmark.py /path/Font.otf "Name" 32  -> <path d=…/> with width/ascent comment
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font = TTFont(sys.argv[1]); text = sys.argv[2]; size = float(sys.argv[3]) if len(sys.argv) > 3 else 32
gs = font.getGlyphSet(); cmap = font.getBestCmap(); scale = size / font["head"].unitsPerEm; x = 0
pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
for ch in text:
    g = cmap[ord(ch)]; gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0))); x += gs[g].width * scale
print(f'<!-- width={x:.1f} ascent={font["hhea"].ascent * scale:.1f} -->\n<path d="{pen.getCommands()}"/>')
```
   (No kerning applied: nudge letter pairs by hand if needed.) If no outline route works, fall back to `<text>` with a system stack and say so in the brand doc.
4. **Files** (`products/<slug>/brand/`):
   - `logo-mark.svg` — mark only, monochrome, `fill="currentColor"`, `viewBox 0 0 32 32`, `role="img"`, `<title>`.
   - `logo.svg` — horizontal lockup: mark (brand colour) + wordmark path; wordmark fill via CSS variable with a dark-mode media query inside the SVG (`<style>:root{--fg:#…light…}@media (prefers-color-scheme:dark){:root{--fg:#…dark…}}</style>`); mark height ≈ 1.6× cap height, gap ≈ 0.4× mark width; tight `viewBox`; `role="img"`, `aria-label`.
   - `assets/favicon.svg` (32×32, mark with its own `prefers-color-scheme` rule, modelled on `factory/starters/web/src/app/icon.svg`; the build phase copies it to `src/app/icon.svg`). Always.
   - Standard/deep, and for `mobile`/`extension`/PWA products: `assets/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180), `og-image.png` (1200×630: mark + name + tagline on a brand background; the web starter generates its own OG image in code, so this PNG is for social/stores). `npm run brand:apply` itself only consumes `tokens.json`.
5. **Test** (every iteration, ≤ 3 iterations): well-formed XML — `python3 -I -c "import sys,xml.dom.minidom as m; m.parse(sys.argv[1])" brand/logo.svg`; render the mark at 16/32/64/128 px on white and on the dark `background` and in grayscale, then **look at the PNG with the Read tool**:
```bash
# sheet.html: <img src="…/logo-mark.svg" width="16"> … (also 32, 64, 128) on a white and a dark div
/opt/pw-browsers/chromium --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=420,260 --screenshot="$SCRATCH/sheet.png" "file://$SCRATCH/sheet.html"
/opt/pw-browsers/chromium --headless=new --no-sandbox --disable-gpu --default-background-color=00000000 --window-size=512,512 --screenshot=brand/assets/icon-512.png "file://$SCRATCH/icon.html"   # icon.html: one <img> at 512 px, margin 0
```
   Reject a mark that turns to mush at 16 px, reads as another well-known logo, or only works in colour. Size budget: mark < 2 KB, lockup < 12 KB. Optional: Figma MCP for mood boards/social banners (link the file in the brand doc); AI-generated imagery is never used inside the logo.

### Step 12 — `brand/tokens.json` (exact shape; no extra keys at any level)
```json
{
  "color": {
    "light": { "brand": "#…", "brand-foreground": "#…", "accent": "#…", "accent-foreground": "#…", "background": "#…", "foreground": "#…", "muted": "#…", "muted-foreground": "#…", "border": "#…", "card": "#…", "card-foreground": "#…" },
    "dark":  { "…": "same 11 keys" }
  },
  "font": { "sans": "<CSS font stack>", "display": "<CSS font stack>" },
  "radius": "0.75rem"
}
```
Values are `#RRGGBB` hex and CSS stacks. Copy the key names/order from `factory/starters/web/brand/tokens.example.json` (do **not** copy its `$comment` key; the starter ignores unknown keys but this repo's tokens stay exact); it wins on any discrepancy (then note it in `factory/LEARNINGS.md`). Run `python3 $SCRATCH/check_tokens.py products/<slug>/brand/tokens.json` until it prints `tokens.json OK`, then validate with the real consumer without touching the starter: `node factory/starters/web/scripts/apply-brand.mjs products/<slug>/brand/tokens.json --out "$SCRATCH/tokens.css" --strict` (exit 0 and `Wrote …`). The build phase later runs `npm run brand:apply -- ../brand/tokens.json` inside the app.

### Step 13 — Document, rename, founder tasks
1. Fill `docs/03-brand.md`: decision summary, candidates table (all 15–30 with fate), gates, scores, domain evidence table (tool, date, price), handles, trademark summary (link to `legal/trademark-check.md`), tagline(s), voice + glossary, palette with contrast table, typography, logo rationale and usage rules (clear space = ½ mark height, minimum sizes 16 px mark / 80 px lockup, don'ts), asset list, tokens summary, alternatives rejected and why.
2. Rename in state (CLI only): `factory.py set <slug> name "<Final name>" --string` and `factory.py set <slug> one_liner "<pt-PT one-liner>" --string`. Do **not** set `links.domain` until the founder confirms the purchase. README title and decision log updated; ask the orchestrator to rename the PR `🏭 <Name> — <one-liner>`.
3. Founder tasks (each ≤ 5 min; format in `factory/templates/HUMAN_TASKS.md`):
   - 🟡/🔴 **Buy the domain** — exact domain string, registrar link (the registrar in `FOUNDER.md`/`SETUP.md`; otherwise a low-markup registrar such as Cloudflare Registrar <https://www.cloudflare.com/products/registrar/>, verify), tool-reported price and date, "confirm renewal price, enable auto-renew, decline add-ons", reply with the domain. 🔴 if the landing page needs it to launch.
   - 🟡 **Claim social handles/stores** for the unverified ones — list handle, link, "use the product email".
   - 🟢 **File the trademark** (optional) — office link, class list, fee page.
4. `python3 factory/scripts/factory.py set-phase <slug> brand done --summary "<Name> · <domain> (<tool-verified|conditional>) · TM <clear|caution>"` (needs `docs/03-brand.md`, `brand/logo.svg`, `brand/tokens.json` non-empty), `validate`, `render-status --write`, commit `<slug>: brand — <Name>`, push. Tell the founder (pt-PT): name, domain with price and verification status, tagline, palette swatches, the tasks.

## Depth: lean / standard / deep

| | lean | standard | deep |
|---|---|---|---|
| Candidates generated | 15 | 20–30 | 25–30 |
| Shortlist with domain checks | 5 | 10–15 | 12–16 → 8 in tournament |
| Trademark check | top 1–2 | top 3 | top 3–5 |
| Selection | weighted score | weighted score + backup | pairwise **name tournament** (3 judges/match) + `devils-advocate` on finalists |
| Logo | 1 mark, 1 revision | 1 mark, up to 3 iterations, favicon/OG | **2 directions** fully drawn and compared at 16 px; mood board; social banners |
| Assets | logo, logo-mark, tokens | + favicon, icons, OG image | + banners, brand usage sheet |

## Decision rules & defaults

- **Gate fails are final:** a name failing any gate is out, whatever its score.
- **Domain beats cleverness:** a good name with a `.com` or strong-TLD domain beats a great name with none. Never settle for a weak TLD.
- **Backup always:** if the purchase fails (taken between check and buy), the founder task says "use backup #1" with its domain pre-checked.
- **Defaults:** radius `0.75rem`; system font stacks; hue chosen by personality, differentiated from competitors; dark mode always provided.
- **Do not overwrite** a founder-chosen name: if the brief or issue states the name, run it through the gates and checks, record the result, and keep it unless a gate fails.
- **Timebox:** strategy mini-brief 20 min, naming loop 60 min, logo 45 min, doc 30 min (lean halves each).
- **Late conflict** (found in legal/GTM): rename via the same CLI commands, regenerate assets, log it.

## Output specification

| File | Content |
|---|---|
| `docs/03-brand.md` | per `factory/templates/brand.md`, pt-PT, no placeholders |
| `brand/logo.svg`, `brand/logo-mark.svg` | hand-written, valid XML, legible at 16 px, no external fonts/refs |
| `brand/tokens.json` | exact shape (Step 12), passes `check_tokens.py` |
| `brand/assets/` | favicon, icons, OG image, trademark screenshots, optional banners/mood board |
| `legal/trademark-check.md` | per-finalist table with database, query, date, verdict, disclaimer |
| `HUMAN_TASKS.md` | domain purchase, handles, optional trademark |
| `product.json` | `name`, `one_liner` updated |

## Definition of Done

- [ ] Name chosen; every gate documented; backup ranked.
- [ ] Domain availability shown by the Shopify tool output (or marked NOT VERIFIED/conditional) with price and date; no unverified "available" claims anywhere.
- [ ] Trademark sanity check recorded for the finalists with links/screenshots and a disclaimer.
- [ ] Tagline, voice (incl. pt-PT address rule and glossary), typography with licence/self-hosting note.
- [ ] Palette light + dark; `check_tokens.py` prints OK; contrast table in the doc.
- [ ] `logo.svg`, `logo-mark.svg` valid, reviewed as PNG at 16/32/64/128 px on light and dark; assets generated.
- [ ] `tokens.json` matches the exact shape; `validate <slug>` passes; no placeholders/guidance comments.
- [ ] Founder tasks written with exact values and ≤ 5 min each; product renamed through the CLI; committed and pushed.

## Anti-patterns

- Saying "domain looks available" from memory or a failed lookup; setting `links.domain` before purchase.
- Names that are generic dictionary words, hard to spell, or only work in English; names too close to a competitor.
- Treating the trademark search as clearance; skipping classes 9/42/35.
- Palettes picked by taste without computed ratios; inverting light mode for dark mode; pale borders on inputs.
- Logos with thin hairlines, gradients, embedded fonts or raster images; testing only at large sizes.
- Hotlinking Google Fonts; shipping fonts without checking the licence.
- Extra keys or wrong value formats in `tokens.json`; hand-editing `product.json`.
- Using "você" in pt-PT copy; Brazilianisms in the glossary.
- Spending hours on mood boards at lean/standard depth.

## Tools & sources

Shopify MCP `generate-business-names`, `generate-domain-names`; `WebSearch`/`WebFetch`; Priberam, Infopédia, RAE, Wiktionary, Urban Dictionary; EUIPO eSearch plus, TMview, WIPO Global Brand Database, INPI, USPTO; Nice classification (WIPO); Python stdlib + `fonttools` (PyPI); Chromium at `/opt/pw-browsers/chromium`; Figma MCP (optional); registrar pages for prices (verify). Agents: `brand-designer`, `devils-advocate`, judge agents (deep).

## Hand-off

**Build/architecture:** `brand/tokens.json` (applied by the starter's `npm run brand:apply`), logo and icon assets, font stacks and licence/self-hosting note, domain for env vars (once bought). **Legal:** `legal/trademark-check.md`, final product/legal name. **GTM:** tagline, messaging, voice, glossary, OG image/banners. `product.json`: `name` updated, `phase` moves to the next pending phase.
