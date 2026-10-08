#!/usr/bin/env bash
# SessionStart hook: show the factory state at the start of every session, give agents a
# scratch directory ($SCRATCH), and, in Claude Code cloud sessions, install dependencies for
# the product apps this branch works on so tests run at once. Output is added to Claude's
# context, so keep it short.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$root" || exit 0
[ -f factory/scripts/factory.py ] || exit 0

branch="$(git branch --show-current 2>/dev/null || echo '?')"
echo "🏭 Fábrica de Produtos · branch ${branch}"
python3 factory/scripts/factory.py status 2>/dev/null | head -25

pending="$(python3 factory/scripts/factory.py inbox --json 2>/dev/null \
  | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null || echo 0)"
echo "💡 Ideias na caixa (ideas/INBOX.md): ${pending} · /ideia /continuar /portfolio /fabrica /lancar /crescer"

# Scratch space for playbooks ($SCRATCH): outside the repo, one per session.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  scratch="${TMPDIR:-/tmp}/factory-scratch-${CLAUDE_CODE_REMOTE_SESSION_ID:-$$}"
  mkdir -p "$scratch" && echo "export SCRATCH=\"$scratch\"" >> "$CLAUDE_ENV_FILE"
fi

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  # Only the apps this branch changed relative to main (a product branch's own product).
  base="origin/main"
  git rev-parse --verify --quiet "$base" >/dev/null || base="$(git rev-list --max-parents=0 HEAD | tail -n 1)"
  dirs="$(python3 factory/scripts/factory.py changed --base "$base" --head HEAD 2>/dev/null \
    | python3 -c 'import json,sys; print("\n".join(d for d in json.load(sys.stdin) if d.startswith("products/")))' 2>/dev/null)"
  for dir in $dirs; do
    if [ -f "$dir/package-lock.json" ] && [ ! -d "$dir/node_modules" ]; then
      if (cd "$dir" && timeout 240 npm ci --no-audit --no-fund --loglevel=error >/dev/null 2>&1); then
        echo "📦 dependências instaladas: $dir"
      else
        echo "⚠️ npm ci falhou ou excedeu o tempo em $dir — corre-o manualmente"
      fi
    fi
  done
fi
exit 0
