import { useDraggable } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, vi } from 'vitest'
import TaskCard from './TaskCard'
import type { Task } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDraggable: vi.fn()
}))

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

describe('TaskCard', () => {
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
    vi.mocked(useDraggable).mockReturnValue({
      attributes: { 'data-testid': 'drag-attrs' },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: null
    } as any)
  })

  const mockTask: Task = {
    _id: 'task123',
    name: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    project: 'proj123',
    completedBy: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  it('debe renderizar el nombre de la tarea', () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('debe renderizar la descripción de la tarea', () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('debe aplicar estilos de drag cuando existe transform', () => {
    vi.mocked(useDraggable).mockReturnValue({
      attributes: { 'data-testid': 'drag-attrs' },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: { x: 12, y: 18 }
    } as any)

    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })

    const dragArea = screen.getByText('Test Task').closest('div')
    expect(dragArea).toHaveStyle({
      transform: 'translate3d(12px, 18px, 0)',
      padding: '1.25rem',
      backgroundColor: '#FFF',
      width: '300px',
      display: 'flex',
      borderWidth: '1px'
    })
  })

  it('debe renderizar el botón de menú', () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('debe mostrar opción Ver Tarea en el menú', () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    expect(screen.getByText('Ver Tarea')).toBeInTheDocument()
  })

  it('debe mostrar opciones de edición si canEdit es true', async () => {
    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    await waitFor(() => {
      expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
      expect(screen.getByText('Eliminar Tarea')).toBeInTheDocument()
    })
  })

  it('no debe mostrar opciones de edición si canEdit es false', async () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    expect(screen.queryByText('Editar Tarea')).not.toBeInTheDocument()
    expect(screen.queryByText('Eliminar Tarea')).not.toBeInTheDocument()
  })

  it('permite hacer click en el botón eliminar cuando canEdit es true', () => {
    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    const deleteButton = screen.getByText('Eliminar Tarea')
    expect(deleteButton).toBeInTheDocument()
    fireEvent.click(deleteButton)
    expect(mutate).toHaveBeenCalledWith({ projectId: 'proj123', taskId: 'task123' })
  })

  it('muestra toast e invalida el proyecto cuando elimina bien', () => {
    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })

    mutationOptions[0].onSuccess('Tarea eliminada')

    expect(toast.success).toHaveBeenCalledWith('Tarea eliminada')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['project', 'proj123'] })
  })

  it('muestra toast de error cuando falla la eliminación', () => {
    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })

    mutationOptions[0].onError(new Error('No se pudo eliminar'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar')
  })
})
