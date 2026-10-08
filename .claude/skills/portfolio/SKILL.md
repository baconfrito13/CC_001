---
name: portfolio
description: Mostra o estado de todos os produtos da fábrica (em todos os branches), o que precisa do fundador e o que está na fila. Use when the founder asks how things are going, "como estão os produtos", "o que falta", "o que preciso de fazer", or for a daily/weekly digest.
argument-hint: "[--publicar]"
---

# /portfolio — the factory at a glance

Arguments: `$ARGUMENTS`

1. `python3 factory/scripts/factory.py portfolio --fetch` — every product on every branch
   (the newest copy of each wins). Use `--json` when you need the data.
2. For each product with open founder tasks, read its `HUMAN_TASKS.md` from its branch
   (`git show origin/<branch>:products/<slug>/HUMAN_TASKS.md`) and keep the open `- [ ]`
   items with their time estimates.
3. Inbox: `python3 factory/scripts/factory.py inbox --json --exclude-taken`, plus GitHub issues
   labeled `ideia` without `em-curso` (GitHub MCP `list_issues`) opened by the repo owner.
4. If `mcp__claude-code-remote__list_sessions` is available, note which product sessions
   (titles starting with `🏭`) are running, idle or failed.
5. Answer in pt-PT:
   - **Produtos** — the table (name, state, phase, progress, G1 score, links).
   - **O que precisa de ti** — grouped by product, most urgent first (🔴 then 🟡), each with
     minutes and a link; total time.
   - **Na fila** — ideas waiting, in backlog order.
   - **A seguir (automático)** — what the factory will do next without the founder.
6. With `--publicar`, also write the same digest into the pinned issue titled
   `📊 Portfólio da Fábrica` (create it if missing, label `portfolio`), replacing its body.
