import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="py-10">
      <EmptyState icon={Compass} title="Page not found" level={1}>
        That page doesn't exist in this demo.{' '}
        <Link to="/" className="font-medium text-brand-strong underline underline-offset-4">
          Go to Home
        </Link>
      </EmptyState>
    </div>
  )
}
