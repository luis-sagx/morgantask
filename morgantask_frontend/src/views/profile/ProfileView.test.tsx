import { useAuth } from '@/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import ProfileView from './ProfileView'

vi.mock('@/hooks/useAuth')
vi.mock('@/components/profile/ProfileForm', () => ({
  default: ({ data }: any) => <div>ProfileForm - {data.name}</div>
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

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar "Cargando..." mientras se carga autenticación', () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any)

    render(<ProfileView />, { wrapper: createWrapper() })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe renderizar ProfileForm cuando datos están disponibles', async () => {
    const mockUser = { _id: 'user123', name: 'John Doe', email: 'john@test.com' }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<ProfileView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('ProfileForm - John Doe')).toBeInTheDocument()
    })
  })

  it('debe pasar datos del usuario a ProfileForm', async () => {
    const mockUser = { _id: 'user123', name: 'Jane Smith', email: 'jane@test.com' }

    vi.mocked(useAuth).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<ProfileView />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('ProfileForm - Jane Smith')).toBeInTheDocument()
    })
  })
})
