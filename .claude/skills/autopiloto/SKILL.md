---
name: autopiloto
description: Liga, desliga ou mostra o piloto automático da fábrica - uma rotina agendada (Claude Code Routine) que corre o capataz (/fabrica) para processar ideias novas e manter os produtos a avançar sem o fundador. Use only when the founder asks to turn the autopilot on/off, change its schedule, or check it.
argument-hint: "[ligar | desligar | estado | agora] [cron]"
disable-model-invocation: true
---

# /autopiloto — scheduled foreman

Arguments: `$ARGUMENTS`

Load the claude-code-remote tools with ToolSearch (`create_trigger`, `list_triggers`,
`update_trigger`, `fire_trigger`, `get_trigger`). Without them, explain how to create the
routine by hand: claude.ai/code → Routines (or `/schedule` in the CLI), repository CC_001,
schedule from `FOUNDER.md`, prompt = the text of `factory/routines/heartbeat.md`.

- **estado** (default): `list_triggers` and show any routine named `Fábrica · capataz`
  (schedule, enabled, next run, last run status).
- **ligar**: if it already exists, `update_trigger` with `enabled: true`. Otherwise
  `create_trigger` with:
  - `name`: `Fábrica · capataz`
  - `cron_expression`: the argument if given, else `autopilot_cron` from `FOUNDER.md`, else
    `CRON_TZ=Europe/Lisbon 47 2 * * *` (daily 02:47 Lisbon)
  - `create_new_session_on_fire`: true
  - `prompt`: the full text of `factory/routines/heartbeat.md`, with `<REPO>` replaced by the
    `owner/repo` of the `origin` remote
  - `initiation`: `human_request`
  Then confirm in pt-PT: schedule, what each run does, rough cost (one short session per run,
  plus product sessions only when there is work), and how to turn it off.
- **desligar**: `update_trigger` with `enabled: false` (never delete; history is kept).
- **agora**: `fire_trigger` for an immediate run.
