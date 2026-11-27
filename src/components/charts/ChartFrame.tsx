import type { ReactNode } from 'react'

/** Chart wrapper: visible title, screen-reader summary, and a data table view. */
export function ChartFrame({
  title,
  summary,
  table,
  legend,
  children,
  className = '',
}: {
  title: string
  summary: string
  table: { head: string[]; rows: (string | number)[][] }
  legend?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <figure className={`flex h-full flex-col rounded-2xl border bg-card p-5 shadow-soft ${className}`}>
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {legend}
      </figcaption>
      <p className="sr-only">{summary}</p>
      <div className="min-h-48 flex-1" aria-hidden>
        {children}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">Show data table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h} scope="col" className="border-b py-1.5 pr-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className="border-b py-1.5 pr-3 tabular-nums">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

export function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden className="inline-block h-0.5 w-4 rounded-full" style={dashed ? { borderTop: `2px dashed ${color}` } : { background: color }} />
      {label}
    </span>
  )
}
