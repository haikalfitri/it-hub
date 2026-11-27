import { ArrowLeft, FileQuestion, LifeBuoy, ListChecks } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { WarrantyBadge } from '@/components/assets/WarrantyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Timeline } from '@/components/common/Timeline'
import { isUnowned } from '@/domain/assets'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { formatDate } from '@/lib/format'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

export default function AssetDetailPage() {
  const { id = '' } = useParams()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const people = usePeopleMap()
  const asset = data.assets.find((a) => a.id === id)

  if (!asset) {
    return (
      <EmptyState icon={FileQuestion} title="Asset not found" level={1}>
        <Link to="/assets" className="font-medium text-brand-strong underline underline-offset-4">
          Back to assets
        </Link>
      </EmptyState>
    )
  }
  const owner = asset.ownerId ? people.get(asset.ownerId) : undefined
  const canOpenPeople = me.role === 'it' || me.role === 'hr'
  const tickets = data.tickets.filter((t) => t.assetId === asset.id)
  const requests = data.requests.filter((r) => r.data.assetId === asset.id || asset.history.some((h) => h.note?.includes(r.id)))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <Link to="/assets" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Assets
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium text-brand-strong">{asset.tag}</span>
          <StatusBadge status={asset.status} />
          {isUnowned(asset) && <StatusBadge status="Rejected" label="No owner recorded" />}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {asset.model} <span className="font-normal text-muted-foreground">· {asset.type}</span>
        </h1>

        <section aria-labelledby="history" className="mt-8 rounded-[10px] border bg-card p-5 shadow-soft">
          <h2 id="history" className="mb-4 font-semibold">
            History
          </h2>
          <Timeline items={[...asset.history].reverse().map((h) => ({ at: h.at, title: h.event, actorId: h.actorId, body: h.note }))} />
        </section>
      </div>

      <aside className="space-y-4 lg:pt-10">
        <dl className="grid gap-3 rounded-[10px] border bg-card p-5 text-sm shadow-soft">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="text-right font-medium">
              {owner ? (
                canOpenPeople ? (
                  <Link to={`/people/${owner.id}`} className="text-brand-strong hover:underline">
                    {owner.name}
                  </Link>
                ) : (
                  owner.name
                )
              ) : (
                '—'
              )}
            </dd>
          </div>
          {[
            ['Serial number', <span key="serial" className="font-mono">{asset.serial}</span>],
            ['Site', asset.site],
            ['Purchased', formatDate(asset.purchaseDate)],
            ['Warranty ends', <WarrantyBadge key="warranty" asset={asset} />],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {(tickets.length > 0 || requests.length > 0) && (
          <div className="rounded-[10px] border bg-card p-5 shadow-soft">
            <h2 className="mb-2 text-sm font-semibold">Linked work</h2>
            <ul className="space-y-1 text-sm">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link to={`/workflows/${r.id}`} className="flex items-center gap-2 rounded-md py-1.5 hover:underline">
                    <ListChecks className="size-4 text-brand-strong" aria-hidden />
                    <span className="font-mono text-xs">{r.id}</span> {r.subjectName}
                    <StatusBadge status={r.status} className="ml-auto" />
                  </Link>
                </li>
              ))}
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link to={`/tickets/${t.id}`} className="flex items-center gap-2 rounded-md py-1.5 hover:underline">
                    <LifeBuoy className="size-4 text-brand-strong" aria-hidden />
                    <span className="font-mono text-xs">{t.id}</span>
                    <StatusBadge status={t.status} className="ml-auto" />
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
