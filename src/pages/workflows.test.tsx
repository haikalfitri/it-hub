import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { useDemoStore } from '@/store/useDemoStore'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  act(() => useDemoStore.getState().resetDemo())
})

it('runs an equipment request end to end through the UI', async () => {
  const user = userEvent.setup()
  renderAt('/workflows/new/equipment')

  await user.selectOptions(screen.getByLabelText('Item type'), 'Laptop')
  await user.type(screen.getByLabelText('Reason'), 'My laptop is 5 years old')
  await user.click(screen.getByRole('button', { name: /submit request/i }))

  expect(await screen.findByText(/waiting on daniel tan/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /switch to daniel tan/i }))
  await user.click(await screen.findByRole('button', { name: /^approve$/i }))

  expect(await screen.findByText(/waiting on hafiz ismail/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /switch to hafiz ismail/i }))
  const picker = await screen.findByRole('radiogroup', { name: /laptop to assign/i })
  await user.click(within(picker).getAllByRole('radio')[0])
  await user.click(screen.getByRole('button', { name: /assign and complete/i }))

  const req = useDemoStore.getState().data.requests.at(-1)!
  expect(req.status).toBe('Completed')
  expect(await screen.findAllByText('Completed')).not.toHaveLength(0)
  const assigned = useDemoStore.getState().data.assets.filter((a) => a.ownerId === 'p-aisyah' && a.type === 'Laptop')
  expect(assigned).toHaveLength(2)
})

it('shows a validation error next to the field', async () => {
  const user = userEvent.setup()
  renderAt('/workflows/new/equipment')
  await user.click(screen.getByRole('button', { name: /submit request/i }))
  expect(screen.getByText('Reason is required')).toBeInTheDocument()
  expect(screen.getByLabelText('Reason')).toHaveAttribute('aria-invalid', 'true')
})

it('rejecting needs a reason', async () => {
  const user = userEvent.setup()
  act(() => useDemoStore.getState().switchRole('manager'))
  const pending = useDemoStore.getState().data.requests.find((r) => r.status === 'Pending' && r.steps[r.currentStep].actorId === 'p-daniel')!
  renderAt(`/workflows/${pending.id}`)
  await user.click(screen.getByRole('button', { name: /^reject$/i }))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByRole('button', { name: /reject request/i }))
  expect(within(dialog).getByText('Please add a reason for rejecting')).toBeInTheDocument()
  await user.type(within(dialog).getByLabelText(/reason/i), 'Budget frozen')
  await user.click(within(dialog).getByRole('button', { name: /reject request/i }))
  expect(useDemoStore.getState().data.requests.find((r) => r.id === pending.id)?.status).toBe('Rejected')
})

it('lists requests awaiting my approval', () => {
  act(() => useDemoStore.getState().switchRole('manager'))
  renderAt('/workflows')
  const mine = useDemoStore.getState().data.requests.filter((r) => r.status === 'Pending' && r.steps[r.currentStep].actorId === 'p-daniel')
  expect(screen.getAllByTestId('request-row')).toHaveLength(mine.length)
})
