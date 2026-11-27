import { Search } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'

// The command palette (and its index of guides, assets and tickets) loads on first open.
const SearchDialog = lazy(() => import('./SearchDialog'))

export function SearchPalette() {
  const [open, setOpenState] = useState(false)
  const [mounted, setMounted] = useState(false)
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => {
    setMounted(true)
    setOpenState(v)
  }

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
      {mounted && (
        <Suspense fallback={null}>
          <SearchDialog open={open} setOpen={setOpen} />
        </Suspense>
      )}
    </>
  )
}
