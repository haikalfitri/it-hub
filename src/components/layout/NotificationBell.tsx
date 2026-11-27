import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/useDemoStore'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const me = useDemoStore((s) => s.currentPersonId)
  const all = useDemoStore((s) => s.data.notifications)
  const markAllRead = useDemoStore((s) => s.markAllRead)
  const mine = all.filter((n) => n.personId === me).sort((a, b) => b.at.localeCompare(a.at))
  const unread = mine.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="relative" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-bold text-white">{unread}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        {mine.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing yet. Updates about your requests and approvals appear here.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {mine.slice(0, 12).map((n) => (
              <li key={n.id}>
                <Link to={n.link} onClick={() => setOpen(false)} className={cn('flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted', !n.read && 'bg-brand-soft/60')}>
                  <span aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand')} />
                  <span>
                    <span className="block">{n.text}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(n.at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
