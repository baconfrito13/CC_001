---
name: lancar
description: Faz o go-live de um produto da fábrica - verifica o gate de lançamento e as tarefas do fundador, faz deploy de produção, configura domínio/analytics/monitorização/pagamentos em modo live e anuncia. Use when the founder says lançar/publicar/go-live/pôr online, approves go-live, or a product's founder tasks for launch are all done.
argument-hint: "<slug> [--preview]"
---

# /lancar — go live

Arguments: `$ARGUMENTS` (`--preview` = deploy and smoke-test a preview only).

1. Resolve the product as `/continuar` step 1 does (spawn/continue its session when it lives
   on another branch).
2. Preconditions — stop and report precisely what is missing if any fails:
   - phases up to `qa` are done (`product.json`), and `docs/06-qa-report.md` shows G2 passed;
   - every 🔴 task in `HUMAN_TASKS.md` is `[x]`;
   - production go-live is approved: the founder asked for it now, `HUMAN_TASKS.md` has the
     go-live approval checked, or `FOUNDER.md` says `go_live: auto`.
3. Delegate to the `devops-engineer` agent, following `factory/playbooks/09-launch.md` and
   `factory/checklists/launch-readiness.md`: `factory.py doctor`; production deploy with the
   platform CLI and env tokens; custom domain + DNS when owned; HTTPS; analytics and error
   monitoring verified with a real event; payments switched to live only if the founder has
   provided live credentials; uptime check; Playwright smoke test against production; rollback
   command recorded in `docs/09-launch.md`.
4. Record: `factory.py set <slug> links.production <url>` (and `links.domain`), then
   `factory.py set-phase <slug> launch done --summary "live em <url>"` and
   `factory.py set <slug> status launched`; validate; commit; push; refresh the PR status
   block.
5. Hand the founder the launch kit: the exact posts/emails from `marketing/launch/` in the
   order and times of the launch plan (posting is theirs to do), and the first-week
   checklist. Push-notify that the product is live, if the tool exists.
6. Schedule growth: the foreman runs `/crescer` weekly; mention it.
