import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buildSeed, DEFAULT_PERSON_BY_ROLE } from '@/domain/seed'
import type { DemoState } from '@/domain/types'
import { useDemoStore } from '@/store/useDemoStore'
import { START_TOUR_EVENT } from './events'
import { TOUR_STEPS, type TourCtx } from './steps'

interface TourApi {
  active: boolean
  index: number
  ctx: TourCtx
  start: () => void
  stop: () => void
  backOnTrack: () => void
}

const TourContext = createContext<TourApi | null>(null)
export const useTour = () => useContext(TourContext)

/** Rough check for "has the visitor changed the demo data?" (seed timestamps differ per build, so compare shape). */
function changedFromSeed(data: DemoState): boolean {
  const seed = buildSeed(new Date())
  const historyLen = (d: DemoState) => d.assets.reduce((n, a) => n + a.history.length, 0)
  return (
    data.requests.length !== seed.requests.length ||
    data.tickets.length !== seed.tickets.length ||
    data.people.length !== seed.people.length ||
    data.notifications.length !== seed.notifications.length ||
    historyLen(data) !== historyLen(seed) ||
    data.requests.some((r, i) => r.status !== seed.requests[i]?.status)
  )
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [ctx, setCtx] = useState<TourCtx>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const tourDone = useDemoStore((s) => s.tourDone)
  const setTourDone = useDemoStore((s) => s.setTourDone)
  const offered = useRef(false)

  const begin = useCallback(() => {
    const st = useDemoStore.getState()
    st.resetDemo()
    st.switchPerson(DEFAULT_PERSON_BY_ROLE.staff)
    setCtx({})
    setIndex(0)
    setActive(true)
    navigate(TOUR_STEPS[0].route({}))
  }, [navigate])

  const start = useCallback(() => {
    if (changedFromSeed(useDemoStore.getState().data)) setConfirmOpen(true)
    else begin()
  }, [begin])

  const stop = useCallback(() => {
    setActive(false)
    setTourDone(true)
  }, [setTourDone])

  const backOnTrack = useCallback(() => {
    const st = useDemoStore.getState()
    const step = TOUR_STEPS[index]
    const out = step.recover({ data: st.data, currentPersonId: st.currentPersonId }, ctx, new Date())
    if (out.data !== st.data) st.setData(out.data)
    if (out.personId) st.switchPerson(out.personId)
    setCtx(out.ctx)
    navigate(step.route(out.ctx))
  }, [index, ctx, navigate])

  // Advance automatically when the current step's condition becomes true.
  useEffect(() => {
    if (!active) return
    const check = () => {
      const st = useDemoStore.getState()
      const snap = { data: st.data, currentPersonId: st.currentPersonId }
      const step = TOUR_STEPS[index]
      if (!step.done(snap, ctx)) return
      const nextCtx = step.capture ? { ...ctx, ...step.capture(snap, ctx) } : ctx
      const nextIndex = index + 1
      setCtx(nextCtx)
      setIndex(nextIndex)
      const nextRoute = TOUR_STEPS[nextIndex]?.route(nextCtx)
      if (nextRoute && window.location.pathname + window.location.search !== nextRoute) navigate(nextRoute)
    }
    check()
    return useDemoStore.subscribe(check)
  }, [active, index, ctx, navigate])

  // A shareable link (/?tour=start) launches the tour straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tour') === 'start') {
      offered.current = true
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // External "start tour" buttons.
  useEffect(() => {
    window.addEventListener(START_TOUR_EVENT, start)
    return () => window.removeEventListener(START_TOUR_EVENT, start)
  }, [start])

  // Offer the tour once per session on a first visit.
  useEffect(() => {
    if (tourDone || offered.current) return
    offered.current = true
    const t = setTimeout(() => {
      toast('New here? Take the 60-second tour', {
        description: 'Request, approve and assign a laptop across three roles.',
        duration: 12000,
        action: { label: 'Start tour', onClick: start },
        onDismiss: () => setTourDone(true),
      })
    }, 900)
    return () => clearTimeout(t)
  }, [tourDone, start, setTourDone])

  return (
    <TourContext.Provider value={{ active, index, ctx, start, stop, backOnTrack }}>
      {children}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start the tour from fresh demo data?</AlertDialogTitle>
            <AlertDialogDescription>The tour resets the demo so a laptop is in stock and every step works. Your changes will be replaced.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={begin}>Reset and start</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TourContext.Provider>
  )
}
