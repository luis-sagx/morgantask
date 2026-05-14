import { useAuth } from '@/hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, vi } from 'vitest'
import NoteDetail from './NoteDetail'

vi.mock('@/hooks/useAuth')
vi.mock('@/api/NoteAPI')
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn()
  }
})
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/projects/proj123?viewTask=task123']}>
    <Routes>
      <Route path="/projects/:projectId" element={children} />
    </Routes>
  </MemoryRouter>
)

describe('NoteDetail', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
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

  it('debe eliminar la nota e invalidar la tarea en éxito', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: { _id: 'user123', name: 'John Doe', email: 'john@test.com' },
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<NoteDetail note={mockNote} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText('Eliminar'))

    expect(mutate).toHaveBeenCalledWith({ projectId: 'proj123', taskId: 'task123', noteId: 'note123' })

    mutationOptions[0].onSuccess('Nota eliminada')

    expect(toast.success).toHaveBeenCalledWith('Nota eliminada')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['task', 'task123'] })
  })
})
