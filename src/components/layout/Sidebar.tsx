import { NavLink } from 'react-router-dom'
import { COMPANY_NAME } from '@/config'
import { cn } from '@/lib/utils'
import { useCurrentPerson } from '@/store/useDemoStore'
import { Logo } from './Logo'
import { navFor } from './nav'

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const me = useCurrentPerson()
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {navFor(me.role).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors duration-200',
              isActive ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="size-[18px]" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarFooter() {
  return (
    <div className="rounded-xl border border-dashed bg-background/60 p-3 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">{COMPANY_NAME}</p>
      <p className="mt-0.5">Demo data only. Changes stay in this browser and can be reset at any time.</p>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r bg-sidebar px-3 py-5 md:flex">
      <Logo />
      <NavList />
      <div className="mt-auto">
        <SidebarFooter />
      </div>
    </aside>
  )
}
