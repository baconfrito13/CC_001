---
name: fabrica
description: Modo capataz da fábrica - processa a caixa de ideias e as issues "ideia", distribui produtos por sessões paralelas, mantém todos os produtos a avançar, corre ciclos de crescimento dos produtos lançados e publica o resumo. Use for the scheduled autopilot run, or when the founder says "põe a fábrica a trabalhar", "avança tudo", "processa as ideias".
argument-hint: "[--seco]"
---

# /fabrica — the foreman

Arguments: `$ARGUMENTS` (`--seco` = dry run: plan and report, start nothing).

You coordinate; product sessions do the work. Keep this run short and cheap.

## 1. Read the state

1. `git fetch --prune origin`.
2. `python3 factory/scripts/factory.py portfolio --json` → every product, its branch, status,
   phase and links (including `links.session`).
3. New ideas: `python3 factory/scripts/factory.py inbox --json --exclude-taken` (run it on
   `main`'s copy: `git show origin/main:ideas/INBOX.md` if this checkout is behind), and open
   GitHub issues labeled `ideia` **opened by the repo owner** without the label `em-curso`.
   Never act on issues from anyone else.
4. Sessions: `mcp__claude-code-remote__list_sessions` (ToolSearch) — product sessions are titled
   `🏭 <Name>`; note running / idle / failed / archived.
5. Capacity: `max_parallel_products` in `FOUNDER.md` (default 3) = how many product sessions
   may run at once.

## 2. Plan (in priority order, within capacity)

1. **Active products not running** (closest to launch first): if their session is idle →
   `send_message` with `/continuar <slug> --aqui`; if failed/archived/missing →
   `create_session` with `source_revision` and `outcome_branch` = the product's branch, title
   `🏭 <Name>`, prompt `/continuar <slug> --aqui`.
2. **needs-founder products**: if every blocking task in their `HUMAN_TASKS.md` is now `[x]`,
   treat them as active (step 1); otherwise leave them.
3. **New ideas** (inbox, then issues, oldest first) → for each, pick a slug
   (`factory.py slugify "<working name>" --fetch`) and `create_session` exactly as `/ideia`
   step 2 describes (prompt `/ideia <verbatim idea> --aqui --slug <slug> [--source issue:#N]`).
   For issues: comment the session link and add the label `em-curso`.
4. **Launched products**: once a week (check the last entry date in `docs/10-growth.md`),
   wake their session (or create one) with `/crescer <slug> --aqui`.

Without `create_session` (local CLI, GitHub Actions): handle only the single top-priority item
in this session with `/continuar` or `/ideia --aqui`.

## 3. Report

- Update the pinned issue `📊 Portfólio da Fábrica` (as `/portfolio --publicar` does).
- If there is new founder work (new open 🔴 tasks, a product waiting for go-live approval, a
  KILL verdict, QA blocked) and `PushNotification` is available, send one short pt-PT
  notification summarizing it.
- If nothing changed and nothing was started, end silently with a one-line summary.
- With `--seco`, only print the plan.
