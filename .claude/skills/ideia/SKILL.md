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

- Flags: `--rapido` → depth `lean` · `--fundo` → depth `deep` · `--so-validar` → stop after
  research · `--aqui` → work in this session (never spawn) · `--slug <slug>` → use this slug
  (set by a parent session).
- **Depth lock:** a flag locks the depth; otherwise a `default_depth` other than `auto` in
  `FOUNDER.md` sets and locks it; otherwise depth `standard`, unlocked (G1 adapts it).
- `#12` or an issue URL → read it with the GitHub MCP (`issue_read`, load via ToolSearch).
  Only process issues **opened by the repository owner**; otherwise say so in one line and
  stop. Claim it at once: add the label `em-curso`. Source = `issue:#12`. Issues from the
  "💡 Nova ideia" form: the idea is "A ideia" plus "Notas"; "Profundidade" Rápida →
  `--rapido`, A fundo → `--fundo`; the "Só validar" checkbox → `--so-validar`.
- No idea text → `python3 factory/scripts/factory.py inbox --json --exclude-taken --fetch`,
  plus open owner issues labeled `na-fila` without `em-curso`. If both are empty, say in one
  line that there is nothing waiting and how to add ideas, and stop.

## 1. One idea or several?

Several distinct ideas → triage them (ICE 1–10 per playbook 00) and take the top N, where
N = `max_parallel_products` in `FOUNDER.md` (default 3) minus products `active` in
`python3 factory/scripts/factory.py portfolio --json` minus product sessions already running
(`list_sessions`, titles starting with `🏭`), minimum 1. Queue every other idea as a GitHub
issue (GitHub MCP `issue_write`): title `💡 <first 60 characters>`, body = the verbatim idea
plus its ICE line, label `na-fila`. Never write queued ideas into `ideas/` files from a session
branch — they would never reach `main`. Slugs chosen in one batch must be distinct.

## 2. Preferred: one dedicated cloud session per idea

If `mcp__claude-code-remote__create_session` is available (ToolSearch) and `--aqui` was not
given:

1. Working name + slug: `python3 factory/scripts/factory.py slugify "<working name>" --fetch`.
2. Factory revision: `git fetch origin main`; if
   `git ls-tree origin/main .claude/workflows/idea-to-product.js` prints a line, use `main`.
   Otherwise use the head branch of the open pull request titled `🛠️ Fábrica…` (GitHub MCP
   `list_pull_requests`). Never use a branch that exists only locally; if there is no such PR,
   `git push -u origin HEAD` and use the current branch.
3. `create_session` with `source_url` = the `origin` remote as `https://github.com/<owner>/<repo>`,
   `source_revision` from 2, `outcome_branch` = `produto/<slug>`,
   `title` = `🏭 <slug> · <Working name>`,
   `prompt` = `/ideia <verbatim idea, or #N for an issue> --aqui --slug <slug> <original flags>`,
   and `model` = `product_session_model` from `FOUNDER.md` unless it is `inherit`.
4. Do not create product files here. Tell the founder (pt-PT, a few lines): one line per idea
   with the session link, the queued ones, and what happens next. If `create_session` fails,
   use step 3.

## 3. Intake in this session (playbook `factory/playbooks/00-intake.md`)

0. If your instructions name a development branch that is not the one checked out (sessions
   started by `/ideia` begin on the factory revision), create it from the current HEAD first:
   `git checkout -b <that branch>` — all product work goes there.
1. Read `FOUNDER.md`, `factory/LEARNINGS.md` and the playbook.
2. Decide working name, `type` (taxonomy in `factory/PIPELINE.md`), one-liner.
3. `python3 factory/scripts/factory.py new <slug or auto> --name "<name>" --type <type> --idea "<verbatim idea>" --one-liner "<one-liner>" --source <claude|issue:#N|inbox> --branch "$(git branch --show-current)"`
   — add `--depth <d> --lock-depth` when the depth is locked (step 0). It prints the slug.
4. Record this session: `python3 factory/scripts/factory.py set <slug> links.session https://claude.ai/code/<session id>`
   (the id comes from `mcp__claude-code-remote__get_session` called without arguments).
5. Write `products/<slug>/docs/00-brief.md` as the playbook says. Do not edit `ideas/` files:
   the foreman recognises processed inbox ideas by their text.
6. `python3 factory/scripts/factory.py set-phase <slug> intake done --summary "<one-liner>"`,
   then `validate <slug>`; commit `<slug>: intake — <one-liner>`; `git push -u origin HEAD`.

## 4. Open the product PR (the product's home)

- Draft PR from this branch into `main`, title `🏭 <Name> — <one-liner>`. Body in pt-PT:
  a two-line pitch, the status block from
  `python3 factory/scripts/factory.py render-status <slug> --pr`, and "Como acompanhar: comenta
  aqui para dar feedback; o que precisa de ti está em HUMAN_TASKS.md".
- `python3 factory/scripts/factory.py set <slug> links.pr <url>`; commit and push.
- Source was an issue → comment the PR link on it (comment starts with `<!-- factory:bot -->`).
- Subscribe to the PR's activity. Act on CI failures and on owner comments without the bot
  marker; CI-success notices need no action.

## 5. Run the pipeline

Call the **Workflow** tool with `name: "idea-to-product"` and `args`:

```json
{"slug": "<slug>", "type": "<type>", "depth": "<product.json depth>", "depth_locked": <product.json depth_locked>,
 "done": ["intake"], "app_dir": "app", "pr": <PR number or null>, "stop_after": <"research" with --so-validar, else omit>}
```

The founder invoking `/ideia` (directly or through the foreman they set up) is the opt-in to
this multi-agent workflow (typically 25–45 agents: Sonnet specialists, a Haiku clerk). If the
Workflow tool is not available here, run the phases yourself in `factory/PIPELINE.md` order
with the Agent tool and the specialist subagents (same file ownership), checkpointing after
each phase. Then act on `result.stopped`:

| `stopped` | What it means | Next |
|---|---|---|
| none / `waiting-founder` | ready to launch; waiting on founder tasks | report the tasks; done for now |
| `kill` | G1 failed | report the verdict and the 3 alternative angles; the founder decides (`/continuar <slug> --forcar`, reply "arquivar" or "ângulo N") |
| `stop_after` | `--so-validar` finished; product paused | report the verdict |
| `qa-blocked`, `build-failed` | the phase is marked blocked | report the blocking items; never relaunch automatically |
| `incomplete` | a phase before launch failed | run `/continuar <slug> --aqui` once; if it fails again, report |
| workflow error | a step threw (e.g. a checkpoint could not push) | read its journal, fix the cause, resume once with `resumeFromRunId`; if it fails again, report |

## 6. Close the loop

1. Refresh the PR description's status block; add dated one-line lessons for anything that
   failed or was slow to `products/<slug>/docs/lessons.md`; commit and push.
2. Reply in pt-PT, at most ~12 lines: name + one-liner · G1 verdict and score · phases done ·
   preview link if any · founder tasks (top 3 with minutes, link to `HUMAN_TASKS.md`) · what
   happens next automatically. If the `PushNotification` tool exists and founder action is
   needed or the product went live, send a one-line notification.
