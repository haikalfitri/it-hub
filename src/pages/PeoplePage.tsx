import { ArrowLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { NativeSelect } from '@/components/common/Field'
import { PageHeader } from '@/components/common/PageHeader'
import { Avatar } from '@/components/layout/RoleSwitcher'
import { Input } from '@/components/ui/input'
import type { Department } from '@/domain/types'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'
import { PersonProfile } from './ProfilePage'

const DEPARTMENTS: Department[] = ['Finance', 'Engineering', 'Operations', 'HR', 'IT']

export default function PeoplePage() {
  const { id } = useParams()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const people = usePeopleMap()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState<Department | ''>('')

  if (me.role !== 'it' && me.role !== 'hr') return <Navigate to="/me" replace />

  if (id) {
    return (
      <div>
        <Link to="/people" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> People
        </Link>
        <PersonProfile personId={id} />
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const rows = data.people
    .filter((p) => !dept || p.department === dept)
    .filter((p) => !q || [p.name, p.title, p.email].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name))

  return (
    <div>
      <PageHeader eyebrow="People" title="People directory" description="Everyone's manager, devices and system access in one place. New hires appear here as soon as onboarding completes." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, title or email" aria-label="Search people" className="h-10 bg-card pl-9" />
        </div>
        <div className="sm:w-48">
          <NativeSelect aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value as Department | '')}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="overflow-x-auto rounded-[10px] border bg-card shadow-soft">
        <table className="w-full text-sm">
          <caption className="sr-only">People ({rows.length})</caption>
          <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Name
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                Department
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                Manager
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Devices
              </th>
              <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
                Systems
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} data-testid="person-row" onClick={() => navigate(`/people/${p.id}`)} className="cursor-pointer border-t hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link to={`/people/${p.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <span>
                      <span className="block font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.title}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">{p.department}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.managerId ? people.get(p.managerId)?.name : '—'}</td>
                <td className="px-4 py-3 text-right font-medium">{data.assets.filter((a) => a.ownerId === p.id).length}</td>
                <td className="hidden px-4 py-3 text-right font-medium sm:table-cell">{data.accounts.find((a) => a.personId === p.id)?.systems.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
