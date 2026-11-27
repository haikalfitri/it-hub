import { warrantyFlag } from './assets'
import { daysFrom } from './seed'
import type { Asset, AssetStatus, AssetType, DemoState, TicketStatus, WorkflowType } from './types'

const DAY = 86_400_000
const WEEK = 7 * DAY

export interface DashboardStats {
  ticketsByStatus: Record<TicketStatus, number>
  ticketTrend: { week: string; label: string; opened: number; resolved: number }[]
  assetsByType: Record<AssetType, number>
  assetsByStatus: Record<AssetStatus, number>
  warrantyAlerts: Asset[]
  pendingByWorkflow: Record<WorkflowType, number>
  inUse: number
  inStock: number
  openTickets: number
  pendingApprovals: number
}

const count = <K extends string>(keys: readonly K[], values: K[]): Record<K, number> => {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>
  for (const v of values) out[v] = (out[v] ?? 0) + 1
  return out
}

/** Index 0..7 of the 8-week bucket a timestamp falls into (7 = this week), or -1 when outside the window. */
function weekIndex(iso: string, today: Date): number {
  const ms = today.getTime() - new Date(iso).getTime()
  if (ms < 0 || ms > 8 * WEEK) return -1
  return 7 - Math.min(7, Math.floor(ms / WEEK))
}

export function dashboardStats(state: DemoState, today: Date): DashboardStats {
  const ticketTrend = Array.from({ length: 8 }, (_, i) => {
    const week = daysFrom(today, -(8 - i) * 7 + 1)
    const d = new Date(`${week}T00:00:00`)
    return { week, label: d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }), opened: 0, resolved: 0 }
  })
  for (const t of state.tickets) {
    const i = weekIndex(t.createdAt, today)
    if (i >= 0) ticketTrend[i].opened++
    if (t.status === 'Resolved' || t.status === 'Closed') {
      const j = weekIndex(t.updatedAt, today)
      if (j >= 0) ticketTrend[j].resolved++
    }
  }

  const open = state.requests.filter((r) => r.status === 'Pending' || r.status === 'Awaiting stock')
  const ticketsByStatus = count(['New', 'In progress', 'Resolved', 'Closed'] as const, state.tickets.map((t) => t.status))
  const assetsByStatus = count(['Assigned', 'In stock', 'In repair', 'Retired'] as const, state.assets.map((a) => a.status))

  return {
    ticketsByStatus,
    ticketTrend,
    assetsByType: count(['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Peripheral'] as const, state.assets.map((a) => a.type)),
    assetsByStatus,
    warrantyAlerts: state.assets.filter((a) => warrantyFlag(a, today) !== 'ok').sort((a, b) => a.warrantyEnd.localeCompare(b.warrantyEnd)),
    pendingByWorkflow: count(['onboarding', 'equipment', 'surrender', 'access'] as const, open.map((r) => r.type)),
    inUse: assetsByStatus.Assigned,
    inStock: assetsByStatus['In stock'],
    openTickets: ticketsByStatus.New + ticketsByStatus['In progress'],
    pendingApprovals: open.length,
  }
}
