import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

it('opens the new-ticket dialog with the category from the URL', async () => {
  renderAt('/tickets?new=1&category=Network%20%26%20VPN')
  const dialog = await screen.findByRole('dialog', { name: /raise a ticket/i })
  expect(dialog).toBeInTheDocument()
  expect(screen.getByLabelText('Category')).toHaveValue('Network & VPN')
})

it('requires a title and creates nothing without one', async () => {
  const user = userEvent.setup()
  renderAt('/tickets?new=1')
  const before = useDemoStore.getState().data.tickets.length
  await user.click(await screen.findByRole('button', { name: /submit ticket/i }))
  expect(screen.getByText('Title is required')).toBeInTheDocument()
  expect(useDemoStore.getState().data.tickets).toHaveLength(before)
})

it('submits a valid ticket and opens it', async () => {
  const user = userEvent.setup()
  renderAt('/tickets?new=1')
  await user.type(await screen.findByLabelText('Title'), 'Keyboard missing keys')
  await user.type(screen.getByLabelText('Description'), 'The E key fell off')
  await user.click(screen.getByRole('button', { name: /submit ticket/i }))
  expect(await screen.findByRole('heading', { name: 'Keyboard missing keys' })).toBeInTheDocument()
  expect(useDemoStore.getState().data.tickets.at(-1)?.title).toBe('Keyboard missing keys')
})

it('shows staff only their own tickets but IT sees all', () => {
  renderAt('/tickets')
  const mine = useDemoStore.getState().data.tickets.filter((t) => t.requesterId === 'p-aisyah').length
  expect(screen.queryAllByTestId('ticket-row')).toHaveLength(mine)
  act(() => useDemoStore.getState().switchRole('it'))
  expect(screen.getAllByTestId('ticket-row')).toHaveLength(useDemoStore.getState().data.tickets.length)
})
