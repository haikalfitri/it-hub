import { ChevronDown } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Label + control + helper/error text. The control receives id and aria-describedby via render prop. */
export function Field({
  label,
  error,
  help,
  children,
  className,
}: {
  label: string
  error?: string
  help?: ReactNode
  className?: string
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}) {
  const id = useId()
  const descId = `${id}-desc`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({ id, 'aria-describedby': error || help ? descId : undefined, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={descId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : help ? (
        <p id={descId} className="text-sm text-muted-foreground">
          {help}
        </p>
      ) : null}
    </div>
  )
}

export function NativeSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-input bg-card pr-9 pl-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  )
}
