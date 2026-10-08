# Radar — facts the factory relies on

Last sweep: 2026-10-08 (initial, from the factory build). `/radar` re-verifies every row past its
"Recheck by" date, monthly; an agent that re-verifies a fact while working updates its row.

| Area | Fact | Value, or where it lives | Verified | Source | Recheck by |
|---|---|---|---|---|---|
| Stack | Web starter dependencies | Next.js 16.4.0, React 19.3.0, TypeScript 7.0.2, Tailwind 4.3.3, Biome 2.5.15, Vitest 5.0.3, Playwright 1.64.0, Stripe SDK 23.0.0, zod 4.6.5, resend 6.32.1, marked 18.1.0 — `factory/starters/web/package.json` | 2026-10-08 | npm registry (`npm view <pkg> version`) | 2026-11-08 |
| Stack | Node.js runtime | Node 22 (`engines`, CI); `@types/node` follows its major — `.github/dependabot.yml` | 2026-10-08 | Node release schedule | 2026-11-08 |
| Deploy | CLI flags | Vercel CLI 63.1.0, Wrangler 4.148.0, EAS CLI 24.12.0, Supabase CLI 2.120.0 — `factory/playbooks/09-launch.md` | 2026-10-08 | each CLI's `--help` | 2026-11-08 |
| Hosting | Vercel Hobby is non-commercial | monetized products on Vercel Pro or Cloudflare — `factory/LEARNINGS.md` | 2026-10-08 | Vercel plans and fair-use pages | 2027-01-08 |
| Payments | Rail fees and eligibility (Stripe Managed Payments, Paddle, Polar, Gumroad, Stripe direct) | `factory/playbooks/monetization.md` | 2026-10-08 | pages listed in that playbook | 2027-01-08 |
| Legal | EU/PT volatile facts (consumer law, GDPR, cookies, AI Act, accessibility, DSA, VAT) | `factory/playbooks/07-legal.md`, "Volatile facts register" | 2026-10-08 | primary texts listed there | 2027-01-06 |
| GitHub | Rulesets: public repos on Free; private repos need Pro or Team | `SETUP.md`, step 1 | 2026-10-08 | docs.github.com — managing rulesets | 2027-01-08 |
| GitHub | Actions on private repos: 2000 min/month on Free, 3000 on Pro | `SETUP.md`, step 1 | 2026-10-08 | docs.github.com — Actions billing | 2027-01-08 |
| QA | Lighthouse 13.5 flags in the sandbox | `factory/LEARNINGS.md` | 2026-10-08 | `lighthouse --help` | 2026-11-08 |
| Claude Code | Routines that start a fresh session have no connectors; the autopilot is a self-bound routine of the Capataz session | `factory/LEARNINGS.md`, `/autopiloto` | 2026-10-08 | live test | 2027-01-08 |
| Claude Code | Cloud "Accept edits" mode asks before tools outside `permissions.allow` | `.claude/settings.json`, `SETUP.md` step 4 | 2026-10-08 | Claude Code cloud documentation | 2027-01-08 |
