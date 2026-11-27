import { FAQS } from '@/content/faqs'
import { GUIDES } from '@/content/guides'

export interface HelpHit {
  type: 'guide' | 'faq'
  title: string
  slug?: string
  snippet: string
}

function snippetAround(text: string, q: string, radius = 60): string {
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return text.length > radius * 2 ? `${text.slice(0, radius * 2).trim()}…` : text
  const start = Math.max(0, i - radius)
  const end = Math.min(text.length, i + q.length + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

/** Case-insensitive search across guides and FAQs. Title matches rank first. */
export function searchHelp(query: string): HelpHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: { score: number; hit: HelpHit }[] = []

  for (const g of GUIDES) {
    const body = [g.summary, ...g.steps.map((s) => `${s.title}. ${s.body}`)].join(' ')
    const inTitle = g.title.toLowerCase().includes(q)
    const inBody = body.toLowerCase().includes(q)
    if (!inTitle && !inBody) continue
    scored.push({
      score: (inTitle ? 10 : 0) + (inBody ? 2 : 0),
      hit: { type: 'guide', title: g.title, slug: g.slug, snippet: inTitle ? g.summary : snippetAround(body, q) },
    })
  }
  for (const f of FAQS) {
    const inQ = f.q.toLowerCase().includes(q)
    const inA = f.a.toLowerCase().includes(q)
    if (!inQ && !inA) continue
    scored.push({ score: (inQ ? 6 : 0) + (inA ? 1 : 0), hit: { type: 'faq', title: f.q, snippet: inA ? snippetAround(f.a, q) : f.a } })
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.hit)
}
