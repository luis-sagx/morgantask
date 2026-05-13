import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import AddNoteForm from './AddNoteForm'

vi.mock('@/api/NoteAPI')
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
      <MemoryRouter initialEntries={['/projects/proj123?viewTask=task123']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AddNoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el formulario de crear nota', () => {
    render(<AddNoteForm />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Crear Nota')).toBeInTheDocument()
  })

  it('debe renderizar el input de contenido', () => {
    render(<AddNoteForm />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText('Contenido de la nota')).toBeInTheDocument()
  })

  it('debe renderizar el botón de crear nota', () => {
    render(<AddNoteForm />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Crear Nota')).toBeInTheDocument()
  })

  it('debe validar que el contenido sea obligatorio', async () => {
    render(<AddNoteForm />, { wrapper: createWrapper() })
    const submitButton = screen.getByDisplayValue('Crear Nota')
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('El Contenido de la nota es obligatorio')).toBeInTheDocument()
    })
  })

  it('debe permitir escribir contenido en el input', async () => {
    render(<AddNoteForm />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText('Contenido de la nota')
    fireEvent.change(input, { target: { value: 'Test note' } })
    expect(input).toHaveValue('Test note')
  })
})
