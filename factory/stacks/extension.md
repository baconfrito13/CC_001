# Recipe: extension

## When to use

`type: extension`: browser extension (Chrome/Edge/Firefox/Safari later) that augments pages or adds a
toolbar/side-panel tool: productivity, scraping-assist, SEO/dev tools, AI sidebars, shopping helpers.
One TypeScript codebase, Manifest V3. Needs server state, accounts or heavy compute → add an `api/`
(`api.md`) or `app/` (`web-saas.md`) component; the extension stays thin. Store review rules are the main risk.

## Default stack

| Concern | Choice | Why | Free-tier limits (verify at execution time) |
|---|---|---|---|
| Framework | WXT 0.21 (`wxt`), TypeScript, React via `@wxt-dev/module-react` (or vanilla for tiny tools) | File-based entrypoints, HMR, MV3 + Firefox builds, `wxt zip` | free |
| Manifest | MV3 (Chrome, Edge); Firefox build from the same source (`-b firefox`) | MV2 is dead on Chrome | n/a |
| Storage | `wxt/utils/storage` (typed wrapper over `browser.storage`) | Versioned, watchable | `storage.sync` ~100 KB, `local` ~10 MB (verify) |
| Payments | MoR license keys (Lemon Squeezy / Polar / Paddle) validated via their license API · or ExtensionPay (`extpay`) | Chrome Web Store has no payments of its own | MoR ~5% + $0.50; ExtensionPay fees: verify |
| Backend (optional) | Hono Worker (`api.md`) for license signing, AI proxy, sync | Never ship secrets inside the extension | Workers Free |
| Landing + legal | `web-static` component (privacy policy URL is mandatory in every store) | Store requirement | — |
| Analytics | Minimal, opt-in, no page-content collection; PostHog EU or none | Store "limited use" policy + GDPR | 1M events/mo |
| Errors | Sentry browser SDK (opt-in) or `console` + local report button | PII risk | 5k errors/mo |
| Unit tests | Vitest 5 with `wxt/testing/vitest-plugin` + `wxt/testing/fake-browser` | Fake `browser.*` APIs | free |
| e2e | Playwright persistent context loading `.output/chrome-mv3` | Real extension in real Chromium | free |

## Scaffold

```bash
cd products/<slug>
npx wxt@latest init extension --template react --pm npm     # templates: vanilla, vue, react, solid, svelte (verified 2026-10-08)
cd extension && npm install                                  # postinstall runs `wxt prepare`
npm i -D vitest@latest @playwright/test@latest @biomejs/biome@latest zod@latest
npm pkg set scripts.typecheck="tsc --noEmit" scripts.test="vitest run" scripts.check="npm run typecheck && npm test && npm run build"
npx wxt build && npx wxt build -b firefox --mv3              # both must build before any feature work (Firefox defaults to MV2 in WXT 0.21: pass --mv3)
```

The WXT template pins `typescript ^5.9`: keep it unless `tsc` and WXT both pass on a newer major. In `wxt.config.ts` set
`manifest: { name, description, default_locale: 'en', permissions: [...], host_permissions: [...] }` from the PRD; start with **no host permissions**
and add the narrowest `matches` per content script.

## Project structure

```
extension/
├── entrypoints/{background.ts, content.ts (or content/index.ts), popup/, options/, sidepanel/}   one per surface in the PRD
├── components/ · lib/{license,storage,messaging,i18n,env}.ts · public/_locales/{en,pt_PT}/messages.json
├── assets/ (icons 16/32/48/96/128 from brand/) · wxt.config.ts · tests/ · e2e/
└── store/{chrome,firefox,edge}/  listing text per locale, screenshots 1280×800, promo tile 440×280, permission justifications, privacy answers
```

## Auth

Usually none (license key = identity). If accounts are needed: `browser.identity.launchWebAuthFlow` against the web app's OAuth/OTP
page (`web-saas`), token stored in `storage.local`, short-lived, refreshed by the service worker. Never embed API secrets in extension code
(it is public after publishing): proxy through your Worker with per-install rate limits.

## Data

Local first: `storage.local` for data, `storage.sync` only for small settings. Declare in the data map (`docs/04-architecture.md`) exactly what leaves the
browser (ideally nothing). Content scripts must not read or transmit page content unless it is the single declared purpose; the Chrome Web Store
"limited use" and single-purpose policies (verify current wording) are enforced in review. The background service worker is ephemeral: no in-memory
state, use `storage`/alarms; handle re-start on every event.

## Payments

License flow: buy on the landing page (MoR `checkoutUrl`) → customer gets a license key by email → popup/options "Activate" → background calls the MoR license
API (activate/validate; endpoints are public for Lemon Squeezy, verify per provider) → store `{key, instanceId, validatedAt, plan}` → re-validate every 7 days with `alarms`;
grace period 14 days offline. Free tier = limited features; paid unlocks via `isPro()` in one module. Client-side checks are bypassable: acceptable for products ≤ ~$30; above that
sign entitlements in a Worker. Flag `LICENSE_MODE=live|test|off`; `test` accepts keys `TEST-…` only outside production builds. ExtensionPay (`extpay`) is the quick alternative (adds Stripe-based
payment + `extpay.getUser()`), at the price of vendor fees and lock-in: ADR.

## Email

Out of scope for the extension; receipts come from the MoR; support email in the store listing and options page. Newsletter capture on the landing page only.

## Analytics & monitoring

Off by default; a first-run opt-in screen enables anonymous events (`install`, `activate`, `feature_used:<name>`, `upgrade_click`) sent to PostHog EU through your Worker or
directly with a random install id (no URLs, no page text). Review the Chrome "User Data" disclosures against what is actually sent. Weekly store stats and ratings go into `docs/10-growth.md`.

## Testing

- Unit (`vitest.config.ts` with `WxtVitest()` from `wxt/testing/vitest-plugin`; `fakeBrowser` from `wxt/testing/fake-browser`): license state machine, storage migrations, parsing logic, i18n key parity.
- e2e (verified in the cloud image 2026-10-08): 
  ```ts
  const ctx = await chromium.launchPersistentContext(tmpDir, { executablePath: '/opt/pw-browsers/chromium', headless: false,
    args: ['--headless=new', '--no-sandbox', `--disable-extensions-except=${ext}`, `--load-extension=${ext}`] });
  const sw = ctx.serviceWorkers()[0] ?? await ctx.waitForEvent('serviceworker');   // extension id = new URL(sw.url()).host
  await page.goto(`chrome-extension://${id}/popup.html`);
  ```
  Use a local fixture page served by Playwright (`page.route`) for content-script tests; never test against live third-party sites in CI.
- Build checks: `wxt build` for chrome and firefox, `wxt zip` size < 10 MB, manifest permissions diff reviewed (every permission justified in `store/`).
- Axe on popup/options pages; keyboard operability; contrast in dark and light.

## Deploy

```bash
npx wxt zip && npx wxt zip -b firefox --mv3    # .output/<name>-<version>-chrome.zip, -firefox.zip and -sources.zip (Firefox needs sources); verified output names 2026-10-08
# automated publishing (store API credentials as env vars; `npx wxt submit init` is an interactive walkthrough → founder task; add `--dry-run` to check auth first)
npx wxt submit --chrome-zip .output/*-chrome.zip --firefox-zip .output/*-firefox.zip --firefox-sources-zip .output/*-sources.zip
```

Store accounts and first submissions are founder actions: Chrome Web Store developer registration (one-time fee, last known $5: verify), Firefox AMO (free), Edge Add-ons (free).
Prepare in `store/` and `docs/09-launch.md`: name ≤ 45 chars, summary ≤ 132 chars, long description per locale, category, screenshots (1280×800 or 640×400), 440×280 promo tile,
single-purpose statement, permission justifications, data-use disclosures, privacy policy URL, support URL, test instructions/demo credentials for reviewers.
Updates: bump `version`, zip, submit; review takes hours to weeks; staged rollout where the store supports it.

## Costs

| Users | Monthly estimate (verify) |
|---|---|
| 0 | One-time store fee (~$5 Chrome); landing on free hosting |
| 100 | €0–5 (landing + optional Worker free tier); MoR fees on sales |
| 10,000 | Worker requests for license checks (~$5 Workers Paid if needed) + optional analytics; MoR fees dominate |

## Gotchas

- Broad host permissions (`<all_urls>`) and remotely hosted code are the top rejection causes; MV3 forbids remote code (no `eval`, no CDN scripts).
- Service workers die after ~30 s idle: use `chrome.alarms`, persist state, rebuild listeners at top level on every start.
- Firefox needs `browser_specific_settings.gecko.id` and a sources zip; WXT targets Firefox MV2 unless you pass `--mv3`; test the Firefox build, not just Chrome.
- Updating a published extension to add permissions disables it for users until they accept: plan permissions up front (`optional_permissions` for rare features).
- Safari needs Xcode + Apple Developer account (`xcrun safari-web-extension-converter`): out of scope in cloud sessions, ADR if wanted.
- Impersonation/branding and "affiliate injection" are policy violations: never inject affiliate links silently.
