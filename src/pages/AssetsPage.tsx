import { AlertTriangle, ArrowDownUp, Boxes, CircleUserRound, PackageCheck, PackageOpen, Search, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WarrantyBadge } from '@/components/assets/WarrantyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { NativeSelect } from '@/components/common/Field'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Input } from '@/components/ui/input'
import { isUnowned, needsAttention } from '@/domain/assets'
import type { AssetStatus, AssetType, Site } from '@/domain/types'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { cn } from '@/lib/utils'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

const TYPES: AssetType[] = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Peripheral']
const STATUSES: AssetStatus[] = ['Assigned', 'In stock', 'In repair', 'Retired']
const SITES: Site[] = ['HQ', 'Site A', 'Site B']

function Toggle({ pressed, onClick, icon: Icon, children }: { pressed: boolean; onClick: () => void; icon: typeof Boxes; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition-colors',
        pressed ? 'border-primary bg-brand-soft text-brand-strong' : 'bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
  )
}

export default function AssetsPage() {
  const me = useCurrentPerson()
  const assets = useDemoStore((s) => s.data.assets)
  const people = usePeopleMap()
  const navigate = useNavigate()
  const isIT = me.role === 'it'
  const today = useMemo(() => new Date(), [])

  const [query, setQuery] = useState('')
  const [type, setType] = useState<AssetType | ''>('')
  const [status, setStatus] = useState<AssetStatus | ''>('')
  const [site, setSite] = useState<Site | ''>('')
  const [mineOnly, setMineOnly] = useState(!isIT)
  const [attention, setAttention] = useState(false)
  const [sort, setSort] = useState<{ key: 'tag' | 'warranty'; dir: 1 | -1 }>({ key: 'tag', dir: 1 })

  const q = query.trim().toLowerCase()
  const rows = assets
    .filter((a) => !mineOnly || a.ownerId === me.id)
    .filter((a) => !type || a.type === type)
    .filter((a) => !status || a.status === status)
    .filter((a) => !site || a.site === site)
    .filter((a) => !attention || needsAttention(a, today))
    .filter((a) => !q || [a.tag, a.serial, a.model, people.get(a.ownerId ?? '')?.name ?? ''].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => sort.dir * (sort.key === 'tag' ? a.tag.localeCompare(b.tag) : a.warrantyEnd.localeCompare(b.warrantyEnd)))

  const stats = [
    { label: 'In use', value: assets.filter((a) => a.status === 'Assigned').length, icon: PackageCheck, onClick: () => setStatus('Assigned') },
    { label: 'In stock', value: assets.filter((a) => a.status === 'In stock').length, icon: PackageOpen, onClick: () => setStatus('In stock') },
    { label: 'In repair', value: assets.filter((a) => a.status === 'In repair').length, icon: Wrench, onClick: () => setStatus('In repair') },
    { label: 'Needs attention', value: assets.filter((a) => needsAttention(a, today)).length, icon: AlertTriangle, onClick: () => setAttention(true), warn: true },
  ]

  const sortBy = (key: 'tag' | 'warranty') => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))
  const ariaSort = (key: 'tag' | 'warranty') => (sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none')

  return (
    <div>
      <PageHeader
        eyebrow="Asset Inventory"
        title={mineOnly ? 'My assets' : 'All assets'}
        description="Every laptop, monitor and phone, who has it, and its full history from purchase to return."
      />

      {isIT && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <button key={s.label} type="button" onClick={s.onClick} className="flex items-center gap-3 rounded-[10px] border bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-lift">
              <span className={cn('grid size-10 place-items-center rounded-full', s.warn ? 'bg-warning-soft text-warning' : 'bg-brand-soft text-brand-strong')}>
                <s.icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-2xl leading-none font-bold">{s.value}</span>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tag, serial, model or owner" aria-label="Search assets" className="h-10 bg-card pl-9" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <NativeSelect aria-label="Type" value={type} onChange={(e) => setType(e.target.value as AssetType | '')}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </NativeSelect>
          <NativeSelect aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as AssetStatus | '')}>
            <option value="">All statuses</option>
            {STATUSES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </NativeSelect>
          <NativeSelect aria-label="Site" value={site} onChange={(e) => setSite(e.target.value as Site | '')}>
            <option value="">All sites</option>
            {SITES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <Toggle pressed={mineOnly} onClick={() => setMineOnly((v) => !v)} icon={CircleUserRound}>
            My assets
          </Toggle>
          <Toggle pressed={attention} onClick={() => setAttention((v) => !v)} icon={AlertTriangle}>
            Needs attention
          </Toggle>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Boxes} title="No assets match">
          Clear a filter or the search to see more.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card shadow-soft">
          <table className="w-full text-sm">
            <caption className="sr-only">Assets ({rows.length})</caption>
            <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" aria-sort={ariaSort('tag')} className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => sortBy('tag')} className="inline-flex items-center gap-1 uppercase hover:text-foreground">
                    Tag <ArrowDownUp className="size-3" aria-hidden />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Model
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                  Owner
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                  Site
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" aria-sort={ariaSort('warranty')} className="hidden px-4 py-3 font-semibold sm:table-cell">
                  <button type="button" onClick={() => sortBy('warranty')} className="inline-flex items-center gap-1 uppercase hover:text-foreground">
                    Warranty <ArrowDownUp className="size-3" aria-hidden />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} data-testid="asset-row" onClick={() => navigate(`/assets/${a.id}`)} className="cursor-pointer border-t transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link to={`/assets/${a.id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-[13px] font-medium whitespace-nowrap text-brand-strong hover:underline">
                      {a.tag}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{a.model}</span>
                    <span className="text-xs text-muted-foreground">{a.type}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {a.ownerId ? people.get(a.ownerId)?.name : isUnowned(a) ? <StatusBadge status="Rejected" label="No owner" /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{a.site}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <WarrantyBadge asset={a} today={today} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
