#!/usr/bin/env python3
"""Factory product-state CLI (stdlib only).

The single way to create products and change their state. Agents and humans both use it:

    python3 factory/scripts/factory.py new auto --name "Recibos Fáceis" --type web-saas --idea "..."
    python3 factory/scripts/factory.py status
    python3 factory/scripts/factory.py set-phase <slug> research done --summary "GO 3.9"
    python3 factory/scripts/factory.py set <slug> links.preview https://example.vercel.app
    python3 factory/scripts/factory.py validate [<slug> ...]
    python3 factory/scripts/factory.py render-status <slug> [--write] [--pr]
    python3 factory/scripts/factory.py inbox [--take N --slug S] [--exclude-taken]
    python3 factory/scripts/factory.py portfolio [--fetch] [--json]   # every branch
    python3 factory/scripts/factory.py scaffold <slug> [--starter web] [--dir app]
    python3 factory/scripts/factory.py next
    python3 factory/scripts/factory.py changed --base origin/main
    python3 factory/scripts/factory.py doctor

Set FACTORY_ROOT to operate on another checkout and FACTORY_TODAY (YYYY-MM-DD) to pin dates.
"""

from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path
from typing import Any

SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
STATUS_START = "<!-- factory:status:start -->"
STATUS_END = "<!-- factory:status:end -->"

PHASE_ICONS = {
    "pending": "⬜",
    "in_progress": "🔄",
    "done": "✅",
    "skipped": "⏭️",
    "blocked": "⛔",
}
PRODUCT_STATUS_LABELS = {
    "active": "🟢 ativo",
    "needs-founder": "🟡 precisa de ti",
    "paused": "⏸️ em pausa",
    "killed": "🔴 descartado",
    "launched": "🚀 lançado",
}
DEPTHS = ("lean", "standard", "deep")
TYPES = (
    "web-static",
    "web-saas",
    "ai-app",
    "api",
    "mobile",
    "extension",
    "ecommerce",
    "content",
    "bot",
    "desktop",
    "other",
)
SOURCE_CHANNELS = ("claude", "issue", "inbox", "action", "other")

# Environment variables that unlock autonomous work, and what each one unlocks.
DOCTOR_ENV = [
    ("VERCEL_TOKEN", "deploy web apps to Vercel (preview + production)"),
    ("CLOUDFLARE_API_TOKEN", "deploy to Cloudflare Workers/Pages, manage DNS"),
    ("CLOUDFLARE_ACCOUNT_ID", "required together with CLOUDFLARE_API_TOKEN"),
    ("SUPABASE_ACCESS_TOKEN", "create/manage Supabase projects (Postgres, Auth, Storage)"),
    ("STRIPE_SECRET_KEY", "Stripe products/prices/checkout, direct or Managed Payments (test key: sk_test_…)"),
    ("POLAR_ACCESS_TOKEN", "create Merchant-of-Record products and checkout links on Polar"),
    ("PADDLE_API_KEY", "create Merchant-of-Record products on Paddle (MB WAY)"),
    ("RESEND_API_KEY", "transactional email + waitlist contacts"),
    ("SENTRY_AUTH_TOKEN", "create Sentry projects, upload source maps"),
    ("POSTHOG_PERSONAL_API_KEY", "read product analytics for growth cycles"),
    ("PLAUSIBLE_API_KEY", "read web analytics for growth cycles"),
    ("EXPO_TOKEN", "build and submit mobile apps with EAS"),
    ("ANTHROPIC_API_KEY", "runtime key for AI features while testing AI products"),
]
DOCTOR_TOOLS = ["node", "npm", "npx", "pnpm", "bun", "python3", "git", "gh", "vercel", "wrangler", "supabase", "eas", "docker"]


# --------------------------------------------------------------------------- utilities


class FactoryError(Exception):
    """A user-facing error: printed without a traceback, exit code 1."""


def repo_root(cli_root: str | None = None) -> Path:
    if cli_root:
        return Path(cli_root).resolve()
    env = os.environ.get("FACTORY_ROOT")
    if env:
        return Path(env).resolve()
    return Path(__file__).resolve().parents[2]


def today() -> str:
    pinned = os.environ.get("FACTORY_TODAY")
    if pinned:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", pinned):
            raise FactoryError(f"FACTORY_TODAY must be YYYY-MM-DD, got {pinned!r}")
        return pinned
    return dt.date.today().isoformat()


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise FactoryError(f"missing file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise FactoryError(f"invalid JSON in {path}: {exc}") from exc


def write_json(path: Path, data: Any) -> None:
    """Atomic write: readers never see a half-written file, a crash never truncates it."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


@contextlib.contextmanager
def repo_lock(root: Path):
    """Serialize factory.py commands on one checkout (parallel agents call `set` concurrently)."""
    lock_dir = root / ".git" if (root / ".git").is_dir() else Path(tempfile.gettempdir())
    with open(lock_dir / "factory.lock", "w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)
    if len(slug) > 40:
        slug = slug[:40].rstrip("-")
    return slug or "produto"


def strip_html_comments(text: str) -> str:
    return re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)


# --------------------------------------------------------------------------- schema


def validate_schema(instance: Any, schema: dict, root_schema: dict | None = None, path: str = "$") -> list[str]:
    """Validate against the JSON-Schema subset used by factory/schemas (no external deps)."""
    root_schema = root_schema or schema
    if "$ref" in schema:
        ref = schema["$ref"]
        if not ref.startswith("#/"):
            return [f"{path}: unsupported $ref {ref}"]
        target: Any = root_schema
        for part in ref[2:].split("/"):
            target = target[part]
        return validate_schema(instance, target, root_schema, path)

    errors: list[str] = []
    expected = schema.get("type")
    if expected is not None:
        types = expected if isinstance(expected, list) else [expected]
        if not any(_is_type(instance, t) for t in types):
            return [f"{path}: expected {'/'.join(types)}, got {type(instance).__name__}"]

    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: {instance!r} is not one of {schema['enum']}")

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            errors.append(f"{path}: shorter than {schema['minLength']}")
        if "maxLength" in schema and len(instance) > schema["maxLength"]:
            errors.append(f"{path}: longer than {schema['maxLength']}")
        if "pattern" in schema and not re.search(schema["pattern"], instance):
            errors.append(f"{path}: {instance!r} does not match {schema['pattern']}")

    if _is_type(instance, "number"):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: {instance} < minimum {schema['minimum']}")
        if "maximum" in schema and instance > schema["maximum"]:
            errors.append(f"{path}: {instance} > maximum {schema['maximum']}")

    if isinstance(instance, dict):
        props = schema.get("properties", {})
        for key in schema.get("required", []):
            if key not in instance:
                errors.append(f"{path}: missing required '{key}'")
        for key, value in instance.items():
            if key in props:
                errors.extend(validate_schema(value, props[key], root_schema, f"{path}.{key}"))
            elif schema.get("additionalProperties") is False:
                errors.append(f"{path}: unexpected property '{key}'")

    if isinstance(instance, list) and "items" in schema:
        for i, item in enumerate(instance):
            errors.extend(validate_schema(item, schema["items"], root_schema, f"{path}[{i}]"))
    return errors


def _is_type(value: Any, name: str) -> bool:
    if name == "object":
        return isinstance(value, dict)
    if name == "array":
        return isinstance(value, list)
    if name == "string":
        return isinstance(value, str)
    if name == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if name == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if name == "boolean":
        return isinstance(value, bool)
    if name == "null":
        return value is None
    return False


# --------------------------------------------------------------------------- model


class Factory:
    def __init__(self, root: Path):
        self.root = root
        self.phases: list[dict] = read_json(root / "factory" / "phases.json")["phases"]
        self.phase_ids = [p["id"] for p in self.phases]
        self.schema: dict = read_json(root / "factory" / "schemas" / "product.schema.json")

    # paths ------------------------------------------------------------------
    @property
    def products_dir(self) -> Path:
        return self.root / "products"

    def product_dir(self, slug: str) -> Path:
        return self.products_dir / slug

    def slugs(self) -> list[str]:
        if not self.products_dir.is_dir():
            return []
        return sorted(p.name for p in self.products_dir.iterdir() if (p / "product.json").is_file())

    # load/save --------------------------------------------------------------
    def load(self, slug: str) -> dict:
        path = self.product_dir(slug) / "product.json"
        if not path.is_file():
            known = ", ".join(self.slugs()) or "none"
            raise FactoryError(f"unknown product '{slug}' (known: {known})")
        return read_json(path)

    def save(self, product: dict, touch: bool = True) -> None:
        if touch:
            product["updated"] = today()
        errors = validate_schema(product, self.schema)
        if errors:
            raise FactoryError("refusing to save invalid product.json:\n  " + "\n  ".join(errors))
        write_json(self.product_dir(product["slug"]) / "product.json", product)

    # phases -----------------------------------------------------------------
    def phase(self, phase_id: str) -> dict:
        for p in self.phases:
            if p["id"] == phase_id:
                return p
        raise FactoryError(f"unknown phase '{phase_id}' (valid: {', '.join(self.phase_ids)})")

    def current_phase(self, product: dict) -> str:
        """Earliest phase (in pipeline order) that is not done or skipped."""
        for pid in self.phase_ids:
            if product["phases"][pid]["status"] not in ("done", "skipped"):
                return pid
        return self.phase_ids[-1]

    def required_outputs(self, product: dict, phase_id: str) -> list[str]:
        app_dir = product.get("stack", {}).get("app_dir") or "app"
        return [o.replace("{app_dir}", app_dir) for o in self.phase(phase_id)["outputs"]]

    def missing_outputs(self, product: dict, phase_id: str) -> list[str]:
        base = self.product_dir(product["slug"])
        missing = []
        for rel in self.required_outputs(product, phase_id):
            target = base / rel.rstrip("/")
            if rel.endswith("/"):
                # A directory output needs at least one real file somewhere under it
                # (`new` pre-creates empty folders such as legal/public/).
                if not target.is_dir() or not any(p.is_file() for p in target.rglob("*")):
                    missing.append(rel)
            elif not target.is_file() or target.stat().st_size == 0:
                missing.append(rel)
        return missing

    # human tasks ----------------------------------------------------------------
    def human_tasks(self, slug: str) -> tuple[int, int]:
        path = self.product_dir(slug) / "HUMAN_TASKS.md"
        if not path.is_file():
            return (0, 0)
        return count_tasks(path.read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- commands


def cmd_new(fx: Factory, args: argparse.Namespace) -> int:
    slug = args.slug
    if slug == "auto":
        base = slugify(args.name)
        slug, n = base, 2
        while fx.product_dir(slug).exists():
            slug, n = f"{base}-{n}", n + 1
    if not SLUG_RE.match(slug) or len(slug) > 48:
        raise FactoryError(f"invalid slug '{slug}': use kebab-case [a-z0-9-], max 48 chars")
    if fx.product_dir(slug).exists():
        raise FactoryError(f"products/{slug} already exists")

    source_channel, source_ref = "claude", None
    if args.source:
        source_channel, _, ref = args.source.partition(":")
        source_ref = ref or None
        if source_channel not in SOURCE_CHANNELS:
            raise FactoryError(f"--source channel must be one of {SOURCE_CHANNELS}")

    date = today()
    phases = {pid: {"status": "pending"} for pid in fx.phase_ids}
    phases["intake"] = {"status": "in_progress", "started": date}
    product = {
        "schema_version": 1,
        "slug": slug,
        "name": args.name,
        "one_liner": args.one_liner or "",
        "idea": args.idea,
        "type": args.type,
        "status": "active",
        "phase": "intake",
        "depth": args.depth,
        "depth_locked": bool(args.lock_depth),
        "phases": phases,
        "decision": None,
        "stack": {
            "recipe": None,
            "app_dir": "app",
            "components": [],
            "hosting": None,
            "payments": None,
            "database": None,
            "auth": None,
        },
        "links": {
            "branch": args.branch,
            "pr": None,
            "issue": source_ref if source_channel == "issue" else None,
            "session": None,
            "preview": None,
            "production": None,
            "domain": None,
            "repo": None,
        },
        "source": {"channel": source_channel, "ref": source_ref},
        "created": date,
        "updated": date,
    }

    pdir = fx.product_dir(slug)
    for sub in ("docs/research", "docs/adr", "brand", "legal/public", "marketing"):
        (pdir / sub).mkdir(parents=True, exist_ok=True)
    fx.save(product, touch=False)

    replacements = {
        "{{slug}}": slug,
        "{{name}}": args.name,
        "{{one_liner}}": args.one_liner or "",
        "{{idea}}": args.idea,
        "{{type}}": args.type,
        "{{date}}": date,
    }
    templates = fx.root / "factory" / "templates"
    _render_template(templates / "product-README.md", pdir / "README.md", replacements, _fallback_readme(product))
    _render_template(templates / "HUMAN_TASKS.md", pdir / "HUMAN_TASKS.md", replacements, _fallback_human_tasks(product))
    _render_template(templates / "brief.md", pdir / "docs" / "00-brief.md", replacements, _fallback_brief(product))
    _write_status_block(fx, product, pdir / "README.md", for_pr=False)
    print(slug)
    return 0


def _render_template(src: Path, dst: Path, replacements: dict[str, str], fallback: str) -> None:
    text = src.read_text(encoding="utf-8") if src.is_file() else fallback
    for key, value in replacements.items():
        text = text.replace(key, value)
    dst.write_text(text, encoding="utf-8")


def _fallback_readme(product: dict) -> str:
    return (
        f"# {product['name']}\n\n> {product.get('one_liner') or product['idea']}\n\n"
        f"{STATUS_START}\n{STATUS_END}\n\n## Decisões\n\n| Data | Decisão | Porquê |\n|---|---|---|\n"
    )


def _fallback_human_tasks(product: dict) -> str:
    return (
        f"# Tarefas do fundador — {product['name']}\n\n"
        "> Só ações que só tu podes fazer. Tudo o resto avança automaticamente.\n\n"
        "## 🔴 Bloqueiam o lançamento\n\n## 🟡 Antes do lançamento\n\n## 🟢 Depois / opcional\n"
    )


def _fallback_brief(product: dict) -> str:
    return f"# Brief — {product['name']}\n\n## Ideia original (palavras do fundador)\n\n> {product['idea']}\n"


def cmd_status(fx: Factory, args: argparse.Namespace) -> int:
    rows = []
    for slug in fx.slugs():
        p = fx.load(slug)
        open_tasks, _ = fx.human_tasks(slug)
        done = sum(1 for pid in fx.phase_ids if p["phases"][pid]["status"] in ("done", "skipped"))
        decision = p.get("decision") or {}
        rows.append(
            {
                "slug": slug,
                "name": p["name"],
                "status": p["status"],
                "phase": p["phase"],
                "progress": f"{done}/{len(fx.phase_ids)}",
                "score": decision.get("score"),
                "verdict": decision.get("verdict"),
                "founder_tasks_open": open_tasks,
                "preview": p["links"].get("preview"),
                "production": p["links"].get("production"),
                "pr": p["links"].get("pr"),
                "updated": p["updated"],
            }
        )
    if args.json:
        print(json.dumps(rows, indent=2, ensure_ascii=False))
        return 0
    if not rows:
        print("Ainda não há produtos. Envia uma ideia com /ideia <descrição>.")
        return 0
    print("| Produto | Estado | Fase | Progresso | G1 | Tarefas fundador | Links | Atualizado |")
    print("|---|---|---|---|---|---|---|---|")
    for r in rows:
        phase = fx.phase(r["phase"])
        score = f"{r['score']:.1f} {str(r['verdict']).upper()}" if r["score"] is not None else "—"
        links = " · ".join(
            f"[{label}]({url})" for label, url in (("PR", r["pr"]), ("preview", r["preview"]), ("prod", r["production"])) if url
        ) or "—"
        print(
            f"| **{r['name']}** (`{r['slug']}`) | {PRODUCT_STATUS_LABELS[r['status']]} | {phase['n']} {phase['name']} "
            f"| {r['progress']} | {score} | {r['founder_tasks_open'] or '—'} | {links} | {r['updated']} |"
        )
    return 0


def cmd_set_phase(fx: Factory, args: argparse.Namespace) -> int:
    product = fx.load(args.slug)
    fx.phase(args.phase)
    entry = product["phases"][args.phase]
    if args.status == "done" and not args.force:
        missing = fx.missing_outputs(product, args.phase)
        if missing:
            raise FactoryError(
                f"cannot mark '{args.phase}' done; missing outputs in products/{args.slug}/: "
                + ", ".join(missing)
                + " (use --force only for phases that genuinely do not apply)"
            )
    entry["status"] = args.status
    date = today()
    if args.status == "in_progress":
        entry.setdefault("started", date)
    if args.status in ("done", "skipped"):
        entry.setdefault("started", date)
        entry["completed"] = date
    else:
        entry.pop("completed", None)
    if args.summary:
        entry["summary"] = args.summary
    product["phase"] = fx.current_phase(product)
    fx.save(product)
    _refresh_readme(fx, product)
    print(f"{args.slug}: {args.phase} → {args.status}; current phase: {product['phase']}")
    return 0


def _parse_value(raw: str) -> Any:
    if raw in ("null", "none", "None"):
        return None
    if raw in ("true", "false"):
        return raw == "true"
    if re.fullmatch(r"-?\d+", raw):
        return int(raw)
    if re.fullmatch(r"-?\d+\.\d+", raw):
        return float(raw)
    if raw[:1] in "[{":
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
    return raw


def cmd_set(fx: Factory, args: argparse.Namespace) -> int:
    product = fx.load(args.slug)
    if args.key.split(".")[0] in ("slug", "schema_version", "created", "phases"):
        raise FactoryError(f"'{args.key}' cannot be set directly (use set-phase for phases)")
    target = product
    parts = args.key.split(".")
    for part in parts[:-1]:
        if target.get(part) is None:
            target[part] = {}
        target = target[part]
        if not isinstance(target, dict):
            raise FactoryError(f"'{part}' is not an object in {args.key}")
    target[parts[-1]] = _parse_value(args.value) if not args.string else args.value
    fx.save(product)
    _refresh_readme(fx, product)
    print(f"{args.slug}: {args.key} = {json.dumps(target[parts[-1]], ensure_ascii=False)}")
    return 0


def cmd_validate(fx: Factory, args: argparse.Namespace) -> int:
    slugs = args.slugs or fx.slugs()
    failures = 0
    for slug in slugs:
        problems: list[str] = []
        pdir = fx.product_dir(slug)
        try:
            product = fx.load(slug)
        except FactoryError as exc:
            print(f"✗ {slug}: {exc}")
            failures += 1
            continue
        problems.extend(validate_schema(product, fx.schema))
        if product.get("slug") != slug:
            problems.append(f"slug field '{product.get('slug')}' does not match folder '{slug}'")
        if not problems:
            for pid in fx.phase_ids:
                if product["phases"][pid]["status"] == "done":
                    for rel in fx.missing_outputs(product, pid):
                        problems.append(f"phase '{pid}' is done but '{rel}' is missing or empty")
            if product["phase"] != fx.current_phase(product):
                problems.append(f"phase is '{product['phase']}' but the first unfinished phase is '{fx.current_phase(product)}'")
            for required in ("README.md", "HUMAN_TASKS.md"):
                if not (pdir / required).is_file():
                    problems.append(f"missing {required}")
            for rel in _unfilled_public_legal(pdir, product):
                problems.append(f"legal page still has FILL blocks: {rel}")
        if problems:
            failures += 1
            print(f"✗ {slug}")
            for problem in problems:
                print(f"    - {problem}")
        else:
            print(f"✓ {slug}")
    if not slugs:
        print("no products to validate")
    return 1 if failures else 0


def _unfilled_public_legal(pdir: Path, product: dict) -> list[str]:
    """Public legal pages integrated in the app must not contain FILL blocks once legal is done."""
    if product["phases"]["legal"]["status"] != "done":
        return []
    found = []
    legal_root = pdir / (product["stack"].get("app_dir") or "app") / "src" / "content" / "legal"
    for path in sorted(legal_root.rglob("*.md")) if legal_root.is_dir() else []:
        if "FILL:" in path.read_text(encoding="utf-8"):
            found.append(str(path.relative_to(pdir)))
    return found


def render_status(fx: Factory, product: dict, for_pr: bool = False) -> str:
    slug = product["slug"]
    open_tasks, done_tasks = fx.human_tasks(slug)
    phase = fx.phase(product["phase"])
    decision = product.get("decision") or {}
    g1 = (
        f"{decision['score']:.1f} ({decision.get('verdict', '?').upper()})"
        if decision.get("score") is not None
        else "—"
    )
    lines = [
        STATUS_START,
        f"**Estado:** {PRODUCT_STATUS_LABELS[product['status']]} · **Fase atual:** {phase['n']} {phase['name']} "
        f"· **Profundidade:** {product['depth']} · **Score G1:** {g1}",
        "",
        "| # | Fase | Estado | Resumo |",
        "|---|---|---|---|",
    ]
    for p in fx.phases:
        state = product["phases"][p["id"]]
        summary = (state.get("summary") or "").replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {p['n']} | {p['name']} | {PHASE_ICONS[state['status']]} | {summary} |")
    links = product["links"]
    link_parts = [
        f"[{label}]({links[key]})"
        for key, label in (
            ("production", "produção"),
            ("preview", "preview"),
            ("pr", "PR"),
            ("issue", "issue"),
            ("session", "sessão Claude"),
            ("repo", "repo"),
        )
        if links.get(key) and str(links[key]).startswith("http")
    ]
    tasks_link = _repo_link(fx, product, "HUMAN_TASKS.md") if for_pr else "HUMAN_TASKS.md"
    lines += [
        "",
        f"**Links:** {' · '.join(link_parts) if link_parts else '—'}",
        f"**Tarefas do fundador:** {open_tasks} abertas, {done_tasks} feitas → [HUMAN_TASKS.md]({tasks_link})",
        f"_Atualizado: {product['updated']}_",
        STATUS_END,
    ]
    return "\n".join(lines)


def _repo_link(fx: Factory, product: dict, rel: str) -> str:
    branch = product["links"].get("branch")
    remote = _git(fx.root, "remote", "get-url", "origin")
    match = re.search(r"github\.com[:/](.+?)(?:\.git)?$", remote or "")
    if not (branch and match):
        return f"products/{product['slug']}/{rel}"
    return f"https://github.com/{match.group(1)}/blob/{branch}/products/{product['slug']}/{rel}"


def _git(root: Path, *argv: str) -> str | None:
    try:
        out = subprocess.run(["git", *argv], cwd=root, capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        return None
    return out.stdout.strip()


def _write_status_block(fx: Factory, product: dict, path: Path, for_pr: bool) -> None:
    block = render_status(fx, product, for_pr=for_pr)
    text = path.read_text(encoding="utf-8") if path.is_file() else ""
    if STATUS_START in text and STATUS_END in text:
        before, rest = text.split(STATUS_START, 1)
        _, after = rest.split(STATUS_END, 1)
        text = before + block + after
    else:
        title_end = text.find("\n") + 1 if text.startswith("# ") else 0
        text = text[:title_end] + "\n" + block + "\n\n" + text[title_end:]
    path.write_text(text, encoding="utf-8")


def _refresh_readme(fx: Factory, product: dict) -> None:
    readme = fx.product_dir(product["slug"]) / "README.md"
    if readme.is_file():
        _write_status_block(fx, product, readme, for_pr=False)


def cmd_render_status(fx: Factory, args: argparse.Namespace) -> int:
    product = fx.load(args.slug)
    if args.write:
        _write_status_block(fx, product, fx.product_dir(args.slug) / "README.md", for_pr=False)
    print(render_status(fx, product, for_pr=args.pr))
    return 0


INBOX_PENDING = "## Por processar"
INBOX_DONE = "## Processadas"


def _inbox_items(text: str) -> tuple[list[str], int, int]:
    lines = text.splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.strip() == INBOX_PENDING)
    except StopIteration as exc:
        raise FactoryError(f"ideas/INBOX.md has no '{INBOX_PENDING}' section") from exc
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
    items = []
    for line in lines[start + 1 : end]:
        stripped = line.strip()
        if re.match(r"^[-*] (?!\[)", stripped) and len(stripped) > 2:
            items.append(stripped[2:].strip())
    return items, start, end


def cmd_inbox(fx: Factory, args: argparse.Namespace) -> int:
    path = fx.root / "ideas" / "INBOX.md"
    if not path.is_file():
        raise FactoryError("ideas/INBOX.md not found")
    text = strip_html_comments(path.read_text(encoding="utf-8"))
    items, _, _ = _inbox_items(text)
    if args.exclude_taken:
        taken = {_normalize_idea(e["product"].get("idea", "")) for e in scan_branches(fx, fetch=args.fetch)}
        items = [idea for idea in items if _normalize_idea(idea) not in taken]
    if args.take is None and args.match is None:
        if args.json:
            print(json.dumps([{"index": i + 1, "idea": idea} for i, idea in enumerate(items)], ensure_ascii=False, indent=2))
        elif not items:
            print("Caixa de ideias vazia.")
        else:
            for i, idea in enumerate(items, 1):
                print(f"{i}. {idea}")
        return 0
    if not args.slug:
        raise FactoryError("--take/--match require --slug (the product created from that idea)")
    if args.match is not None:
        # Match by text, never by position: positions shift with --exclude-taken and other takes.
        wanted = _normalize_idea(args.match)
        idea = next((i for i in _inbox_items(text)[0] if _normalize_idea(i) == wanted), None)
        if idea is None:
            raise FactoryError("no idea in ideas/INBOX.md matches --match")
    else:
        if not 1 <= args.take <= len(items):
            raise FactoryError(f"--take must be between 1 and {len(items)}")
        idea = items[args.take - 1]
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()
    for i, line in enumerate(lines):
        if line.strip() in (f"- {idea}", f"* {idea}"):
            del lines[i]
            break
    else:
        raise FactoryError("could not locate the idea line in ideas/INBOX.md")
    entry = f"- {today()} · {idea} → `products/{args.slug}`"
    if any(line.strip() == INBOX_DONE for line in lines):
        idx = next(i for i, line in enumerate(lines) if line.strip() == INBOX_DONE)
        lines.insert(idx + 1, entry)
    else:
        lines += ["", INBOX_DONE, entry]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"moved idea → products/{args.slug}")
    return 0


def cmd_next(fx: Factory, args: argparse.Namespace) -> int:
    order = {"active": 0, "needs-founder": 1, "launched": 2, "paused": 3, "killed": 4}
    plan = []
    for slug in fx.slugs():
        p = fx.load(slug)
        open_tasks, _ = fx.human_tasks(slug)
        done = sum(1 for pid in fx.phase_ids if p["phases"][pid]["status"] in ("done", "skipped"))
        if p["status"] == "active":
            phase = fx.phase(p["phase"])
            action = f"/continuar {slug} → fase {phase['n']} {phase['name']}"
        elif p["status"] == "needs-founder":
            action = f"à espera do fundador ({open_tasks} tarefas abertas); avançar o que não depende delas"
        elif p["status"] == "launched":
            action = f"/crescer {slug} (ciclo semanal)"
        else:
            action = "nada (em pausa/descartado)"
        plan.append({"slug": slug, "status": p["status"], "progress": done, "action": action, "_order": order[p["status"]]})
    plan.sort(key=lambda r: (r["_order"], -r["progress"], r["slug"]))
    for row in plan:
        row.pop("_order")
    if args.json:
        print(json.dumps(plan, indent=2, ensure_ascii=False))
    elif not plan:
        print("Sem produtos. Processar ideias/INBOX.md e issues 'ideia'.")
    else:
        for row in plan:
            print(f"- {row['slug']} [{row['status']}, {row['progress']}/{len(fx.phase_ids)}]: {row['action']}")
    return 0


def _app_dirs(fx: Factory, slug: str) -> list[str]:
    try:
        product = fx.load(slug)
    except FactoryError:
        return []
    names = [product["stack"].get("app_dir") or "app", *product["stack"].get("components", [])]
    dirs = []
    for name in dict.fromkeys(names):
        if (fx.product_dir(slug) / name / "package.json").is_file():
            dirs.append(f"products/{slug}/{name}")
    return dirs


def cmd_changed(fx: Factory, args: argparse.Namespace) -> int:
    targets: set[str] = set()
    starters = fx.root / "factory" / "starters"
    if args.all:
        for slug in fx.slugs():
            targets.update(_app_dirs(fx, slug))
        if starters.is_dir():
            targets.update(
                f"factory/starters/{d.name}" for d in starters.iterdir() if (d / "package.json").is_file()
            )
    else:
        files = _git(fx.root, "diff", "--name-only", f"{args.base}...{args.head}")
        if files is None:
            files = _git(fx.root, "diff", "--name-only", args.base, args.head)
        if files is None:
            raise FactoryError(f"git diff failed for {args.base}...{args.head}")
        for name in filter(None, files.splitlines()):
            parts = name.split("/")
            if parts[0] == "products" and len(parts) >= 3:
                for d in _app_dirs(fx, parts[1]):
                    if name.startswith(d + "/"):
                        targets.add(d)
            elif name.startswith("factory/starters/") and len(parts) >= 4:
                candidate = f"factory/starters/{parts[2]}"
                if (fx.root / candidate / "package.json").is_file():
                    targets.add(candidate)
    print(json.dumps(sorted(targets)))
    return 0


def count_tasks(text: str) -> tuple[int, int]:
    """(open, done) founder tasks: checkbox lines outside HTML comments."""
    text = strip_html_comments(text)
    open_count = len(re.findall(r"^\s*[-*] \[ \] ", text, flags=re.MULTILINE))
    done_count = len(re.findall(r"^\s*[-*] \[[xX]\] ", text, flags=re.MULTILINE))
    return (open_count, done_count)


def scan_branches(fx: Factory, fetch: bool = False) -> list[dict]:
    """Products across every remote branch (each product lives on its own branch until merged).

    Returns one entry per slug: the copy whose last commit touching products/<slug> is newest
    (ties prefer a non-main branch), with the branch it came from and its founder-task counts.
    The working tree is included as branch "(local)"; uncommitted changes there count as newest.
    """
    if fetch:
        _git(fx.root, "fetch", "--quiet", "--prune", "origin")
    found: dict[str, dict] = {}

    def consider(product: dict, branch: str, stamp: int, tasks_text: str) -> None:
        slug = product.get("slug")
        if not slug:
            return
        key = (stamp, branch not in ("main", "master"))
        current = found.get(slug)
        if current is None or key > current["key"]:
            found[slug] = {"product": product, "branch": branch, "key": key, "tasks": count_tasks(tasks_text)}

    refs = _git(fx.root, "for-each-ref", "--format=%(refname:short)", "refs/remotes/origin") or ""
    for ref in refs.splitlines():
        if ref in ("origin", "origin/HEAD"):
            continue
        listing = _git(fx.root, "ls-tree", "-r", "--name-only", ref, "products/") or ""
        for path in listing.splitlines():
            parts = path.split("/")
            if len(parts) == 3 and parts[2] == "product.json":
                raw = _git(fx.root, "show", f"{ref}:{path}")
                try:
                    product = json.loads(raw or "")
                except json.JSONDecodeError:
                    continue
                stamp = int(_git(fx.root, "log", "-1", "--format=%ct", ref, "--", f"products/{parts[1]}") or 0)
                tasks = _git(fx.root, "show", f"{ref}:products/{parts[1]}/HUMAN_TASKS.md") or ""
                consider(product, ref.removeprefix("origin/"), stamp, tasks)
    for slug in fx.slugs():
        try:
            product = fx.load(slug)
        except FactoryError:
            continue
        dirty = _git(fx.root, "status", "--porcelain", "--", f"products/{slug}")
        stamp = 2**62 if dirty else int(_git(fx.root, "log", "-1", "--format=%ct", "HEAD", "--", f"products/{slug}") or 0)
        tasks_path = fx.product_dir(slug) / "HUMAN_TASKS.md"
        consider(product, "(local)", stamp, tasks_path.read_text(encoding="utf-8") if tasks_path.is_file() else "")
    return [found[s] for s in sorted(found)]


def cmd_portfolio(fx: Factory, args: argparse.Namespace) -> int:
    entries = scan_branches(fx, fetch=args.fetch)
    rows = []
    for entry in entries:
        p = entry["product"]
        decision = p.get("decision") or {}
        phases = p.get("phases", {})
        done = sum(1 for pid in fx.phase_ids if phases.get(pid, {}).get("status") in ("done", "skipped"))
        rows.append(
            {
                "slug": p["slug"],
                "name": p.get("name", p["slug"]),
                "status": p.get("status", "active"),
                "phase": p.get("phase", "intake"),
                "progress": f"{done}/{len(fx.phase_ids)}",
                "blocked": [pid for pid in fx.phase_ids if phases.get(pid, {}).get("status") == "blocked"],
                "depth": p.get("depth"),
                "depth_locked": bool(p.get("depth_locked")),
                "score": decision.get("score"),
                "verdict": decision.get("verdict"),
                "forced": bool(decision.get("forced")),
                "founder_tasks_open": entry["tasks"][0],
                "founder_tasks_done": entry["tasks"][1],
                "branch": entry["branch"],
                "idea": p.get("idea", ""),
                "links": p.get("links", {}),
                "updated": p.get("updated", ""),
            }
        )
    if args.json:
        print(json.dumps(rows, indent=2, ensure_ascii=False))
        return 0
    if not rows:
        print("Ainda não há produtos em nenhum branch.")
        return 0
    print("| Produto | Estado | Fase | Progresso | G1 | Branch | Links |")
    print("|---|---|---|---|---|---|---|")
    for r in rows:
        try:
            phase = fx.phase(r["phase"])
            phase_label = f"{phase['n']} {phase['name']}"
        except FactoryError:
            phase_label = r["phase"]
        score = f"{r['score']:.1f} {str(r['verdict']).upper()}" if r["score"] is not None else "—"
        links = " · ".join(
            f"[{label}]({r['links'][key]})"
            for key, label in (("pr", "PR"), ("preview", "preview"), ("production", "prod"), ("session", "sessão"))
            if str(r["links"].get(key) or "").startswith("http")
        ) or "—"
        status = PRODUCT_STATUS_LABELS.get(r["status"], r["status"])
        print(f"| **{r['name']}** (`{r['slug']}`) | {status} | {phase_label} | {r['progress']} | {score} | `{r['branch']}` | {links} |")
    return 0


SCAFFOLD_IGNORE = (
    "node_modules",
    ".next",
    "out",
    "test-results",
    "playwright-report",
    "blob-report",
    "coverage",
    ".vercel",
    ".turbo",
    "*.tsbuildinfo",
    ".env",
    ".env.local",
    ".env.*.local",
    ".DS_Store",
)


def cmd_scaffold(fx: Factory, args: argparse.Namespace) -> int:
    """Copy a tested starter into a product (without build output, deps or local env files)."""
    src = fx.root / "factory" / "starters" / args.starter
    if not (src / "package.json").is_file():
        known = ", ".join(sorted(p.name for p in src.parent.iterdir() if p.is_dir())) if src.parent.is_dir() else "none"
        raise FactoryError(f"unknown starter '{args.starter}' (available: {known})")
    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]*", args.dir):
        raise FactoryError(f"invalid --dir '{args.dir}'")
    product = fx.load(args.slug)
    dst = fx.product_dir(args.slug) / args.dir
    if dst.exists() and any(dst.iterdir()) and not args.force:
        raise FactoryError(f"products/{args.slug}/{args.dir} already has files (use --force to overwrite starter files)")
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns(*SCAFFOLD_IGNORE), dirs_exist_ok=True)
    if product["stack"].get("app_dir") != args.dir and args.dir not in product["stack"].get("components", []):
        if product["stack"].get("app_dir") == "app" and not (fx.product_dir(args.slug) / "app").exists():
            product["stack"]["app_dir"] = args.dir
        else:
            product["stack"].setdefault("components", []).append(args.dir)
        fx.save(product)
    print(f"products/{args.slug}/{args.dir}")
    return 0


def cmd_slugify(fx: Factory, args: argparse.Namespace) -> int:
    """Print a slug for a name that is free on every branch (and in this checkout)."""
    taken = {e["product"]["slug"] for e in scan_branches(fx, fetch=args.fetch)} | set(fx.slugs())
    base = slugify(args.name)
    slug, n = base, 2
    while slug in taken or fx.product_dir(slug).exists():
        slug, n = f"{base}-{n}", n + 1
    print(slug)
    return 0


def _normalize_idea(text: str) -> str:
    return re.sub(r"\s+", " ", strip_html_comments(text)).strip().lower()


def cmd_doctor(fx: Factory, args: argparse.Namespace) -> int:
    remote = os.environ.get("CLAUDE_CODE_REMOTE") == "true"
    print(f"Ambiente: {'Claude Code cloud' if remote else 'local/CI'} · raiz: {fx.root}")
    print("\nCredenciais (só presença, nunca valores):")
    for name, unlocks in DOCTOR_ENV:
        print(f"  {'✅' if os.environ.get(name) else '⬜'} {name:<26} {unlocks}")
    print("\nFerramentas:")
    for tool in DOCTOR_TOOLS:
        print(f"  {'✅' if shutil.which(tool) else '⬜'} {tool}")
    chromium = Path("/opt/pw-browsers/chromium")
    print(f"\nChromium Playwright: {'✅ ' + str(chromium) if chromium.exists() else '⬜ (CI instala com playwright install)'}")
    return 0


# --------------------------------------------------------------------------- cli


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="factory.py", description="Product factory state CLI")
    parser.add_argument("--root", help="repository root (default: FACTORY_ROOT or this checkout)")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("new", help="create products/<slug> from templates")
    p.add_argument("slug", help="kebab-case slug, or 'auto' to derive it from --name")
    p.add_argument("--name", required=True)
    p.add_argument("--type", required=True, choices=TYPES)
    p.add_argument("--idea", required=True, help="the founder's raw idea, verbatim")
    p.add_argument("--one-liner", default="")
    p.add_argument("--depth", default="standard", choices=DEPTHS)
    p.add_argument(
        "--lock-depth",
        action="store_true",
        help="the founder chose the depth (flag or FOUNDER.md default_depth): G1 must not change it",
    )
    p.add_argument("--source", help="channel[:ref], e.g. issue:#12, inbox, claude")
    p.add_argument("--branch", default=None)
    p.set_defaults(func=cmd_new)

    p = sub.add_parser("status", help="portfolio table")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("set-phase", help="change a phase status (done requires its outputs)")
    p.add_argument("slug")
    p.add_argument("phase")
    p.add_argument("status", choices=list(PHASE_ICONS))
    p.add_argument("--summary")
    p.add_argument("--force", action="store_true", help="skip the outputs check (justify in the summary)")
    p.set_defaults(func=cmd_set_phase)

    p = sub.add_parser("set", help="set a field, e.g. links.preview, status, decision, stack.recipe")
    p.add_argument("slug")
    p.add_argument("key")
    p.add_argument("value")
    p.add_argument("--string", action="store_true", help="store the value as a string, no parsing")
    p.set_defaults(func=cmd_set)

    p = sub.add_parser("validate", help="schema + required outputs of done phases")
    p.add_argument("slugs", nargs="*")
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("render-status", help="markdown status block for README/PR")
    p.add_argument("slug")
    p.add_argument("--write", action="store_true", help="also update the block in the product README")
    p.add_argument("--pr", action="store_true", help="absolute links, for PR descriptions")
    p.set_defaults(func=cmd_render_status)

    p = sub.add_parser("inbox", help="list ideas waiting in ideas/INBOX.md, or move one to processed")
    p.add_argument("--json", action="store_true")
    p.add_argument("--take", type=int, help="1-based index (in this same listing) of the idea to mark processed")
    p.add_argument("--match", help="mark processed the idea whose text equals this (preferred over --take)")
    p.add_argument("--slug", help="product created from the taken idea")
    p.add_argument(
        "--exclude-taken",
        action="store_true",
        help="hide ideas that already became a product on any branch (matches product.json 'idea')",
    )
    p.add_argument("--fetch", action="store_true", help="git fetch before scanning branches")
    p.set_defaults(func=cmd_inbox)

    p = sub.add_parser("scaffold", help="copy a starter into products/<slug>/<dir> (no deps/build output)")
    p.add_argument("slug")
    p.add_argument("--starter", default="web")
    p.add_argument("--dir", default="app")
    p.add_argument("--force", action="store_true", help="copy over an existing folder")
    p.set_defaults(func=cmd_scaffold)

    p = sub.add_parser("slugify", help="a slug for NAME that is free on every branch")
    p.add_argument("name")
    p.add_argument("--fetch", action="store_true")
    p.set_defaults(func=cmd_slugify)

    p = sub.add_parser("portfolio", help="products across ALL branches (each product lives on its own branch)")
    p.add_argument("--json", action="store_true")
    p.add_argument("--fetch", action="store_true", help="git fetch --prune origin first")
    p.set_defaults(func=cmd_portfolio)

    p = sub.add_parser("next", help="what the foreman should do next, by priority")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_next)

    p = sub.add_parser("changed", help="JSON list of app dirs changed between refs (for CI)")
    p.add_argument("--base", default="origin/main")
    p.add_argument("--head", default="HEAD")
    p.add_argument("--all", action="store_true", help="every product app dir and starter")
    p.set_defaults(func=cmd_changed)

    p = sub.add_parser("doctor", help="which credentials/tools are available for autonomous work")
    p.set_defaults(func=cmd_doctor)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        root = repo_root(args.root)
        with repo_lock(root):
            fx = Factory(root)
            return args.func(fx, args)
    except FactoryError as exc:
        print(f"erro: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
