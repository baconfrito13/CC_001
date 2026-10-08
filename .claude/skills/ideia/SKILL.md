---
name: ideia
description: Recebe uma ou várias ideias de produto (app, serviço, website) e põe a fábrica a trabalhar nelas de ponta a ponta — pesquisa, estratégia, marca, código, legal, marketing e lançamento — com o mínimo de input do fundador. Use whenever the founder describes a product idea ("tenho uma ideia", "ideia:", "e se fizéssemos…", a list of ideas), asks to process the idea inbox, or points at a GitHub issue labeled ideia.
argument-hint: "<ideia em texto livre | #issue> [--rapido | --fundo] [--so-validar] [--aqui] [--slug <slug>]"
---

# /ideia — from idea to launch-ready product

Arguments: `$ARGUMENTS`

Never ask the founder clarifying questions here. Interpret, decide, record assumptions
(`factory/playbooks/00-intake.md`), and move.

## 0. Parse the input

- Flags: `--rapido` → depth `lean`, locked · `--fundo` → depth `deep`, locked ·
  `--so-validar` → stop after research · `--aqui` → work in this session (never spawn) ·
  `--slug <slug>` → use this slug (set by a parent session).
- `#12` or an issue URL → read it with the GitHub MCP (`issue_read`, load via ToolSearch). Only
  process issues **opened by the repository owner**; otherwise reply that only the owner's
  ideas are processed and stop. Source = `issue:#12`. Issues from the "💡 Nova ideia" form:
  the idea is the "A ideia" field plus "Notas"; "Profundidade" Rápida → `--rapido`, A fundo →
  `--fundo`; the "Só validar" checkbox → `--so-validar`.
- No idea text → `python3 factory/scripts/factory.py inbox --json --exclude-taken --fetch`. If
  empty, say in one line that the inbox is empty and how to add ideas, and stop.

## 1. One idea or several?

Several distinct ideas → triage them (ICE 1–10 per playbook 00), write the ranked table to
`ideas/BACKLOG.md`, and take the top N, where N = `max_parallel_products` in `FOUNDER.md`
(default 3) minus products already `active` in `python3 factory/scripts/factory.py portfolio --json`
(minimum 1). Append the rest to `ideas/INBOX.md` under `## Por processar` for the foreman.
Each taken idea goes to step 2 (preferred) or step 3.

## 2. Preferred: one dedicated cloud session per idea

If `mcp__claude-code-remote__create_session` is available (ToolSearch) and `--aqui` was not
given:

1. Working name + slug: `python3 factory/scripts/factory.py slugify "<working name>" --fetch`.
2. Source revision: `git fetch origin main` then `git ls-tree origin/main .claude/workflows/idea-to-product.js`.
   If the file exists use `main`; otherwise the factory is not merged yet → use the current
   branch (`git branch --show-current`).
3. `create_session` with `source_url` = the `origin` remote as `https://github.com/<owner>/<repo>`,
   `source_revision` from 2, `outcome_branch` = `produto/<slug>`, `title` = `🏭 <Working name>`,
   `prompt` = `/ideia <verbatim idea> --aqui --slug <slug> <original flags>`, and `model` =
   `product_session_model` from `FOUNDER.md` unless it is `inherit` (then omit it).
4. Do not create product files here. Tell the founder (pt-PT, a few lines): one line per idea
   with the session link, plus what happens next. If `create_session` fails, use step 3.

## 3. Intake in this session (playbook `factory/playbooks/00-intake.md`)

0. If your instructions name a development branch that is not the one checked out (sessions
   started by `/ideia` begin on the factory revision), create it from the current HEAD first:
   `git checkout -b <that branch>` — all product work goes there.
1. Read `FOUNDER.md`, `factory/LEARNINGS.md` and the playbook.
2. Decide working name, `type` (taxonomy in `factory/PIPELINE.md`), one-liner.
3. `python3 factory/scripts/factory.py new <slug or auto> --name "<name>" --type <type> --idea "<verbatim idea>" --one-liner "<one-liner>" --source <claude|issue:#N|inbox> --branch "$(git branch --show-current)"`
   (add `--depth lean|deep` when a flag locked it). It prints the slug.
4. Write `products/<slug>/docs/00-brief.md` as the playbook says.
5. Idea from the inbox → `python3 factory/scripts/factory.py inbox --take <n> --slug <slug>`.
6. `python3 factory/scripts/factory.py set-phase <slug> intake done --summary "<one-liner>"`,
   then `validate <slug>`; commit `<slug>: intake — <one-liner>`; `git push -u origin HEAD`.

## 4. Open the product PR (the product's home)

- Draft PR from this branch into `main`, title `🏭 <Name> — <one-liner>`. Body in pt-PT:
  a two-line pitch, the status block from
  `python3 factory/scripts/factory.py render-status <slug> --pr`, and "Como acompanhar: comenta
  aqui para dar feedback; o que precisa de ti está em HUMAN_TASKS.md".
- `python3 factory/scripts/factory.py set <slug> links.pr <url>`; commit and push.
- Source was an issue → comment on it with the PR link and add the label `em-curso`.
- Subscribe to the PR's activity so the founder's comments wake this session.

## 5. Run the pipeline

Call the **Workflow** tool with `name: "idea-to-product"` and `args`:

```json
{"slug": "<slug>", "type": "<type>", "depth": "<depth from product.json>", "depth_locked": <true only with --rapido/--fundo>,
 "done": ["intake"], "app_dir": "app", "pr": <PR number or null>, "stop_after": <"research" with --so-validar, else omit>}
```

The founder invoking `/ideia` is the explicit opt-in to this multi-agent workflow (typically
25–45 agents: Sonnet specialists, a Haiku clerk for checkpoints). If it stops with an error,
read its journal, fix the cause and relaunch with `resumeFromRunId`. If the Workflow tool is
not available here, run the phases yourself in `factory/PIPELINE.md` order with the Agent tool
and the specialist subagents (same file ownership), checkpointing after each phase.

## 6. Close the loop

1. Refresh the PR description's status block; add dated one-line lessons to
   `factory/LEARNINGS.md` for anything that failed or was slow; commit and push.
2. Reply in pt-PT, at most ~12 lines: name + one-liner · G1 verdict and score · phases done ·
   preview link if any · founder tasks (top 3 with minutes, link to `HUMAN_TASKS.md`) · what
   happens next automatically. If the `PushNotification` tool exists and founder action is
   needed or the product went live, send a one-line notification.
