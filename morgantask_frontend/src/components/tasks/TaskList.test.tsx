import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, it, vi } from 'vitest'
import TaskList from './TaskList'
import type { Task } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (result: { active: { id: string }; over: { id: string } }) => void }) => (
    <div>
      <button onClick={() => onDragEnd({ active: { id: 'task1' }, over: { id: 'completed' } })}>trigger-drag</button>
      {children}
    </div>
  )
}))

vi.mock('./TaskCard', () => ({
  default: ({ task }: { task: Task }) => <li>{task.name}</li>
}))

vi.mock('./DropTask', () => ({
  default: ({ status }: { status: string }) => <div>Drop {status}</div>
}))

describe('TaskList', () => {
  const mutate = vi.fn()
  const setQueryData = vi.fn()
  const invalidateQueries = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMutation).mockReturnValue({ mutate })
    vi.mocked(useQueryClient).mockReturnValue({
      setQueryData,
      invalidateQueries
    })
  })

  const tasks: Task[] = [
    { _id: 'task1', name: 'Tarea 1', description: 'D', status: 'pending', project: 'p1', completedBy: [], notes: [], createdAt: '', updatedAt: '' },
    { _id: 'task2', name: 'Tarea 2', description: 'D', status: 'completed', project: 'p1', completedBy: [], notes: [], createdAt: '', updatedAt: '' }
  ]

  it('renderiza columnas y tareas agrupadas', () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123']}>
        <Routes>
          <Route path="/projects/:projectId" element={<TaskList tasks={tasks} canEdit={true} />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Tareas')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByText('Tarea 1')).toBeInTheDocument()
  })

  it('muestra mensaje cuando no hay tareas en columnas', () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123']}>
        <Routes>
          <Route path="/projects/:projectId" element={<TaskList tasks={[]} canEdit={false} />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('No Hay tareas').length).toBeGreaterThan(0)
  })

  it('ejecuta dragEnd y muta estado', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj123']}>
        <Routes>
          <Route path="/projects/:projectId" element={<TaskList tasks={tasks} canEdit={true} />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('trigger-drag'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        projectId: 'proj123',
        taskId: 'task1',
        status: 'completed'
      })
      expect(setQueryData).toHaveBeenCalled()
    })
  })
})