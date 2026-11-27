import { ChevronRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { DemoState, WorkflowRequest } from '@/domain/types'
import { approverFor, WORKFLOWS } from '@/domain/workflows'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { timeAgo } from '@/lib/format'
import { WORKFLOW_ICON } from './meta'

export function RequestList({ requests, data, empty }: { requests: WorkflowRequest[]; data: DemoState; empty: string }) {
  const people = usePeopleMap()
  if (requests.length === 0) {
    return (
      <EmptyState icon={Inbox} title="Nothing here">
        {empty}
      </EmptyState>
    )
  }
  return (
    <ul className="overflow-hidden rounded-[10px] border bg-card shadow-soft">
      {requests.map((r) => {
        const Icon = WORKFLOW_ICON[r.type]
        const waiting = approverFor(data, r)
        return (
          <li key={r.id} data-testid="request-row" className="border-b last:border-b-0">
            <Link to={`/workflows/${r.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">{r.id}</span> · {WORKFLOWS[r.type].title}
                </p>
                <p className="truncate font-medium">{r.subjectName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {people.get(r.requesterId)?.name} · {timeAgo(r.createdAt)}
                  {waiting && ` · waiting on ${people.get(waiting)?.name}`}
                </p>
              </div>
              <StatusBadge status={r.status} className="shrink-0" />
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
