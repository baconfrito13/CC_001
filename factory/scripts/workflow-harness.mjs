// Runs a Workflow-tool script outside Claude Code with simulated agents, so the control flow
// (gates, loops, resume, checkpoints) can be tested deterministically and for free.
import { readFileSync } from 'node:fs'

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
const FORBIDDEN = ['Date.now(', 'Math.random(', 'new Date()', 'import(', 'require(', 'process.']

export function loadWorkflow(path) {
  const source = readFileSync(path, 'utf8')
  if (!source.startsWith('export const meta = {')) {
    throw new Error('a workflow must start with `export const meta = {`')
  }
  const match = source.match(/^export const meta = (\{[\s\S]*?\n\})\n/)
  if (!match) throw new Error('could not find the end of the meta literal (a line with a lone `}`)')
  // The meta block must be a pure literal: evaluating it with no scope must work.
  const meta = Function(`"use strict"; return (${match[1]})`)()
  const body = source.slice(match[0].length)
  for (const token of FORBIDDEN) {
    if (body.includes(token)) throw new Error(`workflow body uses forbidden ${token}`)
  }
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', 'workflow', body)
  const phaseTitles = new Set([
    ...[...body.matchAll(/phase\('([^']+)'\)/g)].map((m) => m[1]),
    ...[...body.matchAll(/phase: '([^']+)'/g)].map((m) => m[1]),
    ...[...body.matchAll(/(?:checkpoint|save)\('([^']+)'/g)].map((m) => m[1]),
  ])
  return {
    meta,
    phaseTitles,
    run: (hooks) =>
      fn(hooks.agent, hooks.parallel, hooks.pipeline, hooks.phase, hooks.log, hooks.args, hooks.budget, hooks.workflow),
  }
}

// Builds a schema-valid fake value for a JSON schema (required properties only).
export function fake(schema, label = 'x') {
  if (!schema) return `${label}: done`
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== 'null') : schema.type
  if (schema.enum) return schema.enum[0]
  switch (type) {
    case 'object': {
      const out = {}
      for (const key of schema.required || []) out[key] = fake(schema.properties[key], `${label}.${key}`)
      return out
    }
    case 'array':
      return []
    case 'string':
      return `${label}`
    case 'boolean':
      return true
    case 'integer':
      return 0
    case 'number':
      return schema.minimum !== undefined && schema.maximum !== undefined ? (schema.minimum + schema.maximum) / 2 : 1
    default:
      return null
  }
}

const DEFAULTS = {
  architecture: { summary: 'arch', recipe: 'web-saas', app_dir: 'app', builder: 'fullstack-engineer', components: [], files: [] },
  'build:plan': {
    skeleton_green: true,
    summary: 'plan',
    slices: [
      { id: 'auth', title: 'Auth', stories: ['US-1'] },
      { id: 'core', title: 'Core', stories: ['US-2', 'US-3'] },
    ],
  },
  launch: { preview_url: 'https://demo.vercel.app', production_live: false, founder_tasks_open: 2, blocking_tasks: ['HT-01'], summary: 'ready' },
}

export function createRuntime({ args, overrides = {}, delayMs = 2 } = {}) {
  const calls = []
  const logs = []
  const phases = []
  const state = { gitWriters: 0, maxGitWriters: 0, concurrent: 0, maxConcurrent: 0 }
  const lookup = (label) => {
    if (label in overrides) return overrides[label]
    if (label in DEFAULTS) return DEFAULTS[label]
    return undefined
  }
  async function agent(prompt, opts = {}) {
    const label = opts.label || 'agent'
    calls.push({ label, agentType: opts.agentType, phase: opts.phase, prompt })
    const writesGit = opts.agentType === 'factory-clerk'
    state.concurrent++
    state.maxConcurrent = Math.max(state.maxConcurrent, state.concurrent)
    if (writesGit) {
      state.gitWriters++
      state.maxGitWriters = Math.max(state.maxGitWriters, state.gitWriters)
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    state.concurrent--
    if (writesGit) state.gitWriters--
    const o = lookup(label)
    if (typeof o === 'function') return o(prompt, opts, calls)
    if (o !== undefined) return structuredClone(o)
    return fake(opts.schema, label)
  }
  async function parallel(thunks) {
    return Promise.all(thunks.map((t) => Promise.resolve().then(t).catch(() => null)))
  }
  async function pipeline(items, ...stages) {
    return Promise.all(
      items.map(async (item, i) => {
        let value = item
        try {
          for (const stage of stages) value = await stage(value, item, i)
          return value
        } catch {
          return null
        }
      }),
    )
  }
  const hooks = {
    agent,
    parallel,
    pipeline,
    phase: (title) => phases.push(title),
    log: (message) => logs.push(message),
    args,
    budget: { total: null, spent: () => 0, remaining: () => Infinity },
    workflow: async () => {
      throw new Error('nested workflows are not simulated')
    },
  }
  return { hooks, calls, logs, phases, state, labels: () => calls.map((c) => c.label) }
}
