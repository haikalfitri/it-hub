import { assignAsset, personName, returnAsset } from './assets'
import { nextId } from './ids'
import { notify } from './notifications'
import { fail, ok, type Result } from './result'
import { DEFAULT_PERSON_BY_ROLE, emailFor } from './seed'
import { createTicket, setTicketStatus } from './tickets'
import type { Department, DemoState, Person, RequestData, RequestStep, SystemName, WorkflowRequest, WorkflowType } from './types'
import { STEP_LABELS, WORKFLOWS } from './workflowDefs'

export { WORKFLOWS } from './workflowDefs'

export interface OnboardingChecklist {
  account: boolean
  imaged: boolean
  mfa: boolean
  welcome: boolean
}
export type FulfilPayload = { assetId?: string; checklist?: OnboardingChecklist; serial?: string }

const OPEN: WorkflowRequest['status'][] = ['Pending', 'Awaiting stock']
const IT_STEPS = new Set(['it-fulfil', 'it-verify', 'system-owner'])
const isOpen = (r: WorkflowRequest) => OPEN.includes(r.status)
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** The person who approves for a department: its manager, or its head (no manager of their own). */
export function departmentHead(state: DemoState, department: string): Person | undefined {
  const inDept = state.people.filter((p) => p.department === department)
  return inDept.find((p) => p.role === 'manager') ?? inDept.find((p) => p.managerId === null)
}

function managerFor(state: DemoState, type: WorkflowType, requesterId: string, data: RequestData): string | null {
  if (type === 'onboarding') return departmentHead(state, str(data.department))?.id ?? null
  return state.people.find((p) => p.id === requesterId)?.managerId ?? null
}

/** Who must act on the request now, or null when it is closed. */
export function approverFor(_state: DemoState, request: WorkflowRequest): string | null {
  if (!isOpen(request)) return null
  return request.steps[request.currentStep]?.actorId ?? null
}

export const pendingForPerson = (state: DemoState, personId: string): WorkflowRequest[] =>
  state.requests.filter((r) => isOpen(r) && approverFor(state, r) === personId)

function validate(state: DemoState, type: WorkflowType, requester: Person, data: RequestData): string | null {
  if (!WORKFLOWS[type].startRoles.includes(requester.role)) return 'Only HR can start onboarding'
  switch (type) {
    case 'onboarding':
      if (!str(data.fullName)) return 'Full name is required'
      if (!departmentHead(state, str(data.department))) return 'Choose a department'
      if (!str(data.title)) return 'Job title is required'
      if (!str(data.startDate)) return 'Start date is required'
      return null
    case 'equipment':
      if (!str(data.itemType)) return 'Choose an item type'
      if (!str(data.reason)) return 'Reason is required'
      return null
    case 'surrender': {
      const asset = state.assets.find((a) => a.id === data.assetId)
      if (!asset || asset.ownerId !== requester.id || asset.status !== 'Assigned') return 'You can only surrender your own assets'
      if (data.undertaking !== true) return 'You must accept the undertaking'
      return null
    }
    case 'access':
      if (!str(data.system)) return 'Choose a system'
      if (!str(data.justification)) return 'Justification is required'
      return null
  }
}

function subjectFor(state: DemoState, type: WorkflowType, data: RequestData): string {
  switch (type) {
    case 'onboarding':
      return str(data.fullName)
    case 'equipment':
      return str(data.itemType)
    case 'surrender':
      return state.assets.find((a) => a.id === data.assetId)?.tag ?? 'Device'
    case 'access':
      return `${str(data.system)} (${str(data.level) || 'Read'})`
  }
}

const updateRequest = (state: DemoState, id: string, fn: (r: WorkflowRequest) => WorkflowRequest): DemoState => ({
  ...state,
  requests: state.requests.map((r) => (r.id === id ? fn(r) : r)),
})

function setTicket(state: DemoState, r: WorkflowRequest, status: Parameters<typeof setTicketStatus>[2], actorId: string, now: Date, comment?: string): DemoState {
  const res = setTicketStatus(state, r.ticketId, status, actorId, now, comment)
  return res.ok ? res.state : state
}

function actionText(r: WorkflowRequest): string {
  const kind = r.steps[r.currentStep]?.kind
  return kind === 'manager' || kind === 'system-owner' ? 'needs your approval' : 'is ready for IT'
}

/** Move to `stepIndex`, auto-skipping manager steps that have nobody to approve, then notify the actor. */
function enterStep(state: DemoState, id: string, stepIndex: number, now: Date): DemoState {
  let st = state
  let r = st.requests.find((x) => x.id === id)!
  let i = stepIndex
  while (r.steps[i]?.kind === 'manager' && r.steps[i].actorId === null) {
    const idx = i
    st = updateRequest(st, id, (x) => ({
      ...x,
      steps: x.steps.map((s, n) => (n === idx ? { ...s, decision: 'skipped', comment: 'Auto-approved: no line manager', at: now.toISOString() } : s)),
    }))
    i++
    r = st.requests.find((x) => x.id === id)!
  }
  st = updateRequest(st, id, (x) => ({ ...x, currentStep: i }))
  r = st.requests.find((x) => x.id === id)!
  const step = r.steps[i]
  if (IT_STEPS.has(step.kind) && i > 0) {
    const t = st.tickets.find((x) => x.id === r.ticketId)
    if (t && t.status === 'New') st = setTicket(st, r, 'In progress', DEFAULT_PERSON_BY_ROLE.it, now)
  }
  if (step.actorId) {
    const who = personName(st, r.requesterId)
    st = notify(st, step.actorId, `${WORKFLOWS[r.type].title} for ${r.subjectName} from ${who} ${actionText(r)}.`, `/workflows/${id}`, now)
  }
  return st
}

export function submitRequest(state: DemoState, type: WorkflowType, requesterId: string, data: RequestData, now: Date): Result {
  const requester = state.people.find((p) => p.id === requesterId)
  if (!requester) return fail('Person not found')
  const error = validate(state, type, requester, data)
  if (error) return fail(error)

  const def = WORKFLOWS[type]
  const id = nextId('REQ', state.requests.map((r) => r.id))
  const subjectName = subjectFor(state, type, data)
  const t = createTicket(
    state,
    {
      title: `${def.title}: ${subjectName}`,
      description: `Raised automatically from ${id}.`,
      category: def.ticketCategory,
      priority: 'Medium',
      requesterId,
      requestId: id,
      assetId: typeof data.assetId === 'string' ? data.assetId : undefined,
    },
    now,
    { silent: true },
  )
  if (!t.ok) return t
  const steps: RequestStep[] = def.steps.map((kind) => ({
    kind,
    label: STEP_LABELS[type][kind]!,
    actorId: kind === 'manager' ? managerFor(state, type, requesterId, data) : DEFAULT_PERSON_BY_ROLE.it,
    decision: 'pending',
  }))
  const request: WorkflowRequest = {
    id,
    type,
    requesterId,
    subjectName,
    data: { ...data },
    status: 'Pending',
    steps,
    currentStep: 0,
    createdAt: now.toISOString(),
    ticketId: t.id!,
  }
  const st = enterStep({ ...t.state, requests: [...t.state.requests, request] }, id, 0, now)
  return ok(st, id)
}

function openStep(state: DemoState, requestId: string): { r: WorkflowRequest; step: RequestStep } | string {
  const r = state.requests.find((x) => x.id === requestId)
  if (!r) return 'Request not found'
  if (!isOpen(r)) return 'This request is no longer open'
  return { r, step: r.steps[r.currentStep] }
}

function complete(state: DemoState, r: WorkflowRequest, actorId: string, now: Date, finalDecision: RequestStep['decision'], comment?: string): DemoState {
  const at = now.toISOString()
  let st = updateRequest(state, r.id, (x) => ({
    ...x,
    status: 'Completed',
    steps: x.steps.map((s, n) => (n === x.currentStep ? { ...s, decision: finalDecision, at, ...(comment ? { comment } : {}) } : s)),
  }))
  const title = WORKFLOWS[r.type].title
  st = setTicket(st, r, 'Resolved', actorId, now, `Completed via ${title}`)
  return notify(st, r.requesterId, `Your ${title} (${r.subjectName}) is complete.`, `/workflows/${r.id}`, now)
}

export function decide(state: DemoState, requestId: string, actorId: string, decision: 'approve' | 'reject', comment: string, now: Date): Result {
  const found = openStep(state, requestId)
  if (typeof found === 'string') return fail(found)
  const { r, step } = found
  if (step.kind !== 'manager' && step.kind !== 'system-owner') return fail('This step is not an approval')
  if (step.actorId !== actorId) return fail('You are not the approver for this step')
  const text = comment.trim()
  const at = now.toISOString()

  if (decision === 'reject') {
    if (!text) return fail('Please add a reason for rejecting')
    let st = updateRequest(state, requestId, (x) => ({
      ...x,
      status: 'Rejected',
      steps: x.steps.map((s, n) => (n === x.currentStep ? { ...s, decision: 'rejected', comment: text, at } : s)),
    }))
    const who = personName(state, actorId)
    st = setTicket(st, r, 'Closed', actorId, now, `Rejected by ${who}: ${text}`)
    st = notify(st, r.requesterId, `Your ${WORKFLOWS[r.type].title} (${r.subjectName}) was rejected by ${who}.`, `/workflows/${r.id}`, now)
    return ok(st)
  }

  const isLast = r.currentStep === r.steps.length - 1
  if (isLast) {
    let st = state
    if (r.type === 'access') {
      const system = str(r.data.system) as SystemName
      st = {
        ...st,
        accounts: st.accounts.map((a) => (a.personId === r.requesterId && !a.systems.includes(system) ? { ...a, systems: [...a.systems, system] } : a)),
      }
    }
    return ok(complete(st, r, actorId, now, 'approved', text || undefined))
  }
  const st = updateRequest(state, requestId, (x) => ({
    ...x,
    steps: x.steps.map((s, n) => (n === x.currentStep ? { ...s, decision: 'approved', at, ...(text ? { comment: text } : {}) } : s)),
  }))
  return ok(enterStep(st, requestId, r.currentStep + 1, now))
}

function checkFulfilStep(state: DemoState, requestId: string, actorId: string): { r: WorkflowRequest } | string {
  const found = openStep(state, requestId)
  if (typeof found === 'string') return found
  if (found.step.kind !== 'it-fulfil' && found.step.kind !== 'it-verify') return 'This step is not ready for IT yet'
  if (found.step.actorId !== actorId) return 'You are not the assignee for this step'
  return { r: found.r }
}

function uniquePersonIdAndEmail(state: DemoState, name: string): { id: string; email: string } {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')
  let id = `p-${slug}`
  for (let n = 2; state.people.some((p) => p.id === id); n++) id = `p-${slug}-${n}`
  const [local, domain] = emailFor(name).split('@')
  let email = `${local}@${domain}`
  for (let n = 2; state.people.some((p) => p.email === email); n++) email = `${local}${n}@${domain}`
  return { id, email }
}

export function fulfil(state: DemoState, requestId: string, actorId: string, payload: FulfilPayload, now: Date): Result {
  const found = checkFulfilStep(state, requestId, actorId)
  if (typeof found === 'string') return fail(found)
  const { r } = found

  switch (r.type) {
    case 'equipment': {
      const a = state.assets.find((x) => x.id === payload.assetId)
      if (!a) return fail('Pick an asset to assign')
      if (a.type !== r.data.itemType) return fail(`Pick a ${str(r.data.itemType)} for this request`)
      const res = assignAsset(state, a.id, r.requesterId, actorId, now, `Fulfilled ${r.id}`)
      if (!res.ok) return res
      return ok(complete(res.state, r, actorId, now, 'done', `Assigned ${a.tag}`))
    }
    case 'onboarding': {
      const c = payload.checklist
      if (!c || !c.account || !c.imaged || !c.mfa || !c.welcome) return fail('Complete every checklist item first')
      const laptopNeeded = r.data.laptopNeeded === true
      const laptop = laptopNeeded ? state.assets.find((x) => x.id === payload.assetId) : undefined
      if (laptopNeeded && !laptop) return fail('Pick a laptop for the new hire')
      if (laptop && laptop.type !== 'Laptop') return fail('Pick a Laptop for this request')
      if (laptop && laptop.status !== 'In stock') return fail('Asset is not in stock')

      const name = str(r.data.fullName)
      const department = str(r.data.department) as Department
      const { id, email } = uniquePersonIdAndEmail(state, name)
      const person: Person = {
        id,
        name,
        email,
        department,
        title: str(r.data.title),
        managerId: departmentHead(state, department)?.id ?? null,
        role: 'staff',
        startDate: str(r.data.startDate),
      }
      const systems = (Array.isArray(r.data.systems) ? r.data.systems : []) as SystemName[]
      let st: DemoState = { ...state, people: [...state.people, person], accounts: [...state.accounts, { personId: id, systems: [...systems] }] }
      if (laptop) {
        const res = assignAsset(st, laptop.id, id, actorId, now, `Onboarding ${r.id}`)
        if (!res.ok) return res
        st = res.state
      }
      st = updateRequest(st, r.id, (x) => ({ ...x, data: { ...x.data, personId: id } }))
      const latest = st.requests.find((x) => x.id === r.id)!
      return ok(complete(st, latest, actorId, now, 'done', laptop ? `Account created, ${laptop.tag} assigned` : 'Account created'))
    }
    case 'surrender': {
      const a = state.assets.find((x) => x.id === r.data.assetId)
      if (!a) return fail('Asset not found')
      if ((payload.serial ?? '').trim().toLowerCase() !== a.serial.toLowerCase()) return fail(`Serial number does not match ${a.tag}`)
      const condition = r.data.condition === 'damaged' ? 'damaged' : 'good'
      const res = returnAsset(state, a.id, actorId, condition, now, `Surrendered via ${r.id}`)
      if (!res.ok) return res
      return ok(complete(res.state, r, actorId, now, 'done', 'Serial verified'))
    }
    case 'access':
      return fail('This step is not ready for IT yet')
  }
}

export function markAwaitingStock(state: DemoState, requestId: string, actorId: string, now: Date): Result {
  const found = checkFulfilStep(state, requestId, actorId)
  if (typeof found === 'string') return fail(found)
  const { r } = found
  if (r.type !== 'equipment' && r.type !== 'onboarding') return fail('Only equipment and onboarding can wait for stock')
  let st = updateRequest(state, requestId, (x) => ({ ...x, status: 'Awaiting stock' }))
  st = setTicket(st, r, 'In progress', actorId, now, 'Waiting for stock')
  return ok(notify(st, r.requesterId, `Your ${WORKFLOWS[r.type].title} (${r.subjectName}) is waiting for stock.`, `/workflows/${r.id}`, now))
}

export function cancelRequest(state: DemoState, requestId: string, actorId: string, now: Date): Result {
  const r = state.requests.find((x) => x.id === requestId)
  if (!r) return fail('Request not found')
  if (!isOpen(r)) return fail('This request is no longer open')
  if (r.requesterId !== actorId) return fail('Only the requester can cancel')
  const st = updateRequest(state, requestId, (x) => ({ ...x, status: 'Cancelled' }))
  return ok(setTicket(st, r, 'Closed', actorId, now, 'Cancelled by requester'))
}
