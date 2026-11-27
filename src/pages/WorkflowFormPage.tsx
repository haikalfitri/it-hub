import { ArrowLeft, Check, Info, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { Field, NativeSelect } from '@/components/common/Field'
import { PageHeader } from '@/components/common/PageHeader'
import { ERROR_FIELD, STEP_WHO, WORKFLOW_ICON } from '@/components/workflows/meta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { daysFrom } from '@/domain/seed'
import type { Department, RequestData, SystemName, WorkflowType } from '@/domain/types'
import { ALL_SYSTEMS } from '@/domain/workflowDefs'
import { departmentHead, WORKFLOWS } from '@/domain/workflows'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'
import { TOUR_REASON } from '@/tour/steps'

const DEPARTMENTS: Department[] = ['Finance', 'Engineering', 'Operations', 'HR', 'IT']
const ITEM_TYPES = ['Laptop', 'Monitor', 'Phone', 'Tablet', 'Peripheral', 'Desktop']

function CheckRow({ label, checked, onChange, describedBy, invalid }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; describedBy?: string; invalid?: boolean }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-brand-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  )
}

export default function WorkflowFormPage() {
  const { type = '' } = useParams()
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const submitRequest = useDemoStore((s) => s.submitRequest)
  const switchRole = useDemoStore((s) => s.switchRole)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState<RequestData>(() => ({
    itemType: 'Laptop',
    reason: params.get('tour') === '1' ? TOUR_REASON : '',
    neededBy: daysFrom(new Date(), 7),
    system: 'ERP',
    level: 'Read',
    justification: '',
    fullName: '',
    department: 'Finance',
    title: '',
    startDate: daysFrom(new Date(), 14),
    laptopNeeded: true,
    systems: ['Email', 'File share', 'VPN'],
    assetId: '',
    condition: 'good',
    accessoriesReturned: true,
    undertaking: false,
  }))
  const [errors, setErrors] = useState<{ field?: string; message: string }>()

  if (!(type in WORKFLOWS)) return <Navigate to="/workflows" replace />
  const wf = type as WorkflowType
  const def = WORKFLOWS[wf]
  const Icon = WORKFLOW_ICON[wf]

  if (!def.startRoles.includes(me.role)) {
    return (
      <EmptyState icon={Icon} title={`Only HR can start ${def.title.toLowerCase()}`} level={1}>
        <p>Switch to the HR role to try this workflow.</p>
        <Button className="mt-3" onClick={() => switchRole('hr')}>
          Switch to HR
        </Button>
      </EmptyState>
    )
  }

  const set = (k: string, v: RequestData[string]) => setForm((f) => ({ ...f, [k]: v }))
  const err = (field: string) => (errors?.field === field ? errors.message : undefined)
  const myAssets = data.assets.filter((a) => a.ownerId === me.id && a.status === 'Assigned')
  const assetId = (form.assetId as string) || myAssets[0]?.id || ''
  const manager = data.people.find((p) => p.id === me.managerId)
  const approver = wf === 'onboarding' ? departmentHead(data, form.department as string) : manager

  const payload = (): RequestData => {
    switch (wf) {
      case 'equipment':
        return { itemType: form.itemType, reason: form.reason, neededBy: form.neededBy }
      case 'access':
        return { system: form.system, level: form.level, justification: form.justification }
      case 'surrender':
        return { assetId, reason: form.reason || 'Resignation', condition: form.condition, accessoriesReturned: form.accessoriesReturned, undertaking: form.undertaking }
      case 'onboarding':
        return { fullName: form.fullName, department: form.department, title: form.title, startDate: form.startDate, laptopNeeded: form.laptopNeeded, systems: form.systems }
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = submitRequest(wf, payload())
    if (!r.ok) {
      setErrors({ field: ERROR_FIELD[r.error], message: r.error })
      return
    }
    toast.success(`${def.title} submitted`, { description: `${r.id} and its Service Desk ticket were created.` })
    navigate(`/workflows/${r.id}`)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <Link to="/workflows" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Workflows
        </Link>
        <PageHeader eyebrow="New request" title={def.title} description={def.description} />

        <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-[10px] border bg-card p-5 shadow-soft sm:p-6">
          {errors && !errors.field && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-destructive">
              {errors.message}
            </p>
          )}

          {wf === 'equipment' && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Item type" error={err('itemType')}>
                  {(p) => (
                    <NativeSelect {...p} value={form.itemType as string} onChange={(e) => set('itemType', e.target.value)}>
                      {ITEM_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <Field label="Needed by">{(p) => <Input {...p} type="date" className="h-10" value={form.neededBy as string} onChange={(e) => set('neededBy', e.target.value)} />}</Field>
              </div>
              <Field label="Reason" error={err('reason')} help="What it's for, and what you use today.">
                {(p) => <Textarea {...p} rows={3} value={form.reason as string} onChange={(e) => set('reason', e.target.value)} />}
              </Field>
            </>
          )}

          {wf === 'access' && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="System" error={err('system')}>
                  {(p) => (
                    <NativeSelect {...p} value={form.system as string} onChange={(e) => set('system', e.target.value)}>
                      {ALL_SYSTEMS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <Field label="Access level">
                  {(p) => (
                    <NativeSelect {...p} value={form.level as string} onChange={(e) => set('level', e.target.value)}>
                      <option>Read</option>
                      <option>Edit</option>
                      <option>Admin</option>
                    </NativeSelect>
                  )}
                </Field>
              </div>
              <Field label="Justification" error={err('justification')} help="Why you need it and for how long.">
                {(p) => <Textarea {...p} rows={3} value={form.justification as string} onChange={(e) => set('justification', e.target.value)} />}
              </Field>
            </>
          )}

          {wf === 'surrender' &&
            (myAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no assigned devices to surrender.</p>
            ) : (
              <>
                <Field label="Device" error={err('assetId')}>
                  {(p) => (
                    <NativeSelect {...p} value={assetId} onChange={(e) => set('assetId', e.target.value)}>
                      {myAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.tag} · {a.model}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Reason">
                    {(p) => (
                      <NativeSelect {...p} value={(form.reason as string) || 'Resignation'} onChange={(e) => set('reason', e.target.value)}>
                        <option>Resignation</option>
                        <option>Replacement</option>
                        <option>Repair</option>
                      </NativeSelect>
                    )}
                  </Field>
                  <Field label="Condition">
                    {(p) => (
                      <NativeSelect {...p} value={form.condition as string} onChange={(e) => set('condition', e.target.value)}>
                        <option value="good">Good working order</option>
                        <option value="damaged">Damaged or faulty</option>
                      </NativeSelect>
                    )}
                  </Field>
                </div>
                <CheckRow label="Charger, bag and accessories are returned with the device" checked={form.accessoriesReturned as boolean} onChange={(v) => set('accessoriesReturned', v)} />
                <div className="flex flex-col gap-1.5">
                  <CheckRow
                    label={
                      <>
                        <strong>Undertaking.</strong> I confirm I have removed personal files, the device is the one issued to me, and I accept responsibility for any missing items listed above.
                      </>
                    }
                    checked={form.undertaking as boolean}
                    onChange={(v) => set('undertaking', v)}
                    invalid={!!err('undertaking')}
                    describedBy={err('undertaking') ? 'undertaking-err' : undefined}
                  />
                  {err('undertaking') && (
                    <p id="undertaking-err" className="text-sm font-medium text-destructive">
                      {err('undertaking')}
                    </p>
                  )}
                </div>
              </>
            ))}

          {wf === 'onboarding' && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={err('fullName')}>
                  {(p) => <Input {...p} className="h-10" value={form.fullName as string} onChange={(e) => set('fullName', e.target.value)} />}
                </Field>
                <Field label="Job title" error={err('title')}>
                  {(p) => <Input {...p} className="h-10" value={form.title as string} onChange={(e) => set('title', e.target.value)} />}
                </Field>
                <Field label="Department" error={err('department')} help={approver ? `Approver: ${approver.name}` : undefined}>
                  {(p) => (
                    <NativeSelect {...p} value={form.department as string} onChange={(e) => set('department', e.target.value)}>
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <Field label="Start date" error={err('startDate')}>
                  {(p) => <Input {...p} type="date" className="h-10" value={form.startDate as string} onChange={(e) => set('startDate', e.target.value)} />}
                </Field>
              </div>
              <CheckRow label="Needs a laptop" checked={form.laptopNeeded as boolean} onChange={(v) => set('laptopNeeded', v)} />
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Systems to set up</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ALL_SYSTEMS.map((s) => {
                    const list = form.systems as SystemName[]
                    return (
                      <CheckRow key={s} label={s} checked={list.includes(s)} onChange={(v) => set('systems', v ? [...list, s] : list.filter((x) => x !== s))} />
                    )
                  })}
                </div>
              </fieldset>
            </>
          )}

          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" size="lg">
              <Link to="/workflows">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" data-tour="submit-request" disabled={wf === 'surrender' && myAssets.length === 0}>
              <Send /> Submit request
            </Button>
          </div>
        </form>
      </div>

      <aside className="h-fit rounded-[10px] border bg-card p-5 shadow-soft lg:mt-24">
        <h2 className="flex items-center gap-2 font-semibold">
          <Info className="size-4 text-brand-strong" aria-hidden /> What happens next
        </h2>
        <ol className="mt-3 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">1</span>
            <span>A Service Desk ticket is created and linked to your request.</span>
          </li>
          {def.steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">{i + 2}</span>
              <span>
                <strong>{STEP_WHO[s]}</strong>
                {s === 'manager' && (approver ? ` (${approver.name}) approves.` : ': you have no line manager, so this step is skipped.')}
                {s === 'it-fulfil' && (wf === 'onboarding' ? ' prepares the laptop, account and MFA.' : ' assigns an item from stock.')}
                {s === 'it-verify' && ' checks the serial number and returns the device to stock.'}
                {s === 'system-owner' && ' grants the access.'}
              </span>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-xs font-semibold text-success-strong">
              <Check className="size-3.5" aria-hidden />
            </span>
            <span>You're notified, and the ticket resolves by itself.</span>
          </li>
        </ol>
      </aside>
    </div>
  )
}
