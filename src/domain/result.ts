import type { DemoState } from './types'

export type Result = { ok: true; state: DemoState; id?: string } | { ok: false; error: string }

export const ok = (state: DemoState, id?: string): Result => (id ? { ok: true, state, id } : { ok: true, state })
export const fail = (error: string): Result => ({ ok: false, error })
