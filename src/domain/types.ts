export type Role = 'staff' | 'manager' | 'hr' | 'it'
export type Department = 'Finance' | 'Engineering' | 'Operations' | 'HR' | 'IT'

export interface Person {
  id: string
  name: string
  email: string
  department: Department
  title: string
  managerId: string | null
  role: Role
  startDate: string
}

export type AssetType = 'Laptop' | 'Desktop' | 'Monitor' | 'Phone' | 'Tablet' | 'Peripheral'
export type AssetStatus = 'In stock' | 'Assigned' | 'In repair' | 'Retired'
export type Site = 'HQ' | 'Site A' | 'Site B'

export interface AssetEvent {
  at: string
  actorId: string
  event: string
  note?: string
}

export interface Asset {
  id: string
  tag: string
  type: AssetType
  model: string
  serial: string
  status: AssetStatus
  ownerId: string | null
  site: Site
  purchaseDate: string
  warrantyEnd: string
  history: AssetEvent[]
}

export type TicketStatus = 'New' | 'In progress' | 'Resolved' | 'Closed'
export type Priority = 'Low' | 'Medium' | 'High'

export interface TicketComment {
  at: string
  authorId: string
  text: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  status: TicketStatus
  requesterId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  comments: TicketComment[]
  requestId: string | null
  assetId: string | null
}

export type WorkflowType = 'onboarding' | 'equipment' | 'surrender' | 'access'
export type StepKind = 'manager' | 'it-fulfil' | 'it-verify' | 'system-owner'

export interface RequestStep {
  kind: StepKind
  label: string
  actorId: string | null
  decision: 'pending' | 'approved' | 'rejected' | 'done' | 'skipped'
  comment?: string
  at?: string
}

export type RequestStatus = 'Pending' | 'Awaiting stock' | 'Completed' | 'Rejected' | 'Cancelled'

export type RequestData = Record<string, string | boolean | string[]>

export interface WorkflowRequest {
  id: string
  type: WorkflowType
  requesterId: string
  subjectName: string
  data: RequestData
  status: RequestStatus
  steps: RequestStep[]
  currentStep: number
  createdAt: string
  ticketId: string
}

export type SystemName = 'Email' | 'ERP' | 'File share' | 'VPN' | 'HR portal' | 'CAD suite'

export interface Account {
  personId: string
  systems: SystemName[]
}

export interface Notification {
  id: string
  personId: string
  text: string
  link: string
  read: boolean
  at: string
}

export interface DemoState {
  version: 1
  people: Person[]
  assets: Asset[]
  tickets: Ticket[]
  requests: WorkflowRequest[]
  accounts: Account[]
  notifications: Notification[]
  helpfulVotes: Record<string, 'up' | 'down'>
}
