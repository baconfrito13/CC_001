---
name: continuar
description: Retoma e avança um produto da fábrica a partir da fase onde ficou (ou repete uma fase), aplicando primeiro o feedback do fundador. Use when the founder says continuar/avança/retoma/segue, after founder tasks are done, when a product session is woken up by the foreman or a PR comment, or to re-run one phase.
argument-hint: "[slug] [--fase <id>] [--forcar] [--rapido | --fundo] [--aqui]"
---

# /continuar — resume a product

Arguments: `$ARGUMENTS`

## 1. Which product?

1. A slug in the arguments wins. Otherwise the product on this branch: the
   `products/*/product.json` whose `links.branch` equals `git branch --show-current`. Otherwise
   the first `active` row of `python3 factory/scripts/factory.py next --json`.
2. If the product is not in this checkout, find its branch with
   `python3 factory/scripts/factory.py portfolio --fetch --json`. When `--aqui` was not given
   and `mcp__claude-code-remote__create_session` is available, continue it in its own session:
   prefer `send_message` to the product's existing session (`links.session`, if it is idle and
   not archived) with `/continuar <slug> --aqui`; otherwise `create_session` with
   `source_revision` = that branch, `outcome_branch` = that branch, title `🏭 <Name>`, prompt
   `/continuar <slug> --aqui`. Report the link and stop. If neither is possible, say which
   branch holds the product and stop.

## 2. Sync and apply founder feedback first

- `git pull --ff-only` (if it fails, fetch and merge the remote branch; never rebase or
  force-push a shared branch). Then `git fetch origin main` and, if `origin/main` has commits
  this branch lacks, `git merge origin/main` (picks up factory improvements and keeps the PR
  diff limited to the product); resolve conflicts keeping both sides' intent, commit, push.
- Read `product.json`, `HUMAN_TASKS.md`, `docs/` for the current phase, and — if `links.pr`
  exists — the PR's comments and reviews since the last factory commit (GitHub MCP
  `pull_request_read`). Founder requests come first: implement them with the right specialist
  agent, reply briefly on the PR (pt-PT), commit and push.
- Record this session: `python3 factory/scripts/factory.py set <slug> links.session <session url>`
  when you know it.

## 3. Founder tasks and status

- `status: needs-founder` → check which blocking tasks are now `[x]` (or the founder said they
  are done). All blocking tasks done → `python3 factory/scripts/factory.py set <slug> status active`.
  Still blocked → continue only work that does not depend on them.
- A KILL verdict continues only with `--forcar`.

## 4. Run the pipeline

Call the **Workflow** tool with `name: "idea-to-product"` and `args` built from `product.json`:

```json
{"slug": "<slug>", "type": "<type>", "depth": "<depth>", "depth_locked": <true if --rapido/--fundo given, after setting depth>,
 "done": [<phases whose status is done or skipped>], "app_dir": "<stack.app_dir>", "pr": <number from links.pr or null>,
 "force": <true with --forcar>, "only": [<the --fase id, if given>]}
```

With `--rapido`/`--fundo` first run `python3 factory/scripts/factory.py set <slug> depth lean|deep`.
The founder invoking `/continuar` is the opt-in to this multi-agent workflow. If the Workflow
tool is unavailable, run the remaining phases yourself in `factory/PIPELINE.md` order with the
specialist subagents, checkpointing after each phase. On failure, fix and resume with
`resumeFromRunId`.

## 5. Close the loop

Same as `/ideia` step 6: refresh the PR status block, add lessons to `factory/LEARNINGS.md`,
reply in pt-PT (≤ 12 lines: what advanced, verdicts, links, founder tasks with minutes, next
automatic step), push notification when founder action is needed or the product went live.
