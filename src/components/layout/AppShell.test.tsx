import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { useDemoStore } from '@/store/useDemoStore'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  act(() => useDemoStore.getState().resetDemo())
})

it('shows role-appropriate navigation', () => {
  renderAt('/')
  const nav = screen.getByRole('navigation', { name: 'Main' })
  expect(within(nav).getByRole('link', { name: /help center/i })).toBeInTheDocument()
  expect(within(nav).queryByRole('link', { name: /people/i })).not.toBeInTheDocument()
  act(() => useDemoStore.getState().switchRole('it'))
  expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: /people/i })).toBeInTheDocument()
})

it('shows who you are viewing as', () => {
  renderAt('/')
  expect(screen.getByRole('button', { name: /viewing as staff/i })).toBeInTheDocument()
})

it('shows a not-found page for unknown routes', () => {
  renderAt('/nope')
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
})
