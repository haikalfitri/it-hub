import { buildSeed } from './seed'
import { dashboardStats } from './stats'
import { decide, fulfil, submitRequest } from './workflows'
import type { Result } from './result'

const today = new Date('2026-11-27T09:00:00')
const now = new Date('2026-11-27T10:00:00')
const must = (r: Result) => {
  if (!r.ok) throw new Error(r.error)
  return r
}

it('builds an 8-week trend whose opened counts match tickets in the window', () => {
  const s = buildSeed(today)
  const st = dashboardStats(s, today)
  expect(st.ticketTrend).toHaveLength(8)
  const start = new Date(today.getTime() - 56 * 86_400_000)
  const inWindow = s.tickets.filter((t) => new Date(t.createdAt) >= start && new Date(t.createdAt) <= today).length
  expect(st.ticketTrend.reduce((n, w) => n + w.opened, 0)).toBe(inWindow)
  expect(st.ticketTrend[0].week < st.ticketTrend[7].week).toBe(true)
})

it('counts tickets by status and assets by type and status', () => {
  const s = buildSeed(today)
  const st = dashboardStats(s, today)
  expect(Object.values(st.ticketsByStatus).reduce((a, b) => a + b, 0)).toBe(s.tickets.length)
  expect(Object.values(st.assetsByType).reduce((a, b) => a + b, 0)).toBe(s.assets.length)
  expect(st.assetsByStatus.Assigned).toBe(st.inUse)
  expect(st.assetsByStatus['In stock']).toBe(st.inStock)
})

it('counts only open requests as pending, per workflow', () => {
  const s = buildSeed(today)
  const st = dashboardStats(s, today)
  const open = s.requests.filter((r) => r.status === 'Pending' || r.status === 'Awaiting stock')
  expect(Object.values(st.pendingByWorkflow).reduce((a, b) => a + b, 0)).toBe(open.length)
})

it('lists warranty alerts soonest first', () => {
  const st = dashboardStats(buildSeed(today), today)
  expect(st.warrantyAlerts.length).toBeGreaterThanOrEqual(3)
  const ends = st.warrantyAlerts.map((a) => a.warrantyEnd)
  expect(ends).toEqual([...ends].sort())
})

it('in-use goes up by one when an equipment request completes', () => {
  let s = buildSeed(today)
  const before = dashboardStats(s, today).inUse
  const sub = must(submitRequest(s, 'equipment', 'p-aisyah', { itemType: 'Laptop', reason: 'x', neededBy: '' }, now))
  s = must(decide(sub.state, sub.id!, 'p-daniel', 'approve', '', now)).state
  const laptop = s.assets.find((a) => a.type === 'Laptop' && a.status === 'In stock')!
  s = must(fulfil(s, sub.id!, 'p-hafiz', { assetId: laptop.id }, now)).state
  expect(dashboardStats(s, today).inUse).toBe(before + 1)
})
