import { AlertTriangle, ArrowRight, BookOpen, Boxes, CheckCircle2, ClipboardCheck, LifeBuoy, Megaphone, PackagePlus, PlayCircle, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { WarrantyBadge } from '@/components/assets/WarrantyBadge'
import { BentoTile } from '@/components/common/BentoTile'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROLE_LABEL } from '@/components/layout/nav'
import { Button } from '@/components/ui/button'
import { ANNOUNCEMENTS } from '@/content/announcements'
import { GUIDES } from '@/content/guides'
import { COMPANY_NAME } from '@/config'
import { dashboardStats } from '@/domain/stats'
import { approverFor, pendingForPerson, WORKFLOWS } from '@/domain/workflows'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { firstName, timeAgo } from '@/lib/format'
import { startTour } from '@/tour/events'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 18 ? 'Good afternoon' : 'Good evening')

export default function HomePage() {
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const people = usePeopleMap()
  const today = useMemo(() => new Date(), [])
  const isIT = me.role === 'it'

  const tasks = pendingForPerson(data, me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const myOpen = data.requests.filter((r) => r.requesterId === me.id && (r.status === 'Pending' || r.status === 'Awaiting stock'))
  const myAssets = data.assets.filter((a) => a.ownerId === me.id)
  const openTickets = data.tickets.filter((t) => (isIT || t.requesterId === me.id) && (t.status === 'New' || t.status === 'In progress'))
  const st = useMemo(() => dashboardStats(data, today), [data, today])
  const announcement = ANNOUNCEMENTS[0]

  const headline =
    tasks.length > 0
      ? `${tasks.length} ${tasks.length === 1 ? 'item needs' : 'items need'} your action`
      : myOpen.length > 0
        ? `${myOpen.length} of your requests ${myOpen.length === 1 ? 'is' : 'are'} in progress`
        : "You're all caught up"

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand-strong uppercase">
          {greeting(today)}, {firstName(me.name)}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-[28px]">{headline}</h1>
        <p className="mt-1 text-muted-foreground">
          {COMPANY_NAME} · {me.department} · viewing as {ROLE_LABEL[me.role]}
        </p>
      </div>

      <div className="stagger grid auto-rows-[minmax(9rem,auto)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BentoTile size="big" tone="brand" title={tasks.length ? 'Waiting on you' : 'Your requests'} icon={ClipboardCheck}>
          {tasks.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {tasks.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {WORKFLOWS[r.type].title}: {r.subjectName}
                    </span>
                    <span className="block text-sm text-indigo-100">
                      {people.get(r.requesterId)?.name} · {timeAgo(r.createdAt)}
                    </span>
                  </span>
                  <Button asChild size="sm" className="h-8 bg-white text-indigo-900 hover:bg-indigo-50">
                    <Link to={`/workflows/${r.id}`}>Review</Link>
                  </Button>
                </li>
              ))}
              {tasks.length > 3 && (
                <Link to="/workflows" className="text-sm font-medium text-indigo-100 underline underline-offset-4">
                  See all {tasks.length}
                </Link>
              )}
            </ul>
          ) : myOpen.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {myOpen.slice(0, 3).map((r) => {
                const w = approverFor(data, r)
                return (
                  <li key={r.id}>
                    <Link to={`/workflows/${r.id}`} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-3 hover:bg-white/15">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {WORKFLOWS[r.type].title}: {r.subjectName}
                        </span>
                        <span className="block text-sm text-indigo-100">Waiting on {w ? people.get(w)?.name : 'IT'}</span>
                      </span>
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col justify-center">
              <CheckCircle2 className="size-8 text-emerald-300" aria-hidden />
              <p className="mt-2 text-lg font-semibold">Nothing is waiting on you.</p>
              <p className="text-sm text-indigo-100">Start a request below or take the tour to see how approvals flow.</p>
            </div>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <Button asChild size="sm" variant="outline" className="h-9 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/workflows/new/equipment">
                <PackagePlus /> Request equipment
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/tickets?new=1">
                <LifeBuoy /> Raise a ticket
              </Link>
            </Button>
          </div>
        </BentoTile>

        <BentoTile title={isIT ? 'Assets in use' : 'My devices'} icon={Boxes}>
          <Link to="/assets" className="mt-auto rounded-md after:absolute after:inset-0">
            <span className="block text-4xl leading-none font-bold tabular-nums">{isIT ? st.inUse : myAssets.length}</span>
            <span className="mt-1 block truncate text-sm text-muted-foreground">{isIT ? `${st.inStock} in stock` : myAssets.map((a) => a.tag).join(', ') || 'None assigned'}</span>
          </Link>
        </BentoTile>

        <BentoTile title={isIT ? 'Open tickets' : 'My open tickets'} icon={LifeBuoy}>
          <Link to="/tickets" className="mt-auto rounded-md after:absolute after:inset-0">
            <span className="block text-4xl leading-none font-bold tabular-nums">{openTickets.length}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{isIT ? `${st.ticketsByStatus.New} new today and earlier` : 'IT will update you here'}</span>
          </Link>
        </BentoTile>

        <BentoTile size="wide" title="Take the 60-second tour" icon={Sparkles} className="bg-[linear-gradient(135deg,var(--card),var(--brand-soft))]">
          <p className="text-sm text-muted-foreground">Request a laptop as staff, approve it as a manager, then assign it from inventory as IT. Six guided steps.</p>
          <div className="mt-auto pt-3">
            <Button onClick={startTour} data-tour="start-tour">
              <PlayCircle /> Start the tour
            </Button>
          </div>
        </BentoTile>

        {isIT ? (
          <BentoTile size="wide" title="Warranty alerts" icon={AlertTriangle}>
            <ul className="divide-y text-sm">
              {st.warrantyAlerts.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link to={`/assets/${a.id}`} className="flex items-center gap-3 py-2 hover:underline">
                    <span className="font-mono text-xs font-medium text-brand-strong">{a.tag}</span>
                    <span className="flex-1 truncate">{a.model}</span>
                    <WarrantyBadge asset={a} today={today} />
                  </Link>
                </li>
              ))}
            </ul>
          </BentoTile>
        ) : (
          <BentoTile size="wide" title="Popular guides" icon={BookOpen}>
            <ul className="divide-y text-sm">
              {GUIDES.filter((g) => g.popular)
                .slice(0, 3)
                .map((g) => (
                  <li key={g.slug}>
                    <Link to={`/help/${g.slug}`} className="flex items-center gap-2 py-2 hover:underline">
                      <span className="flex-1">{g.title}</span>
                      <span className="text-xs text-muted-foreground">{g.minutes} min</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </BentoTile>
        )}

        <BentoTile size="wide" title="Latest announcement" icon={Megaphone}>
          <p className="font-semibold">{announcement.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{announcement.body}</p>
          <Link to="/help" className="mt-auto pt-2 text-sm font-medium text-brand-strong hover:underline">
            All announcements
          </Link>
        </BentoTile>

        {tasks.length === 0 && myOpen.length === 0 && data.requests.some((r) => r.requesterId === me.id) && (
          <BentoTile size="wide" title="Recently completed" icon={CheckCircle2}>
            <ul className="divide-y text-sm">
              {data.requests
                .filter((r) => r.requesterId === me.id)
                .slice(-3)
                .reverse()
                .map((r) => (
                  <li key={r.id}>
                    <Link to={`/workflows/${r.id}`} className="flex items-center gap-2 py-2 hover:underline">
                      <span className="flex-1 truncate">
                        {WORKFLOWS[r.type].title}: {r.subjectName}
                      </span>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
            </ul>
          </BentoTile>
        )}
      </div>
    </div>
  )
}
