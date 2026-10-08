# Checklist · Security (OWASP ASVS L1-oriented)

Used by: builders (quick pass per slice, items marked ★), `security-auditor` and `qa-engineer` in phase `06-qa` (every item), `devops-engineer` before go-live.
Severity if an item fails is the **default**; raise it for exploitable cases (see severity scale in `factory/playbooks/06-qa.md` Step 9).
Mark each item `pass` / `fail (D-nnn)` / `N/A (reason)` in `docs/06-qa-report.md` §8. ASVS is organised by chapter (encoding, validation, web frontend, API, files, authentication, sessions, authorization, tokens, OAuth, crypto, transport, configuration, data protection, secure coding, logging): verify chapter names against https://owasp.org/www-project-application-security-verification-standard/ at execution time. `$BASE` = local or preview URL.

## 1. Secrets and configuration

| ID | Check | How to verify | Default sev |
|---|---|---|---|
| S-01 ★ | Only `.env.example` is tracked; real env files ignored | `git ls-files` filtered for `.env` (see commands) prints only `.env.example`; `.gitignore` covers `.env*` | P0 |
| S-02 ★ | No secrets in working tree | `npx --yes @secretlint/quick-start@latest "**/*"` (verified 2026-10-08) or `gitleaks detect --no-banner --redact` if installed; patterns below | P0 |
| S-03 | No secrets in git history | `git log --all -p -S '<prefix>'` per pattern; GitHub MCP `run_secret_scanning` on changed files | P0 (rotate) |
| S-04 | No secrets in client bundle | grep `.next/static` (or `dist`, extension build, Expo export) for `service_role`, `sk_live`, `sk-ant-`, `whsec_`, private keys | P0 |
| S-05 ★ | Env validated by zod at boot; missing required var fails fast; client vars use the public prefix only for non-secrets | unit test imports `env.ts` with missing vars | P2 |
| S-06 | Test/mock adapters cannot run in production | test sets `NODE_ENV=production` with `AUTH_ADAPTER=mock`/test keys and expects boot failure | P0 |
| S-07 | Tokens scoped least-privilege (Vercel/Cloudflare/Supabase/Stripe restricted keys); rotation documented in runbook | read `docs/09-launch.md` and provider token list | P2 |

Secret patterns (use with `git grep -nIE`): `sk_(live|test)_[0-9A-Za-z]{16,}` · `rk_(live|test)_[0-9A-Za-z]{16,}` · `whsec_[0-9A-Za-z]{16,}` · `sk-ant-[0-9A-Za-z_-]{20,}` · `re_[0-9A-Za-z]{20,}` · `AKIA[0-9A-Z]{16}` · `-----BEGIN [A-Z ]*PRIVATE KEY-----` · `eyJ[0-9A-Za-z_-]{20,}\.eyJ[0-9A-Za-z_-]{20,}\.` (JWT: decode, `role: service_role` is P0) · `xox[baprs]-[0-9A-Za-z-]{10,}` · `ghp_[0-9A-Za-z]{30,}` · `[0-9]{8,10}:[A-Za-z0-9_-]{35}` (Telegram bot token) · `(secret|token|password|api[_-]?key)\s*[:=]\s*['"][^'"]{12,}['"]`.

## 2. Dependencies and supply chain

| ID | Check | How to verify | Sev |
|---|---|---|---|
| D-01 ★ | No high/critical vulnerabilities in production deps | `npm audit --omit=dev --audit-level=high` exit 0 | P1 |
| D-02 | Lockfile committed; CI uses `npm ci` | `git ls-files package-lock.json`; read workflow | P2 |
| D-03 | New packages vetted: maintained, popular or official, permissive licence, no suspicious install scripts | `npm view <pkg> time.modified license scripts` ; `npm ls --omit=dev --all` size sanity | P2 |
| D-04 | No AGPL/GPL in a closed product | `npx license-checker-rseidelsohn --production --summary` | P1 |
| D-05 | CI actions pinned (version tag or SHA), workflow `permissions:` minimal, no secrets echoed | read `.github/workflows/*.yml` | P2 |
| D-06 | Dependabot/Renovate or monthly `npm outdated` review scheduled (growth cycle) | file present or entry in `docs/10-growth.md` | P3 |

## 3. Authentication and sessions

| ID | Check | How to verify | Sev |
|---|---|---|---|
| A-01 | Passwords (if any) hashed by provider or argon2id/bcrypt; never custom crypto | read auth code | P0 |
| A-02 ★ | Login/OTP/reset endpoints rate-limited; responses do not reveal if an account exists | 100-request loop returns 429; compare responses for known/unknown email | P2 (P1 if brute-forceable) |
| A-03 | Session cookie `HttpOnly; Secure; SameSite=Lax/Strict`; reasonable lifetime; logout invalidates server-side | `curl -sI` after login; reuse old cookie after logout → 401 | P1 |
| A-04 | OAuth/OTP redirect targets from an allow-list (no open redirect) | `?next=https://evil.example` stays on site | P1 |
| A-05 | Reset/magic links single-use, expiring (≤ 1 h) | reuse a link twice | P1 |
| A-06 | Admin accounts require MFA or are limited to allow-listed identities | config review | P2 |
| A-07 | Server decides identity from verified token (`getUser()`/`getClaims()`), never from an unverified cookie/session object or client-sent user id | grep server code; negative test with forged user id | P0 |

## 4. Authorization and data access

| ID | Check | How to verify | Sev |
|---|---|---|---|
| Z-01 ★ | Every protected route/action checks authz on the server; UI hiding is not enforcement | anonymous request to each route in the route inventory → 401/redirect | P0 |
| Z-02 ★ | IDOR: user A cannot read/update/delete user B's objects by changing ids (routes, API, storage URLs) | two-user Playwright/API test per resource | P0 |
| Z-03 | Mass assignment blocked: extra fields (`role`, `user_id`, `plan`, `price`) ignored by zod `.strict()`/pick | POST with extra fields, then read back | P1 |
| Z-04 | RLS enabled on every `public` table; policies target `authenticated`, no `using (true)` except documented public data | RLS query from the playbook returns zero rows; `git grep -n "using (true)" supabase/` empty | P0 |
| Z-05 | Roles stored in `app_metadata`/DB, not user-editable `user_metadata` | grep policies and middleware for `user_metadata` | P0 |
| Z-06 | Service-role/admin client imported only in server-only modules | Grep `service_role` and `SERVICE_ROLE` in `src`: only server modules that import `server-only` | P0 |
| Z-07 | Storage buckets private by default; policies per owner; signed URLs short-lived | anonymous GET of an object URL → 400/403 | P1 |

## 5. Input, output and injection

| ID | Check | How to verify | Sev |
|---|---|---|---|
| I-01 ★ | All external input parsed with zod (body, query, params, headers used, webhooks, third-party responses, LLM output) | Grep `req.json(` and `JSON.parse(` in `src`: every hit is followed by `.parse`/`.safeParse` | P1 |
| I-02 ★ | No raw HTML sinks with user data; markdown from users sanitized | Grep `dangerouslySetInnerHTML` and `innerHTML` in `src` (each justified and sanitized); XSS payload corpus renders inert in both locales | P0/P1 |
| I-03 | SQL always parameterized/ORM; no string-built queries | Grep `src` for SQL built with template literals or concatenation (`query(`, `execute(`, `raw(` followed by a backtick or `+`) | P0 |
| I-04 | SSRF: server-side fetch of user-supplied URLs blocks private/link-local ranges and non-http(s) | try `http://169.254.169.254`, `http://localhost` | P0 |
| I-05 | Request body size limits; upload type/size/name validated; no path traversal in file params | send oversize body, `../../etc/passwd` | P2 |
| I-06 | CSRF protection for cookie-authenticated mutations (SameSite + Origin check or token) | cross-origin POST from another origin fails | P1 |
| I-07 | LLM: untrusted text delimited, no side-effecting tools without confirmation, output rendered as text, prompt-injection fixtures do not exfiltrate or act | `ai-app` fixtures in `tests/` | P1 |

## 6. API, webhooks and abuse

| ID | Check | How to verify | Sev |
|---|---|---|---|
| W-01 ★ | Webhook signatures verified on the raw body; replay window; idempotency by event id | tampered, stale and duplicate fixtures | P0 |
| W-02 | Errors are problem+json without stack traces/paths/SQL | force 500 and 400 | P2 |
| W-03 | CORS allow-list; never `*` with credentials | `curl -sI -H 'Origin: https://evil.example' $BASE/api/...` | P1 |
| W-04 ★ | Rate limits on auth, forms, email-sending, checkout and LLM endpoints; per-IP and per-user | 100-request loop → 429 | P2 (P1 for cost endpoints) |
| W-05 | Email/waitlist abuse: double opt-in or CAPTCHA; cannot be used to spam third parties | submit another person's address: only a confirmation email is sent, rate limited | P2 |
| W-06 | Cost caps: quotas, `max_tokens`, daily budget kill-switch, provider-side spend limit documented | quota test; env flag | P1 |

## 7. Transport, headers and cookies

| ID | Check | How to verify | Sev |
|---|---|---|---|
| H-01 | HTTPS only; HSTS in production | `curl -sI https://<prod>` → `Strict-Transport-Security` | P2 |
| H-02 | CSP present, no `unsafe-eval`; inline scripts via nonce/hash; `frame-ancestors` set | `curl -sI $BASE/` and browser console CSP violations | P2 |
| H-03 | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`; `X-Powered-By` absent (`poweredByHeader: false`) | `curl -sI $BASE/` | P3 |
| H-04 | Third-party scripts minimal, loaded after consent, SRI where static | list network requests on first load | P2 |
| H-05 | Previews `noindex`, no debug routes, no public source maps | `curl -sI` preview; build config | P3 |

## 8. Data protection and logging

| ID | Check | How to verify | Sev |
|---|---|---|---|
| P-01 | Personal data collected = data map in `docs/04-architecture.md` §14 and the privacy policy | diff fields stored/sent vs map | P1 |
| P-02 | No PII/secrets in logs, Sentry events, analytics payloads or prompts | grep log calls; inspect a captured Sentry/PostHog payload in test | P1 |
| P-03 | Export and deletion work and cascade (rows, storage, third-party where possible) | e2e: create, export, delete, verify absent | P1 |
| P-04 | Security events logged (login failure, authz denial, webhook failure) with request id, no secrets | trigger each; read log | P3 |
| P-05 | Backup/restore documented and tested once | runbook entry; restore log | P2 |

## 9. Platform-specific

- **Mobile:** secrets never in the app bundle (anything shipped is public); tokens in secure storage; deep-link params validated; account deletion in-app; `expo-doctor` clean.
- **Extension:** minimal permissions and host matches; no remote code/`eval`; message handlers check `sender.id`/origin; no page-content exfiltration beyond declared purpose; `externally_connectable` restricted.
- **API:** API keys stored hashed; shown once; scopes enforced; `/internal/*` not public; key-brute-force throttled.
- **Bot:** platform signature verified before any work; admin commands allow-listed; no message text in logs.

## Commands

```bash
git ls-files | grep -E '(^|/)\.env' | grep -v '\.env\.example$'          # S-01: must print nothing
npx --yes @secretlint/quick-start@latest "**/*"                          # S-02 (exit code 1 on findings)
npm audit --omit=dev --audit-level=high; echo "exit=$?"                  # D-01
for i in $(seq 1 100); do curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/waitlist" -H 'content-type: application/json' -d '{"email":"a'$i'@example.test"}'; done | sort | uniq -c   # W-04
```
