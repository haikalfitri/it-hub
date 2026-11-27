import { DEFAULT_PERSON_BY_ROLE } from '@/domain/seed'
import type { DemoState, WorkflowRequest } from '@/domain/types'
import { decide, submitRequest } from '@/domain/workflows'

export interface TourCtx {
  requestId?: string
}
export interface TourSnapshot {
  data: DemoState
  currentPersonId: string
}
export interface Recovery {
  data: DemoState
  ctx: TourCtx
  personId?: string
}
export interface TourStep {
  id: string
  title: string
  body: string
  route: (ctx: TourCtx) => string
  target: string
  done: (s: TourSnapshot, ctx: TourCtx) => boolean
  /** Extra context to remember once the step is done (e.g. the new request id). */
  capture?: (s: TourSnapshot, ctx: TourCtx) => TourCtx
  recover: (s: TourSnapshot, ctx: TourCtx, now: Date) => Recovery
}

const STAFF = DEFAULT_PERSON_BY_ROLE.staff
const MANAGER = DEFAULT_PERSON_BY_ROLE.manager
const IT = DEFAULT_PERSON_BY_ROLE.it
export const TOUR_REASON = 'My current laptop is too slow for month-end reports.'

const tourRequest = (s: TourSnapshot, ctx: TourCtx): WorkflowRequest | undefined => s.data.requests.find((r) => r.id === ctx.requestId)
const isTourLaptop = (r?: WorkflowRequest) => !!r && r.type === 'equipment' && r.requesterId === STAFF && r.data.itemType === 'Laptop'
const latestStaffEquipment = (data: DemoState) => [...data.requests].reverse().find((r) => isTourLaptop(r) && r.status !== 'Rejected' && r.status !== 'Cancelled')
/** Open, and still a laptop request the tour can complete. */
const isOpen = (r?: WorkflowRequest) => isTourLaptop(r) && (r!.status === 'Pending' || r!.status === 'Awaiting stock')

function freshRequest(data: DemoState, now: Date, approve: boolean): Recovery {
  const sub = submitRequest(data, 'equipment', STAFF, { itemType: 'Laptop', reason: TOUR_REASON, neededBy: '' }, now)
  if (!sub.ok) return { data, ctx: {} }
  if (!approve) return { data: sub.state, ctx: { requestId: sub.id } }
  const ap = decide(sub.state, sub.id!, MANAGER, 'approve', 'Approved during the tour', now)
  return { data: ap.ok ? ap.state : sub.state, ctx: { requestId: sub.id } }
}

/** Ensure the tour request is open and waiting at the manager step. */
function atManager(s: TourSnapshot, ctx: TourCtx, now: Date, personId: string): Recovery {
  const r = tourRequest(s, ctx)
  if (isOpen(r) && r!.steps[r!.currentStep].kind === 'manager') return { data: s.data, ctx, personId }
  return { ...freshRequest(s.data, now, false), personId }
}

/** Ensure the tour request is open and waiting on IT. */
function atIT(s: TourSnapshot, ctx: TourCtx, now: Date, personId: string): Recovery {
  const r = tourRequest(s, ctx)
  if (isOpen(r) && r!.steps[r!.currentStep].kind === 'it-fulfil') return { data: s.data, ctx, personId }
  if (isOpen(r) && r!.steps[r!.currentStep].kind === 'manager') {
    const ap = decide(s.data, r!.id, MANAGER, 'approve', 'Approved during the tour', now)
    if (ap.ok) return { data: ap.state, ctx, personId }
  }
  return { ...freshRequest(s.data, now, true), personId }
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'submit',
    title: 'Request a laptop as staff',
    body: "You're Aisyah from Finance. The form is filled in for you. Press Submit request.",
    route: () => '/workflows/new/equipment?tour=1',
    target: 'submit-request',
    done: (s) => !!latestStaffEquipment(s.data),
    capture: (s) => ({ requestId: latestStaffEquipment(s.data)?.id }),
    recover: (s, ctx) => ({ data: s.data, ctx, personId: STAFF }),
  },
  {
    id: 'switch-manager',
    title: 'It went to her manager',
    body: 'A linked Service Desk ticket was created and the request is waiting on Daniel, her line manager. Switch to his view.',
    route: (ctx) => `/workflows/${ctx.requestId}`,
    target: 'switch-to-approver',
    done: (s) => s.currentPersonId === MANAGER,
    recover: (s, ctx, now) => atManager(s, ctx, now, STAFF),
  },
  {
    id: 'approve',
    title: 'Approve as the manager',
    body: "You're now Daniel. Press Approve and the request moves to IT.",
    route: (ctx) => `/workflows/${ctx.requestId}`,
    target: 'approve-button',
    done: (s, ctx) => {
      const r = tourRequest(s, ctx)
      return !!r && r.steps[0].decision === 'approved'
    },
    recover: (s, ctx, now) => atManager(s, ctx, now, MANAGER),
  },
  {
    id: 'switch-it',
    title: 'Now it needs IT',
    body: 'The ticket moved to In progress. Switch to Hafiz, the IT admin, to fulfil it.',
    route: (ctx) => `/workflows/${ctx.requestId}`,
    target: 'switch-to-approver',
    done: (s) => s.currentPersonId === IT,
    recover: (s, ctx, now) => atIT(s, ctx, now, MANAGER),
  },
  {
    id: 'assign',
    title: 'Assign a laptop from stock',
    body: 'Only laptops that are in stock are listed. Pick one, then press Assign and complete.',
    route: (ctx) => `/workflows/${ctx.requestId}`,
    target: 'asset-picker',
    done: (s, ctx) => tourRequest(s, ctx)?.status === 'Completed',
    recover: (s, ctx, now) => atIT(s, ctx, now, IT),
  },
  {
    id: 'result',
    title: 'Everything updated together',
    body: "The laptop is assigned to Aisyah with its history, her ticket resolved itself and she was notified. Open the Dashboard to see the counts change.",
    route: (ctx) => `/workflows/${ctx.requestId}`,
    target: 'what-changed',
    done: () => false,
    recover: (s, ctx) => ({ data: s.data, ctx }),
  },
]
