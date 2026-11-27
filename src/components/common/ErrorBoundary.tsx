import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEY } from '@/config'

interface Props {
  children: ReactNode
  /** Injected for tests; defaults to a full page reload. */
  onReload?: () => void
}

/**
 * Last line of defence: if anything throws while rendering (bad saved data, a
 * stale code chunk after a redeploy), show a way out instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('IT Hub crashed', error, info.componentStack)
  }

  private reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage blocked: reload still recovers via in-memory seed */
    }
    ;(this.props.onReload ?? (() => window.location.assign('/')))()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
        <div className="max-w-md rounded-2xl border bg-card p-6 text-center shadow-soft">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">The demo hit an unexpected error. Resetting the demo data and reloading usually fixes it.</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reset demo and reload
          </button>
        </div>
      </main>
    )
  }
}
