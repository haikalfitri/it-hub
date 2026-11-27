import type { ReactNode } from 'react'
import { formatDateTime } from '@/lib/format'
import { usePeopleMap } from '@/hooks/usePeopleMap'

export interface TimelineItem {
  at: string
  title: string
  body?: ReactNode
  actorId?: string
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const people = usePeopleMap()
  return (
    <ol className="relative space-y-5 border-l-2 border-border pl-6">
      {items.map((it, i) => (
        <li key={`${it.at}-${i}`} className="relative">
          <span aria-hidden className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-card bg-brand ring-2 ring-border" />
          <p className="font-medium">{it.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(it.at)}
            {it.actorId && people.get(it.actorId) ? ` · ${people.get(it.actorId)!.name}` : ''}
          </p>
          {it.body && <div className="mt-1 text-sm text-muted-foreground">{it.body}</div>}
        </li>
      ))}
    </ol>
  )
}
