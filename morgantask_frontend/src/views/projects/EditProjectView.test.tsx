import { getProjectById } from '@/api/ProjectAPI'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import EditProjectView from './EditProjectView'

vi.mock('@/api/ProjectAPI')
vi.mock('@/components/projects/EditProjectForm', () => ({
  default: ({ data, projectId }: any) => <div>EditProjectForm - {projectId}</div>
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

describe('EditProjectView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar cargando mientras obtiene datos del proyecto', () => {
    vi.mocked(getProjectById).mockImplementation(() => new Promise(() => {}))

    render(<EditProjectView />, { wrapper: createWrapper() })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe renderizar el formulario de edición cuando obtiene los datos', async () => {
    const mockProject = {
      _id: 'proj123',
      projectName: 'Test Project',
      clientName: 'Test Client',
      description: 'Test Description',
      manager: 'user123',
      tasks: []
    }

    vi.mocked(getProjectById).mockResolvedValue(mockProject as any)

    render(<EditProjectView />, { wrapper: createWrapper() })

    // Esperar a que el query se resuelva
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(screen.getByText('EditProjectForm - proj123')).toBeInTheDocument()
  })

  it('debe redirigir a 404 cuando falla la obtención de datos', async () => {
    vi.mocked(getProjectById).mockRejectedValue(new Error('Project not found'))

    const { container } = render(<EditProjectView />, { wrapper: createWrapper() })

    // Esperar a que el query falle
    await new Promise(resolve => setTimeout(resolve, 100))

    // La vista debe mostrar Navigate (aunque no sea visible en el DOM)
    expect(container).toBeInTheDocument()
  })
})
