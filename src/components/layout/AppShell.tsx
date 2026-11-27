import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { ResetButton } from './ResetButton'
import { RoleSwitcher } from './RoleSwitcher'
import { SearchPalette } from './SearchPalette'
import { NavList, Sidebar, SidebarFooter } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

export function Header({ extraActions }: { extraActions?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:gap-3 md:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-6 bg-sidebar px-3 py-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
          <Logo />
          <NavList onNavigate={() => setOpen(false)} />
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ResetButton />
            </div>
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
      <SearchPalette />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {extraActions}
        <RoleSwitcher />
        <NotificationBell />
        <span className="hidden sm:inline-flex">
          <ThemeToggle />
        </span>
        <span className="hidden xl:inline-flex">
          <ResetButton />
        </span>
        <span className="hidden sm:inline-flex xl:hidden">
          <ResetButton compact />
        </span>
      </div>
    </header>
  )
}

export function AppShell({ headerActions }: { headerActions?: React.ReactNode }) {
  useApplyTheme()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo?.({ top: 0 })
  }, [pathname])
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <Sidebar />
      <div className="min-w-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
          Skip to content
        </a>
        <Header extraActions={headerActions} />
        <main id="main" className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
