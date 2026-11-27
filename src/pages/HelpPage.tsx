import { ArrowRight, BookOpen, Clock, HelpCircle, Info, LifeBuoy, Search, ShieldAlert, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ANNOUNCEMENTS, type Announcement } from '@/content/announcements'
import { FAQS } from '@/content/faqs'
import { GUIDE_CATEGORIES, GUIDES, type GuideCategory } from '@/content/guides'
import { searchHelp } from '@/domain/search'
import { cn } from '@/lib/utils'

const LEVEL: Record<Announcement['level'], { icon: typeof Info; label: string; cls: string }> = {
  info: { icon: Info, label: 'Update', cls: 'bg-brand-soft text-brand-strong' },
  maintenance: { icon: Wrench, label: 'Maintenance', cls: 'bg-warning-soft text-warning' },
  security: { icon: ShieldAlert, label: 'Security', cls: 'bg-danger-soft text-destructive' },
}

export function AnnouncementCard({ a }: { a: Announcement }) {
  const L = LEVEL[a.level]
  return (
    <article className="flex gap-3 rounded-[10px] border bg-card p-4 shadow-soft">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', L.cls)}>
        <L.icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">
          {L.label} · {a.daysAgo === 0 ? 'today' : a.daysAgo === 1 ? 'yesterday' : `${a.daysAgo} days ago`}
        </p>
        <h3 className="font-semibold">{a.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
      </div>
    </article>
  )
}

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<GuideCategory | 'All'>('All')
  const hits = useMemo(() => searchHelp(query), [query])
  const guides = category === 'All' ? GUIDES : GUIDES.filter((g) => g.category === category)

  return (
    <div>
      <PageHeader eyebrow="Help Center" title="How can we help?" description="Step-by-step guides and quick answers for everyday IT. Try a guide first. If you're still stuck, raise a ticket." />

      <div className="relative mb-8 max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides and FAQs, e.g. VPN, printer, password"
          aria-label="Search guides and FAQs"
          className="h-12 rounded-xl bg-card pl-12 text-base shadow-soft"
        />
        {query.trim() && (
          <div className="mt-3 rounded-xl border bg-card p-2 shadow-soft" aria-live="polite">
            {hits.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No guides match "{query.trim()}".{' '}
                <Link to="/tickets?new=1" className="font-medium text-brand-strong underline underline-offset-4">
                  Raise a ticket instead
                </Link>
              </p>
            ) : (
              <ul>
                {hits.slice(0, 8).map((h) => (
                  <li key={`${h.type}-${h.title}`}>
                    {h.type === 'guide' ? (
                      <Link to={`/help/${h.slug}`} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-muted">
                        <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden />
                        <span>
                          <span className="block font-medium">{h.title}</span>
                          <span className="block text-sm text-muted-foreground">{h.snippet}</span>
                        </span>
                      </Link>
                    ) : (
                      <div className="flex gap-3 rounded-lg px-3 py-2.5">
                        <HelpCircle className="mt-0.5 size-4 shrink-0 text-success-strong" aria-hidden />
                        <span>
                          <span className="block font-medium">{h.title}</span>
                          <span className="block text-sm text-muted-foreground">{h.snippet}</span>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <section aria-labelledby="ann" className="mb-10">
        <h2 id="ann" className="mb-3 text-lg font-semibold">
          Announcements
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {ANNOUNCEMENTS.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      </section>

      <section aria-labelledby="guides" className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="guides" className="text-lg font-semibold">
            Guides
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter guides by category">
            {(['All', ...GUIDE_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  'min-h-9 rounded-full border px-3.5 text-sm font-medium transition-colors',
                  category === c ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to={`/help/${g.slug}`}
              className="group flex flex-col rounded-[10px] border bg-card p-5 shadow-soft transition-[box-shadow,transform] duration-200 hover:shadow-lift motion-safe:hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold text-brand-strong">{g.category}</p>
              <h3 className="mt-1 font-semibold">{g.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.summary}</p>
              <p className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden /> {g.minutes} min read
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="faq">
          <h2 id="faq" className="mb-3 text-lg font-semibold">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="rounded-[10px] border bg-card px-5 shadow-soft">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-[15px]">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <aside className="h-fit rounded-[10px] border bg-card p-5 shadow-soft lg:mt-10">
          <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand-strong">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <h2 className="mt-3 font-semibold">Still stuck?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Raise a ticket and the IT team will pick it up. You can follow every update in the Service Desk.</p>
          <Button asChild size="lg" className="mt-4 w-full">
            <Link to="/tickets?new=1">Raise a ticket</Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}
