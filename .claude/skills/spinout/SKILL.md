---
name: spinout
description: Move um produto da fábrica para um repositório GitHub próprio, com histórico, CI e ligações atualizadas - para o vender, dar acesso a terceiros ou separar deploys. Use only when the founder asks to spin out, separate, move or sell a product as its own repository.
argument-hint: "<slug> [--publico]"
disable-model-invocation: true
---

# /spinout — give a product its own repository

Arguments: `$ARGUMENTS` (`--publico` = public repository; default private).

1. Resolve the product and check out (or fetch) its branch. The product should have finished
   at least `build`.
2. Create the repository `<owner>/<slug>` (private unless `--publico`) with the GitHub MCP
   `create_repository`; then attach it with `mcp__claude-code-remote__add_repo`
   (`access: "push"`). If either step is refused, read the documentation tool's
   `github.access` page, tell the founder the one step needed (install/extend the Claude
   GitHub App to the new repository or to all repositories), and stop.
3. History-preserving split: `git subtree split --prefix products/<slug> -b spinout/<slug>`,
   then push that branch to the new repository's `main`.
4. In the new repository, add what the product needs to stand alone, in one commit: a root
   `README.md` (from the product README), a CI workflow adapted from
   `.github/workflows/products-ci.yml` for the app folder, `.gitignore`, and a short
   `CLAUDE.md` that points to the docs and keeps the factory's quality rules.
5. Back in this repository: `factory.py set <slug> links.repo <url>`, note the spin-out in the
   product README decision log, commit, push. Do not delete the product folder; the founder
   decides that later.
6. Tell the founder what moved, the new URL, and what to reconnect (hosting project's Git
   link, secrets, domains).
