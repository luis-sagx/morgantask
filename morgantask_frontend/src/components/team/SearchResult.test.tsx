import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import SearchResult from './SearchResult'

vi.mock('@/api/TeamAPI')
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
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SearchResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'user'
  }

  const mockReset = vi.fn()

  it('debe renderizar el nombre del usuario', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('debe renderizar el texto de resultado', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('Resultado:')).toBeInTheDocument()
  })

  it('debe renderizar el botón de agregar', () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    expect(screen.getByText('Agregar al Proyecto')).toBeInTheDocument()
  })

  it('debe permitir hacer click en el botón agregar', async () => {
    render(<SearchResult user={mockUser} reset={mockReset} />, { wrapper: createWrapper() })
    const addButton = screen.getByText('Agregar al Proyecto')
    fireEvent.click(addButton)
    await waitFor(() => {
      expect(addButton).toBeInTheDocument()
    })
  })

})
