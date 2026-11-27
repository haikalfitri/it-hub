import { nextId } from './ids'
import type { DemoState } from './types'

export function notify(state: DemoState, personId: string, text: string, link: string, now: Date): DemoState {
  const id = nextId('N', state.notifications.map((n) => n.id))
  return { ...state, notifications: [...state.notifications, { id, personId, text, link, read: false, at: now.toISOString() }] }
}

export function markAllRead(state: DemoState, personId: string): DemoState {
  return {
    ...state,
    notifications: state.notifications.map((n) => (n.personId === personId && !n.read ? { ...n, read: true } : n)),
  }
}
