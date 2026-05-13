import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, it, vi } from 'vitest'
import EditTaskModal from './EditTaskModal'
import type { Task } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

describe('EditTaskModal', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()

  const task: Task = {
    _id: 'task1',
    name: 'Task inicial',
    description: 'Desc inicial',
    project: 'proj123',
    status: 'pending',
    completedBy: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries })
    vi.mocked(useMutation).mockReturnValue({ mutate })
  })

  it('renderiza datos iniciales', () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123?editTask=task1']}>
        <Routes>
          <Route path="/projects/:projectId" element={<EditTaskModal data={task} taskId="task1" />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Task inicial')).toBeInTheDocument()
  })

  it('envía edición al mutar', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123?editTask=task1']}>
        <Routes>
          <Route path="/projects/:projectId" element={<EditTaskModal data={task} taskId="task1" />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea'), { target: { value: 'Editada' } })
    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea'), { target: { value: 'Nueva desc' } })
    fireEvent.click(screen.getByDisplayValue('Guardar Tarea'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        projectId: 'proj123',
        taskId: 'task1',
        formData: { name: 'Editada', description: 'Nueva desc' }
      })
    })
  })
})