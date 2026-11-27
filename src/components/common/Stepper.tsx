import { Check, Minus, X } from 'lucide-react'
import type { RequestStatus, RequestStep } from '@/domain/types'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Stepper({
  steps,
  currentStep,
  status,
  submitted,
}: {
  steps: RequestStep[]
  currentStep: number
  status: RequestStatus
  submitted: { at: string; byId: string }
}) {
  const people = usePeopleMap()
  const open = status === 'Pending' || status === 'Awaiting stock'
  const items = [
    { key: 'submitted', label: 'Submitted', state: 'done' as const, who: people.get(submitted.byId)?.name, at: submitted.at, comment: undefined },
    ...steps.map((s, i) => {
      const state =
        s.decision === 'rejected'
          ? ('rejected' as const)
          : s.decision === 'skipped'
            ? ('skipped' as const)
            : s.decision === 'approved' || s.decision === 'done'
              ? ('done' as const)
              : open && i === currentStep
                ? ('current' as const)
                : ('todo' as const)
      return { key: `${s.kind}-${i}`, label: s.label, state, who: s.actorId ? people.get(s.actorId)?.name : undefined, at: s.at, comment: s.comment }
    }),
  ]

  return (
    <ol className="space-y-0">
      {items.map((it, i) => (
        <li key={it.key} className="relative grid grid-cols-[32px_1fr] gap-3 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <span aria-hidden className={cn('absolute top-8 bottom-0 left-[15px] w-0.5', it.state === 'done' || it.state === 'skipped' ? 'bg-success' : 'bg-border')} />
          )}
          <span
            className={cn(
              'relative z-10 grid size-8 place-items-center rounded-full border-2 text-xs font-semibold',
              it.state === 'done' && 'border-success bg-success text-white',
              it.state === 'skipped' && 'border-success bg-card text-success-strong',
              it.state === 'rejected' && 'border-destructive bg-destructive text-white',
              it.state === 'current' && 'border-brand bg-card text-brand-strong ring-4 ring-brand/20',
              it.state === 'todo' && 'border-border bg-card text-muted-foreground',
            )}
          >
            {it.state === 'done' ? <Check className="size-4" /> : it.state === 'rejected' ? <X className="size-4" /> : it.state === 'skipped' ? <Minus className="size-4" /> : i}
            <span className="sr-only">
              {{ done: 'Done', skipped: 'Skipped', rejected: 'Rejected', current: 'In progress', todo: 'Not started' }[it.state]}
            </span>
          </span>
          <div className="min-w-0 pt-1">
            <p className={cn('font-medium', it.state === 'todo' && 'text-muted-foreground')}>{it.label}</p>
            <p className="text-sm text-muted-foreground">
              {it.who ?? (it.state === 'todo' ? 'Not reached yet' : '')}
              {it.at && ` · ${formatDateTime(it.at)}`}
              {it.state === 'current' && ' · waiting'}
            </p>
            {it.comment && <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">“{it.comment}”</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
