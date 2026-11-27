import { RotateCcw } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/store/useDemoStore'

export function ResetButton({ compact = false }: { compact?: boolean }) {
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const navigate = useNavigate()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon-lg" aria-label="Reset demo">
            <RotateCcw className="size-5" />
          </Button>
        ) : (
          <Button variant="outline" size="lg">
            <RotateCcw /> Reset demo
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset the demo data?</AlertDialogTitle>
          <AlertDialogDescription>
            Every ticket, request and asset change you made will be replaced with the original demo data. You'll be switched back to the Staff role.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my changes</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetDemo()
              navigate('/')
              toast.success('Demo data reset')
            }}
          >
            Reset demo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
