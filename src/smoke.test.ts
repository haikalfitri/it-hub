import { COMPANY_NAME, EMAIL_DOMAIN, STORAGE_KEY, SCHEMA_VERSION } from '@/config'

test('config holds the fictional company identity', () => {
  expect(COMPANY_NAME).toBe('Demo Company Sdn Bhd')
  expect(EMAIL_DOMAIN).toBe('demo.example')
  expect(STORAGE_KEY).toBe('it-hub:state')
  expect(SCHEMA_VERSION).toBe(1)
})
