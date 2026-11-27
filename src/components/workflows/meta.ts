import { KeyRound, Laptop, PackagePlus, UserPlus, type LucideIcon } from 'lucide-react'
import type { WorkflowType } from '@/domain/types'

export const WORKFLOW_ICON: Record<WorkflowType, LucideIcon> = {
  onboarding: UserPlus,
  equipment: PackagePlus,
  surrender: Laptop,
  access: KeyRound,
}

export const WORKFLOW_ORDER: WorkflowType[] = ['equipment', 'access', 'surrender', 'onboarding']

export const STEP_WHO: Record<string, string> = {
  manager: 'Manager',
  'it-fulfil': 'IT',
  'it-verify': 'IT',
  'system-owner': 'System owner',
}

export const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full name',
  department: 'Department',
  title: 'Job title',
  startDate: 'Start date',
  laptopNeeded: 'Laptop needed',
  systems: 'Systems',
  itemType: 'Item type',
  reason: 'Reason',
  neededBy: 'Needed by',
  assetId: 'Device',
  condition: 'Condition',
  accessoriesReturned: 'Accessories returned',
  undertaking: 'Undertaking accepted',
  system: 'System',
  level: 'Access level',
  justification: 'Justification',
}

/** Maps a domain validation message to the form field it belongs to. */
export const ERROR_FIELD: Record<string, string> = {
  'Full name is required': 'fullName',
  'Choose a department': 'department',
  'Job title is required': 'title',
  'Start date is required': 'startDate',
  'Choose an item type': 'itemType',
  'Reason is required': 'reason',
  'You can only surrender your own assets': 'assetId',
  'You must accept the undertaking': 'undertaking',
  'Choose a system': 'system',
  'Justification is required': 'justification',
}
