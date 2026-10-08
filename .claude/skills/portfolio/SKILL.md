---
name: portfolio
description: Mostra o estado de todos os produtos da fábrica (em todos os branches), o que precisa do fundador e o que está na fila. Use when the founder asks how things are going, "como estão os produtos", "o que falta", "o que preciso de fazer", or for a daily/weekly digest.
argument-hint: "[--publicar]"
---

# /portfolio — the factory at a glance

Arguments: `$ARGUMENTS`

1. `python3 factory/scripts/factory.py portfolio --fetch` — every product on every branch
   (the copy with the newest commit wins). Use `--json` for the data: it includes blocked
   phases, founder-task counts, the G1 decision and links.
2. For each product with open founder tasks, read its `HUMAN_TASKS.md` from its branch
   (`git show origin/<branch>:products/<slug>/HUMAN_TASKS.md`) and keep the open `- [ ]`
   items with their time estimates.
3. Waiting ideas: `python3 factory/scripts/factory.py inbox --json --exclude-taken`, plus open
   issues labeled `ideia` or `na-fila` without `em-curso`, opened by the repository owner.
4. If `mcp__claude-code-remote__list_sessions` is available, note which product sessions
   (titles starting with `🏭`) are running, idle or failed.
5. Answer in pt-PT:
   - **Produtos** — the table (name, state, phase, progress, G1 score, links).
   - **O que precisa de ti** — grouped by product, most urgent first (🔴 then 🟡), each with
     minutes and a link; total time; plus products stopped on a blocked phase, a pause or a
     KILL verdict, with the decision needed.
   - **Na fila** — ideas waiting, in ICE order where known.
   - **A seguir (automático)** — what the factory will do next without the founder.
6. With `--publicar`, also write the same digest into the issue titled
   `📊 Portfólio da Fábrica` (create it if missing, label `portfolio`), replacing its body, and
   keep its `Último capataz:` line. No tool can pin issues: the founder pins it once on GitHub.
