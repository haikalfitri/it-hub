import { act, render, screen } from '@testing-library/react'
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

it('redirects staff away from the people directory to their profile', () => {
  renderAt('/people')
  expect(screen.getByRole('heading', { level: 1, name: 'Aisyah Rahman' })).toBeInTheDocument()
})

it('shows a newly granted system on the profile', () => {
  const s = useDemoStore.getState()
  act(() => {
    const r = s.submitRequest('access', { system: 'HR portal', level: 'Read', justification: 'Leave approvals' })
    if (!r.ok) throw new Error(r.error)
    s.switchRole('manager')
    if (!useDemoStore.getState().decide(r.id!, 'approve', '').ok) throw new Error('approve failed')
    s.switchRole('it')
    if (!useDemoStore.getState().decide(r.id!, 'approve', '').ok) throw new Error('grant failed')
    s.switchRole('staff')
  })
  renderAt('/me')
  expect(screen.getByText('HR portal')).toBeInTheDocument()
})

it('lists everyone for IT, with a profile per person', () => {
  act(() => useDemoStore.getState().switchRole('it'))
  renderAt('/people')
  expect(screen.getAllByTestId('person-row')).toHaveLength(useDemoStore.getState().data.people.length)
})

it('opens another person profile for IT', () => {
  act(() => useDemoStore.getState().switchRole('it'))
  renderAt('/people/p-farid')
  expect(screen.getByRole('heading', { level: 1, name: 'Farid Zulkifli' })).toBeInTheDocument()
})
