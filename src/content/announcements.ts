export interface Announcement {
  id: string
  title: string
  body: string
  /** Days before today. */
  daysAgo: number
  level: 'info' | 'maintenance' | 'security'
}

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', title: 'Planned email maintenance this Saturday', body: 'Email may be unavailable on Saturday from 10pm to midnight while we apply updates. Teams is not affected.', daysAgo: 1, level: 'maintenance' },
  { id: 'ann-2', title: 'Payroll phishing emails going around', body: 'Some staff received emails asking them to "verify payroll details". Do not click. Use the Report button in Outlook.', daysAgo: 1, level: 'security' },
  { id: 'ann-3', title: 'New: track your IT requests in one place', body: 'Equipment, access and onboarding requests now show every approval step, and each one has a linked Service Desk ticket.', daysAgo: 9, level: 'info' },
]
