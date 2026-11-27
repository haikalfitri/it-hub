import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveDark } from '@/hooks/useApplyTheme'
import { useDemoStore } from '@/store/useDemoStore'

export function ThemeToggle() {
  const theme = useDemoStore((s) => s.theme)
  const setTheme = useDemoStore((s) => s.setTheme)
  const dark = resolveDark(theme)
  return (
    <Button variant="ghost" size="icon-lg" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(dark ? 'light' : 'dark')}>
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
