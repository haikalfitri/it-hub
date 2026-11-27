import { useMemo } from 'react'
import type { Person } from '@/domain/types'
import { useDemoStore } from '@/store/useDemoStore'

export function usePeopleMap(): Map<string, Person> {
  const people = useDemoStore((s) => s.data.people)
  return useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
}
