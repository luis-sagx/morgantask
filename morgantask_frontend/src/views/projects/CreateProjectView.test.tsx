import { useMutation } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, vi } from 'vitest'
import CreateProjectView from './CreateProjectView'
import type { UseFormRegister } from 'react-hook-form'
import type { ProjectFormData } from '@/types'

vi.mock('@/api/ProjectAPI')

const navigate = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn()
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

vi.mock('@/components/projects/ProjectForm', () => ({
  default: ({ register }: { register: UseFormRegister<ProjectFormData> }) => (
    <div>
      <input {...register('projectName')} placeholder="Project Name" />
      <input {...register('clientName')} placeholder="Client Name" />
      <textarea {...register('description')} placeholder="Description" />
    </div>
  )
}))

const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('CreateProjectView', () => {
  const mutate = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
  })

  it('debe renderizar el título del formulario', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Crear Proyecto')
  })

  it('debe renderizar la descripción', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    expect(screen.getByText('Llena el siguiente formulario para crear un proyecto')).toBeInTheDocument()
  })

  it('debe renderizar el botón de volver', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    expect(screen.getByText('Volver a Proyectos')).toBeInTheDocument()
  })

  it('debe renderizar el botón de crear proyecto', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Crear Proyecto')).toBeInTheDocument()
  })

  it('debe renderizar el formulario de proyecto', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText('Project Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Client Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument()
  })

  it('debe tener el link de volver apuntando a /', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })
    const backLink = screen.getByText('Volver a Proyectos').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('debe enviar el proyecto al crear', async () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText('Project Name'), { target: { value: 'Morgan Task' } })
    fireEvent.change(screen.getByPlaceholderText('Client Name'), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Nuevo proyecto' } })
    fireEvent.click(screen.getByDisplayValue('Crear Proyecto'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        projectName: 'Morgan Task',
        clientName: 'Acme',
        description: 'Nuevo proyecto'
      })
    })
  })

  it('debe navegar al home cuando el proyecto se crea bien', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })

    mutationOptions[0].onSuccess('Proyecto creado')

    expect(toast.success).toHaveBeenCalledWith('Proyecto creado')
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('debe mostrar toast cuando falla la creación', () => {
    render(<CreateProjectView />, { wrapper: createWrapper() })

    mutationOptions[0].onError(new Error('No se pudo crear el proyecto'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo crear el proyecto')
  })
})
