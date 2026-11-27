import type { StateStorage } from 'zustand/middleware'

/** localStorage wrapper that never throws: falls back to an in-memory map (private windows, blocked storage). */
export function createSafeStorage(getStorage: () => Storage = () => window.localStorage): StateStorage {
  const memory = new Map<string, string>()
  const attempt = <T>(fn: (s: Storage) => T): T | undefined => {
    try {
      return fn(getStorage())
    } catch {
      return undefined
    }
  }
  return {
    getItem: (name) => {
      const v = attempt((s) => s.getItem(name))
      return v ?? memory.get(name) ?? null
    },
    setItem: (name, value) => {
      memory.set(name, value)
      attempt((s) => s.setItem(name, value))
    },
    removeItem: (name) => {
      memory.delete(name)
      attempt((s) => s.removeItem(name))
    },
  }
}

export const safeStorage = createSafeStorage()
