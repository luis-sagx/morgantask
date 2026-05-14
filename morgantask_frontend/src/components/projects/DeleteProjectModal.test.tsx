import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, vi } from 'vitest'
import DeleteProjectModal from './DeleteProjectModal'

vi.mock('@/api/AuthAPI')
vi.mock('@/api/ProjectAPI', () => ({
  deleteProject: vi.fn()
}))

const navigate = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn()
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigate
  }
})

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/?deleteProject=proj123']}>
    {children}
  </MemoryRouter>
)

describe('DeleteProjectModal', () => {
  const checkMutateAsync = vi.fn()
  const deleteMutateAsync = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    let callCount = 0
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      callCount += 1
      return callCount === 1
        ? ({ mutateAsync: checkMutateAsync } as any)
        : ({ mutateAsync: deleteMutateAsync } as any)
    })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
  })

  it('debe renderizar el modal cuando hay deleteProject en URL', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('debe mostrar el campo de contraseña', async () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })
  })

  it('debe mostrar mensaje de error si la contraseña está vacía', async () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    const submitButton = screen.getByRole('button', { name: 'Eliminar Proyecto' })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('El password es obligatorio')).toBeInTheDocument()
    })
  })

  it('debe renderizar el título correcto', async () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Eliminar Proyecto')
    })
  })

  it('debe renderizar el mensaje de confirmación', async () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Confirma la eliminación del proyecto/)).toBeInTheDocument()
    })
  })

  it('debe validar password y eliminar el proyecto', async () => {
    checkMutateAsync.mockResolvedValue(undefined)
    deleteMutateAsync.mockResolvedValue('Proyecto eliminado')

    render(<DeleteProjectModal />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secreto123' } })
    fireEvent.click(screen.getByDisplayValue('Eliminar Proyecto'))

    await waitFor(() => {
      expect(checkMutateAsync).toHaveBeenCalledWith({ password: 'secreto123' })
      expect(deleteMutateAsync).toHaveBeenCalledWith('proj123')
    })
  })

  it('debe cerrar e invalidar proyectos cuando se elimina bien', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })

    mutationOptions[1].onSuccess('Proyecto eliminado')

    expect(toast.success).toHaveBeenCalledWith('Proyecto eliminado')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['projects'] })
    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('debe mostrar error cuando falla la eliminación', () => {
    render(<DeleteProjectModal />, { wrapper: createWrapper() })

    mutationOptions[1].onError(new Error('No se pudo eliminar'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar')
  })
})
