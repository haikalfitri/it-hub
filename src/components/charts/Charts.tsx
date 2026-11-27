import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardStats } from '@/domain/stats'
import { ChartFrame, LegendItem } from './ChartFrame'

const AXIS = { fontSize: 12, fill: 'var(--muted-foreground)' }

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lift">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span aria-hidden className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function TicketTrendChart({ data }: { data: DashboardStats['ticketTrend'] }) {
  const opened = data.reduce((n, d) => n + d.opened, 0)
  const resolved = data.reduce((n, d) => n + d.resolved, 0)
  return (
    <ChartFrame
      title="Tickets, last 8 weeks"
      summary={`Over the last 8 weeks ${opened} tickets were opened and ${resolved} were resolved or closed. This week: ${data[7].opened} opened, ${data[7].resolved} resolved.`}
      table={{ head: ['Week of', 'Opened', 'Resolved'], rows: data.map((d) => [d.label, d.opened, d.resolved]) }}
      legend={
        <span className="flex gap-3">
          <LegendItem color="var(--chart-1)" label="Opened" />
          <LegendItem color="var(--chart-2)" label="Resolved" dashed />
        </span>
      }
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={192}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }} />
          <Line isAnimationActive={false} type="monotone" dataKey="opened" name="Opened" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }} />
          <Line isAnimationActive={false} type="monotone" dataKey="resolved" name="Resolved" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function HorizontalBars({ title, data, unit }: { title: string; data: { name: string; value: number }[]; unit: string }) {
  const total = data.reduce((n, d) => n + d.value, 0)
  return (
    <ChartFrame
      title={title}
      summary={`${title}: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}. Total ${total} ${unit}.`}
      table={{ head: ['Category', 'Count'], rows: data.map((d) => [d.name, d.value]) }}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={Math.max(160, data.length * 34)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 8 }} barCategoryGap={6}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={88} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: 'var(--muted)', opacity: 0.6 }} />
          <Bar isAnimationActive={false} dataKey="value" name={unit} fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={18}>
            <LabelList dataKey="value" position="right" style={{ fontSize: 12, fill: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
