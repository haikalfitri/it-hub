export function nextId(prefix: string, existing: string[]): string {
  let max = 0
  for (const id of existing) {
    if (!id.startsWith(`${prefix}-`)) continue
    const n = Number(id.slice(prefix.length + 1))
    if (Number.isFinite(n) && n > max) max = n
  }
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}
