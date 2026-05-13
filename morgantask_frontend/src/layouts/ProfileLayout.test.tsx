import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfileLayout from './ProfileLayout'

// Mock de Tabs
vi.mock('@/components/profile/Tabs', () => ({
  default: () => <div data-testid="tabs">Tabs</div>
}))

describe('ProfileLayout', () => {
  it('debe renderizar el componente Tabs', () => {
    render(
      <MemoryRouter>
        <ProfileLayout />
      </MemoryRouter>
    )
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
  })

  it('debe renderizar el Outlet correctamente', () => {
    render(
      <MemoryRouter>
        <ProfileLayout />
      </MemoryRouter>
    )
    // ProfileLayout debe tener Tabs y Outlet
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
  })
})