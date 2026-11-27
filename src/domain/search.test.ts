import { GUIDES } from '@/content/guides'
import { FAQS } from '@/content/faqs'
import { searchHelp } from './search'

it('ships 12 guides with unique slugs and valid related links', () => {
  expect(GUIDES).toHaveLength(12)
  const slugs = new Set(GUIDES.map((g) => g.slug))
  expect(slugs.size).toBe(12)
  for (const g of GUIDES) for (const r of g.related) expect(slugs.has(r)).toBe(true)
})

it('ships 10 FAQs', () => {
  expect(FAQS).toHaveLength(10)
})

it('ranks the VPN guide first for "vpn"', () => {
  const r = searchHelp('vpn')
  expect(r[0]).toMatchObject({ type: 'guide', slug: 'vpn-from-home' })
})

it('ignores case and surrounding spaces', () => {
  expect(searchHelp('VPN ')).toEqual(searchHelp('vpn'))
})

it('returns nothing for an empty query', () => {
  expect(searchHelp('')).toEqual([])
  expect(searchHelp('   ')).toEqual([])
})

it('finds FAQs by answer text', () => {
  const r = searchHelp('90 days')
  expect(r.some((x) => x.type === 'faq')).toBe(true)
})

it('returns a snippet around the match', () => {
  const r = searchHelp('authenticator')
  expect(r.length).toBeGreaterThan(0)
  expect(r[0].snippet.toLowerCase()).toContain('authenticator')
})
