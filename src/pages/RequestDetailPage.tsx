import { ArrowLeft, ArrowRightLeft, Ban, Boxes, Check, FileQuestion, KeyRound, LifeBuoy, PackageX, ShieldCheck, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { Stepper } from '@/components/common/Stepper'
import { StatusBadge } from '@/components/common/StatusBadge'
import { FIELD_LABELS, WORKFLOW_ICON } from '@/components/workflows/meta'
import { ROLE_LABEL } from '@/components/layout/nav'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { availableAssets } from '@/domain/assets'
import type { Result } from '@/domain/result'
import type { AssetType, DemoState, WorkflowRequest } from '@/domain/types'
import type { OnboardingChecklist } from '@/domain/workflows'
import { approverFor, WORKFLOWS } from '@/domain/workflows'
import { usePeopleMap } from '@/hooks/usePeopleMap'
import { formatDate, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

function report(r: Result, success: string) {
  if (r.ok) toast.success(success)
  else toast.error(r.error)
  return r.ok
}

function AssetPicker({ type, value, onChange, label }: { type: AssetType; value: string; onChange: (id: string) => void; label: string }) {
  const data = useDemoStore((s) => s.data)
  const options = availableAssets(data, type)
  if (options.length === 0) return <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">No {type.toLowerCase()} is in stock right now.</p>
  return (
    <div role="radiogroup" aria-label={label} data-tour="asset-picker" className="grid gap-2 sm:grid-cols-2">
      {options.map((a) => (
        <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-brand-soft">
          <input type="radio" name={`asset-${type}`} value={a.id} checked={value === a.id} onChange={() => onChange(a.id)} className="size-4 accent-[var(--primary)]" />
          <span>
            <span className="block font-mono text-xs font-medium">{a.tag}</span>
            <span className="text-muted-foreground">
              {a.model} · {a.site}
            </span>
          </span>
        </label>
      ))}
    </div>
  )
}

function ActionPanel({ r, data }: { r: WorkflowRequest; data: DemoState }) {
  const step = r.steps[r.currentStep]
  const decide = useDemoStore((s) => s.decide)
  const fulfil = useDemoStore((s) => s.fulfil)
  const awaitStock = useDemoStore((s) => s.markAwaitingStock)
  const [comment, setComment] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string>()
  const [assetId, setAssetId] = useState('')
  const [serial, setSerial] = useState('')
  const [serialError, setSerialError] = useState<string>()
  const [checklist, setChecklist] = useState<OnboardingChecklist>({ account: false, imaged: false, mfa: false, welcome: false })

  if (step.kind === 'manager' || step.kind === 'system-owner') {
    return (
      <>
        <label htmlFor="approve-comment" className="text-sm font-medium">
          Comment (optional)
        </label>
        <Textarea id="approve-comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1.5" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="lg" data-tour="approve-button" onClick={() => report(decide(r.id, 'approve', comment), step.kind === 'system-owner' ? 'Access granted' : 'Approved')}>
            <Check /> Approve
          </Button>
          <Button size="lg" variant="outline" onClick={() => setRejectOpen(true)}>
            <X /> Reject
          </Button>
        </div>
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject {r.id}?</DialogTitle>
              <DialogDescription>The requester sees your reason, and the linked ticket closes.</DialogDescription>
            </DialogHeader>
            <label htmlFor="reject-reason" className="text-sm font-medium">
              Reason for rejecting
            </label>
            <Textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              aria-invalid={!!rejectError}
              aria-describedby={rejectError ? 'reject-err' : undefined}
            />
            {rejectError && (
              <p id="reject-err" className="text-sm font-medium text-destructive">
                {rejectError}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const res = decide(r.id, 'reject', rejectReason)
                  if (!res.ok) return setRejectError(res.error)
                  setRejectOpen(false)
                  toast.success('Request rejected')
                }}
              >
                Reject request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (step.kind === 'it-verify') {
    const asset = data.assets.find((a) => a.id === r.data.assetId)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const res = fulfil(r.id, { serial })
          if (!res.ok) return setSerialError(res.error)
          toast.success(`${asset?.tag} returned to ${r.data.condition === 'damaged' ? 'repair' : 'stock'}`)
        }}
      >
        <p className="text-sm text-muted-foreground">
          Check the serial number printed on the device against the inventory record for <span className="font-mono font-medium text-foreground">{asset?.tag}</span>.
        </p>
        <label htmlFor="serial" className="mt-3 block text-sm font-medium">
          Serial number on device
        </label>
        <Input
          id="serial"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="mt-1.5 h-10 font-mono"
          aria-invalid={!!serialError}
          aria-describedby="serial-help"
          autoComplete="off"
        />
        <p id="serial-help" className={cn('mt-1.5 text-sm', serialError ? 'font-medium text-destructive' : 'text-muted-foreground')}>
          {serialError ?? (
            <>
              Demo tip: the label on this device reads <span className="font-mono">{asset?.serial}</span>.
            </>
          )}
        </p>
        <Button type="submit" size="lg" className="mt-4" data-tour="fulfil-button">
          <ShieldCheck /> Verify and return to stock
        </Button>
      </form>
    )
  }

  // it-fulfil: equipment or onboarding
  const isOnboarding = r.type === 'onboarding'
  const type = (isOnboarding ? 'Laptop' : r.data.itemType) as AssetType
  const needsAsset = !isOnboarding || r.data.laptopNeeded === true
  const noStock = needsAsset && availableAssets(data, type).length === 0
  return (
    <div className="flex flex-col gap-4">
      {isOnboarding && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Onboarding checklist</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ['account', 'Account created'],
                ['imaged', 'Laptop imaged'],
                ['mfa', 'MFA set up'],
                ['welcome', 'Welcome guide sent'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-brand-soft">
                <input type="checkbox" checked={checklist[k]} onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))} className="size-4 accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {needsAsset && (
        <div>
          <p className="mb-2 text-sm font-medium">{type} to assign</p>
          <AssetPicker type={type} value={assetId} onChange={setAssetId} label={`${type} to assign`} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          data-tour="fulfil-button"
          disabled={noStock}
          onClick={() => report(fulfil(r.id, { assetId: assetId || undefined, ...(isOnboarding ? { checklist } : {}) }), isOnboarding ? 'New hire is ready' : 'Assigned and completed')}
        >
          <Check /> {isOnboarding ? 'Complete onboarding' : 'Assign and complete'}
        </Button>
        {r.status === 'Pending' && (
          <Button size="lg" variant="outline" onClick={() => report(awaitStock(r.id), 'Marked as awaiting stock')}>
            <PackageX /> Mark awaiting stock
          </Button>
        )}
      </div>
    </div>
  )
}

function Outcome({ r, data }: { r: WorkflowRequest; data: DemoState }) {
  const people = usePeopleMap()
  if (r.status !== 'Completed') return null
  const items: { icon: typeof Boxes; text: React.ReactNode; to?: string }[] = []
  const assetEvents = data.assets.flatMap((a) => a.history.filter((h) => h.note?.includes(r.id)).map(() => a))
  if (r.type === 'access') items.push({ icon: KeyRound, text: `${r.data.system} added to ${people.get(r.requesterId)?.name}'s access`, to: `/me` })
  if (r.type === 'onboarding' && typeof r.data.personId === 'string')
    items.push({ icon: UserPlus, text: `${people.get(r.data.personId)?.name ?? r.subjectName} added to the people directory`, to: `/people/${r.data.personId}` })
  if (r.type === 'surrender') {
    const a = data.assets.find((x) => x.id === r.data.assetId)
    if (a) items.push({ icon: Boxes, text: `${a.tag} is now ${a.status.toLowerCase()}`, to: `/assets/${a.id}` })
  }
  for (const a of assetEvents) items.push({ icon: Boxes, text: `${a.tag} (${a.model}) assigned to ${people.get(a.ownerId ?? '')?.name}`, to: `/assets/${a.id}` })
  items.push({ icon: LifeBuoy, text: `Ticket ${r.ticketId} resolved automatically`, to: `/tickets/${r.ticketId}` })
  return (
    <section aria-labelledby="changed" data-tour="what-changed" className="rounded-[10px] border border-success/40 bg-success-soft/60 p-5">
      <h2 id="changed" className="font-semibold text-success-strong">
        What changed
      </h2>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i}>
            <Link to={it.to ?? '#'} className="flex items-center gap-2 hover:underline">
              <it.icon className="size-4 text-success-strong" aria-hidden /> {it.text}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function RequestDetailPage() {
  const { id = '' } = useParams()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const switchPerson = useDemoStore((s) => s.switchPerson)
  const cancelRequest = useDemoStore((s) => s.cancelRequest)
  const people = usePeopleMap()
  const r = data.requests.find((x) => x.id === id)

  if (!r) {
    return (
      <EmptyState icon={FileQuestion} title="Request not found" level={1}>
        <Link to="/workflows" className="font-medium text-brand-strong underline underline-offset-4">
          Back to workflows
        </Link>
      </EmptyState>
    )
  }

  const def = WORKFLOWS[r.type]
  const Icon = WORKFLOW_ICON[r.type]
  const waitingOn = approverFor(data, r)
  const waitingPerson = waitingOn ? people.get(waitingOn) : undefined
  const isMyTurn = waitingOn === me.id
  const open = r.status === 'Pending' || r.status === 'Awaiting stock'
  const ticket = data.tickets.find((t) => t.id === r.ticketId)

  const fields = Object.entries(r.data).filter(([k]) => k !== 'personId' && FIELD_LABELS[k])
  const display = (k: string, v: unknown) => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (Array.isArray(v)) return v.join(', ') || '—'
    if (k === 'assetId') {
      const a = data.assets.find((x) => x.id === v)
      return a ? `${a.tag} · ${a.model}` : String(v)
    }
    if ((k === 'startDate' || k === 'neededBy') && v) return formatDate(String(v))
    if (k === 'condition') return v === 'damaged' ? 'Damaged or faulty' : 'Good working order'
    return String(v || '—')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <div>
          <Link to="/workflows" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Workflows
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{r.id}</span>
            <StatusBadge status={r.status} />
          </div>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              {def.title}: {r.subjectName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Requested by {people.get(r.requesterId)?.name} · {formatDateTime(r.createdAt)}
          </p>
        </div>

        {open && waitingPerson && !isMyTurn && (
          <div className="flex flex-col gap-3 rounded-[10px] border border-brand/40 bg-brand-soft p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-semibold">Waiting on {waitingPerson.name}</p>
              <p className="text-sm text-muted-foreground">
                {waitingPerson.title}. Switch to their view to {r.steps[r.currentStep].kind.startsWith('it-') ? 'complete this step' : 'approve or reject'}.
              </p>
            </div>
            <Button size="lg" data-tour="switch-to-approver" onClick={() => switchPerson(waitingPerson.id)}>
              <ArrowRightLeft /> Switch to {waitingPerson.name}
            </Button>
          </div>
        )}

        {open && isMyTurn && (
          <section aria-labelledby="your-action" className="rounded-[10px] border-2 border-primary bg-card p-5 shadow-lift">
            <h2 id="your-action" className="mb-1 font-semibold">
              Your action: {r.steps[r.currentStep].label}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              You're viewing as {me.name} ({ROLE_LABEL[me.role]}).
            </p>
            <ActionPanel key={`${r.id}-${r.currentStep}-${r.status}`} r={r} data={data} />
          </section>
        )}

        <Outcome r={r} data={data} />

        <section aria-labelledby="progress" className="rounded-[10px] border bg-card p-5 shadow-soft">
          <h2 id="progress" className="mb-4 font-semibold">
            Progress
          </h2>
          <Stepper steps={r.steps} currentStep={r.currentStep} status={r.status} submitted={{ at: r.createdAt, byId: r.requesterId }} />
        </section>
      </div>

      <aside className="space-y-4 lg:pt-10">
        <dl className="grid gap-3 rounded-[10px] border bg-card p-5 text-sm shadow-soft">
          {fields.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="shrink-0 text-muted-foreground">{FIELD_LABELS[k]}</dt>
              <dd className="text-right font-medium">{display(k, v)}</dd>
            </div>
          ))}
        </dl>
        {ticket && (
          <Link to={`/tickets/${ticket.id}`} className="flex items-center gap-3 rounded-[10px] border bg-card p-4 text-sm shadow-soft hover:bg-muted/60">
            <LifeBuoy className="size-5 text-brand-strong" aria-hidden />
            <span className="flex-1">
              <span className="block text-xs text-muted-foreground">Linked ticket</span>
              <span className="font-mono font-medium">{ticket.id}</span>
            </span>
            <StatusBadge status={ticket.status} />
          </Link>
        )}
        {open && r.requesterId === me.id && (
          <Button variant="outline" className="w-full" onClick={() => report(cancelRequest(r.id), 'Request cancelled')}>
            <Ban /> Cancel request
          </Button>
        )}
      </aside>
    </div>
  )
}
