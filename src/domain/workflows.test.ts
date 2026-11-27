import { deepFreeze } from '@/test/freeze'
import type { Result } from './result'
import { buildSeed } from './seed'
import type { DemoState } from './types'
import { approverFor, cancelRequest, decide, fulfil, markAwaitingStock, pendingForPerson, submitRequest, WORKFLOWS } from './workflows'

const today = new Date('2026-11-27T09:00:00')
const now = new Date('2026-11-27T10:00:00')
let s: DemoState
beforeEach(() => {
  s = deepFreeze(buildSeed(today))
})

function must(r: Result): DemoState & { _id: string } {
  if (!r.ok) throw new Error(r.error)
  return Object.assign({}, r.state, { _id: r.id ?? '' })
}
const req = (st: DemoState, id: string) => st.requests.find((r) => r.id === id)!
const ticketOf = (st: DemoState, id: string) => st.tickets.find((t) => t.id === req(st, id).ticketId)!
const asset = (st: DemoState, id: string) => st.assets.find((a) => a.id === id)!
const stockLaptop = (st: DemoState) => st.assets.find((a) => a.type === 'Laptop' && a.status === 'In stock')!
const aisyahLaptop = (st: DemoState) => st.assets.find((a) => a.ownerId === 'p-aisyah' && a.type === 'Laptop')!
const account = (st: DemoState, personId: string) => st.accounts.find((a) => a.personId === personId)!

const equipment = { itemType: 'Laptop', reason: 'Current laptop is too slow', neededBy: '2026-12-10' }
const surrenderData = (assetId: string, extra: Record<string, unknown> = {}) => ({
  assetId,
  reason: 'Resignation',
  condition: 'good',
  accessoriesReturned: true,
  undertaking: true,
  ...extra,
})
const onboarding = {
  fullName: 'Nur Aina Salleh',
  department: 'Engineering',
  title: 'Graduate Engineer',
  startDate: '2026-12-14',
  laptopNeeded: true,
  systems: ['Email', 'VPN', 'CAD suite'],
}
const access = { system: 'VPN', level: 'Read', justification: 'Work from home on Fridays' }

it('exposes the four workflow definitions', () => {
  expect(Object.keys(WORKFLOWS)).toEqual(['onboarding', 'equipment', 'surrender', 'access'])
  expect(WORKFLOWS.onboarding.startRoles).toEqual(['hr'])
})

describe('equipment request', () => {
  it('runs submit -> manager approve -> IT assign, updating inventory and the linked ticket', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    expect(id).toMatch(/^REQ-\d{4}$/)
    expect(req(st, id)).toMatchObject({ status: 'Pending', currentStep: 0, subjectName: 'Laptop' })
    expect(approverFor(st, req(st, id))).toBe('p-daniel')
    expect(ticketOf(st, id)).toMatchObject({ status: 'New', requestId: id, category: 'Equipment request' })
    expect(st.notifications.at(-1)).toMatchObject({ personId: 'p-daniel', link: `/workflows/${id}` })
    expect(pendingForPerson(st, 'p-daniel').map((r) => r.id)).toContain(id)

    st = must(decide(st, id, 'p-daniel', 'approve', 'OK', now))
    expect(req(st, id)).toMatchObject({ status: 'Pending', currentStep: 1 })
    expect(req(st, id).steps[0]).toMatchObject({ decision: 'approved', comment: 'OK', at: now.toISOString() })
    expect(approverFor(st, req(st, id))).toBe('p-hafiz')
    expect(ticketOf(st, id).status).toBe('In progress')

    const laptop = stockLaptop(st)
    st = must(fulfil(st, id, 'p-hafiz', { assetId: laptop.id }, now))
    expect(req(st, id).status).toBe('Completed')
    expect(req(st, id).steps[1].decision).toBe('done')
    expect(asset(st, laptop.id)).toMatchObject({ status: 'Assigned', ownerId: 'p-aisyah' })
    expect(asset(st, laptop.id).history.at(-1)?.event).toBe('Assigned to Aisyah Rahman')
    expect(ticketOf(st, id).status).toBe('Resolved')
    expect(ticketOf(st, id).comments.at(-1)?.text).toContain('Completed via Equipment request')
    expect(st.notifications.at(-1)).toMatchObject({ personId: 'p-aisyah' })
    expect(approverFor(st, req(st, id))).toBeNull()
  })

  it('lets IT mark awaiting stock and refuses an asset that is not in stock', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    st = must(decide(st, id, 'p-daniel', 'approve', '', now))
    st = must(markAwaitingStock(st, id, 'p-hafiz', now))
    expect(req(st, id).status).toBe('Awaiting stock')
    expect(pendingForPerson(st, 'p-hafiz').map((r) => r.id)).toContain(id)
    const r = fulfil(st, id, 'p-hafiz', { assetId: aisyahLaptop(st).id }, now)
    expect(r).toEqual({ ok: false, error: 'Asset is not in stock' })
    st = must(fulfil(st, id, 'p-hafiz', { assetId: stockLaptop(st).id }, now))
    expect(req(st, id).status).toBe('Completed')
  })

  it('refuses an asset of the wrong type', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    st = must(decide(st, id, 'p-daniel', 'approve', '', now))
    const phone = st.assets.find((a) => a.type === 'Phone' && a.status === 'In stock')!
    expect(fulfil(st, id, 'p-hafiz', { assetId: phone.id }, now)).toEqual({ ok: false, error: 'Pick a Laptop for this request' })
  })

  it('requires a reason', () => {
    expect(submitRequest(s, 'equipment', 'p-aisyah', { ...equipment, reason: ' ' }, now)).toEqual({ ok: false, error: 'Reason is required' })
  })
})

describe('onboarding', () => {
  it('only HR can start it', () => {
    expect(submitRequest(s, 'onboarding', 'p-aisyah', onboarding, now)).toEqual({ ok: false, error: 'Only HR can start onboarding' })
  })

  it('routes to the department manager and creates the person, account and laptop on fulfilment', () => {
    let st = must(submitRequest(s, 'onboarding', 'p-priya', onboarding, now))
    const id = st._id
    expect(req(st, id).subjectName).toBe('Nur Aina Salleh')
    expect(approverFor(st, req(st, id))).toBe('p-kumar')
    st = must(decide(st, id, 'p-kumar', 'approve', 'Welcome', now))

    const incomplete = fulfil(st, id, 'p-hafiz', { assetId: stockLaptop(st).id, checklist: { account: true, imaged: true, mfa: false, welcome: true } }, now)
    expect(incomplete).toEqual({ ok: false, error: 'Complete every checklist item first' })
    const noLaptop = fulfil(st, id, 'p-hafiz', { checklist: { account: true, imaged: true, mfa: true, welcome: true } }, now)
    expect(noLaptop).toEqual({ ok: false, error: 'Pick a laptop for the new hire' })

    const laptop = stockLaptop(st)
    st = must(fulfil(st, id, 'p-hafiz', { assetId: laptop.id, checklist: { account: true, imaged: true, mfa: true, welcome: true } }, now))
    const person = st.people.find((p) => p.name === 'Nur Aina Salleh')!
    expect(person).toMatchObject({ department: 'Engineering', managerId: 'p-kumar', role: 'staff', title: 'Graduate Engineer', startDate: '2026-12-14', email: 'nur.aina.salleh@demo.example' })
    expect(account(st, person.id).systems).toEqual(['Email', 'VPN', 'CAD suite'])
    expect(asset(st, laptop.id)).toMatchObject({ status: 'Assigned', ownerId: person.id })
    expect(req(st, id)).toMatchObject({ status: 'Completed' })
    expect(req(st, id).data.personId).toBe(person.id)
  })

  it('de-duplicates the email of a new hire with an existing name', () => {
    let st = must(submitRequest(s, 'onboarding', 'p-priya', { ...onboarding, fullName: 'Aisyah Rahman', laptopNeeded: false }, now))
    const id = st._id
    st = must(decide(st, id, 'p-kumar', 'approve', '', now))
    st = must(fulfil(st, id, 'p-hafiz', { checklist: { account: true, imaged: true, mfa: true, welcome: true } }, now))
    const emails = st.people.filter((p) => p.name === 'Aisyah Rahman').map((p) => p.email)
    expect(emails).toEqual(['aisyah.rahman@demo.example', 'aisyah.rahman2@demo.example'])
  })
})

describe('laptop surrender', () => {
  it('requires the undertaking', () => {
    const r = submitRequest(s, 'surrender', 'p-aisyah', surrenderData(aisyahLaptop(s).id, { undertaking: false }), now)
    expect(r).toEqual({ ok: false, error: 'You must accept the undertaking' })
  })

  it('only allows your own assets', () => {
    const other = s.assets.find((a) => a.ownerId === 'p-farid')!
    expect(submitRequest(s, 'surrender', 'p-aisyah', surrenderData(other.id), now)).toEqual({ ok: false, error: 'You can only surrender your own assets' })
  })

  it('goes straight to IT and accepts the serial with different case and spaces', () => {
    const lap = aisyahLaptop(s)
    let st = must(submitRequest(s, 'surrender', 'p-aisyah', surrenderData(lap.id), now))
    const id = st._id
    expect(req(st, id).subjectName).toBe(lap.tag)
    expect(approverFor(st, req(st, id))).toBe('p-hafiz')
    st = must(fulfil(st, id, 'p-hafiz', { serial: `  ${lap.serial.toLowerCase()}  ` }, now))
    expect(req(st, id).status).toBe('Completed')
    expect(asset(st, lap.id)).toMatchObject({ status: 'In stock', ownerId: null })
  })

  it('rejects a wrong serial and changes nothing', () => {
    const lap = aisyahLaptop(s)
    const st = must(submitRequest(s, 'surrender', 'p-aisyah', surrenderData(lap.id), now))
    const before = { ...st } as DemoState
    const r = fulfil(before, st._id, 'p-hafiz', { serial: 'WRONG123' }, now)
    expect(r).toEqual({ ok: false, error: `Serial number does not match ${lap.tag}` })
  })

  it('sends a damaged laptop to repair', () => {
    const lap = aisyahLaptop(s)
    const st0 = must(submitRequest(s, 'surrender', 'p-aisyah', surrenderData(lap.id, { condition: 'damaged' }), now))
    const st = must(fulfil(st0, st0._id, 'p-hafiz', { serial: lap.serial }, now))
    expect(asset(st, lap.id).status).toBe('In repair')
  })
})

describe('system access', () => {
  it('adds the system to the account once, after manager and system owner approve', () => {
    let st = must(submitRequest(s, 'access', 'p-meiyee', access, now))
    const id = st._id
    expect(req(st, id).subjectName).toBe('VPN (Read)')
    st = must(decide(st, id, 'p-daniel', 'approve', '', now))
    expect(ticketOf(st, id).status).toBe('In progress')
    st = must(decide(st, id, 'p-hafiz', 'approve', 'Granted', now))
    expect(req(st, id).status).toBe('Completed')
    expect(ticketOf(st, id).status).toBe('Resolved')
    expect(account(st, 'p-meiyee').systems.filter((x) => x === 'VPN')).toHaveLength(1)
    expect(account(st, 'p-meiyee').systems).toContain('VPN')
  })

  it('does not duplicate a system the person already has', () => {
    let st = must(submitRequest(s, 'access', 'p-aisyah', { ...access, system: 'ERP' }, now))
    const id = st._id
    st = must(decide(st, id, 'p-daniel', 'approve', '', now))
    st = must(decide(st, id, 'p-hafiz', 'approve', '', now))
    expect(account(st, 'p-aisyah').systems.filter((x) => x === 'ERP')).toHaveLength(1)
  })
})

describe('rejection', () => {
  it('needs a reason, then closes the ticket and tells the requester', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    expect(decide(st, id, 'p-daniel', 'reject', '  ', now)).toEqual({ ok: false, error: 'Please add a reason for rejecting' })
    st = must(decide(st, id, 'p-daniel', 'reject', 'Not in this budget cycle', now))
    expect(req(st, id).status).toBe('Rejected')
    expect(req(st, id).steps[0]).toMatchObject({ decision: 'rejected', comment: 'Not in this budget cycle' })
    expect(ticketOf(st, id).status).toBe('Closed')
    expect(st.notifications.at(-1)).toMatchObject({ personId: 'p-aisyah' })
    expect(pendingForPerson(st, 'p-daniel').map((r) => r.id)).not.toContain(id)
  })
})

describe('no line manager', () => {
  it('auto-completes the manager step and moves to IT', () => {
    const st = must(submitRequest(s, 'equipment', 'p-daniel', equipment, now))
    const r = req(st, st._id)
    expect(r.steps[0]).toMatchObject({ decision: 'skipped', comment: 'Auto-approved: no line manager' })
    expect(r.currentStep).toBe(1)
    expect(approverFor(st, r)).toBe('p-hafiz')
    expect(ticketOf(st, st._id).status).toBe('In progress')
  })
})

describe('stale or wrong actor', () => {
  it('refuses a decision from someone who is not the approver, leaving state identical', () => {
    const st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const frozen = deepFreeze({ ...st } as DemoState)
    expect(decide(frozen, st._id, 'p-aisyah', 'approve', '', now)).toEqual({ ok: false, error: 'You are not the approver for this step' })
    expect(fulfil(frozen, st._id, 'p-hafiz', { assetId: stockLaptop(st).id }, now)).toEqual({ ok: false, error: 'This step is not ready for IT yet' })
  })

  it('refuses to decide a request that is already completed', () => {
    const done = s.requests.find((r) => r.status === 'Completed')!
    expect(decide(s, done.id, 'p-kumar', 'approve', '', now)).toEqual({ ok: false, error: 'This request is no longer open' })
  })

  it('refuses fulfilment by someone other than IT', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    st = must(decide(st, id, 'p-daniel', 'approve', '', now))
    expect(fulfil(st, id, 'p-daniel', { assetId: stockLaptop(st).id }, now)).toEqual({ ok: false, error: 'You are not the assignee for this step' })
  })
})

describe('cancel', () => {
  it('only the requester can cancel; the ticket closes', () => {
    let st = must(submitRequest(s, 'equipment', 'p-aisyah', equipment, now))
    const id = st._id
    expect(cancelRequest(st, id, 'p-daniel', now)).toEqual({ ok: false, error: 'Only the requester can cancel' })
    st = must(cancelRequest(st, id, 'p-aisyah', now))
    expect(req(st, id).status).toBe('Cancelled')
    expect(ticketOf(st, id).status).toBe('Closed')
    expect(cancelRequest(st, id, 'p-aisyah', now)).toEqual({ ok: false, error: 'This request is no longer open' })
  })
})
