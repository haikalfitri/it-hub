import { nextId } from './ids'
import { notify } from './notifications'
import { fail, ok, type Result } from './result'
import { DEFAULT_PERSON_BY_ROLE } from './seed'
import type { DemoState, Priority, Ticket, TicketStatus } from './types'

export const TICKET_CATEGORIES = [
  'Hardware',
  'Software',
  'Account & access',
  'Network & VPN',
  'Email',
  'Printing',
  'Onboarding',
  'Equipment request',
  'Laptop surrender',
  'System access',
  'Other',
] as const

export interface NewTicketInput {
  title: string
  description: string
  category: string
  priority: Priority
  requesterId: string
  requestId?: string
  assetId?: string
}

export function createTicket(state: DemoState, input: NewTicketInput, now: Date): Result {
  const title = input.title.trim()
  if (!title) return fail('Title is required')
  const id = nextId('TCK', state.tickets.map((t) => t.id))
  const at = now.toISOString()
  const assigneeId = DEFAULT_PERSON_BY_ROLE.it
  const ticket: Ticket = {
    id,
    title,
    description: input.description.trim(),
    category: input.category,
    priority: input.priority,
    status: 'New',
    requesterId: input.requesterId,
    assigneeId,
    createdAt: at,
    updatedAt: at,
    comments: [],
    requestId: input.requestId ?? null,
    assetId: input.assetId ?? null,
  }
  const next = { ...state, tickets: [...state.tickets, ticket] }
  return ok(notify(next, assigneeId, `New ticket ${id}: ${title}`, `/tickets/${id}`, now), id)
}

function updateTicket(state: DemoState, id: string, fn: (t: Ticket) => Ticket): DemoState {
  return { ...state, tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)) }
}

export function setTicketStatus(state: DemoState, ticketId: string, status: TicketStatus, actorId: string, now: Date, comment?: string): Result {
  if (!state.tickets.some((t) => t.id === ticketId)) return fail('Ticket not found')
  const at = now.toISOString()
  const text = `Status changed to ${status}${comment?.trim() ? `. ${comment.trim()}` : ''}`
  return ok(updateTicket(state, ticketId, (t) => ({ ...t, status, updatedAt: at, comments: [...t.comments, { at, authorId: actorId, text }] })))
}

export function addComment(state: DemoState, ticketId: string, authorId: string, text: string, now: Date): Result {
  if (!state.tickets.some((t) => t.id === ticketId)) return fail('Ticket not found')
  const clean = text.trim()
  if (!clean) return fail('Comment cannot be empty')
  const at = now.toISOString()
  return ok(updateTicket(state, ticketId, (t) => ({ ...t, updatedAt: at, comments: [...t.comments, { at, authorId, text: clean }] })))
}
