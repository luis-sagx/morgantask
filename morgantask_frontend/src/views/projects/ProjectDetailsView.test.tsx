import { getFullProject } from '@/api/ProjectAPI'
import { useAuth } from '@/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import ProjectDetailsView from './ProjectDetailsView'

vi.mock('@/api/ProjectAPI')
vi.mock('@/hooks/useAuth')
vi.mock('@/components/tasks/AddTaskModal', () => ({
  default: () => <div>AddTaskModal</div>
}))
vi.mock('@/components/tasks/EditTaskData', () => ({
  default: () => <div>EditTaskData</div>
}))
vi.mock('@/components/tasks/TaskList', () => ({
  default: ({ tasks }: any) => <div>TaskList - {tasks.length} tasks</div>
}))
vi.mock('@/components/tasks/TaskModalDetails', () => ({
  default: () => <div>TaskModalDetails</div>
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
      queries: { retry: false }
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

describe('ProjectDetailsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar cargando mientras obtiene datos', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockImplementation(() => new Promise(() => {}))

    render(<ProjectDetailsView />, { wrapper: createWrapper() })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe renderizar el nombre del proyecto', async () => {
    const mockUser = { _id: 'user123', name: 'John', email: 'john@test.com' }
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'user123',
      tasks: []
    }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockResolvedValue(mockProject as any)

    render(<ProjectDetailsView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })
  })

  it('debe renderizar la descripción del proyecto', async () => {
    const mockUser = { _id: 'user123', name: 'John', email: 'john@test.com' }
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'user123',
      tasks: []
    }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockResolvedValue(mockProject as any)

    render(<ProjectDetailsView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
  })

  it('debe mostrar opciones de manager si el usuario es el manager', async () => {
    const mockUser = { _id: 'user123', name: 'John', email: 'john@test.com' }
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'user123',
      tasks: []
    }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockResolvedValue(mockProject as any)

    render(<ProjectDetailsView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Agregar Tarea')).toBeInTheDocument()
      expect(screen.getByText('Colaboradores')).toBeInTheDocument()
    })
  })

  it('no debe mostrar opciones si el usuario no es manager', async () => {
    const mockUser = { _id: 'user123', name: 'John', email: 'john@test.com' }
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'anotheruser',
      tasks: []
    }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockResolvedValue(mockProject as any)

    render(<ProjectDetailsView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Agregar Tarea')).not.toBeInTheDocument()
      expect(screen.queryByText('Colaboradores')).not.toBeInTheDocument()
    })
  })

  it('debe renderizar la lista de tareas', async () => {
    const mockUser = { _id: 'user123', name: 'John', email: 'john@test.com' }
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'user123',
      tasks: [
        { _id: 'task1', name: 'Task 1' },
        { _id: 'task2', name: 'Task 2' }
      ]
    }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(getFullProject).mockResolvedValue(mockProject as any)

    render(<ProjectDetailsView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('TaskList - 2 tasks')).toBeInTheDocument()
    })
  })
})
