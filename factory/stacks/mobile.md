# Recipe: mobile

## When to use

`type: mobile`: iOS and/or Android app distributed through the stores (utilities, trackers, habit/health-light,
learning, companion apps, subscription apps). Cross-platform from one TypeScript codebase. Games, heavy
3D/AR, background-location-critical apps → ADR (Unity/native). Web-only → `web-saas.md`.
Folder: `products/<slug>/app/` when mobile is the only deliverable; `products/<slug>/mobile/` when a web
`app/` exists (list both in `stack.components`).

## Default stack

| Concern | Choice | Why | Free-tier limits (verify at execution time) |
|---|---|---|---|
| Framework | Expo SDK 57 (React Native 0.86, React 19.2 pinned by Expo), Expo Router, TypeScript strict | Official path, OTA updates, EAS | Expo free |
| Build/release | EAS Build + Submit + Update (`EXPO_TOKEN`) | Cloud builds, no Mac needed in our sessions | Free: 15 Android + 15 iOS builds/month, 1,000 update MAU; Starter $19/mo (https://expo.dev/pricing) |
| In-app purchases | RevenueCat (`react-native-purchases`, `react-native-purchases-ui`) | Receipts, entitlements, paywalls, webhooks | Free to $2,500 monthly tracked revenue, then 1% |
| Backend | Supabase (Auth + Postgres + RLS + Storage, EU region), see `web-saas.md` | Same patterns as web, no custom server | 50k MAU, 500 MB |
| Auth | Supabase Auth + `expo-secure-store` session storage; Sign in with Apple (required if any other social login) | Store rules | free |
| Notifications | `expo-notifications` + Expo Push service | No FCM/APNs plumbing | free |
| Analytics | PostHog EU (`posthog-react-native`) or Firebase-free alternative, consent-gated | GDPR | PostHog 1M events/mo |
| Errors | Sentry (`@sentry/react-native`) | Native crash symbolication | 5k errors/mo |
| Landing + legal pages | `web-static` component (store listings require public privacy-policy URL) | Required by both stores | see `web-static.md` |

## Scaffold

```bash
cd products/<slug>
npx create-expo-app@latest app --template default --yes --no-install      # SDK-matched template; use mobile/ if web exists
cd app && npm install
npx expo install expo-secure-store expo-localization expo-notifications expo-apple-authentication expo-linking
npx expo install react-native-purchases react-native-purchases-ui @supabase/supabase-js @sentry/react-native posthog-react-native
npm i -D jest-expo jest @testing-library/react-native @types/jest
npx expo-doctor@latest                    # must pass
npx expo install --check                  # dependency versions match the SDK; fix with `npx expo install --fix`
npx eas-cli@latest init --non-interactive # links/creates the EAS project (needs EXPO_TOKEN)
npx eas-cli@latest build:configure        # writes eas.json (profiles: development, preview, production)
```

Use `npx expo install <pkg>` for every Expo/React Native package (it picks the SDK-compatible version);
never `npm i react@latest`. The template ships an `AGENTS.md` and a `src/app` Expo Router tree; read both and
the installed `expo` docs before coding (Rule zero in `stacks/README.md`). Add scripts: `typecheck`
(`tsc --noEmit`), `test` (`jest`), `check` (`expo lint && npm run typecheck && npm test`).

## Project structure

```
src/app/                  Expo Router: (tabs)/, (auth)/, paywall.tsx, settings/{account,privacy,legal}.tsx, +not-found.tsx
src/components/ src/hooks/ src/lib/{supabase,purchases,analytics,env}.ts
src/lib/purchases/{index,revenuecat,mock}.ts    PURCHASES_ADAPTER=revenuecat|mock
src/i18n/{en,pt}.ts       expo-localization + a tiny t(); no literals in components
app.json (app.config.ts)  name, slug, bundleIdentifier/package, scheme, permissions text, plugins, runtimeVersion
eas.json · store/         metadata (eas metadata:push), screenshots, listing copy per locale
```

## Auth

Supabase email OTP/magic link (deep link scheme) + Sign in with Apple (+ Google if desired). Session persisted with
`expo-secure-store` (chunked adapter, since SecureStore has a ~2 KB value limit: verify). **In-app account
deletion is mandatory** for apps with account creation (Apple 5.1.1(v), Google Play): Settings → Delete account → server
function deletes user rows/storage and cancels nothing in the store (explain subscription cancellation in the store). Biometric lock optional.

## Data

Same as `web-saas.md`: migrations in `supabase/`, RLS on every table, generated types, `entitlements` table synced by a RevenueCat webhook
(Supabase Edge Function or Worker; verify signature/`Authorization` secret). Offline-first only when the PRD says so
(then SQLite via `expo-sqlite` + sync rules, ADR). Local-only data (no backend) is a valid lean option: then no auth, no RLS, simpler privacy label.

## Payments

Digital goods and subscriptions **must use store IAP** (Apple 3.1.1, Google Play Billing): RevenueCat is the wrapper.
Setup order (founder tasks, batched): Apple Developer ($99/yr) → App Store Connect app + subscription group/products → Google Play Console ($25
one-time, as last known) → products → RevenueCat project, entitlements, offerings → API keys into `EXPO_PUBLIC_RC_IOS_KEY`/`…_ANDROID_KEY`.
Until then `PURCHASES_ADAPTER=mock` simulates offerings/entitlements so the paywall, gating and restore flows are testable.
Include: restore purchases button, price from store (localized), trial and cancel info text, link to terms/privacy on the paywall.
Store commission 15–30%; MoR/Stripe are not allowed for in-app digital goods (physical goods/services excepted).

## Email

Auth emails via Supabase SMTP → Resend (see `web-saas.md`). Support address from `site` config on the landing page.

## Analytics & monitoring

Consent first (ATT prompt only if tracking across apps; default: no tracking, answer the privacy label honestly). PostHog EU with
`captureAppLifecycleEvents`, screen events; Sentry with release + dist, `eas build` uploads source maps via the Sentry config plugin (verify).
Metrics: D1/D7 retention, paywall views → trial → paid (RevenueCat charts), crash-free sessions ≥ 99.5%.

## Testing

- Unit (jest-expo): logic, purchases adapter, entitlement rules, i18n completeness (en/pt same keys).
- Component (React Native Testing Library): paywall, onboarding, forms; accessibility props (`accessibilityLabel`, roles) asserted.
- UI flows in cloud sessions: `npx expo export --platform web` + Playwright on the exported site (react-native-web) for flows that work on web;
  native-only flows are checked on EAS `preview` builds by the founder (listed in `HUMAN_TASKS.md`) or Maestro cloud (verify).
- No simulators exist in cloud sessions: never claim a native-only feature "tested" without a build; mark it `unverified-on-device` in `docs/06-qa-report.md`.
- `npx expo-doctor`, `npx expo install --check`, `npx expo export` (bundling succeeds) are part of `npm run check`.

## Deploy

```bash
export EXPO_TOKEN                                  # from the environment
npx eas-cli@latest build --platform android --profile preview --non-interactive      # installable APK for testers
npx eas-cli@latest build --platform all --profile production --non-interactive       # needs store credentials (founder)
npx eas-cli@latest submit --platform all --profile production --latest --non-interactive
npx eas-cli@latest update --branch production --message "<change>" --non-interactive # JS-only OTA fix
npx eas-cli@latest metadata:push                   # listing text/screenshots when store/ is configured
```

iOS builds need an Apple Developer account and credentials (App Store Connect API key via `eas credentials`; founder task, ≤ 5 min with the exact steps
written down). The first Google Play upload usually must be done manually in the Play Console before `eas submit` works (verify in the EAS docs).
Store prep (assets, privacy labels/data safety answers, age rating, review notes with a demo account, support URL, privacy URL) goes in `docs/09-launch.md`; **submission is a founder action**.
Set `runtimeVersion` policy (`fingerprint` or `appVersion`) so OTA updates never reach incompatible binaries.

## Costs

| Users | Monthly estimate (verify) |
|---|---|
| 0 | Apple $99/yr + Google $25 once (founder); EAS free; Supabase free |
| 100 | + Supabase Pro $25 if production data matters (free projects pause); RevenueCat free; store commission 15–30% on sales |
| 10,000 | Supabase Pro $25 + compute; EAS Starter $19 (or Production $199 for volume); RevenueCat 1% above $2.5k MTR; Sentry Team $26; PostHog usage |

## Gotchas

- The untouched default template is not lint/type clean (verified 2026-10-08, SDK 57): `expo lint` reports 1 error (`react-hooks/set-state-in-effect` in `src/hooks/use-color-scheme.web.ts`) and `tsc --noEmit` 2 errors (no declarations for `*.css` imports: add `declare module '*.css';` in a `.d.ts` or run `npx expo start` once to generate types). `expo-doctor` (21/21), `expo install --check` and `expo export --platform web` pass. Make the baseline green before the first slice.
- Expo Go cannot run RevenueCat or other native modules: use a development build (`eas build --profile development`).
- `npm i` of RN libraries without `expo install` breaks native ABI/SDK alignment; React is pinned by the SDK.
- Apple rejects: missing account deletion, IAP bypass, vague permission strings, broken demo login, missing privacy policy; Google needs the Data safety form and a recent target API level.
- Reviews take days: submit early with a clean demo account; keep a changelog and release notes in both locales.
- OTA updates may change JS only; any native/config change needs a new store build.
- Push tokens and device IDs are personal data: add them to the data map and deletion flow.
