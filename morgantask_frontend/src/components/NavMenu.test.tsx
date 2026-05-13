import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import NavMenu from './NavMenu'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NavMenu', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debe renderizar el componente NavMenu', () => {
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('debe mostrar el nombre del usuario en el popover', () => {
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Hola: John Doe')).toBeInTheDocument()
  })

  it('debe mostrar los enlaces de navegación', () => {
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Mis Proyectos')).toBeInTheDocument()
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
  })

  it('debe remover el token al hacer logout', () => {
    localStorage.setItem('AUTH_TOKEN', 'test_token')
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const logoutButton = screen.getByText('Cerrar Sesión')
    fireEvent.click(logoutButton)
    expect(localStorage.getItem('AUTH_TOKEN')).toBeNull()
  })

  it('debe tener el enlace de Mi Perfil apuntando a /profile', () => {
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const profileLink = screen.getByText('Mi Perfil').closest('a')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('debe tener el enlace de Mis Proyectos apuntando a /', () => {
    render(<NavMenu name="John Doe" />, { wrapper: createWrapper() })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const projectsLink = screen.getByText('Mis Proyectos').closest('a')
    expect(projectsLink).toHaveAttribute('href', '/')
  })
})
