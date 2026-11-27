import { Boxes, LifeBuoy, ListChecks, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

export function SearchPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const canSeePeople = me.role === 'it' || me.role === 'hr'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-muted text-muted-foreground transition-colors hover:bg-accent sm:hidden"
      >
        <Search className="size-[18px]" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-muted px-3 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex md:max-w-md"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="truncate">Search guides, assets, tickets…</span>
        <kbd className="ml-auto hidden rounded border bg-card px-1.5 font-mono text-[11px] lg:inline">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search IT Hub" description="Search guides, assets, tickets, requests and people">
        <CommandInput placeholder="Type a guide, asset tag, serial, ticket or name…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Assets">
            {data.assets.map((a) => (
              <CommandItem key={a.id} value={`${a.tag} ${a.serial} ${a.model}`} onSelect={() => go(`/assets/${a.id}`)}>
                <Boxes aria-hidden />
                <span className="font-mono text-xs">{a.tag}</span>
                <span className="truncate text-muted-foreground">{a.model}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tickets">
            {data.tickets.map((t) => (
              <CommandItem key={t.id} value={`${t.id} ${t.title}`} onSelect={() => go(`/tickets/${t.id}`)}>
                <LifeBuoy aria-hidden />
                <span className="font-mono text-xs">{t.id}</span>
                <span className="truncate">{t.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Requests">
            {data.requests.map((r) => (
              <CommandItem key={r.id} value={`${r.id} ${r.subjectName} ${r.type}`} onSelect={() => go(`/workflows/${r.id}`)}>
                <ListChecks aria-hidden />
                <span className="font-mono text-xs">{r.id}</span>
                <span className="truncate">{r.subjectName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          {canSeePeople && (
            <CommandGroup heading="People">
              {data.people.map((p) => (
                <CommandItem key={p.id} value={`${p.name} ${p.department} ${p.title}`} onSelect={() => go(`/people/${p.id}`)}>
                  <User aria-hidden />
                  <span>{p.name}</span>
                  <span className="truncate text-muted-foreground">{p.department}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
