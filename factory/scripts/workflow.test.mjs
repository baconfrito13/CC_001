// Control-flow tests for .claude/workflows/idea-to-product.js — run: node --test factory/scripts/
import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createRuntime, loadWorkflow } from './workflow-harness.mjs'

const WORKFLOW = fileURLToPath(new URL('../../.claude/workflows/idea-to-product.js', import.meta.url))
const wf = loadWorkflow(WORKFLOW)
const ALL = ['research', 'strategy', 'brand', 'architecture', 'build', 'qa', 'legal', 'gtm', 'launch']
const go = (score) => ({ score, verdict: 'go', knockout: null, wedge: 'w', pivot: null, top_risks: [], summary: `go ${score}` })
const qaWith = (defects) => ({
  checks: { lint: true, typecheck: true, unit: true, e2e: true, build: true },
  defects,
  scores: { performance: 95, accessibility: 100, best_practices: 100, seo: 100 },
  summary: 'qa',
})

async function run(args, overrides) {
  const rt = createRuntime({ args, overrides })
  const result = await wf.run(rt.hooks)
  return { rt, result }
}

test('meta is a pure literal and every phase title used is declared', () => {
  assert.equal(wf.meta.name, 'idea-to-product')
  const declared = new Set(wf.meta.phases.map((p) => p.title))
  for (const title of wf.phaseTitles) assert.ok(declared.has(title), `phase "${title}" missing from meta.phases`)
})

test('requires a slug', async () => {
  await assert.rejects(() => wf.run(createRuntime({ args: {} }).hooks), /args.slug is required/)
})

test('standard GO run: every phase, gates, one git writer at a time', async () => {
  const { rt, result } = await run({ slug: 'demo', type: 'web-saas' }, { 'research:synthesis': go(3.8) })
  assert.deepEqual(result.ran, ['research', 'strategy', 'brand', 'architecture', 'legal', 'gtm', 'build', 'qa'])
  assert.equal(result.stopped, 'waiting-founder')
  assert.equal(result.gate1.verdict, 'go')
  assert.equal(result.gate2.passed, true)
  assert.equal(result.preview, 'https://demo.vercel.app')
  assert.equal(rt.state.maxGitWriters, 1, 'checkpoints must never run concurrently')
  const labels = rt.labels()
  for (const track of ['research:market', 'research:competitors', 'research:audience', 'research:risks', 'research:critic']) {
    assert.ok(labels.includes(track), track)
  }
  assert.ok(!labels.some((l) => l.startsWith('strategy:user-first')), 'no proposals at standard depth')
  assert.ok(labels.includes('build:auth') && labels.includes('build:core') && labels.includes('build:integration'))
  assert.ok(labels.indexOf('build:integration') > labels.indexOf('build:core'))
  assert.ok(labels.indexOf('qa:round-1') > labels.indexOf('build:integration'))
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:research').prompt.includes('set demo depth standard'))
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:launch-ready').prompt.includes('status needs-founder'))
})

test('high score switches to deep: competing proposals, 3 judges, two clean QA rounds', async () => {
  const card = (n) => ({ proposal: n, speed: 3, wedge: 3, distribution: 3, build: 3, retention: 3, risk: 3, note: '' })
  const judge = { scores: [card(1), { ...card(2), speed: 5, wedge: 5 }, card(3)], graft: ['annual plan'] }
  const { rt, result } = await run({ slug: 'demo', type: 'web-saas' }, {
    'research:synthesis': go(4.4),
    'strategy:judge-investor': judge, 'strategy:judge-user': judge, 'strategy:judge-builder': judge,
  })
  const labels = rt.labels()
  for (const l of ['strategy:user-first', 'strategy:revenue-first', 'strategy:distribution-first',
    'strategy:judge-investor', 'strategy:judge-user', 'strategy:judge-builder', 'strategy:synthesis']) {
    assert.ok(labels.includes(l), l)
  }
  const synthesis = rt.calls.find((c) => c.label === 'strategy:synthesis').prompt
  assert.ok(synthesis.includes('proposal #2 (revenue-first)'), 'the weighted winner is computed in code')
  assert.ok(synthesis.includes('#2 revenue-first = 3.9'))
  assert.ok(synthesis.includes('annual plan'))
  assert.ok(labels.includes('qa:round-2'), 'deep needs two clean rounds')
  assert.ok(!labels.includes('qa:round-3'))
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:research').prompt.includes('set demo depth deep'))
  assert.equal(result.gate2.passed, true)
})

test('strategy ties within 0.15 prefer the revenue-first proposal', async () => {
  const card = (n, v) => ({ proposal: n, speed: v, wedge: v, distribution: v, build: v, retention: v, risk: v })
  const judge = { scores: [card(1, 4), card(2, 3.9), card(3, 2)], graft: [] }
  const { rt } = await run({ slug: 'demo', depth: 'deep', depth_locked: true }, {
    'research:synthesis': go(3.8),
    'strategy:judge-investor': judge, 'strategy:judge-user': judge, 'strategy:judge-builder': judge,
  })
  assert.ok(rt.calls.find((c) => c.label === 'strategy:synthesis').prompt.includes('proposal #2 (revenue-first)'))
})

test('founder-locked depth is not changed by the score', async () => {
  const { rt } = await run({ slug: 'demo', depth: 'standard', depth_locked: true }, { 'research:synthesis': go(4.8) })
  assert.ok(!rt.labels().includes('strategy:user-first'))
})

test('KILL stops after research and flags the founder', async () => {
  const kill = { ...go(2.1), verdict: 'kill', summary: 'no demand' }
  const { rt, result } = await run({ slug: 'demo' }, { 'research:synthesis': kill, 'research:rebuttal': kill })
  assert.equal(result.stopped, 'kill')
  assert.deepEqual(result.ran, ['research'])
  assert.ok(!rt.labels().some((l) => l.startsWith('strategy')))
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:research').prompt.includes('status needs-founder'))
})

test('force overrides KILL', async () => {
  const { result } = await run({ slug: 'demo', force: true }, { 'research:synthesis': { ...go(2.1), verdict: 'kill' } })
  assert.notEqual(result.stopped, 'kill')
  assert.ok(result.ran.includes('strategy'))
})

test('serious critic objections trigger a rebuttal that can change the verdict', async () => {
  const { rt, result } = await run({ slug: 'demo' }, {
    'research:synthesis': go(3.9),
    'research:critic': { survives: 'no', fatal: ['nobody pays'], major: [], changes: [] },
    'research:rebuttal': { ...go(2.5), verdict: 'kill' },
  })
  assert.ok(rt.labels().includes('research:rebuttal'))
  assert.equal(result.stopped, 'kill')
})

test('resume at build skips finished phases', async () => {
  const { rt, result } = await run({ slug: 'demo', type: 'web-saas', done: ['research', 'strategy', 'brand', 'architecture'], app_dir: 'app' })
  const labels = rt.labels()
  assert.equal(labels[0], 'build:plan')
  assert.ok(!labels.some((l) => l.startsWith('research') || l.startsWith('strategy')))
  assert.deepEqual(result.ran, ['legal', 'gtm', 'build', 'qa'])
})

test('QA that never gets clean stops at G2 after max rounds', async () => {
  const blocked = qaWith([{ id: 'D1', severity: 'P1', title: 'signup broken', evidence: 'e2e' }])
  const { rt, result } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture', 'build', 'legal', 'gtm'] }, {
    'qa:round-1': blocked, 'qa:round-2': blocked, 'qa:round-3': blocked,
  })
  assert.equal(result.stopped, 'qa-blocked')
  assert.equal(result.gate2.passed, false)
  const labels = rt.labels()
  assert.ok(labels.includes('fix:round-1') && labels.includes('fix:round-2'))
  assert.ok(!labels.includes('fix:round-3'), 'no fix after the last round')
  assert.ok(labels.includes('checkpoint:qa-blocked'))
})

test('QA defects get fixed and then pass', async () => {
  const { rt, result } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture', 'build', 'legal', 'gtm'] }, {
    'qa:round-1': qaWith([{ id: 'D1', severity: 'P0', title: 'payments', evidence: 'log' }]),
    'security:round-1': { findings: [{ severity: 'high', title: 'IDOR', location: 'api/x.ts:10', fix: 'check owner' }], summary: 's' },
  })
  assert.equal(result.gate2.passed, true)
  const fix = rt.calls.find((c) => c.label === 'fix:round-1')
  assert.ok(fix.prompt.includes('payments') && fix.prompt.includes('IDOR'))
  assert.deepEqual(result.ran, ['qa'])
})

test('lean depth: one research agent, no critic, one QA round', async () => {
  const { rt } = await run({ slug: 'demo', depth: 'lean', depth_locked: true }, { 'research:synthesis': go(3.7) })
  const labels = rt.labels()
  assert.ok(labels.includes('research:all'))
  assert.ok(!labels.includes('research:critic') && !labels.includes('strategy:critic'))
  assert.ok(!labels.includes('qa:round-2'))
})

test('only: re-runs a single phase plus integration, nothing else', async () => {
  const { rt, result } = await run({ slug: 'demo', done: ALL.filter((p) => p !== 'launch'), only: ['legal'] })
  assert.deepEqual(rt.labels().filter((l) => !l.startsWith('checkpoint') && !l.startsWith('save')), ['legal', 'build:integration'])
  assert.deepEqual(result.ran, ['legal'])
})

test('a failed build stops before QA instead of testing nothing', async () => {
  const { result } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture'] }, { 'build:plan': null })
  assert.equal(result.stopped, 'build-failed')
  assert.ok(result.notes.some((n) => n.includes('build failed')))
})

test('production go-live marks the product launched', async () => {
  const { rt, result } = await run({ slug: 'demo', done: ALL.filter((p) => p !== 'launch') }, {
    launch: { preview_url: 'https://p', production_live: true, founder_tasks_open: 0, blocking_tasks: [], summary: 'live' },
  })
  assert.equal(result.stopped, null)
  assert.deepEqual(result.ran, ['launch'])
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:launch').prompt.includes('status launched'))
})

test('G1 is enforced in code: a GO below 3.5 or any knockout becomes KILL', async () => {
  const low = await run({ slug: 'demo' }, { 'research:synthesis': go(3.2) })
  assert.equal(low.result.stopped, 'kill')
  assert.equal(low.result.gate1.verdict, 'kill')
  const ko = await run({ slug: 'demo' }, { 'research:synthesis': { ...go(4.3), knockout: 'needs a banking licence' } })
  assert.equal(ko.result.stopped, 'kill')
  const pivot = await run({ slug: 'demo' }, { 'research:synthesis': { ...go(3.6), verdict: 'pivot', pivot: 'B2B instead of B2C' } })
  assert.notEqual(pivot.result.stopped, 'kill')
  assert.ok(pivot.result.ran.includes('strategy'))
})

test('the decision is recorded by the checkpoint as quote-safe JSON, forced on override', async () => {
  const { rt } = await run({ slug: 'demo' }, { 'research:synthesis': { ...go(3.9), summary: "founder's audience is strong" } })
  const cp = rt.calls.find((c) => c.label === 'checkpoint:research').prompt
  assert.ok(cp.includes(`set demo decision '{"verdict":"go","score":3.9,"rationale":"founder’s audience is strong"}'`), cp)
  assert.ok(rt.calls.find((c) => c.label === 'research:synthesis').prompt.includes('Do not edit product.json'))
  const forced = await run({ slug: 'demo', force: true }, { 'research:synthesis': { ...go(2.2), verdict: 'kill' } })
  assert.ok(forced.rt.calls.find((c) => c.label === 'checkpoint:research').prompt.includes('"forced":true'))
})

test('a failed phase checkpoint aborts the run instead of continuing unsaved', async () => {
  await assert.rejects(
    () => run({ slug: 'demo' }, {
      'research:synthesis': go(3.9),
      'checkpoint:research': { ok: false, pushed: false, problems: ['push rejected'] },
    }),
    /checkpoint:research failed: push rejected/,
  )
})

test('progress is saved inside long phases (research tracks, deep proposals, build skeleton)', async () => {
  const { rt } = await run({ slug: 'demo' }, { 'research:synthesis': go(4.4) })
  const labels = rt.labels()
  const tracksSave = rt.calls.find((c) => c.label.startsWith('save:research'))
  assert.ok(tracksSave && tracksSave.prompt.includes('set-phase demo research in_progress'))
  assert.ok(labels.indexOf('save:research — track notes') < labels.indexOf('research:synthesis'))
  assert.ok(labels.some((l) => l.startsWith('save:strategy')))
  assert.ok(rt.calls.find((c) => c.label.startsWith('save:build — skeleton')).prompt.includes('set-phase demo build in_progress'))
  assert.ok(!rt.calls.some((c) => c.agentType === 'factory-clerk' && c.prompt.includes('git add products/demo ideas')), 'never commits ideas/')
})

test('launch never starts with a missing phase', async () => {
  const { rt, result } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture'] }, { legal: null })
  assert.equal(result.stopped, 'incomplete')
  assert.ok(result.notes.some((n) => n.includes('legal')))
  assert.ok(!rt.labels().includes('launch'))
})

test('the launch phase deploys previews only; production belongs to /lancar', async () => {
  const { rt } = await run({ slug: 'demo', done: ALL.filter((p) => p !== 'launch') })
  const launch = rt.calls.find((c) => c.label === 'launch').prompt
  assert.ok(launch.includes('Do NOT deploy to production in this phase'))
  assert.ok(launch.includes('go_live: auto AND HUMAN_TASKS.md has no open 🔴 task'))
})

test('stop_after pauses the product so the foreman does not resume it', async () => {
  const { rt, result } = await run({ slug: 'demo', stop_after: 'research' }, { 'research:synthesis': go(3.9) })
  assert.equal(result.stopped, 'stop_after')
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:research').prompt.includes('set demo status paused'))
  assert.ok(!rt.labels().some((l) => l.startsWith('strategy')))
})

test('an empty slice plan is challenged once; a confirmed "all done" goes on to QA to be verified', async () => {
  const empty = { skeleton_green: true, slices: [], summary: 'nothing' }
  const { rt } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture'] }, {
    'build:plan': empty, 'build:plan:retry': empty,
  })
  const labels = rt.labels()
  assert.ok(labels.includes('build:plan:retry'))
  assert.ok(rt.calls.find((c) => c.label === 'build:plan:retry').prompt.includes('every unfinished PRD must-story needs one'))
  assert.ok(labels.indexOf('qa:round-1') > labels.indexOf('build:plan:retry'), 'QA verifies the claim with e2e tests')
})

test('a build that cannot even plan is marked blocked (not retried every night)', async () => {
  const { rt, result } = await run({ slug: 'demo', done: ['research', 'strategy', 'brand', 'architecture'] }, { 'build:plan': null })
  assert.equal(result.stopped, 'build-failed')
  assert.ok(rt.calls.find((c) => c.label === 'checkpoint:build-blocked').prompt.includes('set-phase demo build blocked'))
})

test('mobile products use the mobile engineer and non-npm checks', async () => {
  const { rt } = await run({ slug: 'app', type: 'mobile', done: ['research', 'strategy', 'brand', 'architecture'] })
  const plan = rt.calls.find((c) => c.label === 'build:plan')
  assert.equal(plan.agentType, 'mobile-engineer')
  assert.ok(!plan.prompt.includes('npm run check'))
})
