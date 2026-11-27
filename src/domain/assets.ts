import { fail, ok, type Result } from './result'
import type { Asset, AssetType, DemoState } from './types'

export type WarrantyFlag = 'expired' | 'expiring' | 'ok'

const DAY = 86_400_000

export function daysToWarranty(asset: Asset, today: Date): number {
  const [y, m, d] = asset.warrantyEnd.split('-').map(Number)
  const end = Date.UTC(y, m - 1, d)
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((end - start) / DAY)
}

export function warrantyFlag(asset: Asset, today: Date): WarrantyFlag {
  const days = daysToWarranty(asset, today)
  if (days < 0) return 'expired'
  return days <= 90 ? 'expiring' : 'ok'
}

export const isUnowned = (asset: Asset): boolean => asset.status === 'Assigned' && asset.ownerId === null

export const personName = (state: DemoState, id: string | null): string =>
  state.people.find((p) => p.id === id)?.name ?? 'Unknown'

function updateAsset(state: DemoState, assetId: string, fn: (a: Asset) => Asset): DemoState {
  return { ...state, assets: state.assets.map((a) => (a.id === assetId ? fn(a) : a)) }
}

export function assignAsset(state: DemoState, assetId: string, ownerId: string, actorId: string, now: Date, note?: string): Result {
  const asset = state.assets.find((a) => a.id === assetId)
  if (!asset) return fail('Asset not found')
  if (asset.status !== 'In stock') return fail('Asset is not in stock')
  if (!state.people.some((p) => p.id === ownerId)) return fail('Person not found')
  const event = { at: now.toISOString(), actorId, event: `Assigned to ${personName(state, ownerId)}`, ...(note ? { note } : {}) }
  return ok(updateAsset(state, assetId, (a) => ({ ...a, status: 'Assigned', ownerId, history: [...a.history, event] })))
}

export function returnAsset(state: DemoState, assetId: string, actorId: string, condition: 'good' | 'damaged', now: Date, note?: string): Result {
  const asset = state.assets.find((a) => a.id === assetId)
  if (!asset) return fail('Asset not found')
  if (asset.status !== 'Assigned') return fail('Asset is not assigned')
  const event = {
    at: now.toISOString(),
    actorId,
    event: condition === 'good' ? 'Returned (good)' : 'Returned (damaged), sent to repair',
    ...(note ? { note } : {}),
  }
  return ok(
    updateAsset(state, assetId, (a) => ({
      ...a,
      status: condition === 'good' ? 'In stock' : 'In repair',
      ownerId: null,
      history: [...a.history, event],
    })),
  )
}

export const availableAssets = (state: DemoState, type: AssetType): Asset[] =>
  state.assets.filter((a) => a.type === type && a.status === 'In stock').sort((a, b) => a.tag.localeCompare(b.tag))
