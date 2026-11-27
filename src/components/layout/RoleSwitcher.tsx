import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_PERSON_BY_ROLE } from '@/domain/seed'
import type { Role } from '@/domain/types'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'
import { ROLE_LABEL } from './nav'

const ROLES: Role[] = ['staff', 'manager', 'hr', 'it']

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn('grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground', className)}>
      {initials(name)}
    </span>
  )
}

export function RoleSwitcher() {
  const me = useCurrentPerson()
  const people = useDemoStore((s) => s.data.people)
  const switchPerson = useDemoStore((s) => s.switchPerson)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-tour="role-switcher"
        aria-label={`Viewing as ${ROLE_LABEL[me.role]}: ${me.name}. Switch role`}
        className="flex h-10 items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1.5 text-sm shadow-soft transition-colors hover:bg-muted"
      >
        <Avatar name={me.name} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[11px] text-muted-foreground">Viewing as {ROLE_LABEL[me.role]}</span>
          <span className="block font-medium">{me.name}</span>
        </span>
        <span className="font-medium sm:hidden">{ROLE_LABEL[me.role]}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch role</DropdownMenuLabel>
          {ROLES.map((role) => {
            const p = people.find((x) => x.id === DEFAULT_PERSON_BY_ROLE[role])
            if (!p) return null
            return (
              <DropdownMenuItem key={role} onSelect={() => switchPerson(p.id)} className="gap-3 py-2">
                <Avatar name={p.name} />
                <span className="flex-1 leading-tight">
                  <span className="block font-medium">{ROLE_LABEL[role]}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.name} · {p.department}
                  </span>
                </span>
                {me.id === p.id && <Check className="size-4 text-brand-strong" aria-label="Current" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Pick a specific person</DropdownMenuLabel>
          {ROLES.map((role) => (
            <DropdownMenuSub key={role}>
              <DropdownMenuSubTrigger>{ROLE_LABEL[role]}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-80 w-64 overflow-y-auto">
                {people
                  .filter((p) => p.role === role)
                  .map((p) => (
                    <DropdownMenuItem key={p.id} onSelect={() => switchPerson(p.id)} className="gap-2">
                      <span className="flex-1 leading-tight">
                        <span className="block">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.title} · {p.department}
                        </span>
                      </span>
                      {me.id === p.id && <Check className="size-4 text-brand-strong" aria-label="Current" />}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
