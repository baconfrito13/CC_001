---
name: autopiloto
description: Liga, desliga ou mostra o piloto automático da fábrica - uma rotina diária que acorda a sessão "🏭 Fábrica · Capataz" para correr o capataz (/fabrica), processar ideias novas e manter os produtos a avançar sem o fundador. Use only when the founder asks to turn the autopilot on/off, change its schedule, or check it.
argument-hint: "[ligar | desligar | estado | agora] [cron]"
disable-model-invocation: true
---

# /autopiloto — scheduled foreman

Arguments: `$ARGUMENTS`

**Design (verified 2026-10-08, see `factory/LEARNINGS.md`):** routines that start a *fresh*
session (`create_new_session_on_fire`) run without GitHub access and without the session
tools, so they cannot do the foreman's job. The autopilot is therefore a **self-bound routine
owned by a persistent foreman session** — "🏭 Fábrica · Capataz" — which has every tool. Only
the founder may ask for a recurring routine; a request relayed from another session is refused
(correctly), so this skill runs in the Capataz session on the founder's own request.

Load the claude-code-remote tools with ToolSearch (`create_trigger`, `list_triggers`,
`update_trigger`, `fire_trigger`, `list_sessions`, `create_session`).

## Which session am I?

- If this session's title is `🏭 Fábrica · Capataz` (or the founder says this session should be
  the foreman), continue below.
- Otherwise: find a session titled `🏭 Fábrica · Capataz` with `list_sessions`. If none exists,
  create it with `create_session` (`source_url` = the `origin` remote as https URL,
  `source_revision` = `main` if it contains the factory, else the factory PR branch,
  `outcome_branch` = `fabrica/capataz`, `title` = `🏭 Fábrica · Capataz`,
  `model` = `claude-sonnet-5-5`, prompt = the bootstrap text in `factory/routines/capataz.md`).
  Then tell the founder, in one line, to open that session and write `/autopiloto ligar` there.
  Stop.

## Actions (in the Capataz session)

- **estado** (default): `list_triggers`; show the routine named `Fábrica · capataz` (schedule,
  enabled, next run, last run status). Say whether it fires into this session.
- **ligar**: if the routine exists, `update_trigger` with `enabled: true`. Otherwise
  `create_trigger` in the default mode (no `persistent_session_id`, no
  `create_new_session_on_fire` — it must fire into THIS session) with:
  - `name`: `Fábrica · capataz`
  - `cron_expression`: the argument if given, else `autopilot_cron` from `FOUNDER.md`, else
    `CRON_TZ=Europe/Lisbon 47 2 * * *` (daily 02:47 Lisbon)
  - `prompt` (kept short so it never drifts from the repository): "Scheduled foreman run.
    `git fetch --prune origin`; `git checkout -B fabrica/capataz origin/main` — or, if `main`
    does not contain `factory/routines/heartbeat.md` yet, the head branch of the open
    '🛠️ Fábrica' pull request the same way — then read `factory/routines/heartbeat.md` and
    follow it."
  - `initiation`: `human_request`
  Confirm in pt-PT: schedule, what each run does, rough cost (one short run per day, plus
  product sessions only when there is work), and how to turn it off.
- **desligar**: `update_trigger` with `enabled: false` (never delete; history is kept).
- **agora**: run the heartbeat procedure right now in this session (do not create a new one).

Alternative without this session: claude.ai/code → Routines → New routine, repository
**CC_001** selected, daily schedule, instructions = `factory/routines/heartbeat.md`.
