import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

it('states honestly that this is a rebuild with fictional data', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText('A rebuild with fictional data of a system I built at Cypark. No company data is used.')).toBeInTheDocument()
  const diagram = screen.getByRole('img', { name: /architecture/i })
  expect(diagram.tagName.toLowerCase()).toBe('svg')
})
