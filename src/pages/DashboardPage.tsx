import { AlertTriangle, ClipboardCheck, LifeBuoy, PackageCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { WarrantyBadge } from '@/components/assets/WarrantyBadge'
import { HorizontalBars, TicketTrendChart } from '@/components/charts/Charts'
import { BentoTile } from '@/components/common/BentoTile'
import { PageHeader } from '@/components/common/PageHeader'
import { WORKFLOW_ICON, WORKFLOW_ORDER } from '@/components/workflows/meta'
import { dashboardStats } from '@/domain/stats'
import { WORKFLOWS } from '@/domain/workflows'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { useDemoStore } from '@/store/useDemoStore'

function Kpi({ title, value, note, icon, to, tone }: { title: string; value: number; note: string; icon: typeof LifeBuoy; to: string; tone?: 'warn' }) {
  return (
    <BentoTile title={title} icon={icon} className="min-h-32">
      <Link to={to} className="mt-auto block rounded-md after:absolute after:inset-0">
        <span className={`block text-4xl leading-none font-bold tabular-nums ${tone === 'warn' ? 'text-warning' : ''}`}>{value}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{note}</span>
      </Link>
    </BentoTile>
  )
}

export default function DashboardPage() {
  const data = useDemoStore((s) => s.data)
  const people = usePeopleMap()
  const today = useMemo(() => new Date(), [])
  const st = useMemo(() => dashboardStats(data, today), [data, today])

  return (
    <div>
      <PageHeader eyebrow="Dashboard" title="IT at a glance" description="Live numbers from the demo data. Complete a workflow and watch these change." />
      <div className="grid auto-rows-[minmax(8rem,auto)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Open tickets" value={st.openTickets} note={`${st.ticketsByStatus.New} new, ${st.ticketsByStatus['In progress']} in progress`} icon={LifeBuoy} to="/tickets" />
        <Kpi title="Pending approvals" value={st.pendingApprovals} note="requests in progress" icon={ClipboardCheck} to="/workflows" />
        <Kpi title="Assets in use" value={st.inUse} note={`${st.inStock} in stock`} icon={PackageCheck} to="/assets" />
        <Kpi title="Warranty alerts" value={st.warrantyAlerts.length} note="expired or ending in 90 days" icon={AlertTriangle} to="/assets" tone="warn" />

        <div className="sm:col-span-2 sm:row-span-2">
          <TicketTrendChart data={st.ticketTrend} />
        </div>
        <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <HorizontalBars title="Tickets by status" unit="tickets" data={Object.entries(st.ticketsByStatus).map(([name, value]) => ({ name, value }))} />
        </div>
        <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <HorizontalBars title="Assets by type" unit="assets" data={Object.entries(st.assetsByType).map(([name, value]) => ({ name, value }))} />
        </div>

        <BentoTile size="wide" title="Warranty alerts" icon={AlertTriangle}>
          <ul className="divide-y text-sm">
            {st.warrantyAlerts.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link to={`/assets/${a.id}`} className="flex items-center gap-3 py-2 hover:underline">
                  <span className="font-mono text-xs font-medium text-brand-strong">{a.tag}</span>
                  <span className="flex-1 truncate">
                    {a.model}
                    <span className="text-muted-foreground"> · {a.ownerId ? people.get(a.ownerId)?.name : 'In stock'}</span>
                  </span>
                  <WarrantyBadge asset={a} today={today} />
                </Link>
              </li>
            ))}
          </ul>
        </BentoTile>

        <BentoTile size="wide" title="Open requests by workflow" icon={ClipboardCheck}>
          <ul className="grid grid-cols-2 gap-3">
            {WORKFLOW_ORDER.map((t) => {
              const Icon = WORKFLOW_ICON[t]
              return (
                <li key={t} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                  <Icon className="size-5 shrink-0 text-brand-strong" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-2xl leading-none font-bold tabular-nums">{st.pendingByWorkflow[t]}</span>
                    <span className="block truncate text-xs text-muted-foreground">{WORKFLOWS[t].title}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </BentoTile>
      </div>
    </div>
  )
}
