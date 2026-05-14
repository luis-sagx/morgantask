import { getProjects } from '@/api/ProjectAPI'
import { useAuth } from '@/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import DashboardView from './DashboardView'
import type { User, Project } from '@/types'

vi.mock('@/hooks/useAuth')
vi.mock('@/api/ProjectAPI')
vi.mock('@/components/projects/DeleteProjectModal', () => ({
  default: () => <div>DeleteProjectModal</div>
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
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

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar "Cargando..." mientras se cargan los datos', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    } as any)

    vi.mocked(getProjects).mockResolvedValue([])

    render(<DashboardView />, { wrapper: createWrapper() })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe renderizar el título de Mis Proyectos', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(getProjects).mockResolvedValue([])

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Mis Proyectos')).toBeInTheDocument()
    })
  })

  it('debe renderizar la descripción', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(getProjects).mockResolvedValue([])

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Maneja y administra tus proyectos')).toBeInTheDocument()
    })
  })

  it('debe renderizar el botón de nuevo proyecto', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(getProjects).mockResolvedValue([])

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument()
    })
  })

  it('debe mostrar mensaje cuando no hay proyectos', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(getProjects).mockResolvedValue([])

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/No hay proyectos aún/)).toBeInTheDocument()
    })
  })

  it('debe renderizar lista de proyectos', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    const mockProjects: Project[] = [
      {
        _id: 'proj1',
        projectName: 'Project 1',
        clientName: 'Client 1',
        description: 'Description 1',
        manager: 'user123',
        tasks: [],
        team: []
      }
    ]

    vi.mocked(getProjects).mockResolvedValue(mockProjects)

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
      expect(screen.getByText('Cliente: Client 1')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })
  })

  it('debe mostrar rol de colaborador cuando el usuario no es manager', async () => {
    const mockUser: User = { _id: 'user123', name: 'John', email: 'john@test.com' }
    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false
    } as any)

    const mockProjects: Project[] = [
      {
        _id: 'proj1',
        projectName: 'Project 1',
        clientName: 'Client 1',
        description: 'Description 1',
        manager: 'anotheruser',
        tasks: [],
        team: []
      }
    ]

    vi.mocked(getProjects).mockResolvedValue(mockProjects)

    render(<DashboardView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Colaborador')).toBeInTheDocument()
    })
  })
})