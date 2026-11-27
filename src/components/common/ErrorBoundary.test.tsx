import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEY } from '@/config'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('boom')
}

it('shows a recovery screen that clears saved demo data', async () => {
  const user = userEvent.setup()
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const reload = vi.fn()
  localStorage.setItem(STORAGE_KEY, 'bad')
  render(
    <ErrorBoundary onReload={reload}>
      <Boom />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /reset demo and reload/i }))
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  expect(reload).toHaveBeenCalled()
  spy.mockRestore()
})
