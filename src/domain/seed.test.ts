import { EMAIL_DOMAIN } from '@/config'
import { buildSeed, DEFAULT_PERSON_BY_ROLE } from './seed'
import { nextId } from './ids'
import type { DemoState } from './types'

const today = new Date('2026-11-27T09:00:00')
const DAY = 86_400_000
const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - new Date('2026-11-27').getTime()) / DAY)

let s: DemoState
beforeEach(() => {
  s = buildSeed(today)
})
const byName = (name: string) => s.people.find((p) => p.name === name)!

describe('nextId', () => {
  it('increments the highest existing number and pads to 4', () => {
    expect(nextId('REQ', ['REQ-0041', 'REQ-0007'])).toBe('REQ-0042')
    expect(nextId('TCK', [])).toBe('TCK-0001')
  })
})

describe('buildSeed people', () => {
  it('has 22-28 people with valid managers', () => {
    expect(s.people.length).toBeGreaterThanOrEqual(22)
    expect(s.people.length).toBeLessThanOrEqual(28)
    const ids = new Set(s.people.map((p) => p.id))
    for (const p of s.people) if (p.managerId) expect(ids.has(p.managerId)).toBe(true)
  })
  it('has exactly one manager per non-IT department and Hafiz heads IT', () => {
    for (const d of ['Finance', 'Engineering', 'Operations', 'HR'] as const) {
      expect(s.people.filter((p) => p.role === 'manager' && p.department === d)).toHaveLength(1)
    }
    const hafiz = byName('Hafiz Ismail')
    expect(hafiz).toMatchObject({ role: 'it', department: 'IT', managerId: null })
  })
  it('has the named demo people', () => {
    const daniel = byName('Daniel Tan')
    expect(daniel).toMatchObject({ role: 'manager', department: 'Finance' })
    expect(byName('Aisyah Rahman')).toMatchObject({ role: 'staff', department: 'Finance', managerId: daniel.id })
    expect(byName('Priya Nair')).toMatchObject({ role: 'hr', department: 'HR' })
    expect(DEFAULT_PERSON_BY_ROLE).toEqual({
      staff: byName('Aisyah Rahman').id,
      manager: daniel.id,
      hr: byName('Priya Nair').id,
      it: byName('Hafiz Ismail').id,
    })
  })
  it('uses the demo email domain for everyone', () => {
    for (const p of s.people) expect(p.email.endsWith(`@${EMAIL_DOMAIN}`)).toBe(true)
  })
  it('gives every person an account', () => {
    for (const p of s.people) expect(s.accounts.some((a) => a.personId === p.id)).toBe(true)
  })
})

describe('buildSeed assets', () => {
  it('has 40-50 assets with unique tags and serials and valid owners', () => {
    expect(s.assets.length).toBeGreaterThanOrEqual(40)
    expect(s.assets.length).toBeLessThanOrEqual(50)
    expect(new Set(s.assets.map((a) => a.tag)).size).toBe(s.assets.length)
    expect(new Set(s.assets.map((a) => a.serial)).size).toBe(s.assets.length)
    const ids = new Set(s.people.map((p) => p.id))
    for (const a of s.assets) if (a.ownerId) expect(ids.has(a.ownerId)).toBe(true)
  })
  it('has at least 3 laptops in stock', () => {
    expect(s.assets.filter((a) => a.type === 'Laptop' && a.status === 'In stock').length).toBeGreaterThanOrEqual(3)
  })
  it('has 2-4 warranties expiring within 90 days and at least 1 expired', () => {
    const expiring = s.assets.filter((a) => {
      const d = daysUntil(a.warrantyEnd)
      return d >= 0 && d <= 90
    })
    expect(expiring.length).toBeGreaterThanOrEqual(2)
    expect(expiring.length).toBeLessThanOrEqual(4)
    expect(s.assets.some((a) => daysUntil(a.warrantyEnd) < 0)).toBe(true)
  })
  it('has 1-2 assigned assets with no owner', () => {
    const n = s.assets.filter((a) => a.status === 'Assigned' && a.ownerId === null).length
    expect(n).toBeGreaterThanOrEqual(1)
    expect(n).toBeLessThanOrEqual(2)
  })
  it('gives Aisyah a laptop', () => {
    const aisyah = byName('Aisyah Rahman')
    expect(s.assets.some((a) => a.type === 'Laptop' && a.ownerId === aisyah.id && a.status === 'Assigned')).toBe(true)
  })
  it('shifts warranty dates with today', () => {
    const later = buildSeed(new Date('2027-03-01T09:00:00'))
    const a = s.assets[0]
    const b = later.assets.find((x) => x.tag === a.tag)!
    expect(new Date(b.warrantyEnd).getTime() - new Date(a.warrantyEnd).getTime()).toBe(94 * DAY)
  })
})

describe('buildSeed tickets and requests', () => {
  it('has 12-18 tickets over the last 8 weeks covering every status', () => {
    expect(s.tickets.length).toBeGreaterThanOrEqual(12)
    expect(s.tickets.length).toBeLessThanOrEqual(18)
    for (const t of s.tickets) {
      const d = daysUntil(t.createdAt)
      expect(d).toBeLessThanOrEqual(0)
      expect(d).toBeGreaterThanOrEqual(-56)
    }
    for (const st of ['New', 'In progress', 'Resolved', 'Closed']) expect(s.tickets.some((t) => t.status === st)).toBe(true)
  })
  it('has 5-7 requests covering all types and key statuses, each with a back-linked ticket', () => {
    expect(s.requests.length).toBeGreaterThanOrEqual(5)
    expect(s.requests.length).toBeLessThanOrEqual(7)
    for (const t of ['onboarding', 'equipment', 'surrender', 'access']) expect(s.requests.some((r) => r.type === t)).toBe(true)
    for (const st of ['Pending', 'Completed', 'Rejected']) expect(s.requests.some((r) => r.status === st)).toBe(true)
    for (const r of s.requests) {
      const t = s.tickets.find((x) => x.id === r.ticketId)
      expect(t?.requestId).toBe(r.id)
    }
  })
  it('starts at schema version 1', () => {
    expect(s.version).toBe(1)
  })
})
