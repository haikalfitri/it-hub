import { ChevronRight, Inbox, Link2, Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog'
import { Button } from '@/components/ui/button'
import type { TicketStatus } from '@/domain/types'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

const FILTERS: (TicketStatus | 'All')[] = ['All', 'New', 'In progress', 'Resolved', 'Closed']

export default function TicketsPage() {
  const [params, setParams] = useSearchParams()
  const me = useCurrentPerson()
  const tickets = useDemoStore((s) => s.data.tickets)
  const people = usePeopleMap()
  const isIT = me.role === 'it'
  const filter = (params.get('status') as TicketStatus | null) ?? 'All'

  const visible = tickets.filter((t) => isIT || t.requesterId === me.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const shown = filter === 'All' ? visible : visible.filter((t) => t.status === filter)
  const count = (f: TicketStatus | 'All') => (f === 'All' ? visible.length : visible.filter((t) => t.status === f).length)

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }
  const dialogOpen = params.get('new') === '1'

  return (
    <div>
      <PageHeader
        eyebrow="Service Desk"
        title={isIT ? 'All tickets' : 'My tickets'}
        description={isIT ? 'Every ticket raised across the company, including ones created automatically by workflows.' : 'Tickets you have raised and the ones created for your requests.'}
        actions={
          <Button size="lg" onClick={() => setParam('new', '1')}>
            <Plus /> Raise a ticket
          </Button>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setParam('status', f === 'All' ? null : f)}
            className={cn(
              'flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
              filter === f ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
            <span className={cn('rounded-full px-1.5 text-xs', filter === f ? 'bg-white/20' : 'bg-muted')}>{count(f)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Inbox} title={visible.length === 0 ? 'No tickets yet' : `No ${filter.toLowerCase()} tickets`}>
          {visible.length === 0 ? 'When you raise a ticket or submit a request, it shows up here.' : 'Try another filter.'}
        </EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-[10px] border bg-card shadow-soft">
          {shown.map((t) => (
            <li key={t.id} data-testid="ticket-row" className="border-b last:border-b-0">
              <Link to={`/tickets/${t.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    {t.requestId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-strong">
                        <Link2 className="size-3" aria-hidden /> {t.requestId}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category}
                    {isIT && ` · ${people.get(t.requesterId)?.name ?? 'Unknown'}`} · updated {timeAgo(t.updatedAt)}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  <StatusBadge status={t.priority} label={`${t.priority} priority`} />
                </div>
                <StatusBadge status={t.status} className="shrink-0" />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NewTicketDialog
        open={dialogOpen}
        initialCategory={params.get('category') ?? undefined}
        onOpenChange={(o) => {
          if (!o) {
            const next = new URLSearchParams(params)
            next.delete('new')
            next.delete('category')
            setParams(next, { replace: true })
          }
        }}
      />
    </div>
  )
}
