import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { isUnowned, warrantyFlag } from '@/domain/assets'
import { useDemoStore } from '@/store/useDemoStore'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  act(() => {
    useDemoStore.getState().resetDemo()
    useDemoStore.getState().switchRole('it')
  })
})

it('IT sees every asset, and "Needs attention" narrows to flagged ones', async () => {
  const user = userEvent.setup()
  renderAt('/assets')
  const all = useDemoStore.getState().data.assets
  expect(screen.getAllByTestId('asset-row')).toHaveLength(all.length)
  await user.click(screen.getByRole('button', { name: /needs attention/i, pressed: false }))
  const flagged = all.filter((a) => warrantyFlag(a, new Date()) !== 'ok' || isUnowned(a))
  expect(screen.getAllByTestId('asset-row')).toHaveLength(flagged.length)
})

it('finds an asset by serial number', async () => {
  const user = userEvent.setup()
  renderAt('/assets')
  const target = useDemoStore.getState().data.assets[5]
  await user.type(screen.getByLabelText('Search assets'), target.serial)
  const rows = screen.getAllByTestId('asset-row')
  expect(rows).toHaveLength(1)
  expect(rows[0]).toHaveTextContent(target.tag)
})

it('staff start on their own assets', () => {
  act(() => useDemoStore.getState().switchRole('staff'))
  renderAt('/assets')
  const mine = useDemoStore.getState().data.assets.filter((a) => a.ownerId === 'p-aisyah')
  expect(screen.getAllByTestId('asset-row')).toHaveLength(mine.length)
})

it('shows asset history on the detail page', () => {
  const a = useDemoStore.getState().data.assets.find((x) => x.ownerId === 'p-aisyah')!
  renderAt(`/assets/${a.id}`)
  expect(screen.getByRole('heading', { name: new RegExp(a.model) })).toBeInTheDocument()
  expect(screen.getByText('Assigned to Aisyah Rahman')).toBeInTheDocument()
})
