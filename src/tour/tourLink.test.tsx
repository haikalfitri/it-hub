import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { useDemoStore } from '@/store/useDemoStore'

afterEach(() => window.history.replaceState(null, '', '/'))

it('the ?tour=start link asks before replacing changed demo data', async () => {
  act(() => {
    useDemoStore.getState().resetDemo()
    useDemoStore.getState().createTicket({ title: 'My own change', description: '', category: 'Other', priority: 'Low' })
  })
  window.history.replaceState(null, '', '/?tour=start')
  render(
    <MemoryRouter initialEntries={['/?tour=start']}>
      <App />
    </MemoryRouter>,
  )
  expect(await screen.findByRole('alertdialog', { name: /start the tour from fresh demo data/i })).toBeInTheDocument()
  expect(useDemoStore.getState().data.tickets.some((t) => t.title === 'My own change')).toBe(true)
})
