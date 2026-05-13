import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProfileForm from './ProfileForm'
import { User } from '@/types'

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

const mockUser: User = {
  _id: '123',
  name: 'Test User',
  email: 'test@test.com'
}

describe('ProfileForm', () => {
  it('debe renderizar el título del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
  })

  it('debe renderizar la descripción del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByText('Aquí puedes actualizar tu información')).toBeInTheDocument()
  })

  it('debe renderizar los campos del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    // El input de email usa id="text" en vez de "email", verificar por placeholder
    expect(screen.getByPlaceholderText('Tu Email')).toBeInTheDocument()
  })

  it('debe renderizar el botón de guardar', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Guardar Cambios')).toBeInTheDocument()
  })

  it('debe tener los valores por defecto del usuario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    const nameInput = screen.getByDisplayValue('Test User')
    const emailInput = screen.getByDisplayValue('test@test.com')
    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
  })
})