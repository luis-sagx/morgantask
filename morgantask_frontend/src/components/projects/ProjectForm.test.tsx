import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import ProjectForm from './ProjectForm'
import { ProjectFormData } from '@/types'

const TestWrapper = ({ children }: { children: (errors: any, register: any) => React.ReactNode }) => {
  const { register, formState: { errors } } = useForm<ProjectFormData>()
  return <>{children(errors, register)}</>
}

describe('ProjectForm', () => {
  it('debe renderizar el campo de nombre del proyecto', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByLabelText('Nombre del Proyecto')).toBeInTheDocument()
  })

  it('debe renderizar el campo de nombre del cliente', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByLabelText('Nombre Cliente')).toBeInTheDocument()
  })

  it('debe renderizar el campo de descripción', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
  })

  it('debe tener los placeholders correctos', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByPlaceholderText('Nombre del Proyecto')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del Cliente')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Descripción del Proyecto')).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay error en projectName', () => {
    const errors = {
      projectName: { message: 'El Titulo del Proyecto es obligatorio', type: 'required' }
    } as any

    render(
      <TestWrapper>
        {(_, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByText('El Titulo del Proyecto es obligatorio')).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay error en clientName', () => {
    const errors = {
      clientName: { message: 'El Nombre del Cliente es obligatorio', type: 'required' }
    } as any

    render(
      <TestWrapper>
        {(_, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByText('El Nombre del Cliente es obligatorio')).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay error en description', () => {
    const errors = {
      description: { message: 'Una descripción del proyecto es obligatoria', type: 'required' }
    } as any

    render(
      <TestWrapper>
        {(_, register) => (
          <ProjectForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByText('Una descripción del proyecto es obligatoria')).toBeInTheDocument()
  })
})