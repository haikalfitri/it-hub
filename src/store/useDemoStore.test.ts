import { STORAGE_KEY } from '@/config'
import { buildSeed } from '@/domain/seed'
import { createSafeStorage } from './safeStorage'
import { createDemoStore } from './useDemoStore'

const seedCount = buildSeed(new Date()).requests.length
beforeEach(() => localStorage.clear())

describe('safeStorage', () => {
  it('falls back to memory when localStorage throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
      removeItem: () => {
        throw new Error('denied')
      },
    } as unknown as Storage
    const st = createSafeStorage(() => broken)
    st.setItem('k', 'v')
    expect(st.getItem('k')).toBe('v')
    st.removeItem('k')
    expect(st.getItem('k')).toBeNull()
  })
  it('also works when localStorage itself is unavailable', () => {
    const st = createSafeStorage(() => {
      throw new Error('no storage')
    })
    st.setItem('k', 'v')
    expect(st.getItem('k')).toBe('v')
  })
})

describe('demo store hydration', () => {


  it('reseeds when stored data is not JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    const store = createDemoStore()
    expect(store.getState().data.people.length).toBeGreaterThan(20)
  })
  it('reseeds when the stored version is old', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { data: { people: [] }, currentPersonId: 'x' }, version: 0 }))
    const store = createDemoStore()
    expect(store.getState().data.people.length).toBeGreaterThan(20)
    expect(store.getState().currentPersonId).toBe('p-aisyah')
  })
  it('reseeds when stored data is the right version but malformed', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { data: { people: 'oops' }, currentPersonId: 'p-daniel' }, version: 1 }))
    const store = createDemoStore()
    expect(Array.isArray(store.getState().data.people)).toBe(true)
    expect(store.getState().data.requests).toHaveLength(seedCount)
  })
  it('reseeds when saved data lacks helpfulVotes or has malformed assets', () => {
    const good = buildSeed(new Date())
    const { helpfulVotes: _omit, ...noVotes } = good
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { data: noVotes, currentPersonId: 'p-daniel' }, version: 1 }))
    expect(createDemoStore().getState().data.helpfulVotes).toEqual({})
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { data: { ...good, assets: [{}] }, currentPersonId: 'p-daniel' }, version: 1 }))
    expect(createDemoStore().getState().data.assets.every((a) => typeof a.tag === 'string')).toBe(true)
  })
  it('restores valid saved data and person', () => {
    const a = createDemoStore()
    a.getState().switchRole('manager')
    a.getState().submitRequest('equipment', { itemType: 'Monitor', reason: 'x', neededBy: '' })
    const b = createDemoStore()
    expect(b.getState().currentPersonId).toBe('p-daniel')
    expect(b.getState().data.requests).toHaveLength(seedCount + 1)
  })
})

describe('demo store actions', () => {
  it('resetDemo restores the seed', () => {
    const store = createDemoStore()
    const r = store.getState().submitRequest('equipment', { itemType: 'Laptop', reason: 'slow', neededBy: '' })
    expect(r.ok).toBe(true)
    expect(store.getState().data.requests).toHaveLength(seedCount + 1)
    store.getState().resetDemo()
    expect(store.getState().data.requests).toHaveLength(seedCount)
  })
  it('a failed action leaves data untouched', () => {
    const store = createDemoStore()
    const before = store.getState().data
    const pending = before.requests.find((r) => r.status === 'Pending' && r.steps[r.currentStep].actorId === 'p-daniel')!
    const r = store.getState().decide(pending.id, 'approve', '')
    expect(r.ok).toBe(false)
    expect(store.getState().data).toBe(before)
  })
  it('switchRole picks the default person and switchPerson ignores unknown ids', () => {
    const store = createDemoStore()
    store.getState().switchRole('it')
    expect(store.getState().currentPersonId).toBe('p-hafiz')
    store.getState().switchPerson('nobody')
    expect(store.getState().currentPersonId).toBe('p-hafiz')
    store.getState().switchPerson('p-kumar')
    expect(store.getState().currentPersonId).toBe('p-kumar')
  })
  it('markAllRead clears the current person notifications', () => {
    const store = createDemoStore()
    store.getState().switchRole('manager')
    store.getState().markAllRead()
    expect(store.getState().data.notifications.filter((n) => n.personId === 'p-daniel' && !n.read)).toHaveLength(0)
  })
})
