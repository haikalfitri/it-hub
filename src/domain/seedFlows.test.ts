import { buildSeed } from './seed'
import { approverFor, decide, fulfil } from './workflows'

const now = new Date('2026-11-27T10:00:00')

it('every open seeded request has an actor on each non-manager step', () => {
  const s = buildSeed(now)
  for (const r of s.requests.filter((x) => x.status === 'Pending' || x.status === 'Awaiting stock')) {
    for (const step of r.steps) if (step.kind !== 'manager') expect(step.actorId, `${r.id} ${step.kind}`).toBe('p-hafiz')
  }
})

it('seeded equipment request REQ-0007 can be approved and then fulfilled by IT', () => {
  const s = buildSeed(now)
  const a = decide(s, 'REQ-0007', 'p-daniel', 'approve', '', now)
  if (!a.ok) throw new Error(a.error)
  const r = a.state.requests.find((x) => x.id === 'REQ-0007')!
  expect(approverFor(a.state, r)).toBe('p-hafiz')
  const monitor = a.state.assets.find((x) => x.type === 'Monitor' && x.status === 'In stock')
  expect(monitor).toBeDefined()
  const f = fulfil(a.state, 'REQ-0007', 'p-hafiz', { assetId: monitor!.id }, now)
  if (!f.ok) throw new Error(f.error)
  expect(f.state.requests.find((x) => x.id === 'REQ-0007')!.status).toBe('Completed')
})

it('seeded onboarding REQ-0006 can be approved and then completed by IT', () => {
  const s = buildSeed(now)
  const a = decide(s, 'REQ-0006', 'p-daniel', 'approve', '', now)
  if (!a.ok) throw new Error(a.error)
  const laptop = a.state.assets.find((x) => x.type === 'Laptop' && x.status === 'In stock')!
  const f = fulfil(a.state, 'REQ-0006', 'p-hafiz', { assetId: laptop.id, checklist: { account: true, imaged: true, mfa: true, welcome: true } }, now)
  if (!f.ok) throw new Error(f.error)
  expect(f.state.people.some((p) => p.name === 'Ong Mei Ling')).toBe(true)
})
