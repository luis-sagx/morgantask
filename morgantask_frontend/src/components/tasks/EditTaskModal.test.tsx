import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, describe, it, vi } from 'vitest'
import EditTaskModal from './EditTaskModal'
import type { Task } from '@/types'

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

describe('EditTaskModal', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

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
    mutationOptions = []
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
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
    window.history.pushState({}, '', '/projects/proj123?editTask=task1')
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

  it('ejecuta el flujo de éxito al editar la tarea', async () => {
    window.history.pushState({}, '', '/projects/proj123?editTask=task1')
    render(
      <MemoryRouter initialEntries={['/projects/proj123?editTask=task1']}>
        <Routes>
          <Route path="/projects/:projectId" element={<EditTaskModal data={task} taskId="task1" />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea'), { target: { value: 'Editada' } })
    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea'), { target: { value: 'Nueva desc' } })

    mutationOptions[0].onSuccess('Tarea actualizada')

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ['project', 'proj123'] })
      expect(invalidateQueries).toHaveBeenNthCalledWith(2, { queryKey: ['task', 'task1'] })
      expect(toast.success).toHaveBeenCalledWith('Tarea actualizada')
      expect(screen.getByPlaceholderText('Nombre de la tarea')).toHaveValue('')
      expect(screen.getByPlaceholderText('Descripción de la tarea')).toHaveValue('')
      expect(navigate).toHaveBeenCalledWith('/projects/proj123', { replace: true })
    })
  })

  it('muestra error cuando falla la edición', () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123?editTask=task1']}>
        <Routes>
          <Route path="/projects/:projectId" element={<EditTaskModal data={task} taskId="task1" />} />
        </Routes>
      </MemoryRouter>
    )

    mutationOptions[0].onError(new Error('No se pudo editar'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo editar')
  })
})
