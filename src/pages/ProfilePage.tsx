import { Boxes, KeyRound, LifeBuoy, ListChecks, Mail, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WarrantyBadge } from '@/components/assets/WarrantyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar } from '@/components/layout/RoleSwitcher'
import { ROLE_LABEL } from '@/components/layout/nav'
import { WORKFLOWS } from '@/domain/workflows'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { formatDate } from '@/lib/format'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

function Panel({ title, icon: Icon, count, children }: { title: string; icon: typeof Boxes; count?: number; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-[10px] border bg-card p-5 shadow-soft">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-brand-strong" aria-hidden /> {title}
        {count !== undefined && <span className="rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

export function PersonProfile({ personId }: { personId: string }) {
  const data = useDemoStore((s) => s.data)
  const people = usePeopleMap()
  const person = people.get(personId)
  if (!person) {
    return (
      <EmptyState icon={UserX} title="Person not found" level={1}>
        <Link to="/people" className="font-medium text-brand-strong underline underline-offset-4">
          Back to people
        </Link>
      </EmptyState>
    )
  }
  const manager = person.managerId ? people.get(person.managerId) : undefined
  const assets = data.assets.filter((a) => a.ownerId === person.id)
  const systems = data.accounts.find((a) => a.personId === person.id)?.systems ?? []
  const requests = data.requests.filter((r) => r.requesterId === person.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const tickets = data.tickets.filter((t) => t.requesterId === person.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
        <Avatar name={person.name} className="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.08em] text-brand-strong uppercase">
            {person.department} · {ROLE_LABEL[person.role]}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{person.name}</h1>
          <p className="text-muted-foreground">{person.title}</p>
        </div>
        <dl className="grid gap-1 text-sm sm:text-right">
          <div className="flex items-center gap-2 sm:justify-end">
            <dt className="sr-only">Email</dt>
            <Mail className="size-4 text-muted-foreground" aria-hidden />
            <dd>{person.email}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">Manager: </dt>
            <dd className="inline font-medium">{manager?.name ?? 'None'}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">Started: </dt>
            <dd className="inline font-medium">{formatDate(person.startDate)}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Assigned devices" icon={Boxes} count={assets.length}>
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No devices assigned.</p>
          ) : (
            <ul className="divide-y">
              {assets.map((a) => (
                <li key={a.id}>
                  <Link to={`/assets/${a.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:underline">
                    <span className="font-mono text-xs font-medium text-brand-strong">{a.tag}</span>
                    <span className="flex-1 truncate">{a.model}</span>
                    <WarrantyBadge asset={a} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="System access" icon={KeyRound} count={systems.length}>
          {systems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No system access yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {systems.map((s) => (
                <li key={s} className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Requests" icon={ListChecks} count={requests.length}>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <ul className="divide-y">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link to={`/workflows/${r.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:underline">
                    <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                    <span className="flex-1 truncate">
                      {WORKFLOWS[r.type].title}: {r.subjectName}
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Tickets" icon={LifeBuoy} count={tickets.length}>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="divide-y">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link to={`/tickets/${t.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:underline">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <span className="flex-1 truncate">{t.title}</span>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const me = useCurrentPerson()
  return <PersonProfile personId={me.id} />
}
