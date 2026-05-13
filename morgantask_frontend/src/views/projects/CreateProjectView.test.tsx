import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import CreateProjectView from './CreateProjectView'
import type { UseFormRegister } from 'react-hook-form'
import type { ProjectFormData } from '@/types'

vi.mock('@/api/ProjectAPI')
vi.mock('react-toastify')
vi.mock('@/components/projects/ProjectForm', () => ({
  default: ({ register }: { register: UseFormRegister<ProjectFormData> }) => (
    <div>
      <input {...register('projectName')} placeholder="Project Name" />
      <input {...register('clientName')} placeholder="Client Name" />
      <textarea {...register('description')} placeholder="Description" />
    </div>
  )
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

describe('CreateProjectView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})