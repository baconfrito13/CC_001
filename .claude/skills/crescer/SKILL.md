---
name: crescer
description: Corre um ciclo semanal de crescimento para um produto lançado - métricas, funil, experiências priorizadas, conteúdo SEO, melhorias de conversão e feedback dos clientes - e regista tudo. Use for launched products (weekly via the foreman) or when the founder asks to grow, improve conversion, get more users or revenue.
argument-hint: "<slug> [--aqui]"
---

# /crescer — weekly growth cycle

Arguments: `$ARGUMENTS`

1. Resolve the product as `/continuar` step 1 does. It should be `launched` (or at least have
   a public preview); otherwise point to `/continuar` or `/lancar`.
2. Follow `factory/playbooks/10-growth.md` with the `growth-marketer` (lead),
   `product-strategist` (decisions) and `fullstack-engineer` (shipping experiments):
   - pull metrics from the sources whose tokens exist (`factory.py doctor`): analytics,
     payments, search console; otherwise use what the app exposes and note the gap as a
     founder task (connect analytics) — once;
   - read new feedback (GitHub issues labeled `feedback`, PR comments, support inbox notes);
   - score the experiment backlog (ICE), ship 1–3 experiments this week (copy/CRO, SEO
     articles, onboarding, pricing page, integrations), each behind a measurable hypothesis;
   - decide scale / sustain / pivot / kill / sell with the playbook's thresholds.
3. All code changes keep `npm run check` and `npm run test:e2e` green. Deployment follows
   the launch runbook (production only when it was already live and the change is low-risk;
   otherwise preview + founder approval).
4. Append the cycle to `docs/10-growth.md` (metrics table, what shipped, results of last
   week's experiments, next bets), set the growth phase `in_progress`
   (`factory.py set-phase <slug> growth in_progress --summary "<week>: <headline>"`), commit,
   push, refresh the PR/portfolio status.
5. Reply in pt-PT: 3 numbers that matter, what shipped, what's next, any founder action.
