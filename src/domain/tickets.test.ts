import { deepFreeze } from '@/test/freeze'
import { markAllRead, notify } from './notifications'
import { buildSeed } from './seed'
import { addComment, createTicket, setTicketStatus } from './tickets'
import type { DemoState } from './types'

const today = new Date('2026-11-27T09:00:00')
const now = new Date('2026-11-27T10:00:00')
let s: DemoState
beforeEach(() => {
  s = deepFreeze(buildSeed(today))
})

describe('createTicket', () => {
  it('creates a New ticket assigned to IT and notifies the assignee', () => {
    const r = createTicket(s, { title: 'Mouse broken', description: 'Left click fails', category: 'Hardware', priority: 'Low', requesterId: 'p-aisyah' }, now)
    if (!r.ok) throw new Error(r.error)
    expect(r.id).toMatch(/^TCK-\d{4}$/)
    expect(r.state.tickets.map((t) => t.id)).not.toContain(undefined)
    const t = r.state.tickets.find((x) => x.id === r.id)!
    expect(t).toMatchObject({ status: 'New', assigneeId: 'p-hafiz', requesterId: 'p-aisyah', requestId: null, createdAt: now.toISOString() })
    expect(r.state.tickets).toHaveLength(s.tickets.length + 1)
    const n = r.state.notifications.at(-1)!
    expect(n).toMatchObject({ personId: 'p-hafiz', link: `/tickets/${r.id}`, read: false })
  })
  it('rejects an empty title', () => {
    const r = createTicket(s, { title: '  ', description: '', category: 'Other', priority: 'Low', requesterId: 'p-aisyah' }, now)
    expect(r).toEqual({ ok: false, error: 'Title is required' })
  })
})

describe('setTicketStatus', () => {
  it('changes status, appends a system comment and bumps updatedAt', () => {
    const t = s.tickets.find((x) => x.status === 'New' && !x.requestId)!
    const r = setTicketStatus(s, t.id, 'In progress', 'p-hafiz', now, 'Looking into it')
    if (!r.ok) throw new Error(r.error)
    const u = r.state.tickets.find((x) => x.id === t.id)!
    expect(u.status).toBe('In progress')
    expect(u.updatedAt).toBe(now.toISOString())
    expect(u.comments.at(-1)).toMatchObject({ authorId: 'p-hafiz', text: 'Status changed to In progress. Looking into it' })
  })
  it('fails for an unknown ticket', () => {
    expect(setTicketStatus(s, 'TCK-9999', 'Resolved', 'p-hafiz', now)).toEqual({ ok: false, error: 'Ticket not found' })
  })
})

describe('addComment', () => {
  it('rejects whitespace-only text', () => {
    expect(addComment(s, s.tickets[0].id, 'p-aisyah', '   ', now)).toEqual({ ok: false, error: 'Comment cannot be empty' })
  })
  it('appends a trimmed comment', () => {
    const r = addComment(s, s.tickets[0].id, 'p-aisyah', ' Thanks! ', now)
    if (!r.ok) throw new Error(r.error)
    expect(r.state.tickets[0].comments.at(-1)).toEqual({ at: now.toISOString(), authorId: 'p-aisyah', text: 'Thanks!' })
  })
})

describe('notifications', () => {
  it('notify adds an unread notification with a new id', () => {
    const next = notify(s, 'p-aisyah', 'Hello', '/me', now)
    const n = next.notifications.at(-1)!
    expect(n).toMatchObject({ personId: 'p-aisyah', text: 'Hello', link: '/me', read: false })
    expect(s.notifications.map((x) => x.id)).not.toContain(n.id)
  })
  it('markAllRead only touches that person', () => {
    const next = markAllRead(s, 'p-daniel')
    expect(next.notifications.filter((n) => n.personId === 'p-daniel').every((n) => n.read)).toBe(true)
    expect(next.notifications.find((n) => n.personId === 'p-hafiz')?.read).toBe(false)
  })
})
