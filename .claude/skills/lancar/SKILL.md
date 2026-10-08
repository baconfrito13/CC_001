---
name: lancar
description: Faz o go-live de um produto da fábrica - verifica o gate de lançamento e as tarefas do fundador, faz deploy de produção, configura domínio/analytics/monitorização/pagamentos em modo live e anuncia. Use when the founder says lançar/publicar/go-live/pôr online, approves go-live, or a product's founder tasks for launch are all done.
argument-hint: "<slug> [--preview] [--aqui]"
---

# /lancar — go live

Arguments: `$ARGUMENTS` (`--preview` = deploy and smoke-test a preview only).

This is the only path to production (besides `go_live: auto` in `FOUNDER.md` with no open 🔴
founder task). Merging a product PR deploys a preview at most.

1. Resolve the product as `/continuar` step 1 does — when it lives in another session, hand it
   over as `/lancar <slug> --aqui <other arguments>`.
2. Preconditions — stop and report precisely what is missing if any fails:
   - every phase before `launch` is done in `product.json` (including `legal` and `gtm`), and
     `docs/06-qa-report.md` shows G2 passed;
   - every 🔴 task in `HUMAN_TASKS.md` is `[x]`;
   - go-live is approved: the founder asked for it now, the go-live task in `HUMAN_TASKS.md` is
     ticked, or `FOUNDER.md` says `go_live: auto`.
3. Delegate to the `devops-engineer` agent, following `factory/playbooks/09-launch.md` and
   `factory/checklists/launch-readiness.md`: `factory.py doctor`; production deploy with the
   platform CLI and env tokens; custom domain + DNS when owned; HTTPS; analytics and error
   monitoring verified with a real event; payments switched to live only if the founder has
   provided live credentials; uptime check; smoke test against production
   (`BASE_URL=<url> npm run test:smoke` in the web starter); rollback command recorded in
   `docs/09-launch.md`.
4. Record: `factory.py set <slug> links.production <url>` (and `links.domain`), then
   `factory.py set-phase <slug> launch done --summary "live em <url>"` and
   `factory.py set <slug> status launched`; validate; commit; push; refresh the PR status
   block.
5. Hand the founder the launch kit: the exact posts/emails from `marketing/launch/` in the
   order and times of the launch plan (posting is theirs to do — Show HN text must be written
   in their own words), and the first-week checklist. Push-notify that the product is live, if
   the tool exists.
6. Growth: the foreman runs `/crescer` weekly; mention it.
