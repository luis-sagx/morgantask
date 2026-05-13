import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EditProjectForm from './EditProjectForm'
import { ProjectFormData } from '@/types'

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

const mockProjectData: ProjectFormData = {
  projectName: 'Test Project',
  clientName: 'Test Client',
  description: 'Test Description'
}

describe('EditProjectForm', () => {
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
})