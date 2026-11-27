import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ icon: Icon, title, children, level = 2 }: { icon: LucideIcon; title: string; children?: ReactNode; level?: 1 | 2 | 3 }) {
  const H = `h${level}` as 'h1' | 'h2' | 'h3'
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/60 px-6 py-12 text-center">
      <span className="mb-3 grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
        <Icon className="size-5" aria-hidden />
      </span>
      <H className="font-semibold">{title}</H>
      {children && <div className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  )
}
