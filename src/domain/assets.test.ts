import { deepFreeze } from '@/test/freeze'
import { assignAsset, availableAssets, daysToWarranty, isUnowned, returnAsset, warrantyFlag } from './assets'
import { buildSeed, daysFrom } from './seed'
import type { Asset, DemoState } from './types'

const today = new Date('2026-11-27T09:00:00')
const now = new Date('2026-11-27T10:00:00')
let s: DemoState
beforeEach(() => {
  s = deepFreeze(buildSeed(today))
})
const withWarranty = (days: number): Asset => ({ ...s.assets[0], warrantyEnd: daysFrom(today, days) })
const inStockLaptop = () => s.assets.find((a) => a.type === 'Laptop' && a.status === 'In stock')!
const aisyahLaptop = () => s.assets.find((a) => a.ownerId === 'p-aisyah' && a.type === 'Laptop')!

describe('warrantyFlag', () => {
  it.each([
    [-1, 'expired'],
    [0, 'expiring'],
    [90, 'expiring'],
    [91, 'ok'],
  ])('%i days left -> %s', (days, flag) => {
    expect(warrantyFlag(withWarranty(days), today)).toBe(flag)
    expect(daysToWarranty(withWarranty(days), today)).toBe(days)
  })
})

it('isUnowned is true only for assigned assets with no owner', () => {
  expect(isUnowned({ ...s.assets[0], status: 'Assigned', ownerId: null })).toBe(true)
  expect(isUnowned({ ...s.assets[0], status: 'In stock', ownerId: null })).toBe(false)
})

describe('assignAsset', () => {
  it('assigns an in-stock asset and appends one history event', () => {
    const a = inStockLaptop()
    const r = assignAsset(s, a.id, 'p-farid', 'p-hafiz', now)
    if (!r.ok) throw new Error(r.error)
    const b = r.state.assets.find((x) => x.id === a.id)!
    expect(b).toMatchObject({ status: 'Assigned', ownerId: 'p-farid' })
    expect(b.history).toHaveLength(a.history.length + 1)
    expect(b.history.at(-1)).toMatchObject({ event: 'Assigned to Farid Zulkifli', actorId: 'p-hafiz', at: now.toISOString() })
  })
  it('refuses an asset that is not in stock and leaves state untouched', () => {
    const r = assignAsset(s, aisyahLaptop().id, 'p-farid', 'p-hafiz', now)
    expect(r).toEqual({ ok: false, error: 'Asset is not in stock' })
  })
  it('refuses an unknown asset', () => {
    expect(assignAsset(s, 'nope', 'p-farid', 'p-hafiz', now).ok).toBe(false)
  })
})

describe('returnAsset', () => {
  it('returns a good asset to stock and clears the owner', () => {
    const r = returnAsset(s, aisyahLaptop().id, 'p-hafiz', 'good', now)
    if (!r.ok) throw new Error(r.error)
    const b = r.state.assets.find((x) => x.id === aisyahLaptop().id)!
    expect(b).toMatchObject({ status: 'In stock', ownerId: null })
    expect(b.history.at(-1)?.event).toBe('Returned (good)')
  })
  it('sends a damaged asset to repair', () => {
    const r = returnAsset(s, aisyahLaptop().id, 'p-hafiz', 'damaged', now)
    if (!r.ok) throw new Error(r.error)
    const b = r.state.assets.find((x) => x.id === aisyahLaptop().id)!
    expect(b).toMatchObject({ status: 'In repair', ownerId: null })
    expect(b.history.at(-1)?.event).toBe('Returned (damaged), sent to repair')
  })
})

it('availableAssets lists in-stock assets of a type sorted by tag', () => {
  const list = availableAssets(s, 'Laptop')
  expect(list.length).toBeGreaterThanOrEqual(3)
  expect(list.every((a) => a.type === 'Laptop' && a.status === 'In stock')).toBe(true)
  expect(list.map((a) => a.tag)).toEqual([...list.map((a) => a.tag)].sort())
})
