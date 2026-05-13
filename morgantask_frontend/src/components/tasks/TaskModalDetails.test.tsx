import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, it, vi } from 'vitest'
import TaskModalDetails from './TaskModalDetails'
import type { Task } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn()
}))

vi.mock('@/components/notes/NotesPanel', () => ({
  default: () => <div>NotesPanel</div>
}))

describe('TaskModalDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderView = (url = '/projects/proj123?viewTask=task1') =>
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/projects/:projectId" element={<TaskModalDetails />} />
        </Routes>
      </MemoryRouter>
    )

  it('redirecciona en error', () => {
    vi.mocked(useQuery).mockReturnValue({
      isError: true,
      error: { message: 'Error' },
      data: undefined
    })

    renderView()
    expect(window.location.pathname).toContain('/')
  })

  it('renderiza detalle de tarea con historial', () => {
    const taskData: Task = {
      _id: 'task1',
      name: 'Tarea X',
      description: 'Desc X',
      status: 'pending',
      project: 'proj123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      completedBy: [
        { _id: 'log1', status: 'completed', user: { _id: 'u1', name: 'John', email: 'john@test.com' } }
      ]
    }

    vi.mocked(useQuery).mockReturnValue({
      isError: false,
      data: taskData
    })

    renderView()
    expect(screen.getByText('Tarea X')).toBeInTheDocument()
    expect(screen.getByText(/Descripción:/)).toBeInTheDocument()
    expect(screen.getByText('Historial de Cambios')).toBeInTheDocument()
    expect(screen.getByText('NotesPanel')).toBeInTheDocument()
  })
})