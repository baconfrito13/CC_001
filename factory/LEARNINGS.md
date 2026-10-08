# Lessons learned

The factory's active lessons, by phase. Read your phase's section and "Factory" before starting
a phase. `/melhorar` curates this file every week from the products' `docs/lessons.md`: a lesson
folded into a playbook, template, checklist, stack recipe or starter moves to the archive in
`factory/knowledge/improvements.md` (the place it went now carries it). Proven positive patterns
live in `factory/knowledge/patterns.md`; facts with a recheck date in `factory/knowledge/radar.md`.

Format: `- YYYY-MM-DD · <kind> · <lesson> (→ fixed in <file>, if applicable)`; kinds: mistake, win,
method, trend, preference. Keep about 15 per section; add a factory-wide problem here directly.

## Factory (every phase)

- 2026-10-08 · mistake · In Claude Code cloud sessions the GitHub REST API (`api.github.com`) only serves repository-scoped endpoints and `gh` has no valid token: use the GitHub MCP tools for PRs, issues and labels.
- 2026-10-08 · mistake · `rsync` is not installed in cloud sessions: copy starters with `factory.py scaffold` (→ fixed in `05-build.md`, `stacks/web-static.md`, `fullstack-engineer.md`).
- 2026-10-08 · method · Sessions started with `create_session` (from a session that has the tools) get the full toolset — GitHub MCP, create_session, send_later, Workflow, PushNotification — and load the repo's skills, agents and SessionStart hook; they start on `source_revision` and must create their `outcome_branch` themselves (→ `ideia` skill step 3.0).
- 2026-10-08 · mistake · Routines created through the `create_trigger` MCP tool with `create_new_session_on_fire` run WITHOUT connectors: no GitHub MCP, no `add_repo`, no `create_session`, `gh api` 403. A `persistent_session_id` set from another session was ignored by `fire_trigger` (it started a fresh session). Use a routine created by the foreman session itself (self-bound) or one made in the claude.ai Routines UI with the repo selected.
- 2026-10-08 · mistake · Dependabot proposed `@types/node` 22 → 26 while the runtime is Node 22 (engines, CI): type majors must follow the runtime, so its majors are ignored (→ fixed in `.github/dependabot.yml`); move `engines`, CI `node-version` and `@types/node` together.
- 2026-10-08 · mistake · Cloud sessions in "Accept edits" mode ask before any tool call not in `permissions.allow`, and `.claude/settings.json` edits apply to running sessions at once: every tool an unattended run needs must be allowed there (→ fixed in `.claude/settings.json`).

## Research

_None yet._

## Strategy

_None yet._

## Brand

_None yet._

## Architecture

_None yet._

## Build

- 2026-10-08 · mistake · Package majors move fast (Next 16, TypeScript 7, Vitest 5, ESLint 10 as of this date): always check `npm view <pkg> version` and the installed package's docs before writing code; never pin from memory.
- 2026-10-08 · mistake · `create-astro` fails behind the cloud proxy (template download from codeload is blocked): scaffold Astro manually (see `stacks/content.md`). The untouched Expo template fails `tsc` and `expo lint` (see `stacks/mobile.md`).

## QA

- 2026-10-08 · method · Lighthouse 13.5 has no `--chrome-path` flag: use `CHROME_PATH=/opt/pw-browsers/chromium` plus `--chrome-flags="--headless=new --no-sandbox"`; a trivial page scores ~87 mobile performance in the sandbox, so calibrate against a baseline.

## Legal

_None yet._

## GTM

_None yet._

## Launch

- 2026-10-08 · method · Vercel CLI 63: non-interactive linking is `vercel link --yes --project <name> --token $VERCEL_TOKEN` (`--scope <team>` for teams); `vercel deploy --prod` prints the URL on stdout; `vercel project create <name>` exists.
- 2026-10-08 · mistake · Vercel Hobby is non-commercial (includes advertising a product for sale): monetized products go on Vercel Pro (one seat covers every project) or Cloudflare.

## Growth

_None yet._
