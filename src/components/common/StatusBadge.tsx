import { cn } from '@/lib/utils'

type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral'

const TONE: Record<string, Tone> = {
  // assets
  Assigned: 'ok',
  'In stock': 'info',
  'In repair': 'danger',
  Retired: 'neutral',
  // tickets
  New: 'info',
  'In progress': 'warn',
  Resolved: 'ok',
  Closed: 'neutral',
  // requests
  Pending: 'warn',
  'Awaiting stock': 'warn',
  Completed: 'ok',
  Rejected: 'danger',
  Cancelled: 'neutral',
  // warranty
  expired: 'danger',
  expiring: 'warn',
  ok: 'ok',
  // priority
  High: 'danger',
  Medium: 'warn',
  Low: 'neutral',
}

const CLASSES: Record<Tone, string> = {
  ok: 'bg-success-soft text-success-strong',
  warn: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-destructive',
  info: 'bg-brand-soft text-brand-strong',
  neutral: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const tone = TONE[status] ?? 'neutral'
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', CLASSES[tone], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {label ?? status}
    </span>
  )
}
