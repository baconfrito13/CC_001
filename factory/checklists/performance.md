# Checklist · Performance

Used by: builders (★ per slice), `qa-engineer` in `06-qa` Step 5, `devops-engineer` after the preview deploy (re-run Lighthouse on the real URL).
Landing-page target (mobile emulation, **median of 3 runs**): Lighthouse **performance, accessibility, best-practices, SEO each ≥ 90**; LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms (lab proxy for INP ≤ 200 ms); desktop performance ≥ 95.
Real-user Core Web Vitals (CrUX / Search Console / Vercel Speed Insights) replace lab numbers after launch: log them in `docs/10-growth.md`.

## 1. Measuring (verified 2026-10-08, lighthouse 13.5)

```bash
URL=http://localhost:3100/en; OUT="$SCRATCH/lh"; mkdir -p "$OUT"            # production build: npm run build && npm run start -- --port 3100
for i in 1 2 3; do CHROME_PATH=/opt/pw-browsers/chromium npx --yes lighthouse@latest "$URL" \
  --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path="$OUT/m$i.json" --quiet; done                  # desktop: add --preset=desktop
jq -s '[.[]|.categories|map_values(.score)]' "$OUT"/m*.json                  # pick the median per category
jq '.audits|{lcp:."largest-contentful-paint".displayValue,cls:."cumulative-layout-shift".displayValue,tbt:."total-blocking-time".displayValue,bytes:."total-byte-weight".displayValue}' "$OUT/m1.json"
jq '.environment.benchmarkIndex' "$OUT/m1.json"                              # host speed; compare with a trivial page
```

There is **no `--chrome-path` flag** in lighthouse 13.5: use the `CHROME_PATH` environment variable. Re-check with `npx lighthouse@latest --help` at execution time. Always test the production build, never `next dev`. In the cloud sandbox a trivial static page scored 87 on mobile performance (TBT ≈ 520 ms, benchmarkIndex ≈ 1130): calibrate against such a baseline and judge by LCP/CLS/TBT and bytes, not only by the score. If CPU noise dominates, repeat 5 times and report the median plus the noise note.

| ID | Check | How to verify | Sev if failed |
|---|---|---|---|
| PF-01 ★ | Median-of-3 Lighthouse ≥ 90 in all four categories, landing page, each locale, mobile emulation | commands above | 80–89 P2, < 80 P1 |
| PF-02 | Desktop preset performance ≥ 95 | `--preset=desktop` | P2 |
| PF-03 | Pricing page, one legal page and the main app screen measured too (standard+) | same, other URLs; authenticated screens via Playwright `PerformanceObserver` for LCP | P3 |

## 2. Delivery and rendering

| ID | Check | How to verify | Sev |
|---|---|---|---|
| PF-10 ★ | First Load JS of the landing page ≤ 150 KB gzip; no client component where a server component suffices; no heavy library for a small feature | `npm run build` route table; `@next/bundle-analyzer` (verify the setting for Next 16/Turbopack) | P2 |
| PF-11 ★ | Images: modern formats (AVIF/WebP), explicit `width`/`height`, `loading="lazy"` below the fold, `priority`/`fetchpriority="high"` only on the LCP image, responsive `sizes`; hero ≤ 150 KB | Lighthouse `uses-optimized-images`, `uses-responsive-images`; `ls -l public` | P2 |
| PF-12 ★ | Fonts self-hosted, subset, `font-display: swap`, ≤ 2 families/4 files, preload only the critical one; no layout shift on swap | Lighthouse `font-display`; CLS | P2 |
| PF-13 | No render-blocking third-party scripts; analytics and ads load after consent and `afterInteractive`/idle | Lighthouse `render-blocking-resources`; network panel list on first load | P2 |
| PF-14 | Caching: hashed assets `Cache-Control: public, max-age=31536000, immutable`; HTML revalidated; CDN in front | `curl -sI $BASE/_next/static/...` and `$BASE/` | P3 |
| PF-15 | Compression (br/gzip) on text assets; HTTP/2+ | `curl -sI -H 'Accept-Encoding: br,gzip' $BASE/` → `content-encoding` | P3 |
| PF-16 | LCP element identified and fast: server-rendered text/image, no client-side data waterfall before it | Lighthouse `largest-contentful-paint-element`; trace | P2 |
| PF-17 | CLS ≤ 0.1: reserve space for images, banners (consent banner must not push content), embeds | Lighthouse CLS audit; screenshot sequence | P2 |
| PF-18 | TBT ≤ 200 ms: no long tasks from hydration of large trees; defer non-critical JS | Lighthouse long-tasks audit | P2 |
| PF-19 | `next/image` remote patterns restricted; no unoptimized huge assets in the repo | `git ls-files` sizes (see below) | P3 |

## 3. Backend, data and APIs

| ID | Check | How to verify | Sev |
|---|---|---|---|
| PF-20 ★ | API p95 ≤ 300 ms at 20 concurrent users, 0 errors (excluding deliberate 429) | `npx autocannon -c 20 -d 15 $BASE/api/health` and one real endpoint | P2 |
| PF-21 | TTFB of server-rendered pages ≤ 600 ms (lab, warm) | Lighthouse `server-response-time` | P3 |
| PF-22 | No N+1 queries: list pages issue a constant number of queries | enable query logging in a test, count per request | P2 |
| PF-23 | Indexes exist for filter/sort/FK columns used by top queries (`user_id`, foreign keys) | `EXPLAIN` on the 5 hottest queries shows index scans; migration review | P2 |
| PF-24 | Pagination or limits on every list endpoint (default ≤ 50, hard max ≤ 200) | request with `limit=100000` is capped | P2 |
| PF-25 | Expensive work (emails, webhooks fan-out, AI) off the request path or streamed; timeouts and retries with backoff set | code review; tests with slow stubs | P2 |
| PF-26 | AI: time-to-first-token ≤ 2 s with streaming; prompt caching hit (`cache_read_input_tokens > 0` on the second call) | `ai-app` test with real key if available, else mock timing | P3 |
| PF-27 | Serverless cold start acceptable (≤ 1 s) and region co-located with the database | measure first request after idle; check region config | P3 |

## 4. Product-type additions

- **Mobile:** cold start ≤ 2 s on a mid-range device (founder task to measure), JS bundle size via `npx expo export` output, images sized for density, lists virtualized (`FlashList`/`FlatList`), no blocking work on the JS thread, Hermes enabled (default); OTA update size.
- **Extension:** content script injected only on matching URLs, < 50 KB, no layout thrash on host pages; service worker wakes lazily; bundle zip < 10 MB (`npx wxt zip`).
- **API (Workers):** CPU time per request under the plan limit (free: 10 ms); `wrangler deploy --dry-run` bundle size; D1 queries batched; cache API/KV for read-heavy calls.
- **Content/SEO sites:** static HTML, no hydration for article pages, image CDN, Lighthouse ≥ 95 realistic; sitemap size sane.
- **Bots:** webhook ack < 1 s; slow work queued.

## 5. Budgets (fail the slice if exceeded without justification)

| Budget | Limit |
|---|---|
| Landing JS (gzip) | 150 KB (lean/standard), 100 KB (deep) |
| Landing total transfer (first load) | 1 MB, hero image ≤ 150 KB |
| Third-party requests before consent | 0 |
| Fonts | ≤ 2 families, ≤ 4 files, ≤ 100 KB |
| Lighthouse (median of 3) | ≥ 90 each category |
| API p95 | ≤ 300 ms at 20 concurrent users |

Repo hygiene: `git ls-files -z | xargs -0 ls -l | sort -k5 -n -r | head` shows no file over 500 KB without reason.
