# Checklist · SEO (technical, on-page, international)

Used by: builders (★ per page), `qa-engineer` in `06-qa` Step 6, `growth-marketer` for the keyword/content layer (see `docs/08-gtm.md`), `devops-engineer` after DNS goes live.
Each item: `pass` / `fail (D-nnn)` / `N/A`. Verify against a **production build** (`npm run build && npm run start -- --port 3100`), then repeat on the preview/production URL. `$BASE` = that URL; locales `en` and `pt` unless the product differs.
Google guidance changes: check https://developers.google.com/search/docs at execution time for anything marked (verify).

## 1. Crawlability and indexation

| ID | Check | How to verify | Sev |
|---|---|---|---|
| SE-01 ★ | `/robots.txt` returns 200, allows public pages, references the sitemap; **production** does not disallow `/`; previews/staging send `X-Robots-Tag: noindex` | `curl -s $BASE/robots.txt`; `curl -sI $PREVIEW/` | P1 (prod blocked = P0) |
| SE-02 ★ | `/sitemap.xml` lists every indexable URL in every locale (including legal pages), absolute URLs on the canonical host, valid XML, ≤ 50,000 URLs per file | `curl -s $BASE/sitemap.xml`; count `<loc>`; all return 200 | P1 |
| SE-03 ★ | Every public page returns 200; unknown URLs return a real 404 (not 200); redirects are single-hop 301/308 | `curl -s -o /dev/null -w '%{http_code}' $BASE/does-not-exist`; `curl -sIL` | P1 |
| SE-04 | One canonical host: `http→https`, `www→apex` (or reverse) 301; trailing-slash policy consistent | `curl -sI http://<domain>`, `www.<domain>` | P2 |
| SE-05 ★ | No accidental `noindex` in production HTML or headers; login/app/checkout pages `noindex` on purpose | grep rendered HTML for `name="robots"`; headers | P1 |
| SE-06 | Internal links are crawlable `<a href>` (no JS-only navigation); no orphan pages (each page linked from ≥ 1 other) | crawl with `npx linkinator ./out --recurse` (or against `$BASE`), compare to sitemap | P2 |
| SE-07 | Pages render meaningful content without JS (server-rendered/static) | `curl -s $BASE/en` contains the h1 and main copy | P1 |

## 2. On-page

| ID | Check | How to verify | Sev |
|---|---|---|---|
| SE-10 ★ | Unique `<title>` per page and locale, ≤ 60 chars, primary keyword/brand; unique meta description ≤ 160 chars | Playwright dump of title/description for all routes, assert uniqueness and length | P2 |
| SE-11 ★ | Exactly one `<h1>` per page, headings hierarchical, matches search intent of the page | Playwright count `h1`; outline dump | P2 |
| SE-12 ★ | `<link rel="canonical">` self-referencing, absolute, correct locale URL | grep rendered HTML | P1 |
| SE-13 | Images: descriptive `alt`, modern format, dimensions set; filenames meaningful | axe `image-alt`; review | P3 |
| SE-14 | Body content is original, specific, matches the keyword plan; no thin or duplicate pages; dates real | review against `marketing/seo/` briefs | P2 |
| SE-15 | Internal linking: landing → pricing → legal; hub/spoke for content sites; anchor text descriptive | review | P3 |
| SE-16 | Readable URLs: lowercase, hyphenated, locale prefix consistent (`/en/...`, `/pt/...`) | sitemap review | P3 |

## 3. International (en + pt-PT)

| ID | Check | How to verify | Sev |
|---|---|---|---|
| SE-20 ★ | `hreflang` alternates on every page: each locale plus `x-default`, reciprocal, absolute URLs, matching canonicals; use `pt-PT` where the copy is European Portuguese | grep `rel="alternate"` in HTML or sitemap `xhtml:link`; check reciprocity script | P2 |
| SE-21 ★ | `<html lang>` equals page language; content actually translated (no mixed-language pages) | Playwright; compare strings between locales | P2 |
| SE-22 | Language switcher links to the equivalent page, crawlable; no forced redirect by IP/Accept-Language that hides a locale from crawlers | click-through; `curl -sI -H 'Accept-Language: pt-PT' $BASE/` | P2 |
| SE-23 | Prices/currency/date formats localized (`Intl`) | visual | P3 |

## 4. Social and structured data

| ID | Check | How to verify | Sev |
|---|---|---|---|
| SE-30 ★ | Open Graph and Twitter card tags (`og:title`, `og:description`, `og:image` 1200×630 absolute URL, `og:locale`, `twitter:card`) render; OG image URL returns 200 image | `curl -s $BASE/en` grep; `curl -sI <og:image>` | P2 |
| SE-31 ★ | JSON-LD valid JSON, correct `@type` (`Organization`, `WebSite`, `Product`/`SoftwareApplication` with `offers`, `BreadcrumbList`, `Article` for content, `FAQPage` only where visible FAQ exists) | extract `script[type="application/ld+json"]`, `JSON.parse`, check required properties; Rich Results Test is a web tool (founder/optional) | P3 |
| SE-32 | Structured data matches visible content (price, name, ratings only if real; never fabricate reviews) | review | P1 (policy risk) |
| SE-33 | Favicon set, `manifest`/theme-color, Apple touch icon | `curl -sI` each | P3 |

## 5. Performance and UX signals

| ID | Check | How to verify | Sev |
|---|---|---|---|
| SE-40 ★ | Lighthouse SEO = 100 and Performance ≥ 90 on landing (median of 3) | `factory/checklists/performance.md` commands | P2 |
| SE-41 | Mobile-friendly: viewport meta, readable font size, tap targets, no horizontal scroll | Lighthouse `viewport`, `tap-targets`; 360 px screenshot | P2 |
| SE-42 | No intrusive interstitials: consent banner small, dismissible, not covering content or hurting CLS | screenshot at 360 px | P2 |
| SE-43 | HTTPS everywhere, no mixed content | console warnings; Lighthouse best-practices | P1 |

## 6. Search tooling and measurement (mostly founder-owned)

- [ ] Google Search Console and Bing Webmaster verified by DNS TXT record (founder task, exact record provided); sitemap submitted.
- [ ] Analytics goals match the keyword plan landing pages; branded and non-branded queries tracked weekly in `docs/10-growth.md`.
- [ ] `ads.txt` only after ad approval; `security.txt` optional (`/.well-known/security.txt` with contact).

## 7. Product-type additions

- **Content/programmatic sites:** each generated page has ≥ 3 unique data points and original summary; thin pages `noindex` or merged; sample 10 pages manually; sitemap split per section; avoid scaled low-value content (Google spam policy, verify wording); RSS feed valid (`/rss.xml`).
- **Mobile apps:** App Store Optimization: title ≤ 30 chars with keyword, subtitle, keyword field, localized screenshots/description (en + pt-PT), privacy URL, support URL; Google Play short description ≤ 80, full ≤ 4000, feature graphic 1024×500.
- **Extensions:** store listing name ≤ 45 chars, summary ≤ 132, keywords naturally in first sentences, 3–5 screenshots (1280×800), promo tile 440×280, localized `_locales/*/messages.json`.
- **E-commerce:** product pages with unique descriptions, `Product` JSON-LD with `offers` and availability, collection pages indexable, faceted-filter URLs `noindex` or canonicalized.
- **Bots/APIs:** a crawlable landing and docs site (`/docs`) with canonical docs URLs; changelog page.

## Snippet: on-page audit over all routes (Playwright)

```ts
for (const loc of ['en', 'pt']) for (const route of routes) {
  await page.goto(`/${loc}${route}`);
  const t = await page.title();
  const d = await page.locator('meta[name="description"]').getAttribute('content');
  const h1 = await page.locator('h1').count();
  const canon = await page.locator('link[rel="canonical"]').getAttribute('href');
  const alt = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(els => els.map(e => e.getAttribute('hreflang')));
  expect.soft(t.length, `${loc}${route} title`).toBeLessThanOrEqual(60);
  expect.soft(d?.length ?? 0, `${loc}${route} description`).toBeGreaterThan(50);
  expect.soft(h1, `${loc}${route} h1`).toBe(1);
  expect.soft(canon, `${loc}${route} canonical`).toContain(loc);
  expect.soft(alt, `${loc}${route} hreflang`).toEqual(expect.arrayContaining(['en', expect.stringMatching(/^pt/), 'x-default']));   // pt or pt-PT, per the site's choice
}
```
