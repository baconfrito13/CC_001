# Recipe: ai-app

## When to use

`type: ai-app`: a language model is the core value (chat, generation, extraction, classification,
agents, document Q&A). It is `web-saas.md` **plus** the layer below; read that recipe first. Pure
developer API around a model → `api.md`. A feature that merely uses an LLM for 5% of the product is
a normal `web-saas` with one server function.

**Confirm model facts at execution time with the `claude-api` skill** (Skill tool) and the Models API
(`client.models.list()`): ids, prices, context windows, parameter rules change. Snapshot of that
skill on 2026-10-06: `claude-opus-5-5` ($4 in / $20 out per MTok), `claude-sonnet-5-5` ($2 / $10),
`claude-haiku-5-5` ($0.10 / $0.50 up to 100K prompt tokens), all 1M context. Never append date suffixes to ids.

## Default stack

| Concern | Choice | Why | Limits/prices (verify) |
|---|---|---|---|
| Base | Everything in `web-saas.md` | Auth, quotas and billing need accounts | see that recipe |
| LLM | Anthropic API via official `@anthropic-ai/sdk` (0.132 on 2026-10-08) | First-party features (caching, structured output, fallbacks) arrive here first | pay per token, no free tier |
| Model routing | Env-selected per feature: Haiku 5.5 (classify/short), Sonnet 5.5 (default generation), Opus 5.5 (hard reasoning) | Cost scales ~20× across the three | prices above |
| Streaming | `client.messages.stream` → SSE/`ReadableStream` from a Route Handler | Time-to-first-token; avoids HTTP timeouts | Vercel Pro functions: 300 s default, configurable (verify) |
| Rate/abuse | Upstash ratelimit + Cloudflare Turnstile on free signups | LLM endpoints are cost-attack targets | free tiers (verify) |
| Evals | `evals/*.jsonl` + `npm run eval` (runs only when `ANTHROPIC_API_KEY` is set) | Prompt changes need regression checks | API cost, cap at €2/run |
| UI helpers | Own thin hook; Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) only via ADR | Fewer layers, new API features immediately | free |

## Scaffold

```bash
# 1. follow stacks/web-saas.md through "Scaffold", then:
npm i @anthropic-ai/sdk@latest
mkdir -p src/lib/ai evals src/app/api/ai
# src/lib/ai/{client,models,prompts,usage,guard,mock}.ts   (structure below)
```

Env (`.env.example` + zod): `ANTHROPIC_API_KEY`, `AI_PROVIDER=anthropic|mock`, `AI_ENABLED=true`,
`AI_MODEL_FAST`, `AI_MODEL_DEFAULT`, `AI_MODEL_SMART` (ids from the skill table, not hard-coded in
code), `AI_DAILY_BUDGET_EUR`, `AI_MAX_INPUT_CHARS`, `AI_MAX_OUTPUT_TOKENS`. Default `AI_PROVIDER=mock`
until the founder adds a key: e2e and demos run on canned streams.

## Project structure

```
src/lib/ai/client.ts    single Anthropic client; provider switch (anthropic|mock)
src/lib/ai/models.ts    feature → model env var, max_tokens, effort, price table (USD per MTok) for cost accounting
src/lib/ai/prompts.ts   versioned prompts (PROMPT_VERSION), stable system text first (cache prefix)
src/lib/ai/usage.ts     ledger: reserve → call → settle from response.usage; table ai_usage + ai_budget_daily
src/lib/ai/guard.ts     auth, plan quota, rate limit, input caps, kill-switch, injection hygiene
src/app/api/ai/chat/route.ts      POST, zod-validated, streams text, maxDuration set
evals/                  cases + graders; src/app/[locale]/ai/page.tsx  AI transparency notice
```

## Auth

As `web-saas`. **No anonymous LLM endpoint** unless the PRD demands a try-before-signup demo: then
cap at 3 requests/IP/day with Turnstile, Haiku only, `max_tokens` ≤ 300.

## Data

Add `ai_usage(id, user_id, feature, model, input_tokens, cache_read_tokens, cache_write_tokens, output_tokens, cost_micros, created_at)`
and `ai_budget_daily(day, cost_micros)`; RLS: users read only their own rows, writes via service role.
Store prompts/outputs only if the PRD needs history; then per-user rows with retention (default 30 days)
and deletion on account delete. Never log raw prompts in Sentry/PostHog.

## Payments

Plans map to quotas: `free` (e.g. 10 requests/day, Haiku/Sonnet-low), `pro` (monthly budget in €, hard-capped),
optional credit packs. Rule: **cost per free user per month ≤ €0.20** and gross margin on paid plans ≥ 70% at
P90 usage (numbers from `docs/02-business.md`; recompute in `docs/04-architecture.md`).

## Email

As `web-saas`. Add budget-warning email at 80% of a plan quota (transactional, no marketing consent needed).

## Analytics & monitoring

Events: `ai_request` (feature, model, latency_ms, tokens, cost_usd, cached_ratio), `ai_refusal`, `ai_error`,
`ai_quota_hit`. Dashboard: p95 time-to-first-token, cost/user/day, cache hit ratio, refusal rate. Alerts: daily
cost > 80% of `AI_DAILY_BUDGET_EUR` (email), > 100% (kill-switch `AI_ENABLED=false`). Founder task: set a monthly
spend limit in the Anthropic Console (hard stop independent of our code).

## Call pattern (current API rules, from the `claude-api` skill 2026-10-06; re-verify)

```ts
const stream = client.messages.stream({
  model: models.default,                 // from env, e.g. claude-sonnet-5-5
  max_tokens: Math.min(env.AI_MAX_OUTPUT_TOKENS, planCap),
  thinking: { type: "adaptive" },        // opus-5-5 cannot disable thinking; thinking tokens bill as output
  output_config: { effort: "low" },      // set effort explicitly: opus-5-5 and haiku-5-5 default to "medium"
  system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  messages,                              // validated with zod; user content length-capped
});
for await (const ev of stream) if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") send(ev.delta.text);
const final = await stream.finalMessage();            // check final.stop_reason === "refusal" | "max_tokens"
await usage.settle(reservation, final.usage);         // input/cache/output tokens → cost
```

Rules: no `temperature/top_p/top_k` on current models (400); no assistant prefill (400); no `budget_tokens`; no forced
`tool_choice` `any|tool` on opus-5-5/sonnet-5-5 (use `auto` + `strict: true` tools, or `output_config.format` for JSON);
always parse tool inputs with `JSON.parse`; always zod-validate model output before using it; handle `stop_reason: "refusal"`
with a localized message and, on the Claude API, opt into server-side refusal fallbacks by default as the skill recommends for
opus-5-5/sonnet-5-5 (beta `server-side-fallback-2026-07-01`, `fallbacks: "default"`; record it in the ADR because a fallback
model can change cost). Verify caching works: `usage.cache_read_input_tokens > 0`
on the second identical-prefix call (min cacheable prefix is model-dependent); never put timestamps/UUIDs before the cache breakpoint.

## Abuse, safety and AI-Act

- Guard order per request: auth → kill-switch → rate limit (per user and per IP) → plan quota (reserve worst-case cost = input tokens + `max_tokens`) → input caps → call → settle.
- Untrusted text (web pages, uploaded docs, emails) goes in delimited blocks the system prompt marks as data; the model gets no side-effecting tools without user confirmation; outputs are rendered as text/markdown with sanitization, never as HTML or executed.
- System prompt is not secret by design; do not put secrets or other users' data in context.
- Transparency (EU AI Act Art. 50, check applicability dates at execution time): label the interface as AI ("Esta resposta foi gerada por IA"), disclose AI-generated content where required, publish `/ai` (providers, purpose, limits, human contact). `legal` records the AI-Act risk classification in `legal/` (target: minimal/limited risk; any Annex III domain → stop and write an ADR).
- Anthropic is a processor outside the EU: list it in subprocessors, check its DPA/transfer mechanism and API data-retention terms (verify), minimize PII in prompts.

## Testing

- Unit: guard, quota math (property tests for `reserve ≥ settle`), price table, prompt builders, zod schemas.
- Mock provider: deterministic chunks incl. refusal, `max_tokens`, error 429/500 → e2e of streaming UI, quota exhaustion, kill-switch.
- Evals (`npm run eval`): ≥ 20 cases/feature, pass-rate threshold in `docs/05-build.md`; run on every prompt/model change; cost printed.
- Security tests (`06-qa`): prompt-injection fixtures, IDOR on conversation ids, quota bypass by parallel requests, oversized input.

## Deploy

As `web-saas`; add `ANTHROPIC_API_KEY` as encrypted env (`printf %s "$ANTHROPIC_API_KEY" | npx vercel@latest env add ANTHROPIC_API_KEY production --token "$VERCEL_TOKEN"`), set `export const maxDuration = 120` (verify plan limit) on the chat route. Ship with `AI_PROVIDER=mock` + waitlist until the key and spend limit exist.

## Costs

Per request, Sonnet 5.5 with 2.5k cached + 0.5k fresh input and 600 output tokens: 0.5k×$2 + 2.5k×$0.20 + 0.6k×$10 per MTok ≈ **$0.0075**; Haiku 5.5 ≈ $0.0004; Opus 5.5 ≈ $0.0145 (thinking tokens add to output: measure).

| Users (20 requests/user/month) | LLM cost (Sonnet) | + web-saas infra |
|---|---|---|
| 0 | €0 (mock) + eval budget ≤ €5 | €0 |
| 100 | ~$15 | ~$45–60 |
| 10,000 | ~$1,500 (Haiku ~$75, Opus ~$2,900) | ~$120–300 |

Pricing must be set from this table; free tier sized so LLM cost per free user ≤ €0.20/month.

## Gotchas

- Hobby/serverless time limits kill long streams: set `maxDuration`, stream early, keep `max_tokens` modest.
- Thinking tokens are billed as output: low effort for chat; raise only where evals show gains.
- Model ids from memory are wrong within months: read them from `AI_MODEL_*` env and the skill table.
- Parallel requests race the quota check: reserve atomically (SQL `update … returning`) not read-then-write.
- Refusals arrive as HTTP 200: check `stop_reason`.
- Cached prefix invalidated silently by non-deterministic JSON key order or dynamic text in the system prompt.
