import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import ChangePasswordView from './ChangePasswordView'

vi.mock('@/api/ProfileAPI')
vi.mock('react-toastify')

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

describe('ChangePasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el título', () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cambiar Contraseña')
  })

  it('debe renderizar el campo de contraseña actual', () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Contraseña Actual')).toBeInTheDocument()
  })

  it('debe renderizar el campo de nueva contraseña', () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument()
  })

  it('debe renderizar el campo de confirmación de contraseña', () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Repetir Contraseña')).toBeInTheDocument()
  })

  it('debe renderizar el botón de envío', () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Cambiar Contraseña')).toBeInTheDocument()
  })

  it('debe validar que contraseña actual sea requerida', async () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    const submitButton = screen.getByDisplayValue('Cambiar Contraseña')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('La contraseña actual es obligatoria')).toBeInTheDocument()
    })
  })

  it('debe validar que la nueva contraseña sea requerida', async () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    const currentPasswordInput = screen.getByPlaceholderText('Contraseña Actual')
    fireEvent.change(currentPasswordInput, { target: { value: 'current123' } })
    const submitButton = screen.getByDisplayValue('Cambiar Contraseña')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('La nueva contraseña es obligatoria')).toBeInTheDocument()
    })
  })

  it('debe validar longitud mínima de contraseña', async () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    const currentPasswordInput = screen.getByPlaceholderText('Contraseña Actual')
    fireEvent.change(currentPasswordInput, { target: { value: 'current123' } })
    const newPasswordInput = screen.getByPlaceholderText('Nueva Contraseña')
    fireEvent.change(newPasswordInput, { target: { value: 'short' } })
    const submitButton = screen.getByDisplayValue('Cambiar Contraseña')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('La contraseña debe ser mínima de 8 caracteres')).toBeInTheDocument()
    })
  })

  it('debe validar que las contraseñas coincidan', async () => {
    render(<ChangePasswordView />, { wrapper: createWrapper() })
    const currentPasswordInput = screen.getByPlaceholderText('Contraseña Actual')
    fireEvent.change(currentPasswordInput, { target: { value: 'current123' } })
    const newPasswordInput = screen.getByPlaceholderText('Nueva Contraseña')
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
    const confirmPasswordInput = screen.getByPlaceholderText('Repetir Contraseña')
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } })
    const submitButton = screen.getByDisplayValue('Cambiar Contraseña')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no son iguales')).toBeInTheDocument()
    })
  })
})
