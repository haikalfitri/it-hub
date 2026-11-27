import { StatusBadge } from '@/components/common/StatusBadge'
import { daysToWarranty, warrantyFlag } from '@/domain/assets'
import type { Asset } from '@/domain/types'
import { formatDate } from '@/lib/format'

export function WarrantyBadge({ asset, today = new Date() }: { asset: Asset; today?: Date }) {
  const flag = warrantyFlag(asset, today)
  const days = daysToWarranty(asset, today)
  if (flag === 'expired') return <StatusBadge status="expired" label={`Expired ${-days}d ago`} />
  if (flag === 'expiring') return <StatusBadge status="expiring" label={days === 0 ? 'Ends today' : `Ends in ${days}d`} />
  return <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(asset.warrantyEnd)}</span>
}
