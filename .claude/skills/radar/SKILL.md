---
name: radar
description: Radar mensal da fábrica - volta a verificar versões, preços, regras de plataformas e leis de que a fábrica depende, recolhe tendências de mercado, canais e tecnologia com fontes, atualiza a base de conhecimento e sugere ideias ao fundador. Use monthly (the foreman starts it) or when the founder asks about trends, what changed out there, or for idea suggestions.
argument-hint: "[tech | legal | mercado | tudo] [--seco]"
---

# /radar — what changed out there

Arguments: `$ARGUMENTS` (default `tudo`; `--seco` = report only, change nothing).

`radar` in `FOUNDER.md`: `off` → say so and stop. Work on a branch `fabrica/radar-<YYYY-MM>`
from `origin/main`. Read `factory/knowledge/README.md`, `radar.md` and `trends.md`, and the
"Self-modification limits" in `CLAUDE.md`, first. Run the sweeps in parallel with subagents,
each returning entries with a source URL and an access date — nothing from memory:

1. **Tech** (`solution-architect`) — every row of `radar.md` past its recheck date, plus:
   breaking changes coming in the starter's dependencies (release notes; Dependabot already
   proposes the version bumps — do not bump versions here), hosting, payments, email and
   analytics platform changes (pricing, limits, terms), and new Claude Code capabilities the
   factory could use. A change that needs code or a recipe change becomes a proposal.
2. **Legal and platforms** (`legal-counsel`) — EU and Portuguese law and guidance that affects
   the factory's products (GDPR and CNPD guidance, consumer law, AI Act timeline, accessibility,
   DSA, VAT and e-invoicing), app-store and payment-provider rule changes, with primary sources.
   Create a founder task only when a live product must act.
3. **Market and channels** (`market-researcher`) — trends in the markets of active and launched
   products and in the founder's interests (`FOUNDER.md`): demand shifts, new competitors,
   pricing moves, channels that are working now (communities, search and AI answers,
   marketplaces, launch platforms). For each live product, note what should change in its growth
   plan; its next `/crescer` reads `trends.md`.

Then:

- Update `radar.md` (new verified and recheck dates, the "Last sweep" line) and `trends.md`
  (dated, sourced lines); log the changes in `factory/knowledge/improvements.md`.
- **Idea suggestions:** up to `radar_ideas_per_month` from `FOUNDER.md` (default 3, 0 = none) —
  opportunities backed by at least two trend sources and fitting the founder's profile, each with
  a rough G1 score, numbered in the "Ideias sugeridas" table of `trends.md`. Mark earlier
  suggestions that became products (`factory.py portfolio --json`, source `radar`). Never start
  them: the founder picks one with `/ideia sugestão <n>` or by copying it to `ideas/INBOX.md`.
- Ask the `devils-advocate` agent to attack the diff (unsupported claims, legal statements weaker
  than the sources, anything that loosens a rule in `CLAUDE.md`); fix or drop what it flags.
- Split by scope (`python3 factory/scripts/factory.py scope --base origin/main --head HEAD`):
  `data`/`method` changes → PR `🛠️ Fábrica: radar <YYYY-MM>`, marked ready (the foreman merges
  it under the self-modification limits); `sensitive`/`control` changes — gates, legal, launch,
  payments, growth, stack recipes or starters — → branch `fabrica/proposta-radar-<YYYY-MM>`, a
  draft PR `🛠️ Fábrica: proposta radar <YYYY-MM>` for the founder (at most 3 proposals open at
  once across the factory). Commit `factory: radar <YYYY-MM> — <headline>`, push.
- Post a short "Radar <YYYY-MM>" comment on the `📊 Portfólio da Fábrica` issue (never edit its
  body) and reply in pt-PT, at most 12 lines: what changed that matters, what the factory
  updated, the idea suggestions, any founder action. Push-notify when a live product is affected.
