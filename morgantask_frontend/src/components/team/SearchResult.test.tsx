import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, vi } from 'vitest'
import SearchResult from './SearchResult'

vi.mock('@/api/TeamAPI')

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
  <MemoryRouter initialEntries={['/projects/proj123']}>
    <Routes>
      <Route path="/projects/:projectId" element={children} />
    </Routes>
  </MemoryRouter>
)

describe('SearchResult', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/projects/proj123')
    mutationOptions = []
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
  })

  const mockUser = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'user'
  }

  const mockReset = vi.fn()

  it('debe renderizar el nombre del usuario', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('debe renderizar el texto de resultado', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('Resultado:')).toBeInTheDocument()
  })

  it('debe renderizar el botón de agregar', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('Agregar al Proyecto')).toBeInTheDocument()
  })

  it('debe permitir hacer click en el botón agregar', async () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    const addButton = screen.getByText('Agregar al Proyecto')
    fireEvent.click(addButton)
    expect(mutate).toHaveBeenCalledWith({ projectId: 'proj123', id: 'user123' })
  })

  it('debe cerrar el modal y refrescar el equipo cuando agrega al usuario', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })

    mutationOptions[0].onSuccess('Usuario agregado')

    expect(toast.success).toHaveBeenCalledWith('Usuario agregado')
    expect(mockReset).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/projects/proj123', { replace: true })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['projectTeam', 'proj123'] })
  })

  it('debe mostrar toast cuando no se puede agregar al usuario', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })

    mutationOptions[0].onError(new Error('No se pudo agregar'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo agregar')
  })
})
