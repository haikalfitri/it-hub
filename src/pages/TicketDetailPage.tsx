import { ArrowLeft, Boxes, FileQuestion, Link2, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Timeline } from '@/components/common/Timeline'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { TicketStatus } from '@/domain/types'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { formatDateTime } from '@/lib/format'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

const NEXT: Record<TicketStatus, TicketStatus[]> = {
  New: ['In progress', 'Resolved'],
  'In progress': ['Resolved'],
  Resolved: ['Closed', 'In progress'],
  Closed: ['In progress'],
}

export default function TicketDetailPage() {
  const { id = '' } = useParams()
  const me = useCurrentPerson()
  const ticket = useDemoStore((s) => s.data.tickets.find((t) => t.id === id))
  const asset = useDemoStore((s) => s.data.assets.find((a) => a.id === ticket?.assetId))
  const setStatus = useDemoStore((s) => s.setTicketStatus)
  const addComment = useDemoStore((s) => s.addComment)
  const people = usePeopleMap()
  const [text, setText] = useState('')
  const [error, setError] = useState<string>()

  if (!ticket) {
    return (
      <EmptyState icon={FileQuestion} title="Ticket not found" level={1}>
        <Link to="/tickets" className="font-medium text-brand-strong underline underline-offset-4">
          Back to the Service Desk
        </Link>
      </EmptyState>
    )
  }

  const isIT = me.role === 'it'
  const linked = !!ticket.requestId
  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const r = addComment(ticket.id, text)
    if (!r.ok) return setError(r.error)
    setText('')
    setError(undefined)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <Link to="/tickets" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Service Desk
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
          <StatusBadge status={ticket.status} />
          <StatusBadge status={ticket.priority} label={`${ticket.priority} priority`} />
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance">{ticket.title}</h1>
        {ticket.description && <p className="mt-2 max-w-2xl whitespace-pre-line text-muted-foreground">{ticket.description}</p>}

        <section aria-labelledby="activity" className="mt-8 rounded-[10px] border bg-card p-5 shadow-soft">
          <h2 id="activity" className="mb-4 font-semibold">
            Activity
          </h2>
          <Timeline
            items={[
              { at: ticket.createdAt, title: 'Ticket raised', actorId: ticket.requesterId },
              ...ticket.comments.map((c) => ({
                at: c.at,
                actorId: c.authorId,
                title: c.text.startsWith('Status changed') ? c.text.split('. ')[0] : 'Comment',
                body: c.text.startsWith('Status changed') ? c.text.split('. ').slice(1).join('. ') || undefined : c.text,
              })),
            ]}
          />
          <form onSubmit={send} className="mt-6 flex flex-col gap-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Add a comment
            </label>
            <Textarea id="comment" value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-invalid={!!error} aria-describedby={error ? 'comment-err' : undefined} />
            {error && (
              <p id="comment-err" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="self-end">
              <Send /> Post comment
            </Button>
          </form>
        </section>
      </div>

      <aside className="space-y-4 lg:pt-10">
        <dl className="grid gap-3 rounded-[10px] border bg-card p-5 text-sm shadow-soft">
          {[
            ['Requester', people.get(ticket.requesterId)?.name ?? 'Unknown'],
            ['Assignee', people.get(ticket.assigneeId ?? '')?.name ?? 'Unassigned'],
            ['Category', ticket.category],
            ['Raised', formatDateTime(ticket.createdAt)],
            ['Last update', formatDateTime(ticket.updatedAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {linked && (
          <div className="rounded-[10px] border border-brand/40 bg-brand-soft p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-brand-strong">
              <Link2 className="size-4" aria-hidden /> Linked to {ticket.requestId}
            </p>
            <p className="mt-1 text-muted-foreground">This ticket updates automatically as the request moves through its approval steps.</p>
            <Button asChild variant="outline" className="mt-3 w-full bg-card">
              <Link to={`/workflows/${ticket.requestId}`}>Open the request</Link>
            </Button>
          </div>
        )}

        {asset && (
          <Link to={`/assets/${asset.id}`} className="flex items-center gap-3 rounded-[10px] border bg-card p-4 text-sm shadow-soft hover:bg-muted/60">
            <Boxes className="size-5 text-brand-strong" aria-hidden />
            <span>
              <span className="block font-mono text-xs text-muted-foreground">{asset.tag}</span>
              <span className="font-medium">{asset.model}</span>
            </span>
          </Link>
        )}

        {isIT && !linked && (
          <div className="rounded-[10px] border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold">Update status</h2>
            <div className="flex flex-wrap gap-2">
              {NEXT[ticket.status].map((s) => (
                <Button
                  key={s}
                  variant={s === 'Resolved' ? 'default' : 'outline'}
                  onClick={() => {
                    const r = setStatus(ticket.id, s)
                    if (r.ok) toast.success(`Ticket marked ${s.toLowerCase()}`)
                    else toast.error(r.error)
                  }}
                >
                  Mark {s.toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
