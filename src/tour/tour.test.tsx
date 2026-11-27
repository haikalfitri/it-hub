import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { useDemoStore } from '@/store/useDemoStore'
import { startTour } from './events'

beforeEach(() => {
  act(() => useDemoStore.getState().resetDemo())
})

it('walks the six-step tour through the real UI', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  act(() => startTour())
  const card = () => screen.getByRole('dialog', { name: /./, hidden: false })
  expect(await screen.findByRole('heading', { name: 'Request a laptop as staff' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /submit request/i }))
  expect(await screen.findByRole('heading', { name: 'It went to her manager' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /switch to daniel tan/i }))
  expect(await screen.findByRole('heading', { name: 'Approve as the manager' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /^approve$/i }))
  expect(await screen.findByRole('heading', { name: 'Now it needs IT' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /switch to hafiz ismail/i }))
  expect(await screen.findByRole('heading', { name: 'Assign a laptop from stock' })).toBeInTheDocument()

  const picker = screen.getByRole('radiogroup', { name: /laptop to assign/i })
  await user.click(within(picker).getAllByRole('radio')[0])
  await user.click(screen.getByRole('button', { name: /assign and complete/i }))
  expect(await screen.findByRole('heading', { name: 'Everything updated together' })).toBeInTheDocument()
  expect(card()).toBeInTheDocument()
})

it('"Get back on track" recovers after the manager rejects', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  act(() => startTour())
  await user.click(await screen.findByRole('button', { name: /submit request/i }))
  await user.click(await screen.findByRole('button', { name: /switch to daniel tan/i }))
  await screen.findByRole('heading', { name: 'Approve as the manager' })
  const req = useDemoStore.getState().data.requests.at(-1)!
  act(() => {
    useDemoStore.getState().decide(req.id, 'reject', 'testing')
  })
  await user.click(screen.getByRole('button', { name: /get back on track/i }))
  const fresh = useDemoStore.getState().data.requests.at(-1)!
  expect(fresh.id).not.toBe(req.id)
  expect(fresh.status).toBe('Pending')
  expect(await screen.findByRole('button', { name: /^approve$/i })).toBeInTheDocument()
})
