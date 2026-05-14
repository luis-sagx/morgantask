import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, describe, it, vi } from 'vitest'
import AddTaskModal from './AddTaskModal'

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigate
  }
})

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

describe('AddTaskModal', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
  })

  const renderWithRoute = (url: string) => {
    window.history.pushState({}, '', url)
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/projects/:projectId" element={<AddTaskModal />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renderiza modal cuando existe newTask', () => {
    renderWithRoute('/projects/proj123?newTask=true')
    expect(screen.getByText('Nueva Tarea')).toBeInTheDocument()
  })

  it('no renderiza modal sin newTask', () => {
    renderWithRoute('/projects/proj123')
    expect(screen.queryByText('Nueva Tarea')).not.toBeInTheDocument()
  })

  it('muestra validaciones requeridas', async () => {
    renderWithRoute('/projects/proj123?newTask=true')
    fireEvent.click(screen.getByDisplayValue('Guardar Tarea'))
    await waitFor(() => {
      expect(screen.getByText('El nombre de la tarea es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La descripción de la tarea es obligatoria')).toBeInTheDocument()
    })
  })

  it('envía datos al mutar', async () => {
    renderWithRoute('/projects/proj123?newTask=true')
    fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea'), { target: { value: 'Nueva' } })
    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea'), { target: { value: 'Desc' } })
    fireEvent.click(screen.getByDisplayValue('Guardar Tarea'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        projectId: 'proj123',
        formData: { name: 'Nueva', description: 'Desc' }
      })
    })
  })

  it('ejecuta el flujo de éxito de la tarea creada', async () => {
    renderWithRoute('/projects/proj123?newTask=true')

    fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea'), { target: { value: 'Nueva' } })
    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea'), { target: { value: 'Desc' } })

    mutationOptions[0].onSuccess('Tarea creada')

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['project', 'proj123'] })
      expect(toast.success).toHaveBeenCalledWith('Tarea creada')
      expect(screen.getByPlaceholderText('Nombre de la tarea')).toHaveValue('')
      expect(screen.getByPlaceholderText('Descripción de la tarea')).toHaveValue('')
      expect(navigate).toHaveBeenCalledWith('/projects/proj123', { replace: true })
    })
  })

  it('muestra error cuando falla la creación', () => {
    renderWithRoute('/projects/proj123?newTask=true')

    mutationOptions[0].onError(new Error('No se pudo crear'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo crear')
  })
})
