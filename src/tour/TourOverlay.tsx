import { LifeBuoy, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TOUR_STEPS } from './steps'
import { useTour } from './TourProvider'

type Rect = { top: number; left: number; width: number; height: number }

export function TourOverlay() {
  const tour = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState<Rect | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const scrolledFor = useRef<string>('')

  const step = tour?.active ? TOUR_STEPS[tour.index] : undefined
  const route = step && tour ? step.route(tour.ctx) : ''
  const onRoute = !!route && location.pathname === route.split('?')[0]

  // Track the target element's position.
  useEffect(() => {
    if (!step) return
    let frame = 0
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      if (scrolledFor.current !== step.id) {
        scrolledFor.current = step.id
        el.scrollIntoView({ block: 'center' })
      }
      setRect((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : { top: r.top, left: r.left, width: r.width, height: r.height }))
    }
    const loop = () => {
      update()
      frame = window.setTimeout(loop, 250)
    }
    loop()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(document.body)
    document.fonts?.ready.then(update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      clearTimeout(frame)
      ro?.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [step])

  // Move focus to the card when the step changes, so screen readers hear it.
  useEffect(() => {
    if (step) headingRef.current?.focus()
  }, [step])

  // Escape skips the tour.
  useEffect(() => {
    if (!step || !tour) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')) tour.stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, tour])

  if (!tour || !step) return null
  const last = tour.index === TOUR_STEPS.length - 1
  const pad = 6
  // On small screens the card sits at the bottom; flip it to the top when the target is in the lower half.
  const cardOnTop = !!rect && onRoute && rect.top + rect.height / 2 > window.innerHeight * 0.5

  return (
    <>
      {rect && onRoute && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 rounded-xl ring-4 ring-brand shadow-[0_0_0_9999px_rgb(15_14_31/0.35)] transition-all duration-200 motion-reduce:transition-none"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      )}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className={cn(
          'fixed inset-x-3 z-50 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lift sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:w-96 sm:p-5',
          cardOnTop ? 'top-3' : 'bottom-3',
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.08em] text-brand-strong uppercase">
            Tour · step {tour.index + 1} of {TOUR_STEPS.length}
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="Skip tour" onClick={tour.stop}>
            <X />
          </Button>
        </div>
        <div className="mb-3 flex gap-1" aria-hidden>
          {TOUR_STEPS.map((s, i) => (
            <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= tour.index ? 'bg-brand' : 'bg-muted'}`} />
          ))}
        </div>
        <h2 id="tour-title" ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1 text-sm text-muted-foreground" aria-live="polite">
          {step.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {last ? (
            <>
              <Button
                onClick={() => {
                  tour.stop()
                  navigate('/dashboard')
                }}
              >
                Open the Dashboard
              </Button>
              <Button variant="outline" onClick={tour.stop}>
                Finish
              </Button>
            </>
          ) : !onRoute ? (
            <Button onClick={() => navigate(route)}>Take me there</Button>
          ) : (
            <Button variant="outline" onClick={tour.backOnTrack}>
              <LifeBuoy /> Get back on track
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
