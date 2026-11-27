import type { Role, StepKind, SystemName, WorkflowType } from './types'

export const STEP_LABELS: Record<WorkflowType, Partial<Record<StepKind, string>>> = {
  onboarding: { manager: 'Department manager approval', 'it-fulfil': 'IT prepares laptop and accounts' },
  equipment: { manager: 'Line manager approval', 'it-fulfil': 'IT assigns equipment' },
  surrender: { 'it-verify': 'IT verifies serial number' },
  access: { manager: 'Line manager approval', 'system-owner': 'System owner grants access' },
}

export const WORKFLOWS: Record<
  WorkflowType,
  { title: string; description: string; steps: StepKind[]; ticketCategory: string; startRoles: Role[] }
> = {
  onboarding: {
    title: 'New-hire onboarding',
    description: 'HR starts it, the department manager approves, and IT prepares the laptop and accounts.',
    steps: ['manager', 'it-fulfil'],
    ticketCategory: 'Onboarding',
    startRoles: ['hr'],
  },
  equipment: {
    title: 'Equipment request',
    description: 'Ask for a laptop, monitor, phone or other device. Your manager approves and IT assigns one from stock.',
    steps: ['manager', 'it-fulfil'],
    ticketCategory: 'Equipment request',
    startRoles: ['staff', 'manager', 'hr', 'it'],
  },
  surrender: {
    title: 'Laptop surrender & undertaking',
    description: 'Return a device when you leave or get a replacement. IT checks the serial number and returns it to stock.',
    steps: ['it-verify'],
    ticketCategory: 'Laptop surrender',
    startRoles: ['staff', 'manager', 'hr', 'it'],
  },
  access: {
    title: 'System access request',
    description: 'Request access to a business system. Your manager approves and the system owner grants it.',
    steps: ['manager', 'system-owner'],
    ticketCategory: 'System access',
    startRoles: ['staff', 'manager', 'hr', 'it'],
  },
}

export const ALL_SYSTEMS: SystemName[] = ['Email', 'ERP', 'File share', 'VPN', 'HR portal', 'CAD suite']
