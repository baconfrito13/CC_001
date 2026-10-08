# Founder dashboard — Painel da Fábrica

> **pt-PT:** o painel da fábrica está em https://claude.ai/artifact/R8Eqjh67MTbGhDDuA5qPqe —
> privado (só tu o abres, com a tua conta Claude). Mostra todas as ideias e produtos, a fase de
> cada um, o que precisa de ti, estatísticas, o que a fábrica aprendeu e as sessões a trabalhar
> ao vivo. Atualiza-se sozinho a cada fase concluída; para forçar, escreve `/painel` numa sessão.

URL: https://claude.ai/artifact/R8Eqjh67MTbGhDDuA5qPqe

A private Claude artifact, not GitHub Pages: a Pages site would publish the founder's ideas and
plans to anyone with the link (and needs a paid plan for a private repository), and a static
page could not show live session status. `painel.html` in this folder is the page's source.

## How it gets its data

| Source | What | Freshness |
|---|---|---|
| Artifact store, `state/summary` | factory totals, pipeline, the `ideas/INBOX.md` ideas not yet taken, knowledge base (learnings, patterns, radar, suggestions, scoreboard) | every refresh |
| Artifact store, `state/queue` | the owner's open issues labeled `ideia`/`na-fila` without `em-curso` | the foreman and `/painel` |
| Artifact store, `products/<slug>` | one document per product: status, phases with dates and summaries, G1 decision, metrics, phase hours, open founder tasks, lesson counts by kind, links, document paths, stack | every refresh |
| `Claude Code Remote` connector (`list_sessions`), called by the page as the viewer | live state of the factory's sessions | every minute while open |

`python3 factory/scripts/factory.py dashboard` builds the documents from every branch (the same
scan as `portfolio`) and from `origin/main` for the inbox and the knowledge base; it never copies
lesson texts, personal or customer data (CLAUDE.md, Confidentiality) — only counts. It deletes the
document of a product no branch has any more only after a fetch that worked and found products.
A session writes the documents with the `ArtifactData` tool, as the founder's account, following
`.claude/skills/painel/SKILL.md`. Who refreshes:

- after every saved phase checkpoint of the idea-to-product workflow, a separate best-effort clerk
  call (it never fails the checkpoint and leaves the queue alone);
- `/ideia` and `/continuar` when they finish, the foreman (`/fabrica`) on every run;
- `/painel` on demand.

`ArtifactData` is in the allow list so unattended refreshes never stall; the `artifact-guard`
hook (`.claude/settings.json` → `factory.py artifact-guard`) limits that to reads and batches on
this URL, and any other use of the tool asks the founder. A refresh failure never stops the
factory: the page shows how old its data is and turns amber after 26 hours.

## Changing the page

1. Edit `painel.html`. Keep the page contract: no `<html>`/`<head>`/`<body>`, `<title>` and
   `<style>` first, theme tokens with the dark-mode block repeated for `[data-theme="dark"]`,
   Google Fonts only, all text set with `textContent` (store data is untrusted), links only
   `https://`.
2. Test it locally with Playwright and a mocked `window.claude` (fake `db` and `mcp`) at
   1440 px and 400 px, light and dark; no horizontal scroll, no console errors.
3. Publish with the `Artifact` tool passing `url` = the URL above (read it first with
   `action: "read"`; a publish without `url` creates a second dashboard). Omit `capabilities` to
   keep the stored ones: `db` rules `[{"path": "", "read": "view", "write": "admin"}]` and
   `mcp` `{"servers": [{"server": "Claude Code Remote", "tools": ["list_sessions"]}]}`.
4. Changing the document shape: change `dashboard_data` in `factory.py`, its test, and the
   page's `normProduct` together; old documents are replaced on the next refresh.
5. Moving the dashboard to a new artifact: change the `URL:` line above in the same pull
   request (the skill, the guard and the README links read it).
