import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, it, vi } from 'vitest'
import AddTaskModal from './AddTaskModal'

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

describe('AddTaskModal', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
    vi.mocked(useMutation).mockReturnValue({ mutate } as any)
  })

  const renderWithRoute = (url: string) =>
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/projects/:projectId" element={<AddTaskModal />} />
        </Routes>
      </MemoryRouter>
    )

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
})
