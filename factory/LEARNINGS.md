# Lessons learned

Append-only. One dated line per lesson, newest at the bottom, written by whoever hit the
problem. Every agent reads this before starting a phase. When a lesson reveals a process gap,
also fix the playbook/template it belongs to (in a `🛠️ Fábrica:` PR) and note "→ fixed in …".

Format: `- YYYY-MM-DD · <phase> · <lesson> (→ fixed in <file>, if applicable)`

- 2026-10-08 · build · Package majors move fast (Next 16, TypeScript 7, Vitest 5, ESLint 10 as of this date): always check `npm view <pkg> version` and the installed package's docs before writing code; never pin from memory.
- 2026-10-08 · launch · Vercel CLI 63: non-interactive linking is `vercel link --yes --project <name> --token $VERCEL_TOKEN` (`--scope <team>` for teams); `vercel deploy --prod` prints the URL on stdout; `vercel project create <name>` exists.
- 2026-10-08 · factory · In Claude Code cloud sessions the GitHub REST API (`api.github.com`) only serves repository-scoped endpoints and `gh` has no valid token: use the GitHub MCP tools for PRs, issues and labels.
