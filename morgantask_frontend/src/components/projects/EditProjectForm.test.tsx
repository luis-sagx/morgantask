import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, describe, it, vi } from 'vitest'
import EditProjectForm from './EditProjectForm'
import { ProjectFormData } from '@/types'

const navigate = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn()
  }
})

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

const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

const mockProjectData: ProjectFormData = {
  projectName: 'Test Project',
  clientName: 'Test Client',
  description: 'Test Description'
}

describe('EditProjectForm', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
  })

  it('debe renderizar el título del formulario', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })
    expect(screen.getByText('Editar Proyecto')).toBeInTheDocument()
  })

  it('debe renderizar la descripción del formulario', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })
    expect(screen.getByText('Llena el siguiente formulario para editar el proyecto')).toBeInTheDocument()
  })

  it('debe renderizar el botón de volver', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })
    expect(screen.getByText('Volver a Proyectos')).toBeInTheDocument()
  })

  it('debe renderizar el botón de guardar', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Guardar Cambios')).toBeInTheDocument()
  })

  it('debe tener los valores por defecto del proyecto', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument()
  })

  it('debe enviar el proyecto actualizado', async () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByDisplayValue('Guardar Cambios'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        formData: mockProjectData,
        projectId: '123'
      })
    })
  })

  it('debe ejecutar acciones de éxito al guardar', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })

    mutationOptions[0].onSuccess('Proyecto actualizado')

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ['projects'] })
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, { queryKey: ['editProject', '123'] })
    expect(toast.success).toHaveBeenCalledWith('Proyecto actualizado')
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('debe mostrar error cuando falla la edición', () => {
    render(<EditProjectForm data={mockProjectData} projectId="123" />, { wrapper: createWrapper() })

    mutationOptions[0].onError(new Error('Error al editar'))

    expect(toast.error).toHaveBeenCalledWith('Error al editar')
  })
})
