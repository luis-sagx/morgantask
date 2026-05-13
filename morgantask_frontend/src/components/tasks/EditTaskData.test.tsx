import { getTaskById } from '@/api/TaskAPI'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import EditTaskData from './EditTaskData'
import type { Task } from '@/types'

vi.mock('@/api/TaskAPI')
vi.mock('./EditTaskModal', () => ({
  default: ({ taskId }: { taskId: string }) => <div>EditTaskModal - {taskId}</div>
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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
      <MemoryRouter initialEntries={['/projects/proj123?editTask=task123']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('EditTaskData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el modal de edición cuando hay datos', async () => {
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

    vi.mocked(getTaskById).mockResolvedValue(mockTask)

    render(<EditTaskData />, { wrapper: createWrapper() })

    // Esperar a que el query se resuelva
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(screen.getByText('EditTaskModal - task123')).toBeInTheDocument()
  })

  it('debe llamar a getTaskById con los parámetros correctos', async () => {
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

    vi.mocked(getTaskById).mockResolvedValue(mockTask)

    render(<EditTaskData />, { wrapper: createWrapper() })

    // Esperar a que el query se resuelva
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(getTaskById).toHaveBeenCalledWith({
      projectId: 'proj123',
      taskId: 'task123'
    })
  })
})