import { EMAIL_DOMAIN } from '@/config'
import { STEP_LABELS, WORKFLOWS } from './workflowDefs'
import type {
  Account,
  Asset,
  AssetType,
  DemoState,
  Department,
  Notification,
  Person,
  Priority,
  RequestData,
  RequestStep,
  RequestStatus,
  Role,
  Site,
  SystemName,
  Ticket,
  TicketComment,
  TicketStatus,
  WorkflowRequest,
  WorkflowType,
} from './types'

const HOUR = 3_600_000

/** Local calendar date `n` days from `today`, as YYYY-MM-DD. */
export function daysFrom(today: Date, n: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** A timestamp `daysAgo` days and `hoursEarlier` hours before `today`. */
function ago(today: Date, daysAgo: number, hoursEarlier = 2): string {
  return new Date(today.getTime() - (daysAgo * 24 + hoursEarlier) * HOUR).toISOString()
}

export const emailFor = (name: string) =>
  `${name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .join('.')}@${EMAIL_DOMAIN}`

type PersonRow = [id: string, name: string, department: Department, title: string, role: Role, managerId: string | null, startDaysAgo: number]

const PEOPLE: PersonRow[] = [
  ['p-hafiz', 'Hafiz Ismail', 'IT', 'Head of IT', 'it', null, 2400],
  ['p-kevin', 'Kevin Lim', 'IT', 'IT Support Engineer', 'it', 'p-hafiz', 900],
  ['p-daniel', 'Daniel Tan', 'Finance', 'Finance Manager', 'manager', null, 2100],
  ['p-aisyah', 'Aisyah Rahman', 'Finance', 'Accounts Executive', 'staff', 'p-daniel', 640],
  ['p-farid', 'Farid Zulkifli', 'Finance', 'Finance Analyst', 'staff', 'p-daniel', 820],
  ['p-meiyee', 'Wong Mei Yee', 'Finance', 'Accounts Assistant', 'staff', 'p-daniel', 300],
  ['p-nadia', 'Nadia Hassan', 'Finance', 'Payroll Executive', 'staff', 'p-daniel', 1200],
  ['p-jason', 'Jason Yeo', 'Finance', 'Credit Controller', 'staff', 'p-daniel', 510],
  ['p-kumar', 'Kumar Selvam', 'Engineering', 'Engineering Manager', 'manager', null, 1900],
  ['p-amirul', 'Amirul Hakim', 'Engineering', 'Project Engineer', 'staff', 'p-kumar', 760],
  ['p-jiahui', 'Chen Jia Hui', 'Engineering', 'Electrical Engineer', 'staff', 'p-kumar', 980],
  ['p-arjun', 'Arjun Pillai', 'Engineering', 'Site Engineer', 'staff', 'p-kumar', 430],
  ['p-syafiqah', 'Syafiqah Azmi', 'Engineering', 'Design Engineer', 'staff', 'p-kumar', 1500],
  ['p-weijie', 'Lee Wei Jie', 'Engineering', 'Junior Engineer', 'staff', 'p-kumar', 38],
  ['p-nurul', 'Nurul Huda Abdullah', 'Operations', 'Operations Manager', 'manager', null, 1700],
  ['p-rizal', 'Rizal Hamid', 'Operations', 'Operations Executive', 'staff', 'p-nurul', 690],
  ['p-siewling', 'Tan Siew Ling', 'Operations', 'Site Supervisor', 'staff', 'p-nurul', 1100],
  ['p-muthu', 'Muthu Rajan', 'Operations', 'Maintenance Technician', 'staff', 'p-nurul', 1350],
  ['p-izzati', 'Izzati Kamal', 'Operations', 'Logistics Coordinator', 'staff', 'p-nurul', 270],
  ['p-boonkeat', 'Ong Boon Keat', 'Operations', 'Procurement Officer', 'staff', 'p-nurul', 880],
  ['p-faizal', 'Faizal Omar', 'Operations', 'Site Technician', 'staff', 'p-nurul', 560],
  ['p-siti', 'Siti Mariam Yusof', 'HR', 'HR Manager', 'manager', null, 2000],
  ['p-priya', 'Priya Nair', 'HR', 'HR Executive', 'hr', 'p-siti', 720],
  ['p-hana', 'Hana Zainal', 'HR', 'HR Assistant', 'hr', 'p-siti', 190],
]

export const DEFAULT_PERSON_BY_ROLE: Record<Role, string> = {
  staff: 'p-aisyah',
  manager: 'p-daniel',
  hr: 'p-priya',
  it: 'p-hafiz',
}

const IT_ADMIN = DEFAULT_PERSON_BY_ROLE.it

const BASE_SYSTEMS: Record<Department, SystemName[]> = {
  Finance: ['Email', 'File share', 'VPN', 'ERP'],
  Engineering: ['Email', 'File share', 'VPN', 'CAD suite'],
  Operations: ['Email', 'File share', 'VPN'],
  HR: ['Email', 'File share', 'VPN', 'HR portal'],
  IT: ['Email', 'File share', 'VPN', 'ERP', 'HR portal', 'CAD suite'],
}
/** People whose seeded account deliberately lacks a system (it arrives via a request). */
const SYSTEM_EXCEPTIONS: Record<string, SystemName[]> = {
  'p-meiyee': ['Email', 'File share', 'VPN'],
  'p-amirul': ['Email', 'File share', 'VPN', 'CAD suite'],
  'p-weijie': ['Email', 'File share', 'VPN', 'CAD suite'],
}

const MODELS: Record<AssetType, string[]> = {
  Laptop: ['Dell Latitude 5440', 'Lenovo ThinkPad T14', 'HP EliteBook 840'],
  Desktop: ['Dell OptiPlex 7010'],
  Monitor: ['Dell P2422H'],
  Phone: ['Samsung Galaxy A55'],
  Tablet: ['Apple iPad (10th gen)'],
  Peripheral: ['Dell WD19S Dock'],
}
const PREFIX: Record<AssetType, string> = { Laptop: 'LAP', Desktop: 'DSK', Monitor: 'MON', Phone: 'PHN', Tablet: 'TAB', Peripheral: 'PER' }
const SERIAL_PREFIX: Record<AssetType, string> = { Laptop: '5CG', Desktop: 'DT7', Monitor: 'CN0', Phone: 'R5C', Tablet: 'DMP', Peripheral: 'WD1' }

interface AssetSpec {
  type: AssetType
  ownerId: string | null
  status?: Asset['status']
  site?: Site
  /** Override warranty: days from today (negative = expired). */
  warrantyIn?: number
  extraHistory?: { daysAgo: number; event: string; note?: string }[]
}

function assetSpecs(): AssetSpec[] {
  const specs: AssetSpec[] = []
  // One laptop per person.
  for (const [id, , dept] of PEOPLE) {
    const site: Site = dept === 'Operations' ? 'Site A' : dept === 'Engineering' && id === 'p-arjun' ? 'Site B' : 'HQ'
    specs.push({
      type: 'Laptop',
      ownerId: id,
      site,
      warrantyIn: id === 'p-daniel' ? 41 : undefined,
    })
  }
  // Spare laptops in stock.
  for (let i = 0; i < 4; i++) specs.push({ type: 'Laptop', ownerId: null, status: 'In stock' })
  // Laptop returned damaged via a completed surrender.
  specs.push({
    type: 'Laptop',
    ownerId: null,
    status: 'In repair',
    site: 'Site A',
    extraHistory: [
      { daysAgo: 400, event: 'Assigned to Muthu Rajan' },
      { daysAgo: 35, event: 'Returned (damaged), sent to repair', note: 'Cracked hinge. Replacement laptop issued.' },
    ],
  })
  // Monitors.
  const monitorOwners = ['p-aisyah', 'p-daniel', 'p-farid', 'p-priya', 'p-jiahui', 'p-syafiqah', 'p-hafiz']
  monitorOwners.forEach((ownerId, i) => specs.push({ type: 'Monitor', ownerId, warrantyIn: i === 2 ? 75 : undefined }))
  specs.push({ type: 'Monitor', ownerId: null, status: 'Assigned', site: 'HQ' }) // unowned: needs attention
  // Phones.
  specs.push({ type: 'Phone', ownerId: 'p-nurul', warrantyIn: 20, site: 'Site A' })
  specs.push({ type: 'Phone', ownerId: 'p-siewling', site: 'Site A' })
  specs.push({ type: 'Phone', ownerId: null, status: 'In stock' })
  specs.push({
    type: 'Phone',
    ownerId: null,
    status: 'In repair',
    extraHistory: [{ daysAgo: 6, event: 'Sent to repair', note: 'Battery swelling.' }],
  })
  // Tablets.
  specs.push({ type: 'Tablet', ownerId: 'p-muthu', site: 'Site A' })
  specs.push({ type: 'Tablet', ownerId: null, status: 'In stock', warrantyIn: -120 })
  // Desktops at site control rooms.
  specs.push({ type: 'Desktop', ownerId: 'p-faizal', site: 'Site A', warrantyIn: -30 })
  specs.push({ type: 'Desktop', ownerId: null, status: 'In stock', site: 'Site B' })
  // Docking stations.
  specs.push({ type: 'Peripheral', ownerId: 'p-kumar' })
  specs.push({ type: 'Peripheral', ownerId: null, status: 'In stock' })
  return specs
}

function buildAssets(today: Date, nameOf: (id: string) => string): Asset[] {
  const counters: Partial<Record<AssetType, number>> = {}
  return assetSpecs().map((spec, i) => {
    const n = (counters[spec.type] = (counters[spec.type] ?? 0) + 1)
    const tag = `${PREFIX[spec.type]}-${String(n).padStart(4, '0')}`
    const models = MODELS[spec.type]
    const purchaseDaysAgo = 120 + ((i * 37) % 800)
    const warrantyEnd = spec.warrantyIn !== undefined ? daysFrom(today, spec.warrantyIn) : daysFrom(today, 1095 - purchaseDaysAgo)
    const purchaseDate = spec.warrantyIn !== undefined ? daysFrom(today, spec.warrantyIn - 1095) : daysFrom(today, -purchaseDaysAgo)
    const purchaseAgo = Math.round((today.getTime() - new Date(purchaseDate).getTime()) / (24 * HOUR))
    const serial = `${SERIAL_PREFIX[spec.type]}${((i + 1) * 7919 + 104729).toString(36).toUpperCase().padStart(6, '0')}`
    const history: Asset['history'] = [{ at: ago(today, purchaseAgo, 0), actorId: IT_ADMIN, event: 'Received into stock' }]
    if (spec.ownerId) {
      history.push({ at: ago(today, Math.max(purchaseAgo - 7, 1), 0), actorId: IT_ADMIN, event: `Assigned to ${nameOf(spec.ownerId)}` })
    }
    if (spec.status === 'Assigned' && !spec.ownerId) {
      history.push({ at: ago(today, 60, 0), actorId: IT_ADMIN, event: 'Marked assigned', note: 'Owner not recorded during stock-take.' })
    }
    for (const h of spec.extraHistory ?? []) history.push({ at: ago(today, h.daysAgo, 0), actorId: IT_ADMIN, event: h.event, note: h.note })
    return {
      id: `a-${tag.toLowerCase()}`,
      tag,
      type: spec.type,
      model: models[i % models.length],
      serial,
      status: spec.status ?? (spec.ownerId ? 'Assigned' : 'In stock'),
      ownerId: spec.ownerId,
      site: spec.site ?? 'HQ',
      purchaseDate,
      warrantyEnd,
      history,
    }
  })
}

interface TicketSpec {
  title: string
  description: string
  category: string
  priority: Priority
  status: TicketStatus
  requesterId: string
  daysAgo: number
  updates?: { daysAgo: number; authorId: string; text: string }[]
}

const TICKETS: TicketSpec[] = [
  { title: 'Outlook keeps asking for my password', description: 'Since this morning Outlook prompts for my password every few minutes.', category: 'Email', priority: 'Medium', status: 'Resolved', requesterId: 'p-farid', daysAgo: 52, updates: [{ daysAgo: 51, authorId: 'p-kevin', text: 'Cleared cached credentials and re-signed in. Working now.' }] },
  { title: 'Level 3 printer shows offline', description: 'The printer near the pantry is offline for everyone on level 3.', category: 'Printing', priority: 'Low', status: 'Resolved', requesterId: 'p-meiyee', daysAgo: 45, updates: [{ daysAgo: 45, authorId: 'p-kevin', text: 'Printer had a new IP after a power cut. Re-reserved the address.' }] },
  { title: 'VPN drops every few minutes at site', description: 'VPN disconnects repeatedly when working from Site B.', category: 'Network & VPN', priority: 'High', status: 'Resolved', requesterId: 'p-arjun', daysAgo: 38, updates: [{ daysAgo: 36, authorId: 'p-hafiz', text: 'Updated the VPN client and adjusted the keep-alive setting.' }] },
  { title: 'Laptop fan is loud and very hot', description: 'Fan runs at full speed even when idle.', category: 'Hardware', priority: 'Medium', status: 'Closed', requesterId: 'p-rizal', daysAgo: 31, updates: [{ daysAgo: 29, authorId: 'p-kevin', text: 'Cleaned the vents and updated BIOS. Temperatures normal.' }] },
  { title: 'Please install Microsoft Visio', description: 'Need Visio for process diagrams for the new project.', category: 'Software', priority: 'Low', status: 'Resolved', requesterId: 'p-amirul', daysAgo: 24, updates: [{ daysAgo: 23, authorId: 'p-kevin', text: 'Licence assigned and installed remotely.' }] },
  { title: 'Set up MFA on my new phone', description: 'I changed phones and can no longer approve sign-ins.', category: 'Account & access', priority: 'Medium', status: 'Resolved', requesterId: 'p-izzati', daysAgo: 17, updates: [{ daysAgo: 17, authorId: 'p-hafiz', text: 'Reset MFA methods. Registered the new phone with the user.' }] },
  { title: 'Cannot open the Finance shared folder', description: 'Getting "access denied" on the month-end folder.', category: 'Account & access', priority: 'Medium', status: 'In progress', requesterId: 'p-nadia', daysAgo: 9, updates: [{ daysAgo: 8, authorId: 'p-kevin', text: 'Checking folder permissions with the folder owner.' }] },
  { title: 'Teams camera not detected', description: 'Camera works in other apps but not in Teams meetings.', category: 'Hardware', priority: 'Low', status: 'New', requesterId: 'p-jiahui', daysAgo: 2 },
  { title: 'Suspicious email asking to verify payroll details', description: 'Received an email asking me to log in to update bank details. Looks like phishing.', category: 'Other', priority: 'High', status: 'In progress', requesterId: 'p-siti', daysAgo: 1, updates: [{ daysAgo: 1, authorId: 'p-hafiz', text: 'Confirmed phishing. Blocking the sender and checking who else received it.' }] },
  { title: 'Wi-Fi very slow in meeting room B', description: 'Video calls keep freezing in meeting room B.', category: 'Network & VPN', priority: 'Medium', status: 'New', requesterId: 'p-siewling', daysAgo: 0 },
]

interface RequestSpec {
  type: WorkflowType
  requesterId: string
  subjectName: string
  data: RequestData
  status: RequestStatus
  daysAgo: number
  /** Per step: decision, actor, comment, days ago. */
  steps: { decision: RequestStep['decision']; actorId: string | null; comment?: string; daysAgo?: number }[]
  currentStep: number
  ticketStatus: TicketStatus
}

const REQUESTS: RequestSpec[] = [
  {
    type: 'onboarding', requesterId: 'p-priya', subjectName: 'Lee Wei Jie', status: 'Completed', daysAgo: 45, currentStep: 1, ticketStatus: 'Resolved',
    data: { fullName: 'Lee Wei Jie', department: 'Engineering', title: 'Junior Engineer', startDate: '', laptopNeeded: true, systems: ['Email', 'File share', 'VPN', 'CAD suite'] },
    steps: [{ decision: 'approved', actorId: 'p-kumar', comment: 'Approved. Starts with the substation team.', daysAgo: 44 }, { decision: 'done', actorId: IT_ADMIN, comment: 'Laptop imaged, accounts and MFA ready.', daysAgo: 40 }],
  },
  {
    type: 'surrender', requesterId: 'p-muthu', subjectName: 'LAP-0029', status: 'Completed', daysAgo: 36, currentStep: 0, ticketStatus: 'Resolved',
    data: { assetId: 'a-lap-0029', reason: 'Replacement', condition: 'damaged', accessoriesReturned: true, undertaking: true },
    steps: [{ decision: 'done', actorId: IT_ADMIN, comment: 'Serial verified. Sent to repair.', daysAgo: 35 }],
  },
  {
    type: 'access', requesterId: 'p-amirul', subjectName: 'CAD suite (Edit)', status: 'Completed', daysAgo: 21, currentStep: 1, ticketStatus: 'Resolved',
    data: { system: 'CAD suite', level: 'Edit', justification: 'Need to update single-line diagrams for the new project.' },
    steps: [{ decision: 'approved', actorId: 'p-kumar', daysAgo: 21 }, { decision: 'approved', actorId: IT_ADMIN, comment: 'Edit rights granted.', daysAgo: 20 }],
  },
  {
    type: 'equipment', requesterId: 'p-rizal', subjectName: 'Phone', status: 'Rejected', daysAgo: 13, currentStep: 0, ticketStatus: 'Closed',
    data: { itemType: 'Phone', reason: 'Need a work phone for on-call duty.', neededBy: '' },
    steps: [{ decision: 'rejected', actorId: 'p-nurul', comment: 'Please use the shared on-call phone for now.', daysAgo: 12 }, { decision: 'pending', actorId: null }],
  },
  {
    type: 'access', requesterId: 'p-meiyee', subjectName: 'ERP (Edit)', status: 'Pending', daysAgo: 3, currentStep: 1, ticketStatus: 'In progress',
    data: { system: 'ERP', level: 'Edit', justification: 'Taking over accounts payable entries from next month.' },
    steps: [{ decision: 'approved', actorId: 'p-daniel', comment: 'Approved for AP entries.', daysAgo: 2 }, { decision: 'pending', actorId: IT_ADMIN }],
  },
  {
    type: 'onboarding', requesterId: 'p-priya', subjectName: 'Ong Mei Ling', status: 'Pending', daysAgo: 2, currentStep: 0, ticketStatus: 'New',
    data: { fullName: 'Ong Mei Ling', department: 'Finance', title: 'Tax Executive', startDate: '', laptopNeeded: true, systems: ['Email', 'File share', 'VPN', 'ERP'] },
    steps: [{ decision: 'pending', actorId: 'p-daniel' }, { decision: 'pending', actorId: null }],
  },
  {
    type: 'equipment', requesterId: 'p-farid', subjectName: 'Monitor', status: 'Pending', daysAgo: 0, currentStep: 0, ticketStatus: 'New',
    data: { itemType: 'Monitor', reason: 'Second screen for month-end reconciliations.', neededBy: '' },
    steps: [{ decision: 'pending', actorId: 'p-daniel' }, { decision: 'pending', actorId: null }],
  },
]

export function buildSeed(today: Date): DemoState {
  const people: Person[] = PEOPLE.map(([id, name, department, title, role, managerId, startDaysAgo]) => ({
    id,
    name,
    email: emailFor(name),
    department,
    title,
    managerId,
    role,
    startDate: daysFrom(today, -startDaysAgo),
  }))
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? 'Unknown'

  const accounts: Account[] = people.map((p) => ({
    personId: p.id,
    systems: [...(SYSTEM_EXCEPTIONS[p.id] ?? BASE_SYSTEMS[p.department])],
  }))

  const assets = buildAssets(today, nameOf)

  const tickets: Ticket[] = TICKETS.map((t, i) => {
    const comments: TicketComment[] = (t.updates ?? []).map((u) => ({ at: ago(today, u.daysAgo, 1), authorId: u.authorId, text: u.text }))
    if (t.status !== 'New') {
      comments.push({ at: ago(today, Math.max(t.daysAgo - 1, 0), 1), authorId: IT_ADMIN, text: `Status changed to ${t.status}` })
    }
    return {
      id: `TCK-${String(i + 1).padStart(4, '0')}`,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      requesterId: t.requesterId,
      assigneeId: IT_ADMIN,
      createdAt: ago(today, t.daysAgo, 3),
      updatedAt: comments.length ? comments[comments.length - 1].at : ago(today, t.daysAgo, 3),
      comments,
      requestId: null,
      assetId: null,
    }
  })

  const requests: WorkflowRequest[] = REQUESTS.map((r, i) => {
    const id = `REQ-${String(i + 1).padStart(4, '0')}`
    const ticketId = `TCK-${String(tickets.length + 1).padStart(4, '0')}`
    const def = WORKFLOWS[r.type]
    const data: RequestData = { ...r.data }
    if (r.type === 'onboarding') data.startDate = daysFrom(today, r.status === 'Completed' ? -38 : 14)
    if (r.type === 'equipment') data.neededBy = daysFrom(today, -r.daysAgo + 10)
    const steps: RequestStep[] = def.steps.map((kind, s) => {
      const st = r.steps[s]
      return {
        kind,
        label: STEP_LABELS[r.type][kind]!,
        actorId: st.actorId,
        decision: st.decision,
        ...(st.comment ? { comment: st.comment } : {}),
        ...(st.daysAgo !== undefined ? { at: ago(today, st.daysAgo, 1) } : {}),
      }
    })
    const createdAt = ago(today, r.daysAgo, 4)
    const comments: TicketComment[] = []
    if (r.ticketStatus !== 'New') {
      const last = [...r.steps].reverse().find((s) => s.daysAgo !== undefined)
      comments.push({ at: ago(today, last?.daysAgo ?? r.daysAgo, 1), authorId: IT_ADMIN, text: `Status changed to ${r.ticketStatus}` })
    }
    tickets.push({
      id: ticketId,
      title: `${def.title}: ${r.subjectName}`,
      description: `Raised automatically from ${id}.`,
      category: def.ticketCategory,
      priority: 'Medium',
      status: r.ticketStatus,
      requesterId: r.requesterId,
      assigneeId: IT_ADMIN,
      createdAt,
      updatedAt: comments.length ? comments[0].at : createdAt,
      comments,
      requestId: id,
      assetId: typeof data.assetId === 'string' ? data.assetId : null,
    })
    return { id, type: r.type, requesterId: r.requesterId, subjectName: r.subjectName, data, status: r.status, steps, currentStep: r.currentStep, createdAt, ticketId }
  })

  const notifications: Notification[] = [
    { id: 'N-0001', personId: 'p-daniel', text: 'Farid Zulkifli requested a Monitor and needs your approval.', link: '/workflows/REQ-0007', read: false, at: ago(today, 0, 3) },
    { id: 'N-0002', personId: 'p-daniel', text: 'New-hire onboarding for Ong Mei Ling needs your approval.', link: '/workflows/REQ-0006', read: false, at: ago(today, 2, 3) },
    { id: 'N-0003', personId: IT_ADMIN, text: 'ERP (Edit) access for Wong Mei Yee is ready for you to grant.', link: '/workflows/REQ-0005', read: false, at: ago(today, 2, 1) },
    { id: 'N-0004', personId: 'p-rizal', text: 'Your Phone request was rejected by Nurul Huda Abdullah.', link: '/workflows/REQ-0004', read: true, at: ago(today, 12, 1) },
  ]

  return { version: 1, people, assets, tickets, requests, accounts, notifications, helpfulVotes: {} }
}
