import { findUserByEmail } from '@/api/TeamAPI'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import AddMemberForm from './AddMemberForm'
import type { TeamMember } from '@/types'

vi.mock('@/api/TeamAPI')
vi.mock('./SearchResult', () => ({
  default: ({ user, reset }: { user: TeamMember; reset: () => void }) => (
    <div>
      <div>SearchResult - {user.name}</div>
      <button type="button" onClick={reset}>Reset Search</button>
    </div>
  )
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ projectId: 'proj123' })
  }
})

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

describe('AddMemberForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el formulario de agregar miembro', () => {
    render(<AddMemberForm />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('E-mail de Usuario')).toBeInTheDocument()
  })

  it('debe renderizar el input de email', () => {
    render(<AddMemberForm />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText('E-mail del usuario a Agregar')).toBeInTheDocument()
  })

  it('debe renderizar el botón de buscar', () => {
    render(<AddMemberForm />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Buscar Usuario')).toBeInTheDocument()
  })

  it('debe validar que el email sea requerido', async () => {
    render(<AddMemberForm />, { wrapper: createWrapper() })
    const submitButton = screen.getByDisplayValue('Buscar Usuario')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('El Email es obligatorio')).toBeInTheDocument()
    })
  })

  it('debe validar que el email tenga formato válido', async () => {
    render(<AddMemberForm />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('E-mail del usuario a Agregar')
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } })
    const submitButton = screen.getByDisplayValue('Buscar Usuario')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('E-mail no válido')).toBeInTheDocument()
    })
  })

  it('debe enviar el formulario con email válido', async () => {
    const mockUser: TeamMember = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@test.com'
    }
    vi.mocked(findUserByEmail).mockResolvedValue(mockUser)

    render(<AddMemberForm />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('E-mail del usuario a Agregar')
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    const submitButton = screen.getByDisplayValue('Buscar Usuario')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('SearchResult - John Doe')).toBeInTheDocument()
    })
  })

  it('debe limpiar la búsqueda cuando se resetea el resultado', async () => {
    const mockUser: TeamMember = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@test.com'
    }
    vi.mocked(findUserByEmail).mockResolvedValue(mockUser)

    render(<AddMemberForm />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('E-mail del usuario a Agregar') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.click(screen.getByDisplayValue('Buscar Usuario'))

    await waitFor(() => {
      expect(screen.getByText('SearchResult - John Doe')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Reset Search'))

    await waitFor(() => {
      expect(emailInput).toHaveValue('')
    })
  })

  it('debe mostrar cargando mientras busca el usuario', async () => {
    vi.mocked(findUserByEmail).mockImplementation(() => new Promise(() => {}))
    render(<AddMemberForm />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('E-mail del usuario a Agregar')
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    const submitButton = screen.getByDisplayValue('Buscar Usuario')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })
})
