import { ArrowRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { RequestList } from '@/components/workflows/RequestList'
import { STEP_WHO, WORKFLOW_ICON, WORKFLOW_ORDER } from '@/components/workflows/meta'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pendingForPerson, WORKFLOWS } from '@/domain/workflows'
import { useCurrentPerson, useDemoStore } from '@/store/useDemoStore'

export default function WorkflowsPage() {
  const me = useCurrentPerson()
  const data = useDemoStore((s) => s.data)
  const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt)
  const awaiting = pendingForPerson(data, me.id).sort(byNewest)
  const mine = data.requests.filter((r) => r.requesterId === me.id).sort(byNewest)
  const all = [...data.requests].sort(byNewest)
  const seesAll = me.role === 'it' || me.role === 'hr'

  return (
    <div>
      <PageHeader
        eyebrow="Workflows"
        title="Requests and approvals"
        description="Each form routes to the right approver, creates a linked Service Desk ticket, and updates the inventory or accounts when it completes."
      />

      <section aria-labelledby="start" className="mb-10">
        <h2 id="start" className="mb-3 text-lg font-semibold">
          Start a request
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_ORDER.map((type) => {
            const def = WORKFLOWS[type]
            const Icon = WORKFLOW_ICON[type]
            const allowed = def.startRoles.includes(me.role)
            const body = (
              <>
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{def.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{def.description}</p>
                <p className="mt-4 flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">
                  {['You', ...def.steps.map((s) => STEP_WHO[s])].map((w, i, arr) => (
                    <span key={`${w}-${i}`} className="flex items-center gap-1">
                      <span className="rounded-full bg-muted px-2 py-0.5">{w}</span>
                      {i < arr.length - 1 && <ArrowRight className="size-3" aria-hidden />}
                    </span>
                  ))}
                </p>
              </>
            )
            return allowed ? (
              <Link
                key={type}
                to={`/workflows/new/${type}`}
                data-tour={`workflow-${type}`}
                className="group flex flex-col rounded-[10px] border bg-card p-5 shadow-soft transition-[box-shadow,transform] duration-200 hover:shadow-lift motion-safe:hover:-translate-y-0.5"
              >
                {body}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong">
                  Start <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ) : (
              <div key={type} className="flex flex-col rounded-[10px] border border-dashed bg-card/60 p-5">
                {body}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Lock className="size-4" aria-hidden /> Started by HR. Switch to the HR role to try it.
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <Tabs defaultValue={awaiting.length > 0 || me.role !== 'staff' ? 'awaiting' : 'mine'}>
        <TabsList className="mb-4">
          <TabsTrigger value="awaiting">Awaiting my action ({awaiting.length})</TabsTrigger>
          <TabsTrigger value="mine">My requests ({mine.length})</TabsTrigger>
          {seesAll && <TabsTrigger value="all">All ({all.length})</TabsTrigger>}
        </TabsList>
        <TabsContent value="awaiting">
          <RequestList requests={awaiting} data={data} empty="Nothing needs your approval right now." />
        </TabsContent>
        <TabsContent value="mine">
          <RequestList requests={mine} data={data} empty="You haven't submitted any requests yet. Start one above." />
        </TabsContent>
        {seesAll && (
          <TabsContent value="all">
            <RequestList requests={all} data={data} empty="No requests yet." />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
