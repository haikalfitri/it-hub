import { buildSeed } from '@/domain/seed'
import type { DemoState } from '@/domain/types'
import { decide, fulfil, submitRequest } from '@/domain/workflows'
import { TOUR_STEPS, type TourSnapshot } from './steps'

const now = new Date('2026-11-27T10:00:00')
const snap = (data: DemoState, currentPersonId = 'p-aisyah'): TourSnapshot => ({ data, currentPersonId })
const step = (id: string) => TOUR_STEPS.find((s) => s.id === id)!
const unwrap = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error('failed')
  return r as Extract<T, { ok: true }>
}

it('has six steps', () => {
  expect(TOUR_STEPS.map((s) => s.id)).toEqual(['submit', 'switch-manager', 'approve', 'switch-it', 'assign', 'result'])
})

it('step 1 is done once Aisyah submits an equipment request, and captures its id', () => {
  const s0 = buildSeed(now)
  expect(step('submit').done(snap(s0), {})).toBe(false)
  const r = unwrap(submitRequest(s0, 'equipment', 'p-aisyah', { itemType: 'Laptop', reason: 'slow', neededBy: '' }, now))
  expect(step('submit').done(snap(r.state), {})).toBe(true)
  expect(step('submit').capture?.(snap(r.state), {})).toEqual({ requestId: r.id })
})

it('step 3 is done when Daniel approves, step 5 when the request completes', () => {
  const s0 = buildSeed(now)
  const sub = unwrap(submitRequest(s0, 'equipment', 'p-aisyah', { itemType: 'Laptop', reason: 'slow', neededBy: '' }, now))
  const ctx = { requestId: sub.id! }
  expect(step('approve').done(snap(sub.state, 'p-daniel'), ctx)).toBe(false)
  const ap = unwrap(decide(sub.state, sub.id!, 'p-daniel', 'approve', '', now))
  expect(step('approve').done(snap(ap.state, 'p-daniel'), ctx)).toBe(true)
  expect(step('switch-it').done(snap(ap.state, 'p-hafiz'), ctx)).toBe(true)
  const laptop = ap.state.assets.find((a) => a.type === 'Laptop' && a.status === 'In stock')!
  expect(step('assign').done(snap(ap.state, 'p-hafiz'), ctx)).toBe(false)
  const done = unwrap(fulfil(ap.state, sub.id!, 'p-hafiz', { assetId: laptop.id }, now))
  expect(step('assign').done(snap(done.state, 'p-hafiz'), ctx)).toBe(true)
})

it('recovering the approve step after a rejection creates a fresh request waiting on Daniel', () => {
  const s0 = buildSeed(now)
  const sub = unwrap(submitRequest(s0, 'equipment', 'p-aisyah', { itemType: 'Laptop', reason: 'slow', neededBy: '' }, now))
  const rej = unwrap(decide(sub.state, sub.id!, 'p-daniel', 'reject', 'no', now))
  const out = step('approve').recover(snap(rej.state, 'p-daniel'), { requestId: sub.id! }, now)
  expect(out.ctx.requestId).not.toBe(sub.id)
  const fresh = out.data.requests.find((r) => r.id === out.ctx.requestId)!
  expect(fresh).toMatchObject({ status: 'Pending', currentStep: 0, requesterId: 'p-aisyah' })
  expect(fresh.steps[0].actorId).toBe('p-daniel')
  expect(out.personId).toBe('p-daniel')
})

it('recovering the assign step leaves a request waiting on IT', () => {
  const s0 = buildSeed(now)
  const out = step('assign').recover(snap(s0, 'p-hafiz'), {}, now)
  const r = out.data.requests.find((x) => x.id === out.ctx.requestId)!
  expect(r.status).toBe('Pending')
  expect(r.steps[r.currentStep].kind).toBe('it-fulfil')
  expect(out.personId).toBe('p-hafiz')
})
