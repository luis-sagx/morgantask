import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import ProjectForm from './ProjectForm'
import type { ProjectFormData, FieldErrors } from '@/types'
import type { UseFormRegister } from 'react-hook-form'

const TestWrapper = ({ children }: { children: (errors: FieldErrors<ProjectFormData>, register: UseFormRegister<ProjectFormData>) => React.ReactNode }) => {
  const { register, formState: { errors } } = useForm<ProjectFormData>()
  return <>{children(errors as FieldErrors<ProjectFormData>, register)}</>
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
    const errors: FieldErrors<ProjectFormData> = {
      projectName: { message: 'El Titulo del Proyecto es obligatorio', type: 'required' }
    }

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
    const errors: FieldErrors<ProjectFormData> = {
      clientName: { message: 'El Nombre del Cliente es obligatorio', type: 'required' }
    }

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
    const errors: FieldErrors<ProjectFormData> = {
      description: { message: 'Una descripción del proyecto es obligatoria', type: 'required' }
    }

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