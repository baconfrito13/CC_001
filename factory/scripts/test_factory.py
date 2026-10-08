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
import unittest.mock
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


class GitRepoTestCase(FactoryTestCase):
    """A real git repository with an origin, for commands that read every branch."""

    clock = 1_790_000_000

    def git(self, *argv: str) -> str:
        GitRepoTestCase.clock += 60  # strictly increasing commit times
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

    def init_repo(self) -> None:
        origin = tempfile.TemporaryDirectory()
        self.addCleanup(origin.cleanup)
        subprocess.run(["git", "init", "-q", "--bare", origin.name], check=True)
        self.git("init", "-q", "-b", "main")
        self.git("remote", "add", "origin", origin.name)
        self.commit_all("factory")
        self.git("push", "-q", "origin", "main")


class TestPortfolio(GitRepoTestCase):
    """Products live on their own branches; the portfolio must see all of them."""

    def test_scans_branches_dedupes_and_filters_inbox(self) -> None:
        self.init_repo()

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


class TestLearning(FactoryTestCase):
    """The factory learns from every product: lessons and metrics are recorded as it works."""

    def test_lesson_appends_formatted_lines_and_dedupes(self) -> None:
        slug = self.new()
        code, _, err = run(self.root, "lesson", slug, "--phase", "qa", "--kind", "win", "--text", "  E2E per story first   made QA pass in round 1 ")
        self.assertEqual(code, 0, err)
        path = self.root / "products" / slug / "docs" / "lessons.md"
        text = path.read_text(encoding="utf-8")
        self.assertTrue(text.startswith("# Lessons — Recibos Fáceis"))
        self.assertIn("- 2026-10-08 · qa · win · E2E per story first made QA pass in round 1\n", text)
        # the same lesson again (other case and spacing) is not duplicated
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "qa", "--kind", "win", "--text", "e2e per story first made qa pass in round 1")[0], 0)
        self.assertEqual(path.read_text(encoding="utf-8").count("E2E per story"), 1)
        # trends carry their source — kept even for long text — or are flagged as unsourced
        long_text = "AI answers send referral traffic " + "x" * 600
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "research", "--kind", "trend", "--text", long_text, "--source", "https://example.com/r")[0], 0)
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "gtm", "--kind", "trend", "--text", "Short videos convert better this year")[0], 0)
        # text too short to help is skipped without failing; comment markers cannot hide lessons
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "build", "--kind", "mistake", "--text", "- oops")[0], 0)
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "build", "--kind", "mistake", "--text", "Never trust <!-- in user input")[0], 0)
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "general", "--kind", "preference", "--text", "Founder prefers one-time prices")[0], 0)
        lessons = factory.parse_lessons(path.read_text(encoding="utf-8"))
        self.assertEqual(
            [(item["phase"], item["kind"]) for item in lessons],
            [("qa", "win"), ("research", "trend"), ("gtm", "trend"), ("build", "mistake"), ("general", "preference")],
        )
        self.assertTrue(lessons[1]["text"].endswith("(source: https://example.com/r)"))
        self.assertTrue(lessons[2]["text"].endswith("(unsourced)"))
        self.assertNotIn("<!--", path.read_text(encoding="utf-8"))
        self.assertEqual(run(self.root, "lesson", slug, "--phase", "nope", "--kind", "win", "--text", "long enough text")[0], 1)
        # lines written before kinds existed still count; stray list items are reported, not lost
        self.assertEqual(factory.parse_lessons("- 2026-01-01 · build · an old style lesson")[0]["kind"], "note")
        self.assertEqual(factory.unparsed_lessons("# T\n- free-form note\n* another\n- 2026-01-01 · qa · win · ok text\n"), 2)

    def test_metric_sets_adds_and_records_the_factory_revision(self) -> None:
        slug = self.new()
        self.assertEqual(run(self.root, "metric", slug, "qa_rounds+=2", "g2_passed=true", "mrr_eur=12.5", "--once", "run1:qa")[0], 0)
        self.assertEqual(run(self.root, "metric", slug, "qa_rounds+=2", "--once", "run1:qa")[0], 0, "a replay is a no-op")
        self.assertEqual(self.product(slug)["metrics"]["qa_rounds"], 2)
        self.assertEqual(self.product(slug)["metrics_applied"], ["run1:qa"])
        self.assertEqual(run(self.root, "metric", slug, "qa_rounds+=1", "channel=reddit", "--factory-rev")[0], 0)
        metrics = self.product(slug)["metrics"]
        self.assertEqual({k: metrics[k] for k in ("qa_rounds", "g2_passed", "mrr_eur", "channel")},
                         {"qa_rounds": 3, "g2_passed": True, "mrr_eur": 12.5, "channel": "reddit"})
        self.assertEqual(metrics["factory_rev"], "unknown")  # not a git checkout here
        self.assertEqual(run(self.root, "metric", slug, "channel+=1")[0], 1, "+= needs numbers")
        self.assertEqual(run(self.root, "metric", slug, "Bad-Key=1")[0], 1)
        self.assertEqual(run(self.root, "metric", slug, "list=[1,2]")[0], 1)
        self.assertEqual(run(self.root, "metric", slug)[0], 1, "nothing to record")
        self.assertEqual(run(self.root, "set", slug, "metrics.nested", '{"a": 1}')[0], 1, "metrics hold scalars only")
        self.assertEqual(run(self.root, "validate", slug)[0], 0)

    def test_phase_hours_come_from_completion_times(self) -> None:
        os.environ["FACTORY_NOW"] = "2026-10-08T09:00:00Z"
        self.addCleanup(os.environ.pop, "FACTORY_NOW", None)
        slug = self.new()
        steps = [("10:30", ["intake"]), ("12:00", ["research"]), ("13:00", ["strategy", "brand"])]
        for clock, phases in steps:
            os.environ["FACTORY_NOW"] = f"2026-10-08T{clock}:00Z"
            for phase in phases:  # straight to done, as the pipeline's checkpoints do
                self.assertEqual(run(self.root, "set-phase", slug, phase, "done", "--force")[0], 0)
        product = self.product(slug)
        self.assertEqual(product["phases"]["intake"]["started_at"], "2026-10-08T09:00:00Z")
        self.assertNotIn("started_at", product["phases"]["research"], "only a real start is stamped")
        self.assertEqual(factory.phase_hours_of(product["phases"]), {"intake": 1.5, "research": 1.5, "strategy": 1.0, "brand": 1.0})
        self.assertEqual(factory.phase_hours_of({"qa": {"status": "done"}, "intake": "odd"}), {})


class TestRetro(GitRepoTestCase):
    def test_retro_reads_lessons_and_metrics_on_every_branch(self) -> None:
        self.init_repo()
        self.git("checkout", "-qb", "produto/alpha")
        self.new(name="Alpha", idea="ideia alfa")
        os.environ["FACTORY_TODAY"] = "2026-10-10"
        run(self.root, "set-phase", "alpha", "intake", "done")
        run(self.root, "lesson", "alpha", "--phase", "qa", "--kind", "mistake", "--text", "Stripe webhooks need the forwarder before e2e")
        run(self.root, "metric", "alpha", "qa_rounds=3", "g2_passed=true")
        self.commit_all("alpha")
        self.git("push", "-q", "origin", "produto/alpha")
        # an older copy of alpha on another branch carries a lesson the newest copy lacks
        self.git("checkout", "-qb", "claude/alpha-old", "HEAD~0")
        run(self.root, "lesson", "alpha", "--phase", "build", "--kind", "method", "--text", "Scaffold first, then brand tokens")
        self.commit_all("alpha lesson on a side branch")
        self.git("push", "-q", "origin", "claude/alpha-old")
        self.git("checkout", "-q", "produto/alpha")
        run(self.root, "set", "alpha", "status", "needs-founder")
        self.commit_all("alpha newest")
        self.git("push", "-q", "origin", "produto/alpha")
        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", "produto/beta")
        self.new(name="Beta", idea="ideia beta")
        os.environ["FACTORY_TODAY"] = "2026-10-12"
        run(self.root, "lesson", "beta", "--phase", "gtm", "--kind", "win", "--text", "A niche subreddit launch beat Product Hunt")
        run(self.root, "metric", "beta", "qa_rounds=1", "g2_passed=false")
        with (self.root / "products" / "beta" / "docs" / "lessons.md").open("a", encoding="utf-8") as fh:
            fh.write("- a free-form note\n")
        self.commit_all("beta")
        self.git("push", "-q", "origin", "produto/beta")
        # a branch with odd metrics must not break the report
        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", "produto/gamma")
        self.new(name="Gamma", idea="ideia gama")
        path = self.root / "products" / "gamma" / "product.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["metrics"] = ["not", "a", "dict"]
        path.write_text(json.dumps(data), encoding="utf-8")
        self.commit_all("gamma odd")
        self.git("push", "-q", "origin", "produto/gamma")
        self.git("checkout", "-q", "main")
        self.git("fetch", "-q", "origin")

        code, out, err = run(self.root, "retro", "--json")
        self.assertEqual(code, 0, err)
        report = json.loads(out)
        products = {p["slug"]: p for p in report["products"]}
        self.assertEqual(sorted(products), ["alpha", "beta", "gamma"])
        self.assertEqual(products["alpha"]["status"], "needs-founder")
        self.assertEqual(products["alpha"]["phase_hours"], {"intake": 48.0})
        self.assertEqual(products["gamma"]["metrics"], {})
        totals = report["totals"]
        self.assertEqual(totals["median_metrics"]["qa_rounds"], 2)
        self.assertEqual(totals["rates"]["g2_passed"], 0.5)
        self.assertEqual(totals["lessons_by_kind"], {"mistake": 1, "method": 1, "win": 1})
        self.assertEqual(totals["lessons_new"], 3)
        self.assertEqual(totals["lessons_unparsed"], 1)
        ids = {item["text"]: item["id"] for item in report["lessons"]}
        self.assertIn("Scaffold first, then brand tokens", ids, "lessons on non-newest branches are read")
        # the improvement cycle marks what it processed; --new then hides it
        stripe = ids["Stripe webhooks need the forwarder before e2e"]
        self.assertEqual(run(self.root, "retro", "--mark-seen", stripe)[0], 0)
        self.assertEqual(run(self.root, "retro", "--mark-seen", stripe)[0], 0)
        self.assertEqual((self.root / "factory" / "knowledge" / "lessons-seen.txt").read_text(encoding="utf-8").count(stripe), 1)
        fresh = json.loads(run(self.root, "retro", "--json", "--new")[1])
        self.assertEqual(sorted(item["slug"] for item in fresh["lessons"]), ["alpha", "beta"])
        self.assertEqual(fresh["totals"]["lessons_new"], 2)
        recent = json.loads(run(self.root, "retro", "--json", "--since", "2026-10-11")[1])
        self.assertEqual([item["slug"] for item in recent["lessons"]], ["beta"])
        self.assertEqual(run(self.root, "retro", "--mark-seen", "nothex")[0], 1)
        self.assertEqual(run(self.root, "retro", "--since", "yesterday")[0], 1)
        code, out, _ = run(self.root, "retro")
        self.assertEqual(code, 0)
        self.assertIn("A niche subreddit launch beat Product Hunt", out)
        self.assertNotIn("Stripe webhooks", out.split("## Lições por processar")[-1])


class TestDashboard(GitRepoTestCase):
    """The founder's dashboard reads every branch and the knowledge base, never lesson texts."""

    TASKS = (
        "# Tarefas do fundador — Alpha\n\n"
        "<!--\n- [ ] **HT-99 · Exemplo do modelo** — ⏱ 4 min · 💶 ≈ 12 €/ano\n-->\n\n"
        "## 🔴 Bloqueiam o lançamento\n\n"
        "- [ ] **HT-01 · Comprar o domínio `alpha.pt`** — ⏱ 4 min · 💶 ≈ 12 €/ano\n"
        "  - **Porquê:** detalhe, não é tarefa\n"
        "## 🟡 Antes do lançamento\n\n"
        "- [ ] **HT-02 · Criar conta Stripe** — ⏱ 5 min · 💶 0 €\n"
        "## ✅ Concluídas\n\n"
        "- [x] **HT-03 · Escolher o nome** — ⏱ 1 min\n"
    )

    def test_tasks_and_knowledge_parsing(self) -> None:
        tasks = factory.parse_founder_tasks(self.TASKS)
        self.assertEqual([t["id"] for t in tasks], ["HT-01", "HT-02", "HT-03"], "the commented example is skipped")
        self.assertEqual(tasks[0], {"id": "HT-01", "title": "Comprar o domínio alpha.pt", "done": False,
                                    "priority": "red", "minutes": 4, "cost": "≈ 12 €/ano"})
        self.assertEqual((tasks[1]["priority"], tasks[2]["priority"], tasks[2]["done"]), ("amber", "done", True))

        knowledge = self.root / "factory" / "knowledge"
        knowledge.mkdir(parents=True)
        (self.root / "factory" / "LEARNINGS.md").write_text(
            "# L\n\n## Factory (every phase)\n\n- 2026-10-01 · mistake · one\n- 2026-10-02 · win · two\n\n## QA\n\n_None yet._\n",
            encoding="utf-8",
        )
        (knowledge / "radar.md").write_text(
            "Last sweep: 2026-09-01 (x)\n\n| Area | Fact | Value | Verified | Source | Recheck by |\n|---|---|---|---|---|---|\n"
            "| Stack | Old fact | v | 2026-08-01 | s | 2026-09-01 |\n| Legal | Fresh fact | v | 2026-10-01 | s | 2027-01-01 |\n",
            encoding="utf-8",
        )
        (knowledge / "trends.md").write_text(
            "# T\n\n## Channels\n\n- 2026-10-01 · AI answers · evidence: https://e.x (accessed 2026-10-01)\n\n## Ideias sugeridas\n\n"
            "| # | Date | Idea | Why now | Rough G1 | Status |\n|---|---|---|---|---|---|\n| 1 | 2026-10-01 | Uma app | porque sim | 3.6 | sugerida |\n",
            encoding="utf-8",
        )
        (knowledge / "improvements.md").write_text(
            "## Changelog\n\n| Date | Change | Evidence | Watch | PR |\n|---|---|---|---|---|\n| 2026-10-08 | X | Y | Z | #1 |\n\n"
            "## Experiments\n\n| ID | Since | Hypothesis | Change | Metric | Products | Result |\n|---|---|---|---|---|---|---|\n"
            "| E-1 | 2026-10-01 | h | c | m | 1 | |\n| E-2 | 2026-09-01 | h | c | m | 3 | keep |\n",
            encoding="utf-8",
        )
        (knowledge / "scoreboard.md").write_text("| Week | Products |\n|---|---|\n| 2026-W41 | 1 · 0 · 0 |\n", encoding="utf-8")
        (knowledge / "patterns.md").write_text("### P-001 · Ship it\n- **What:** x\n", encoding="utf-8")
        summary = factory._knowledge_summary(factory.Factory(self.root))
        self.assertEqual(summary["learnings_by_phase"], {"Factory (every phase)": 2, "QA": 0})
        self.assertEqual((summary["learnings"], summary["patterns"], summary["trends"]), (2, 1, 1))
        self.assertEqual([r["due"] for r in summary["radar"]], [True, False])
        self.assertEqual(summary["radar_last_sweep"], "2026-09-01")
        self.assertEqual(summary["suggestions"][0]["idea"], "Uma app")
        self.assertEqual((summary["improvements"], summary["experiments_open"]), (1, 1))
        self.assertEqual(summary["scoreboard"], {"header": ["Week", "Products"], "rows": [["2026-W41", "1 · 0 · 0"]]})

    def test_documents_cover_every_branch_without_lesson_texts(self) -> None:
        self.init_repo()
        self.git("checkout", "-qb", "produto/alpha")
        self.new(name="Alpha", idea="ideia alfa")
        run(self.root, "set-phase", "alpha", "intake", "done", "--summary", "brief pronto")
        run(self.root, "set-phase", "alpha", "research", "in_progress")
        run(self.root, "lesson", "alpha", "--phase", "qa", "--kind", "mistake", "--text", "Secret lesson text stays out")
        run(self.root, "set", "alpha", "links.pr", "https://github.com/o/r/pull/7")
        run(self.root, "set", "alpha", "links.domain", "alpha.pt")
        run(self.root, "set", "alpha", "stack.hosting", "vercel")
        self.touch("alpha", "HUMAN_TASKS.md", self.TASKS)
        self.touch("alpha", "docs/00-brief.md", "# Brief")
        self.commit_all("alpha")
        self.git("push", "-q", "origin", "produto/alpha")
        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", "produto/beta")
        self.new(name="Beta", idea="ideia beta")
        self.commit_all("beta")
        self.git("push", "-q", "origin", "produto/beta")
        self.git("checkout", "-q", "main")
        self.git("fetch", "-q", "origin")
        (self.root / "ideas").mkdir()
        (self.root / "ideas" / "INBOX.md").write_text("## Por processar\n- ideia beta\n- uma ideia nova\n", encoding="utf-8")

        out = self.root.parent / f"{self.root.name}-painel"
        self.addCleanup(shutil.rmtree, out, True)
        code, stdout, err = run(self.root, "dashboard", "--out", str(out))
        self.assertEqual(code, 0, err)
        batches = json.loads((out / "batches.json").read_text(encoding="utf-8"))
        self.assertEqual([(w["op"], w["collection"], w["doc_id"], "if_version" in w) for w in batches[0]],
                         [("set", "state", "summary", False), ("set", "products", "alpha", False), ("set", "products", "beta", False)])
        everything = "".join(Path(w["file_path"]).read_text(encoding="utf-8") for w in batches[0])
        self.assertNotIn("Secret lesson text", everything, "lesson texts never reach the dashboard")
        # writes to existing documents carry their version; stale products are deleted only with --prune
        versions = json.dumps({"state/summary": 4, "products/alpha": 2, "products/gone": 7})
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--versions", versions)[0], 0)
        kept = json.loads((out / "batches.json").read_text(encoding="utf-8"))[0]
        self.assertEqual([w.get("if_version") for w in kept], [4, 2, None])
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--versions", versions, "--prune")[0], 0)
        pruned = json.loads((out / "batches.json").read_text(encoding="utf-8"))[0]
        self.assertEqual(pruned[-1], {"op": "delete", "collection": "products", "doc_id": "gone", "if_version": 7})
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--versions", '{"other/x": 1}')[0], 1)
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--versions", '{"products/a": true}')[0], 1)
        # ideas queued as issues come from the session's GitHub tools, checked before they are shown
        queued = '[{"number": 12, "title": "💡 Uma app de rendas", "url": "https://github.com/o/r/issues/12"}]'
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--queued", queued)[0], 0)
        self.assertEqual(json.loads((out / "state" / "summary.json").read_text(encoding="utf-8"))["queued"][0]["number"], 12)
        bad = '[{"number": 12, "title": "x", "url": "javascript:alert(1)//github.com/o/r/issues/12"}]'
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--queued", bad)[0], 1)
        self.assertEqual(run(self.root, "dashboard", "--out", str(out), "--queued", '[{"number": 3, "title": "x", "url": "https://github.com/o/r/issues/4"}]')[0], 1)
        alpha = json.loads((out / "products" / "alpha.json").read_text(encoding="utf-8"))
        self.assertEqual(alpha["branch"], "produto/alpha")
        self.assertEqual(alpha["remote_branch"], "produto/alpha")
        self.assertEqual(alpha["progress"], {"done": 1, "total": 11})
        self.assertEqual([p["status"] for p in alpha["phases"][:3]], ["done", "in_progress", "pending"])
        self.assertEqual(alpha["phases"][0]["summary"], "brief pronto")
        self.assertEqual(alpha["founder_tasks"]["open"], 2)
        self.assertEqual(alpha["founder_tasks"]["minutes_open"], 9)
        self.assertEqual(alpha["lessons"], {"total": 1, "by_kind": {"mistake": 1}})
        self.assertEqual(alpha["links"], {"pr": "https://github.com/o/r/pull/7", "domain": "https://alpha.pt"})
        self.assertEqual(alpha["stack"], {"hosting": "vercel"})
        self.assertEqual(
            alpha["docs"],
            ["products/alpha/HUMAN_TASKS.md", "products/alpha/README.md", "products/alpha/docs/00-brief.md"],
            "lessons.md stays out",
        )
        summary = json.loads((out / "state" / "summary.json").read_text(encoding="utf-8"))
        self.assertEqual(summary["totals"]["products"], 2)
        self.assertEqual(summary["totals"]["by_phase"], {"research": 1, "intake": 1})
        self.assertEqual(summary["totals"]["founder_tasks_open"], 2)
        self.assertEqual(summary["inbox"], ["uma ideia nova"], "ideas already taken are not listed")
        self.assertEqual([p["id"] for p in summary["pipeline"]][:2], ["intake", "research"])
        self.assertEqual(len(json.loads(run(self.root, "dashboard")[1])["products"]), 2)
        # many products split into batches of at most 50 writes
        entries = [{"product": {"slug": f"p{i:03d}", "name": "P"}, "branch": "main", "key": (0, False), "tasks": (0, 0), "tasks_text": ""}
                   for i in range(60)]
        with unittest.mock.patch.object(factory, "scan_branches", return_value=entries):
            self.assertEqual(run(self.root, "dashboard", "--out", str(out))[0], 0)
        self.assertEqual([len(b) for b in json.loads((out / "batches.json").read_text(encoding="utf-8"))], [50, 11])


class TestScope(GitRepoTestCase):
    """Who may merge a change depends on what it touches (CLAUDE.md, Merges)."""

    def change(self, branch: str, files: dict[str, str], rename: tuple[str, str] | None = None) -> None:
        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", branch)
        for rel, content in files.items():
            path = self.root / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        if rename:
            (self.root / rename[1]).parent.mkdir(parents=True, exist_ok=True)
            self.git("mv", *rename)
        self.commit_all(branch)

    def scope(self, branch: str, *extra: str) -> tuple[int, dict]:
        code, out, err = run(self.root, "scope", "--base", "main", "--head", branch, "--json", *extra)
        return code, json.loads(out) if out.strip().startswith("{") else {"err": err}

    def test_classifies_paths_and_enforces_requirements(self) -> None:
        self.assertEqual(factory.scope_of("products/alpha/docs/lessons.md"), "product")
        self.assertEqual(factory.scope_of("products/alpha/app/src/página.tsx"), "product")
        # rule and tool files are control wherever they sit (nested CLAUDE.md loads on demand)
        for control in ("factory/knowledge/CLAUDE.md", "factory/playbooks/claude.md", "products/foo/CLAUDE.md",
                        "products/foo/app/.claude/skills/x/SKILL.md", "products/foo/.mcp.json", "factory/knowledge/AGENTS.md",
                        "products/foo/../../CLAUDE.md", "factory/playbooks/helper.sh", "factory/knowledge/data.json"):
            self.assertEqual(factory.scope_of(control), "control", control)
        for sensitive in ("factory/playbooks/06-qa.md", "factory/playbooks/08-gtm.md", "factory/stacks/web-saas.md",
                          "factory/templates/HUMAN_TASKS.md", "factory/templates/compliance.md"):
            self.assertEqual(factory.scope_of(sensitive), "sensitive", sensitive)
        self.assertEqual(factory.scope_of("factory/LEARNINGS.md"), "data")
        self.assertEqual(factory.scope_of("factory/knowledge/patterns.md"), "data")
        self.assertEqual(factory.scope_of("factory/knowledge/README.md"), "sensitive")
        self.assertEqual(factory.scope_of("factory/playbooks/05-build.md"), "method")
        self.assertEqual(factory.scope_of("factory/playbooks/07-legal.md"), "sensitive")
        self.assertEqual(factory.scope_of("factory/templates/legal/terms.pt.md"), "sensitive")
        self.assertEqual(factory.scope_of("factory/starters/web/package.json"), "sensitive")
        for control in ("CLAUDE.md", ".claude/settings.json", ".github/workflows/x.yml", "factory/scripts/factory.py", "FOUNDER.md"):
            self.assertEqual(factory.scope_of(control), "control", control)

        (self.root / "factory" / "playbooks").mkdir(parents=True)
        (self.root / "factory" / "playbooks" / "05-build.md").write_text("x", encoding="utf-8")
        (self.root / ".claude").mkdir()
        (self.root / ".claude" / "settings.json").write_text("{}", encoding="utf-8")
        self.init_repo()

        self.change("produto/alpha", {"products/alpha/README.md": "a"})
        self.assertEqual(self.scope("produto/alpha", "--require", "product", "--slug", "alpha")[0], 0)
        self.assertEqual(self.scope("produto/alpha", "--require", "product", "--slug", "beta")[0], 1)

        self.change("produto/sneaky", {"products/alpha/README.md": "a", "CLAUDE.md": "relaxed rules"})
        code, report = self.scope("produto/sneaky", "--require", "product")
        self.assertEqual((code, report["verdict"]), (1, "control"))

        self.change("fabrica/melhoria-1", {"factory/LEARNINGS.md": "l", "factory/knowledge/patterns.md": "p"})
        self.assertEqual(self.scope("fabrica/melhoria-1", "--require", "data")[0], 0)

        self.change("fabrica/melhoria-2", {"factory/knowledge/trends.md": "t", "factory/playbooks/05-build.md": "better"})
        self.assertEqual(self.scope("fabrica/melhoria-2", "--require", "data")[0], 1)
        self.assertEqual(self.scope("fabrica/melhoria-2", "--require", "method")[0], 0)

        # a rename out of a control path counts both sides
        self.change("fabrica/melhoria-3", {}, rename=(".claude/settings.json", "factory/templates/settings.json"))
        code, report = self.scope("fabrica/melhoria-3", "--require", "method")
        self.assertEqual(code, 1)
        self.assertIn(".claude/settings.json", [p["path"] for p in report["paths"]])

        # symlinks count as control even where the path looks like knowledge
        self.git("checkout", "-q", "main")
        self.git("checkout", "-qb", "fabrica/melhoria-4")
        (self.root / "factory" / "knowledge").mkdir(parents=True, exist_ok=True)
        os.symlink("../../.claude/settings.json", self.root / "factory" / "knowledge" / "link.md")
        self.commit_all("symlink")
        code, report = self.scope("fabrica/melhoria-4", "--require", "data")
        self.assertEqual((code, report["verdict"]), (1, "control"))

        # non-ASCII names parse; dependency-only changes pass --require deps
        self.change("produto/acentos", {"products/alpha/docs/ação.md": "a"})
        self.assertEqual(self.scope("produto/acentos", "--require", "product", "--slug", "alpha")[0], 0)
        self.change("dependabot/npm", {"products/alpha/app/package.json": "{}", "products/alpha/app/package-lock.json": "{}"})
        self.assertEqual(self.scope("dependabot/npm", "--require", "deps")[0], 0)
        self.change("dependabot/actions", {".github/workflows/ci.yml": "x"})
        self.assertEqual(self.scope("dependabot/actions", "--require", "deps")[0], 1)

        self.git("checkout", "-q", "main")
        self.assertEqual(self.scope("main", "--require", "data")[0], 1, "an empty change is not mergeable")
        self.assertEqual(run(self.root, "scope", "--base", "main", "--head", "no-such-branch")[0], 1)


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
            and not p.name.startswith("test_")  # tests name made-up paths on purpose
            and not p.name.endswith(".test.mjs")
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
