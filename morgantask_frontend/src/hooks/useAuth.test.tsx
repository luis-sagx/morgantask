import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { getUser } from '@/api/AuthAPI'
import type { ReactNode } from 'react'

vi.mock('@/api/AuthAPI', () => ({
  getUser: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false
      }
    }
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe iniciar con isLoading en true y retornar datos cuando la carga es exitosa', async () => {
    const mockUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@test.com'
    }
    vi.mocked(getUser).mockResolvedValue(mockUser as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    // Verificar estado inicial
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.data).toBeUndefined()

    // Esperar a que termine de cargar
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockUser)
    expect(result.current.isError).toBe(false)
  })

  it('debe manejar errores correctamente', async () => {
    vi.mocked(getUser).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    // Esperar a que termine con error
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    }, { timeout: 3000 })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})