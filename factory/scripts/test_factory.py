#!/usr/bin/env python3
"""Tests for factory.py — run with: python3 -m unittest discover -s factory/scripts -v"""

from __future__ import annotations

import contextlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import importlib.util

# Load factory.py by path: `import factory` would hit the repo's factory/ folder when the tests
# are started from the repository root.
_spec = importlib.util.spec_from_file_location("factory_cli", Path(__file__).resolve().parent / "factory.py")
factory = importlib.util.module_from_spec(_spec)
sys.modules["factory_cli"] = factory
_spec.loader.exec_module(factory)

REPO = Path(__file__).resolve().parents[2]


def run(root: Path, *argv: str) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = factory.main(["--root", str(root), *argv])
    return code, out.getvalue(), err.getvalue()


class FactoryTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "factory" / "schemas").mkdir(parents=True)
        shutil.copy(REPO / "factory" / "phases.json", self.root / "factory" / "phases.json")
        shutil.copy(
            REPO / "factory" / "schemas" / "product.schema.json",
            self.root / "factory" / "schemas" / "product.schema.json",
        )
        os.environ["FACTORY_TODAY"] = "2026-10-08"

    def tearDown(self) -> None:
        os.environ.pop("FACTORY_TODAY", None)
        self.tmp.cleanup()

    def new(self, name: str = "Recibos Fáceis", slug: str = "auto", **extra: str) -> str:
        argv = ["new", slug, "--name", name, "--type", extra.get("type", "web-saas"), "--idea", extra.get("idea", "uma app para recibos")]
        code, out, err = run(self.root, *argv)
        self.assertEqual(code, 0, err)
        return out.strip()

    def product(self, slug: str) -> dict:
        return json.loads((self.root / "products" / slug / "product.json").read_text(encoding="utf-8"))

    def touch(self, slug: str, rel: str, content: str = "x") -> None:
        path = self.root / "products" / slug / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


class TestNew(FactoryTestCase):
    def test_creates_valid_product_with_portuguese_slug(self) -> None:
        slug = self.new()
        self.assertEqual(slug, "recibos-faceis")
        product = self.product(slug)
        self.assertEqual(product["phase"], "intake")
        self.assertEqual(product["phases"]["intake"]["status"], "in_progress")
        self.assertEqual(product["created"], "2026-10-08")
        pdir = self.root / "products" / slug
        for rel in ("README.md", "HUMAN_TASKS.md", "docs/00-brief.md"):
            self.assertTrue((pdir / rel).is_file(), rel)
        readme = (pdir / "README.md").read_text(encoding="utf-8")
        self.assertIn(factory.STATUS_START, readme)
        self.assertIn("uma app para recibos", (pdir / "docs/00-brief.md").read_text(encoding="utf-8"))
        self.assertEqual(run(self.root, "validate", slug)[0], 0)

    def test_auto_slug_is_unique(self) -> None:
        self.assertEqual(self.new(), "recibos-faceis")
        self.assertEqual(self.new(), "recibos-faceis-2")

    def test_rejects_invalid_slug_and_duplicates(self) -> None:
        code, _, err = run(self.root, "new", "Bad Slug", "--name", "x", "--type", "api", "--idea", "y")
        self.assertEqual(code, 1)
        self.assertIn("invalid slug", err)
        self.new(slug="taken")
        code, _, err = run(self.root, "new", "taken", "--name", "x", "--type", "api", "--idea", "y")
        self.assertEqual(code, 1)
        self.assertIn("already exists", err)

    def test_issue_source_sets_issue_link(self) -> None:
        code, out, err = run(self.root, "new", "auto", "--name", "Bot", "--type", "bot", "--idea", "i", "--source", "issue:#12")
        self.assertEqual(code, 0, err)
        product = self.product(out.strip())
        self.assertEqual(product["source"], {"channel": "issue", "ref": "#12"})
        self.assertEqual(product["links"]["issue"], "#12")

    def test_templates_are_rendered_with_placeholders(self) -> None:
        templates = self.root / "factory" / "templates"
        templates.mkdir(parents=True)
        (templates / "brief.md").write_text("# {{name}} ({{slug}})\n\n> {{idea}}\n", encoding="utf-8")
        slug = self.new(name="Tradutor Pro", idea="traduzir menus")
        brief = (self.root / "products" / slug / "docs/00-brief.md").read_text(encoding="utf-8")
        self.assertEqual(brief, "# Tradutor Pro (tradutor-pro)\n\n> traduzir menus\n")


class TestPhases(FactoryTestCase):
    def test_done_requires_outputs_then_advances(self) -> None:
        slug = self.new()
        (self.root / "products" / slug / "docs" / "00-brief.md").unlink()
        code, _, err = run(self.root, "set-phase", slug, "intake", "done")
        self.assertEqual(code, 1)
        self.assertIn("missing outputs", err)
        self.touch(slug, "docs/00-brief.md", "# brief")
        code, out, err = run(self.root, "set-phase", slug, "intake", "done", "--summary", "brief ok")
        self.assertEqual(code, 0, err)
        product = self.product(slug)
        self.assertEqual(product["phase"], "research")
        self.assertEqual(product["phases"]["intake"]["completed"], "2026-10-08")
        self.assertEqual(product["phases"]["intake"]["summary"], "brief ok")

    def test_directory_outputs_must_be_non_empty(self) -> None:
        slug = self.new()
        # docs/adr/ is created empty by `new`
        code, _, err = run(self.root, "set-phase", slug, "architecture", "done")
        self.assertEqual(code, 1)
        self.assertIn("docs/adr/", err)
        self.touch(slug, "docs/04-architecture.md")
        self.touch(slug, "docs/adr/0001-stack.md")
        self.assertEqual(run(self.root, "set-phase", slug, "architecture", "done")[0], 0)

    def test_force_and_skipped(self) -> None:
        slug = self.new()
        self.assertEqual(run(self.root, "set-phase", slug, "intake", "done", "--force", "--summary", "n/a")[0], 0)
        self.assertEqual(run(self.root, "set-phase", slug, "research", "skipped", "--summary", "founder override")[0], 0)
        self.assertEqual(self.product(slug)["phase"], "strategy")

    def test_reopening_a_phase_moves_current_phase_back(self) -> None:
        slug = self.new()
        run(self.root, "set-phase", slug, "intake", "done", "--force")
        run(self.root, "set-phase", slug, "research", "done", "--force")
        self.assertEqual(run(self.root, "set-phase", slug, "research", "in_progress")[0], 0)
        product = self.product(slug)
        self.assertEqual(product["phase"], "research")
        self.assertNotIn("completed", product["phases"]["research"])

    def test_unknown_phase(self) -> None:
        slug = self.new()
        code, _, err = run(self.root, "set-phase", slug, "marketing", "done")
        self.assertEqual(code, 1)
        self.assertIn("unknown phase", err)


class TestSet(FactoryTestCase):
    def test_set_values_and_reject_invalid(self) -> None:
        slug = self.new()
        self.assertEqual(run(self.root, "set", slug, "links.preview", "https://x.vercel.app")[0], 0)
        self.assertEqual(run(self.root, "set", slug, "decision", '{"verdict": "go", "score": 3.9, "rationale": "r"}')[0], 0)
        self.assertEqual(run(self.root, "set", slug, "stack.components", '["api"]')[0], 0)
        product = self.product(slug)
        self.assertEqual(product["links"]["preview"], "https://x.vercel.app")
        self.assertEqual(product["decision"]["score"], 3.9)
        self.assertEqual(product["stack"]["components"], ["api"])

        before = (self.root / "products" / slug / "product.json").read_text(encoding="utf-8")
        code, _, err = run(self.root, "set", slug, "status", "sleeping")
        self.assertEqual(code, 1)
        self.assertIn("not one of", err)
        code, _, err = run(self.root, "set", slug, "links.nope", "x")
        self.assertEqual(code, 1)
        self.assertIn("unexpected property", err)
        after = (self.root / "products" / slug / "product.json").read_text(encoding="utf-8")
        self.assertEqual(before, after, "invalid writes must not touch the file")

    def test_protected_keys(self) -> None:
        slug = self.new()
        for key in ("slug", "phases.intake.status", "created"):
            code, _, _ = run(self.root, "set", slug, key, "x")
            self.assertEqual(code, 1, key)

    def test_string_flag_keeps_numbers_as_text(self) -> None:
        slug = self.new()
        self.assertEqual(run(self.root, "set", slug, "one_liner", "2024", "--string")[0], 0)
        self.assertEqual(self.product(slug)["one_liner"], "2024")


class TestValidateAndStatus(FactoryTestCase):
    def test_validate_detects_inconsistencies(self) -> None:
        slug = self.new()
        path = self.root / "products" / slug / "product.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["phases"]["research"]["status"] = "done"
        data["phase"] = "build"
        path.write_text(json.dumps(data), encoding="utf-8")
        code, out, _ = run(self.root, "validate", slug)
        self.assertEqual(code, 1)
        self.assertIn("docs/01-research.md", out)
        self.assertIn("first unfinished phase is 'intake'", out)

    def test_validate_flags_unfilled_legal_pages(self) -> None:
        slug = self.new()
        path = self.root / "products" / slug / "product.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["phases"]["legal"]["status"] = "done"
        path.write_text(json.dumps(data), encoding="utf-8")
        self.touch(slug, "docs/07-compliance.md")
        self.touch(slug, "legal/ropa.md")
        self.touch(slug, "app/src/content/legal/pt/privacy.md", "<!-- FILL: data categories -->")
        code, out, _ = run(self.root, "validate", slug)
        self.assertEqual(code, 1)
        self.assertIn("FILL blocks", out)

    def test_render_status_counts_tasks_outside_comments(self) -> None:
        slug = self.new()
        self.touch(
            slug,
            "HUMAN_TASKS.md",
            "# T\n<!-- - [ ] example -->\n- [ ] **HT-01** comprar domínio\n- [x] **HT-02** conta Stripe\n",
        )
        code, out, _ = run(self.root, "render-status", slug, "--write")
        self.assertEqual(code, 0)
        self.assertIn("1 abertas, 1 feitas", out)
        self.assertIn("| 00 | Receção | 🔄 |", out)
        readme = (self.root / "products" / slug / "README.md").read_text(encoding="utf-8")
        self.assertEqual(readme.count(factory.STATUS_START), 1)
        self.assertIn("1 abertas", readme)

    def test_status_and_next(self) -> None:
        self.assertEqual(run(self.root, "status")[0], 0)
        first = self.new(name="Alpha")
        second = self.new(name="Beta")
        run(self.root, "set-phase", second, "intake", "done", "--force")
        run(self.root, "set", first, "status", "needs-founder")
        code, out, _ = run(self.root, "status", "--json")
        self.assertEqual(code, 0)
        rows = {r["slug"]: r for r in json.loads(out)}
        self.assertEqual(rows["beta"]["progress"], "1/11")
        code, out, _ = run(self.root, "next", "--json")
        plan = json.loads(out)
        self.assertEqual([p["slug"] for p in plan], ["beta", "alpha"])
        self.assertIn("/continuar beta", plan[0]["action"])
        self.assertEqual(run(self.root, "status")[0], 0)


class TestInbox(FactoryTestCase):
    def test_list_and_take(self) -> None:
        (self.root / "ideas").mkdir()
        inbox = self.root / "ideas" / "INBOX.md"
        inbox.write_text(
            "# Ideias\n\n<!-- - exemplo ignorado -->\n## Por processar\n\n- app de receitas\n- marketplace de explicações\n\n## Processadas\n",
            encoding="utf-8",
        )
        code, out, _ = run(self.root, "inbox", "--json")
        self.assertEqual(code, 0)
        self.assertEqual([i["idea"] for i in json.loads(out)], ["app de receitas", "marketplace de explicações"])
        code, _, err = run(self.root, "inbox", "--take", "2", "--slug", "explicacoes")
        self.assertEqual(code, 0, err)
        text = inbox.read_text(encoding="utf-8")
        self.assertIn("- app de receitas", text)
        self.assertIn("- 2026-10-08 · marketplace de explicações → `products/explicacoes`", text)
        code, out, _ = run(self.root, "inbox", "--json")
        self.assertEqual(len(json.loads(out)), 1)
        self.assertEqual(run(self.root, "inbox", "--take", "5", "--slug", "x")[0], 1)


class TestChanged(FactoryTestCase):
    def git(self, *argv: str) -> None:
        subprocess.run(["git", *argv], cwd=self.root, check=True, capture_output=True)

    def test_changed_between_refs_and_all(self) -> None:
        slug = self.new(name="Gamma")
        self.touch(slug, "app/package.json", "{}")
        (self.root / "factory" / "starters" / "web").mkdir(parents=True)
        (self.root / "factory" / "starters" / "web" / "package.json").write_text("{}", encoding="utf-8")
        self.git("init", "-q", "-b", "main")
        self.git("-c", "user.email=t@t", "-c", "user.name=t", "add", "-A")
        self.git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "base")
        self.git("checkout", "-qb", "feature")
        self.touch(slug, "app/src/page.tsx", "export {}")
        self.touch(slug, "docs/00-brief.md", "changed docs only")
        self.git("-c", "user.email=t@t", "-c", "user.name=t", "add", "-A")
        self.git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "change")
        code, out, err = run(self.root, "changed", "--base", "main", "--head", "HEAD")
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out), [f"products/{slug}/app"])
        code, out, _ = run(self.root, "changed", "--all")
        self.assertEqual(json.loads(out), ["factory/starters/web", f"products/{slug}/app"])


class TestPortfolio(FactoryTestCase):
    """Products live on their own branches; the portfolio must see all of them."""

    clock = 1_790_000_000

    def git(self, *argv: str) -> str:
        TestPortfolio.clock += 60  # strictly increasing commit times
        stamp = f"{TestPortfolio.clock} +0000"
        env = {
            **os.environ,
            "GIT_AUTHOR_NAME": "t",
            "GIT_AUTHOR_EMAIL": "t@t",
            "GIT_COMMITTER_NAME": "t",
            "GIT_COMMITTER_EMAIL": "t@t",
            "GIT_AUTHOR_DATE": stamp,
            "GIT_COMMITTER_DATE": stamp,
        }
        out = subprocess.run(["git", *argv], cwd=self.root, check=True, capture_output=True, text=True, env=env)
        return out.stdout

    def commit_all(self, message: str) -> None:
        self.git("add", "-A")
        self.git("commit", "-qm", message)

    def test_scans_branches_dedupes_and_filters_inbox(self) -> None:
        origin = tempfile.TemporaryDirectory()
        self.addCleanup(origin.cleanup)
        subprocess.run(["git", "init", "-q", "--bare", origin.name], check=True)
        self.git("init", "-q", "-b", "main")
        self.git("remote", "add", "origin", origin.name)
        self.commit_all("factory")
        self.git("push", "-q", "origin", "main")

        self.git("checkout", "-qb", "produto/alpha")
        self.new(name="Alpha", idea="ideia alfa")
        self.commit_all("alpha intake")
        self.git("push", "-q", "origin", "produto/alpha")

        self.git("checkout", "-qb", "claude/followup")
        os.environ["FACTORY_TODAY"] = "2026-10-09"
        run(self.root, "set", "alpha", "status", "needs-founder")
        self.commit_all("alpha waiting")
        self.git("push", "-q", "origin", "claude/followup")

        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", "produto/beta")
        self.new(name="Beta", idea="App  de receitas")
        self.touch("beta", "HUMAN_TASKS.md", "# T\n- [ ] **HT-01** domínio\n- [x] **HT-02** conta\n- [ ] **HT-03** IBAN\n")
        run(self.root, "set-phase", "beta", "qa", "blocked", "--summary", "2 bloqueios")
        self.commit_all("beta intake")
        self.git("push", "-q", "origin", "produto/beta")

        self.git("checkout", "-q", "main")
        self.git("fetch", "-q", "origin")
        # main itself has no product.json files (git leaves only empty, untracked folders behind)
        self.assertEqual(list(self.root.glob("products/*/product.json")), [])

        code, out, err = run(self.root, "portfolio", "--json")
        self.assertEqual(code, 0, err)
        rows = {r["slug"]: r for r in json.loads(out)}
        self.assertEqual(sorted(rows), ["alpha", "beta"])
        self.assertEqual(rows["alpha"]["branch"], "claude/followup", "newest copy wins")
        self.assertEqual(rows["alpha"]["status"], "needs-founder")
        self.assertEqual(rows["beta"]["branch"], "produto/beta")
        self.assertEqual((rows["beta"]["founder_tasks_open"], rows["beta"]["founder_tasks_done"]), (2, 1))
        self.assertEqual(rows["beta"]["blocked"], ["qa"])
        self.assertEqual(rows["alpha"]["blocked"], [])
        self.assertEqual(run(self.root, "portfolio")[0], 0)

        # a stale copy merged into main must not hide newer work on the product branch
        self.git("checkout", "-q", "main")
        self.git("merge", "-q", "--no-ff", "-m", "merge alpha", "origin/produto/alpha")
        self.git("push", "-q", "origin", "main")
        self.git("fetch", "-q", "origin")
        rows = {r["slug"]: r for r in json.loads(run(self.root, "portfolio", "--json")[1])}
        self.assertEqual(rows["alpha"]["branch"], "claude/followup")
        # the merged copy is also checked out locally now; it is older than claude/followup
        self.assertEqual(rows["alpha"]["status"], "needs-founder")

        (self.root / "ideas").mkdir()
        (self.root / "ideas" / "INBOX.md").write_text(
            "## Por processar\n- app de receitas\n- ideia nova\n", encoding="utf-8"
        )
        code, out, _ = run(self.root, "inbox", "--json", "--exclude-taken")
        self.assertEqual(code, 0)
        self.assertEqual([i["idea"] for i in json.loads(out)], ["ideia nova"])

        # slugs taken on other branches are not reused
        self.assertEqual(run(self.root, "slugify", "Alpha")[1].strip(), "alpha-2")
        self.assertEqual(run(self.root, "slugify", "Gamma Ray")[1].strip(), "gamma-ray")


class TestRobustness(FactoryTestCase):
    """Findings from the adversarial review, reproduced as tests."""

    def test_parallel_writes_never_corrupt_product_json(self) -> None:
        slug = self.new()
        script = str(Path(__file__).resolve().parent / "factory.py")
        procs = [
            subprocess.Popen(
                [sys.executable, script, "--root", str(self.root), "set", slug, "links.preview", f"https://p{i}.example"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            for i in range(30)
        ]
        results = [(p.wait(), p.stderr.read()) for p in procs]
        for proc in procs:
            proc.stdout.close()
            proc.stderr.close()
        failures = [err for code, err in results if code != 0]
        self.assertEqual(failures, [])
        self.assertTrue(self.product(slug)["links"]["preview"].startswith("https://p"))
        self.assertEqual(run(self.root, "validate", slug)[0], 0)

    def test_inbox_match_moves_the_named_idea(self) -> None:
        (self.root / "ideas").mkdir()
        inbox = self.root / "ideas" / "INBOX.md"
        inbox.write_text("## Por processar\n- ideia A\n- ideia B\n- ideia C\n\n## Processadas\n", encoding="utf-8")
        self.new(name="Prod A", idea="ideia A")
        code, out, _ = run(self.root, "inbox", "--json", "--exclude-taken")
        self.assertEqual([i["idea"] for i in json.loads(out)], ["ideia B", "ideia C"])
        code, _, err = run(self.root, "inbox", "--match", "Ideia  C", "--slug", "prod-c")
        self.assertEqual(code, 0, err)
        text = inbox.read_text(encoding="utf-8")
        self.assertIn("- ideia B", text.split("## Processadas")[0])
        self.assertIn("ideia C → `products/prod-c`", text)
        self.assertEqual(run(self.root, "inbox", "--match", "nope", "--slug", "x")[0], 1)

    def test_directory_output_needs_a_real_file(self) -> None:
        slug = self.new()
        self.touch(slug, "docs/07-compliance.md")
        # `new` created the empty legal/public/ folder: that must not satisfy `legal/`
        code, _, err = run(self.root, "set-phase", slug, "legal", "done")
        self.assertEqual(code, 1)
        self.assertIn("legal/", err)
        self.touch(slug, "legal/ropa.md")
        self.assertEqual(run(self.root, "set-phase", slug, "legal", "done")[0], 0)

    def test_depth_lock_and_forced_override_are_recorded(self) -> None:
        code, out, err = run(
            self.root, "new", "auto", "--name", "Lean One", "--type", "web-static", "--idea", "i", "--depth", "lean", "--lock-depth"
        )
        self.assertEqual(code, 0, err)
        slug = out.strip()
        self.assertTrue(self.product(slug)["depth_locked"])
        decision = '{"verdict": "kill", "score": 2.4, "rationale": "forçado pelo fundador", "forced": true}'
        self.assertEqual(run(self.root, "set", slug, "decision", decision)[0], 0)
        self.assertTrue(self.product(slug)["decision"]["forced"])


class TestScaffold(FactoryTestCase):
    def test_copies_starter_without_build_output(self) -> None:
        starter = self.root / "factory" / "starters" / "web"
        for rel in ("package.json", "src/app/page.tsx", "node_modules/x/index.js", ".next/cache", "tsconfig.tsbuildinfo", ".env.local", ".env.example"):
            path = starter / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("x", encoding="utf-8")
        slug = self.new()
        code, out, err = run(self.root, "scaffold", slug)
        self.assertEqual(code, 0, err)
        app = self.root / "products" / slug / "app"
        self.assertTrue((app / "src/app/page.tsx").is_file())
        self.assertTrue((app / ".env.example").is_file())
        for rel in ("node_modules", ".next", "tsconfig.tsbuildinfo", ".env.local"):
            self.assertFalse((app / rel).exists(), rel)
        code, _, err = run(self.root, "scaffold", slug)
        self.assertEqual(code, 1)
        self.assertIn("already has files", err)
        self.assertEqual(run(self.root, "scaffold", slug, "--dir", "admin")[0], 0)
        self.assertEqual(self.product(slug)["stack"]["components"], ["admin"])
        self.assertEqual(run(self.root, "scaffold", slug, "--starter", "nope")[0], 1)


class TestHelpers(unittest.TestCase):
    def test_slugify(self) -> None:
        self.assertEqual(factory.slugify("Ação Rápida: Faturas & Recibos!"), "acao-rapida-faturas-recibos")
        self.assertEqual(factory.slugify("   "), "produto")
        self.assertLessEqual(len(factory.slugify("x" * 100)), 40)

    def test_schema_subset(self) -> None:
        schema = {
            "type": "object",
            "required": ["a"],
            "additionalProperties": False,
            "properties": {"a": {"type": "string", "pattern": "^x"}, "b": {"$ref": "#/$defs/n"}},
            "$defs": {"n": {"type": ["integer", "null"], "minimum": 1}},
        }
        self.assertEqual(factory.validate_schema({"a": "xy", "b": None}, schema), [])
        errors = factory.validate_schema({"a": "y", "b": 0, "c": 1}, schema)
        self.assertEqual(len(errors), 3, errors)
        self.assertTrue(factory.validate_schema({"a": "x", "b": True}, schema))
        self.assertTrue(factory.validate_schema({}, schema))


class TestRepoState(unittest.TestCase):
    """The real repository's products must always validate."""

    def test_repository_products_validate(self) -> None:
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = factory.main(["--root", str(REPO), "validate"])
        self.assertEqual(code, 0, out.getvalue())


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    block = text[4 : text.index("\n---", 4)]
    fields = {}
    for line in block.splitlines():
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip().strip('"')
    return fields


class TestRepoStructure(unittest.TestCase):
    """Cross-file consistency of the factory (skills, agents, workflow, references)."""

    MODELS = {"sonnet", "haiku", "opus", "fable", "inherit"}
    EFFORTS = {"low", "medium", "high", "xhigh", "max"}
    BUILTIN_AGENTS = {"general-purpose", "Explore", "Plan"}

    def test_skills_have_valid_frontmatter(self) -> None:
        skills = sorted((REPO / ".claude" / "skills").glob("*/SKILL.md"))
        self.assertGreaterEqual(len(skills), 8)
        for path in skills:
            fm = frontmatter(path)
            self.assertEqual(fm.get("name"), path.parent.name, path)
            self.assertGreater(len(fm.get("description", "")), 40, path)

    def test_agents_have_valid_frontmatter(self) -> None:
        agents = sorted((REPO / ".claude" / "agents").glob("*.md"))
        self.assertGreaterEqual(len(agents), 12)
        for path in agents:
            fm = frontmatter(path)
            self.assertEqual(fm.get("name"), path.stem, path)
            self.assertGreater(len(fm.get("description", "")), 40, path)
            self.assertIn(fm.get("model"), self.MODELS, path)
            self.assertIn(fm.get("effort"), self.EFFORTS, path)

    def test_workflow_agent_types_exist(self) -> None:
        source = (REPO / ".claude" / "workflows" / "idea-to-product.js").read_text(encoding="utf-8")
        used = set(re.findall(r"agentType: '([a-z-]+)'", source))
        used |= set(re.findall(r"'((?:fullstack|mobile)-engineer)'", source))
        self.assertTrue(used)
        known = {p.stem for p in (REPO / ".claude" / "agents").glob("*.md")} | self.BUILTIN_AGENTS
        self.assertEqual(sorted(used - known), [])

    def test_phase_playbooks_exist(self) -> None:
        for phase in json.loads((REPO / "factory" / "phases.json").read_text(encoding="utf-8"))["phases"]:
            if phase["id"] == "intake" or phase.get("playbook"):
                self.assertTrue((REPO / phase["playbook"]).is_file(), phase["playbook"])

    def test_file_references_resolve(self) -> None:
        """Every concrete factory/... or .claude/... path mentioned in docs and code exists."""
        pattern = re.compile(r"(?<![\w/.-])((?:factory|\.claude)/[A-Za-z0-9_./-]+[A-Za-z0-9_/-])")
        sources = [
            p
            for p in REPO.rglob("*")
            if p.is_file()
            and p.suffix in {".md", ".js", ".mjs", ".py", ".yml", ".json", ".sh"}
            and not any(part in {"node_modules", ".git", "products", ".next"} for part in p.parts)
        ]
        generated = {"node_modules", ".next", "out", "dist", "test-results", "playwright-report", "coverage"}
        missing = []
        for src in sources:
            for ref in pattern.findall(src.read_text(encoding="utf-8", errors="ignore")):
                ref = ref.rstrip(".")
                if any(token in ref for token in ("NN", "<", "*", "{", "$")):
                    continue
                if generated & set(ref.split("/")):
                    continue  # runtime paths (installed deps, build output) are not repository files
                if not (REPO / ref).exists():
                    missing.append(f"{src.relative_to(REPO)} → {ref}")
        self.assertEqual(missing, [], "broken references:\n" + "\n".join(missing))


if __name__ == "__main__":
    unittest.main()
