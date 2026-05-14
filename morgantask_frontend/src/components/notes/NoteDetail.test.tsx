import { useAuth } from '@/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import NoteDetail from './NoteDetail'

vi.mock('@/hooks/useAuth')
vi.mock('@/api/NoteAPI')
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
      <MemoryRouter initialEntries={['/projects/proj123?viewTask=task123']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NoteDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockNote = {
    _id: 'note123',
    content: 'Test note content',
    createdBy: { _id: 'user123', name: 'John Doe', email: 'john@test.com' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    task: 'task123'
  }

  it('debe renderizar el contenido de la nota', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    expect(screen.getByText('Test note content')).toBeInTheDocument()
  })

  it('debe renderizar el nombre del creador', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    expect(screen.getByText('por: John Doe')).toBeInTheDocument()
  })

  it('debe mostrar cargando mientras se obtienen datos de auth', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe mostrar botón eliminar si es el creador', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: { _id: 'user123', name: 'John Doe', email: 'john@test.com' },
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('no debe mostrar botón eliminar si no es el creador', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: { _id: 'anotheruser', name: 'Jane Doe', email: 'jane@test.com' },
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('debe mostrar el botón eliminar correctamente si es el creador', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: { _id: 'user123', name: 'John Doe', email: 'john@test.com' },
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    const deleteButton = screen.getByText('Eliminar')
    expect(deleteButton).toBeInTheDocument()
  })
})