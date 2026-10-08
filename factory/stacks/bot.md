# Recipe: bot

## When to use

`type: bot`: the product lives inside a messaging platform: Telegram bot (default: free, no business
verification, instant), Discord app (slash commands/buttons), WhatsApp Business (Meta Cloud API; slower,
verification and message templates). Includes AI assistants in chat (add the guards of `ai-app.md`). A
landing page (`web-static.md`) is part of every bot product: discovery, legal pages, pricing.

## Default stack

| Concern | Choice | Why | Limits/prices (verify at execution time) |
|---|---|---|---|
| Telegram | grammY 1.46 (`grammy`), webhook mode, adapter `cloudflare-mod` or `hono` (both verified in the installed package) | Best TS framework, tiny, edge-ready | Bot API free |
| Discord | HTTP Interactions endpoint on a Worker (slash commands, buttons, modals), `discord-interactions` for signature verification; `discord.js` 14 only if the gateway is needed | No always-on process | free |
| WhatsApp | Meta WhatsApp Business Cloud API, webhook on a Worker | Official; no unofficial libraries (ban risk) | conversation/message pricing by category: https://developers.facebook.com/docs/whatsapp/pricing |
| Runtime | Cloudflare Workers + Hono (`api.md` scaffolding) | Webhooks are request/response | Workers Free: 100k req/day, 10 ms CPU |
| State | D1 (users, plans, preferences, conversation state) | KV free tier allows only 1,000 writes/day | D1: 100k writes/day |
| Long-lived gateway (only if needed) | Node container (Fly.io/Railway) with `discord.js` | Gateway needs a persistent websocket | prices: verify |
| Payments | MoR `checkoutUrl` + webhook → link plan to chat user id; platform-native payments where the platform requires them | Telegram expects Stars for in-bot digital goods (verify rules), Discord has App Subscriptions (verify eligibility) | MoR ~5% + $0.50 |
| Landing + legal | `web-static` from the starter | Required for store/listing and privacy URL | — |
| Errors/logs | Sentry (`@sentry/cloudflare`) + Workers Logs | | free tiers |

## Scaffold

```bash
cd products/<slug>
npm create cloudflare@latest bot -- --framework=hono --lang=ts --no-deploy --no-git --no-open --no-agents < /dev/null
cd bot && npm i grammy@latest zod@latest && npm i -D typescript vitest@latest @cloudflare/vitest-pool-workers@latest @biomejs/biome@latest
npx wrangler d1 create <slug>-db && npx wrangler types --env-interface CloudflareBindings
# Discord only: npm i discord-interactions@latest ; WhatsApp only: no SDK needed (fetch + HMAC)
# landing: follow stacks/web-static.md into products/<slug>/app
```

Telegram bot skeleton: `const bot = new Bot(env.TELEGRAM_BOT_TOKEN)` created per request (Workers have no shared process state), handlers in `src/bot/*.ts`,
`app.post('/telegram/:secretPath', webhookCallback(bot, 'hono', { secretToken: env.TELEGRAM_WEBHOOK_SECRET }))` (check the adapter signature in the installed types).

## Project structure

```
bot/src/index.ts                Hono app: POST /telegram, POST /discord, GET|POST /whatsapp, POST /webhooks/mor, GET /health
bot/src/bot/{commands,callbacks,i18n,keyboards}.ts    commands: /start /help /privacy /delete /plan (+ product commands); strings in en + pt
bot/src/lib/{db,plans,quota,env,verify}.ts            verify.ts = signature checks per platform
bot/migrations/*.sql · bot/test/*.test.ts · app/ (landing)
```

## Auth

The platform identifies the user (Telegram `from.id`, Discord `member.user.id`, WhatsApp `wa_id`). Verify every inbound request: Telegram secret-token header
(`X-Telegram-Bot-Api-Secret-Token`) and a non-guessable path; Discord Ed25519 `X-Signature-Ed25519` + `X-Signature-Timestamp` (reject on failure with 401, required for the endpoint to be accepted);
WhatsApp `X-Hub-Signature-256` HMAC-SHA256 with the app secret, plus the GET `hub.challenge` verification. Admin commands only for ids in `ADMIN_IDS`. Link a paying customer to a chat user with a one-time deep link
(`https://t.me/<bot>?start=<token>`) generated after checkout, token single-use and expiring.

## Data

D1 tables: `users(platform, platform_id, locale, plan, created_at, deleted_at)`, `usage(user_id, day, count)`, `state(user_id, key, value, expires_at)`, `webhook_events(id)` for idempotency. Store the minimum:
no message history unless a PRD story needs it (then retention ≤ 30 days). `/delete` erases the user and their rows; `/privacy` returns the privacy URL and what is stored. Data map lists Telegram/Discord/Meta as platforms and Cloudflare as processor.

## Payments

Preferred: MoR checkout link per plan → webhook (signature verified, idempotent) → `users.plan`; `/plan` shows status and portal link. Flag `PAYMENTS_LIVE=false` → all users on the free tier with quotas.
Platform rules decide the channel for digital goods inside the app (Telegram Stars `XTR` invoices; Discord App Subscriptions; WhatsApp none): record the rule you verified, with URL and date, in an ADR before designing pricing.
Quotas enforced per user per day (`quota.ts`) before any costly call.

## Email

Rarely needed. Receipts come from the MoR; support contact in `/help`; newsletter on the landing page only.

## Analytics & monitoring

Count commands, activations (first useful command within 24 h), D1/D7/D30 retention, free→paid conversion from D1 (`usage`, `users`) with a weekly query script `scripts/metrics.sql` → `docs/10-growth.md`.
No third-party analytics inside chats. Workers Logs with `platform`, `command`, `status`, `latencyMs` (no message text). Uptime on `/health`; alert if webhook error rate > 2%.

## Testing

- Unit: command handlers with a fake context; grammY: intercept outgoing API calls with `bot.api.config.use((prev, method, payload) => …)` and feed updates through `bot.handleUpdate(update)`.
- Signature tests for each platform (valid, tampered, replayed timestamp), idempotent MoR webhook, quota exhaustion, `/delete`, locale fallback (en/pt).
- Worker integration via `@cloudflare/vitest-pool-workers` (package README for the config shape).
- Live platform e2e is impossible in cloud sessions without tokens and may be blocked by the proxy (check `curl -sI https://api.telegram.org`): the founder creates the bot (BotFather, ~2 min) and sends the token as env var; then run a scripted smoke (`getMe`, `setWebhook`, send `/start` from the founder's account) listed in `HUMAN_TASKS.md`.
- `06-qa`: flood test (100 updates/s mocked) stays under CPU limit; oversized/odd updates ignored without 5xx.

## Deploy

```bash
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID TELEGRAM_BOT_TOKEN        # all from the environment
npx wrangler d1 migrations apply <slug>-db --remote
for s in TELEGRAM_BOT_TOKEN TELEGRAM_WEBHOOK_SECRET MOR_WEBHOOK_SECRET ADMIN_IDS SENTRY_DSN; do printf %s "${!s}" | npx wrangler secret put "$s"; done
npx wrangler deploy
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" --data-urlencode "url=https://<worker-domain>/telegram/<secretPath>" --data-urlencode "secret_token=${TELEGRAM_WEBHOOK_SECRET}"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"      # pending_update_count, last_error_message
```

Never print the token (`set +x`, no `echo`). Discord: set the Interactions Endpoint URL in the developer portal (founder, 2 min), register commands via REST with `DISCORD_APP_ID`/`DISCORD_BOT_TOKEN`.
WhatsApp: Meta app + phone number + webhook subscription + business verification are founder tasks; sandbox test number allows testing with a few recipients (verify limits). Listing text, command list (`setMyCommands`) and description per locale are prepared in `marketing/` and `docs/09-launch.md`.

## Costs

| Users | Monthly estimate (verify) |
|---|---|
| 0 | €0 (Workers Free + D1 free) + domain |
| 100 | €0 |
| 10,000 | ~$5 Workers Paid + D1 usage; WhatsApp conversation fees can dominate (per message category); MoR fees on subscriptions |

## Gotchas

- Telegram requires a webhook response within seconds: do slow work with `ctx.waitUntil` or a queue and send results with `sendMessage`; return 200 quickly or Telegram retries.
- Only one update mode: delete the webhook before `getUpdates` polling in local dev; use a separate dev bot token.
- Discord message-content access is a privileged intent (approval needed); slash commands avoid it.
- WhatsApp: opt-in is mandatory, outbound messages outside the 24 h window need approved templates; policy violations get numbers banned.
- Rate limits: Telegram ~30 messages/s global and 1/s per chat; implement backoff (`@grammyjs/auto-retry`, verify).
- KV is a poor session store on the free tier (1,000 writes/day): keep sessions in D1.
- Group-chat bots see other people's data: privacy mode, minimal storage, DPIA note if used in groups at scale.
