import { deleteTask } from '@/api/TaskAPI'
import { DndContext } from '@dnd-kit/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import TaskCard from './TaskCard'
import type { Task } from '@/types'

vi.mock('@/api/TaskAPI')
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
      <MemoryRouter initialEntries={['/projects/proj123']}>
        <DndContext>
          {children}
        </DndContext>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('debe mostrar opciones de edición si canEdit es true', () => {
    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
    expect(screen.getByText('Eliminar Tarea')).toBeInTheDocument()
  })

  it('no debe mostrar opciones de edición si canEdit es false', () => {
    render(<TaskCard task={mockTask} canEdit={false} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    expect(screen.queryByText('Editar Tarea')).not.toBeInTheDocument()
    expect(screen.queryByText('Eliminar Tarea')).not.toBeInTheDocument()
  })

  it('permite hacer click en el botón eliminar cuando canEdit es true', () => {
    vi.mocked(deleteTask).mockResolvedValue('Tarea eliminada')

    render(<TaskCard task={mockTask} canEdit={true} />, { wrapper: createWrapper() })
    const menuButton = screen.getByRole('button', { name: /opciones/i })
    fireEvent.click(menuButton)
    const deleteButton = screen.getByText('Eliminar Tarea')
    expect(deleteButton).toBeInTheDocument()
    fireEvent.click(deleteButton)
  })
})