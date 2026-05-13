import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import DeleteProjectModal from './DeleteProjectModal'

vi.mock('@/api/AuthAPI')
vi.mock('@/api/ProjectAPI', () => ({
  deleteProject: vi.fn()
}))
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
      <MemoryRouter initialEntries={['/?deleteProject=proj123']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DeleteProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el modal cuando hay deleteProject en URL', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('debe mostrar el campo de contraseña', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('debe mostrar mensaje de error si la contraseña está vacía', async () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    const submitButton = screen.getByRole('button', { name: 'Eliminar Proyecto' })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('El password es obligatorio')).toBeInTheDocument()
    })
  })

  it('debe renderizar el título correcto', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Eliminar Proyecto')
  })

  it('debe renderizar el mensaje de confirmación', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    expect(screen.getByText(/Confirma la eliminación del proyecto/)).toBeInTheDocument()
  })
})
