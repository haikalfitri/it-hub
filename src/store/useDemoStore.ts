import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SCHEMA_VERSION, STORAGE_KEY } from '@/config'
import { markAllRead as markAllReadFn } from '@/domain/notifications'
import type { Result } from '@/domain/result'
import { buildSeed, DEFAULT_PERSON_BY_ROLE } from '@/domain/seed'
import { addComment, createTicket, setTicketStatus, type NewTicketInput } from '@/domain/tickets'
import type { DemoState, RequestData, Role, TicketStatus, WorkflowType } from '@/domain/types'
import { cancelRequest, decide, fulfil, markAwaitingStock, submitRequest, type FulfilPayload } from '@/domain/workflows'
import { createSafeStorage } from './safeStorage'

export type Theme = 'light' | 'dark' | 'system'

export interface DemoStore {
  data: DemoState
  currentPersonId: string
  theme: Theme
  tourDone: boolean
  switchPerson: (id: string) => void
  switchRole: (role: Role) => void
  resetDemo: () => void
  setTheme: (t: Theme) => void
  setTourDone: (b: boolean) => void
  createTicket: (input: Omit<NewTicketInput, 'requesterId'>) => Result
  setTicketStatus: (id: string, status: TicketStatus, comment?: string) => Result
  addComment: (id: string, text: string) => Result
  submitRequest: (type: WorkflowType, data: RequestData) => Result
  decide: (id: string, decision: 'approve' | 'reject', comment: string) => Result
  fulfil: (id: string, payload: FulfilPayload) => Result
  markAwaitingStock: (id: string) => Result
  cancelRequest: (id: string) => Result
  voteHelpful: (slug: string, v: 'up' | 'down') => void
  markAllRead: () => void
  /** Replace demo data wholesale (used by the guided tour's recovery). */
  setData: (data: DemoState) => void
}

type Persisted = Pick<DemoStore, 'data' | 'currentPersonId' | 'theme' | 'tourDone'>

const fresh = (): Persisted => ({
  data: buildSeed(new Date()),
  currentPersonId: DEFAULT_PERSON_BY_ROLE.staff,
  theme: 'system',
  tourDone: false,
})

function isValid(p: unknown): p is Persisted {
  const d = (p as Persisted | undefined)?.data as unknown as Record<string, unknown> | undefined
  if (!d || d.version !== SCHEMA_VERSION) return false
  const withId = (k: string, idKey = 'id') =>
    Array.isArray(d[k]) && (d[k] as unknown[]).every((x) => !!x && typeof (x as Record<string, unknown>)[idKey] === 'string')
  return (
    withId('people') &&
    (d.people as unknown[]).length > 0 &&
    withId('assets') &&
    (d.assets as { tag?: unknown }[]).every((a) => typeof a.tag === 'string' && Array.isArray((a as { history?: unknown }).history)) &&
    withId('tickets') &&
    withId('requests') &&
    withId('accounts', 'personId') &&
    withId('notifications') &&
    !!d.helpfulVotes &&
    typeof d.helpfulVotes === 'object'
  )
}

export function createDemoStore(storage = createSafeStorage()) {
  return create<DemoStore>()(
    persist(
      (set, get) => {
        const run = (fn: (data: DemoState, actor: string, now: Date) => Result): Result => {
          const res = fn(get().data, get().currentPersonId, new Date())
          if (res.ok) set({ data: res.state })
          return res
        }
        return {
          ...fresh(),
          switchPerson: (id) => {
            if (get().data.people.some((p) => p.id === id)) set({ currentPersonId: id })
          },
          switchRole: (role) => set({ currentPersonId: DEFAULT_PERSON_BY_ROLE[role] }),
          resetDemo: () => set({ data: buildSeed(new Date()), currentPersonId: DEFAULT_PERSON_BY_ROLE.staff }),
          setTheme: (theme) => set({ theme }),
          setTourDone: (tourDone) => set({ tourDone }),
          createTicket: (input) => run((d, a, n) => createTicket(d, { ...input, requesterId: a }, n)),
          setTicketStatus: (id, status, comment) => run((d, a, n) => setTicketStatus(d, id, status, a, n, comment)),
          addComment: (id, text) => run((d, a, n) => addComment(d, id, a, text, n)),
          submitRequest: (type, data) => run((d, a, n) => submitRequest(d, type, a, data, n)),
          decide: (id, decision, comment) => run((d, a, n) => decide(d, id, a, decision, comment, n)),
          fulfil: (id, payload) => run((d, a, n) => fulfil(d, id, a, payload, n)),
          markAwaitingStock: (id) => run((d, a, n) => markAwaitingStock(d, id, a, n)),
          cancelRequest: (id) => run((d, a, n) => cancelRequest(d, id, a, n)),
          voteHelpful: (slug, v) => set({ data: { ...get().data, helpfulVotes: { ...get().data.helpfulVotes, [slug]: v } } }),
          markAllRead: () => set({ data: markAllReadFn(get().data, get().currentPersonId) }),
          setData: (data) => set({ data }),
        }
      },
      {
        name: STORAGE_KEY,
        version: SCHEMA_VERSION,
        storage: createJSONStorage(() => storage),
        partialize: (s): Persisted => ({ data: s.data, currentPersonId: s.currentPersonId, theme: s.theme, tourDone: s.tourDone }),
        migrate: () => fresh(),
        merge: (persisted, current) => {
          if (!isValid(persisted)) return current
          const p = persisted as Persisted
          const personOk = p.data.people.some((x) => x.id === p.currentPersonId)
          return { ...current, ...p, currentPersonId: personOk ? p.currentPersonId : DEFAULT_PERSON_BY_ROLE.staff }
        },
      },
    ),
  )
}

export const useDemoStore = createDemoStore()

export const useCurrentPerson = () =>
  useDemoStore((s) => s.data.people.find((p) => p.id === s.currentPersonId) ?? s.data.people[0])

export const usePerson = (id: string | null | undefined) => useDemoStore((s) => s.data.people.find((p) => p.id === id))
