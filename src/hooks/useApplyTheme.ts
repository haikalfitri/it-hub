import { useEffect } from 'react'
import { useDemoStore } from '@/store/useDemoStore'

export function resolveDark(theme: 'light' | 'dark' | 'system'): boolean {
  if (theme === 'system') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  return theme === 'dark'
}

/** Keeps the `dark` class on <html> in sync with the chosen theme (and the OS when theme = system). */
export function useApplyTheme() {
  const theme = useDemoStore((s) => s.theme)
  useEffect(() => {
    const apply = () => document.documentElement.classList.toggle('dark', resolveDark(theme))
    apply()
    if (theme !== 'system') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener('change', apply)
    return () => mq?.removeEventListener('change', apply)
  }, [theme])
}
