import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const SIZE = {
  sm: '',
  wide: 'sm:col-span-2',
  tall: 'sm:row-span-2',
  big: 'sm:col-span-2 sm:row-span-2',
} as const

export function BentoTile({
  size = 'sm',
  tone = 'default',
  title,
  icon: Icon,
  action,
  className,
  children,
  ...rest
}: {
  size?: keyof typeof SIZE
  tone?: 'default' | 'brand'
  title: string
  icon: LucideIcon
  action?: ReactNode
  className?: string
  children: ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      aria-label={title}
      className={cn(
        'bento-tile relative flex min-h-36 flex-col overflow-hidden rounded-2xl p-5 transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5',
        tone === 'brand'
          ? 'bg-[linear-gradient(140deg,#6366f1,#4338ca_60%,#312e81)] text-white shadow-lift dark:bg-[linear-gradient(140deg,#4f46e5,#312e81)]'
          : 'border bg-card shadow-soft hover:shadow-lift',
        SIZE[size],
        className,
      )}
      {...rest}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className={cn('flex items-center gap-2 text-sm font-medium', tone === 'brand' ? 'text-indigo-100' : 'text-muted-foreground')}>
          <Icon className="size-4" aria-hidden />
          {title}
        </h2>
        {action}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  )
}
