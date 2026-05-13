import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import TaskForm from './TaskForm'
import type { TaskFormData, FieldErrors } from '@/types'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { register, formState: { errors } } = useForm<TaskFormData>()
  return <>{children(errors as FieldErrors<TaskFormData>, register)}</>
}

describe('TaskForm', () => {
  it('debe renderizar el campo de nombre', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <TaskForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByLabelText('Nombre de la tarea')).toBeInTheDocument()
  })

  it('debe renderizar el campo de descripción', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <TaskForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByLabelText('Descripción de la tarea')).toBeInTheDocument()
  })

  it('debe tener los placeholders correctos', () => {
    render(
      <TestWrapper>
        {(errors, register) => (
          <TaskForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByPlaceholderText('Nombre de la tarea')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Descripción de la tarea')).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay error en nombre', () => {
    const errors: FieldErrors<TaskFormData> = {
      name: { message: 'El nombre de la tarea es obligatorio', type: 'required' }
    }

    render(
      <TestWrapper>
        {(_, register) => (
          <TaskForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByText('El nombre de la tarea es obligatorio')).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay error en descripción', () => {
    const errors: FieldErrors<TaskFormData> = {
      description: { message: 'La descripción de la tarea es obligatoria', type: 'required' }
    }

    render(
      <TestWrapper>
        {(_, register) => (
          <TaskForm errors={errors} register={register} />
        )}
      </TestWrapper>
    )
    expect(screen.getByText('La descripción de la tarea es obligatoria')).toBeInTheDocument()
  })
})