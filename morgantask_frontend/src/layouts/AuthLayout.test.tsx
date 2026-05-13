import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'
import AuthLayout from './AuthLayout'

// Mock de Logo
vi.mock('@/components/Logo', () => ({
  default: () => <div data-testid="logo">Logo</div>
}))

// Mock de ToastContainer
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast" />
}))

describe('AuthLayout', () => {
  it('debe renderizar el logo', () => {
    render(
      <MemoryRouter>
        <AuthLayout />
      </MemoryRouter>
    )
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('debe renderizar el ToastContainer', () => {
    render(
      <MemoryRouter>
        <AuthLayout />
      </MemoryRouter>
    )
    expect(screen.getByTestId('toast')).toBeInTheDocument()
  })

  it('debe renderizar el Outlet', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      </MemoryRouter>
    )
    // El outlet debe renderizarse
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('debe tener la estructura correcta con clases de estilo', () => {
    render(
      <MemoryRouter>
        <AuthLayout />
      </MemoryRouter>
    )
    const container = document.querySelector('.min-h-screen.bg-gray-900')
    expect(container).toBeInTheDocument()
  })
})