import { BookOpen, Boxes, LifeBuoy, ListChecks, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { GUIDES } from '@/content/guides'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

export default function SearchDialog({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const canSeePeople = me.role === 'it' || me.role === 'hr'
  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }
  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search IT Hub" description="Search guides, assets, tickets, requests and people">
      <CommandInput placeholder="Type a guide, asset tag, serial, ticket or name…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Guides">
          {GUIDES.map((g) => (
            <CommandItem key={g.slug} value={`${g.title} ${g.summary} ${g.category}`} onSelect={() => go(`/help/${g.slug}`)}>
              <BookOpen aria-hidden />
              <span className="truncate">{g.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
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
  )
}
