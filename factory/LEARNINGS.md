# Lessons learned

Append-only. One dated line per lesson, newest at the bottom, written by whoever hit the
problem. Every agent reads this before starting a phase. When a lesson reveals a process gap,
also fix the playbook/template it belongs to (in a `🛠️ Fábrica:` PR) and note "→ fixed in …".

Format: `- YYYY-MM-DD · <phase> · <lesson> (→ fixed in <file>, if applicable)`

- 2026-10-08 · build · Package majors move fast (Next 16, TypeScript 7, Vitest 5, ESLint 10 as of this date): always check `npm view <pkg> version` and the installed package's docs before writing code; never pin from memory.
- 2026-10-08 · launch · Vercel CLI 63: non-interactive linking is `vercel link --yes --project <name> --token $VERCEL_TOKEN` (`--scope <team>` for teams); `vercel deploy --prod` prints the URL on stdout; `vercel project create <name>` exists.
- 2026-10-08 · factory · In Claude Code cloud sessions the GitHub REST API (`api.github.com`) only serves repository-scoped endpoints and `gh` has no valid token: use the GitHub MCP tools for PRs, issues and labels.
- 2026-10-08 · factory · `rsync` is not installed in cloud sessions: copy starters with `factory.py scaffold` (→ fixed in `05-build.md`, `stacks/web-static.md`, `fullstack-engineer.md`).
- 2026-10-08 · factory · Sessions started with `create_session` (from a session that has the tools) get the full toolset — GitHub MCP, create_session, send_later, Workflow, PushNotification — and load the repo's skills, agents and SessionStart hook; they start on `source_revision` and must create their `outcome_branch` themselves (→ `ideia` skill step 3.0).
- 2026-10-08 · factory · Routines created through the `create_trigger` MCP tool with `create_new_session_on_fire` run WITHOUT connectors: no GitHub MCP, no `add_repo`, no `create_session`, `gh api` 403. A `persistent_session_id` set from another session was ignored by `fire_trigger` (it started a fresh session). Use a routine created by the foreman session itself (self-bound) or one made in the claude.ai Routines UI with the repo selected.
- 2026-10-08 · qa · Lighthouse 13.5 has no `--chrome-path` flag: use `CHROME_PATH=/opt/pw-browsers/chromium` plus `--chrome-flags="--headless=new --no-sandbox"`; a trivial page scores ~87 mobile performance in the sandbox, so calibrate against a baseline.
- 2026-10-08 · build · `create-astro` fails behind the cloud proxy (template download from codeload is blocked): scaffold Astro manually (see `stacks/content.md`). The untouched Expo template fails `tsc` and `expo lint` (see `stacks/mobile.md`).
- 2026-10-08 · launch · Vercel Hobby is non-commercial (includes advertising a product for sale): monetized products go on Vercel Pro (one seat covers every project) or Cloudflare.
