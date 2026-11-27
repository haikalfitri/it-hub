import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Field, NativeSelect } from '@/components/common/Field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TICKET_CATEGORIES } from '@/domain/tickets'
import type { Priority } from '@/domain/types'
import { useDemoStore } from '@/store/useDemoStore'

export function NewTicketDialog({ open, onOpenChange, initialCategory }: { open: boolean; onOpenChange: (o: boolean) => void; initialCategory?: string }) {
  const createTicket = useDemoStore((s) => s.createTicket)
  const navigate = useNavigate()
  const validCategory = TICKET_CATEGORIES.includes(initialCategory as (typeof TICKET_CATEGORIES)[number]) ? initialCategory! : 'Hardware'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(validCategory)
  const [priority, setPriority] = useState<Priority>('Medium')
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (open) {
      setCategory(validCategory)
      setError(undefined)
    }
  }, [open, validCategory])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = createTicket({ title, description, category, priority })
    if (!r.ok) {
      setError(r.error)
      return
    }
    setTitle('')
    setDescription('')
    onOpenChange(false)
    toast.success(`Ticket ${r.id} raised`, { description: 'IT has been notified.' })
    navigate(`/tickets/${r.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a ticket</DialogTitle>
          <DialogDescription>Tell IT what's wrong. You'll get a notification on every update.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Title" error={error === 'Title is required' ? error : undefined}>
            {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Laptop won't connect to Wi-Fi" className="h-10" />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              {(p) => (
                <NativeSelect {...p} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </NativeSelect>
              )}
            </Field>
            <Field label="Priority">
              {(p) => (
                <NativeSelect {...p} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </NativeSelect>
              )}
            </Field>
          </div>
          <Field label="Description" help="What happened, when it started, and anything you already tried.">
            {(p) => <Textarea {...p} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />}
          </Field>
          {error && error !== 'Title is required' && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              Submit ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
