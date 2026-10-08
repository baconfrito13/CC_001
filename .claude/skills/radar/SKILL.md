---
name: radar
description: Radar mensal da fábrica - volta a verificar versões, preços, regras de plataformas e leis de que a fábrica depende, recolhe tendências de mercado, canais e tecnologia com fontes, atualiza a base de conhecimento e sugere ideias ao fundador. Use monthly (the foreman starts it) or when the founder asks about trends, what changed out there, or for idea suggestions.
argument-hint: "[tech | legal | mercado | tudo] [--seco]"
---

# /radar — what changed out there

Arguments: `$ARGUMENTS` (default `tudo`; `--seco` = report only, change nothing).

`radar` in `FOUNDER.md`: `monthly` (default) or `off` → say so and stop. Work on a branch
`fabrica/radar-<YYYY-MM>` from `origin/main`. Read `factory/knowledge/README.md`, `radar.md` and
`trends.md` first. Run the sweeps in parallel with subagents, each returning entries with a
source URL and an access date — nothing from memory:

1. **Tech** (`solution-architect`) — every row of `radar.md` past its recheck date, plus: latest
   versions and breaking changes of the starter's dependencies (`npm view <pkg> version`,
   release notes); hosting, payments, email and analytics platform changes (pricing, limits,
   terms); new Claude Code capabilities the factory could use. A breaking change or a clearly
   better option becomes an improvement: a starter upgrade with every check green, or a stack
   recipe change.
2. **Legal and platforms** (`legal-counsel`) — EU and Portuguese law and guidance that affects
   the factory's products (GDPR and CNPD guidance, consumer law, AI Act timeline, accessibility,
   DSA, VAT and e-invoicing), app-store and payment-provider rule changes. Update the affected
   playbook, template, checklist and the volatile facts register of
   `factory/playbooks/07-legal.md`; create a founder task only when a live product must act.
3. **Market and channels** (`market-researcher`) — trends in the markets of active and launched
   products and in the founder's interests (`FOUNDER.md`): demand shifts, new competitors,
   pricing moves, channels that are working now (communities, search and AI answers,
   marketplaces, launch platforms). For each live product, note what should change in its growth
   plan; its next `/crescer` reads `trends.md`.

Then:

- Update `radar.md` (new verified and recheck dates, the "Last sweep" line), `trends.md` (dated,
  sourced lines) and every place they change; log the changes in
  `factory/knowledge/improvements.md`.
- **Idea suggestions:** up to `radar_ideas_per_month` from `FOUNDER.md` (default 3, 0 = none) —
  opportunities backed by at least two trend sources and fitting the founder's profile, each with
  a rough G1 score, numbered in the "Ideias sugeridas" table of `trends.md`. Never start them: the
  founder picks one with `/ideia sugestão <n>` or by copying it to `ideas/INBOX.md`.
- Ask the `devils-advocate` agent to attack the diff (unsupported claims, legal statements
  weaker than the sources, anything that loosens a rule in `CLAUDE.md`); fix or drop what it
  flags and record the outcome under **Revisão adversarial** in the PR description.
- Validate, commit `factory: radar <YYYY-MM> — <headline>`, push, open
  `🛠️ Fábrica: radar <YYYY-MM>` and mark it ready; a knowledge-only PR is merged under the merge
  rules in `CLAUDE.md`, anything else waits for the founder.
- Reply in pt-PT, at most 12 lines: what changed that matters, what the factory updated, the idea
  suggestions, and any founder action. Push-notify when a live product is affected.
