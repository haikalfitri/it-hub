import { ArrowLeft, BookX, Clock, LifeBuoy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { guideBySlug } from '@/content/guides'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/useDemoStore'

export default function GuidePage() {
  const { slug = '' } = useParams()
  const guide = guideBySlug(slug)
  const vote = useDemoStore((s) => s.data.helpfulVotes[slug])
  const voteHelpful = useDemoStore((s) => s.voteHelpful)

  if (!guide) {
    return (
      <EmptyState icon={BookX} title="Guide not found" level={1}>
        <Link to="/help" className="font-medium text-brand-strong underline underline-offset-4">
          Back to the Help Center
        </Link>
      </EmptyState>
    )
  }
  const related = guide.related.map(guideBySlug).filter((g) => !!g)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0">
        <Link to="/help" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Help Center
        </Link>
        <p className="text-xs font-semibold tracking-[0.08em] text-brand-strong uppercase">{guide.category}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-[28px]">{guide.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{guide.summary}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden /> {guide.minutes} min read
        </p>

        <ol className="mt-8 space-y-4">
          {guide.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-[10px] border bg-card p-5 shadow-soft">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-sm font-medium text-primary-foreground">{i + 1}</span>
              <div>
                <h2 className="font-semibold">{s.title}</h2>
                <p className="mt-1 text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[10px] border border-dashed p-4">
          <p className="font-medium">Was this guide helpful?</p>
          <div className="flex gap-2">
            {(['up', 'down'] as const).map((v) => {
              const Icon = v === 'up' ? ThumbsUp : ThumbsDown
              return (
                <Button
                  key={v}
                  variant="outline"
                  aria-pressed={vote === v}
                  onClick={() => voteHelpful(slug, v)}
                  className={cn(vote === v && 'border-primary bg-brand-soft text-brand-strong')}
                >
                  <Icon /> {v === 'up' ? 'Yes' : 'No'}
                </Button>
              )
            })}
          </div>
          {vote && (
            <p className="text-sm text-muted-foreground" role="status">
              {vote === 'up' ? 'Thanks for the feedback!' : "Thanks. We'll improve this guide. Raise a ticket if you still need help."}
            </p>
          )}
        </div>
      </article>

      <aside className="space-y-4 lg:pt-10">
        <div className="rounded-[10px] border bg-card p-5 shadow-soft">
          <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand-strong">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <h2 className="mt-3 font-semibold">Still stuck?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Raise a ticket. The category will be filled in for you.</p>
          <Button asChild size="lg" className="mt-4 w-full">
            <Link to={`/tickets?new=1&category=${encodeURIComponent(guide.ticketCategory)}`}>Raise a ticket</Link>
          </Button>
        </div>
        {related.length > 0 && (
          <div className="rounded-[10px] border bg-card p-5 shadow-soft">
            <h2 className="font-semibold">Related guides</h2>
            <ul className="mt-2 space-y-1">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to={`/help/${r.slug}`} className="block rounded-md py-1.5 text-sm text-brand-strong hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
