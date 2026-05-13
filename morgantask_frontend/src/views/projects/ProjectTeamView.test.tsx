import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, it, vi } from 'vitest'
import ProjectTeamView from './ProjectTeamView'
import type { TeamMember } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}))

vi.mock('@/components/team/AddMemberModal', () => ({
  default: () => <div>AddMemberModal</div>
}))

describe('ProjectTeamView', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMutation).mockReturnValue({ mutate })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries })
  })

  const renderView = () =>
    render(
      <MemoryRouter initialEntries={['/projects/proj123/team']}>
        <Routes>
          <Route path="/projects/:projectId/team" element={<ProjectTeamView />} />
        </Routes>
      </MemoryRouter>
    )

  it('muestra cargando', () => {
    vi.mocked(useQuery).mockReturnValue({ isLoading: true, isError: false, data: undefined })
    renderView()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra estado vacío', () => {
    vi.mocked(useQuery).mockReturnValue({ isLoading: false, isError: false, data: [] })
    renderView()
    expect(screen.getByText('No hay miembros en este equipo')).toBeInTheDocument()
  })

  it('renderiza miembros y permite eliminar', () => {
    const mockTeam: TeamMember[] = [{ _id: 'u1', name: 'John', email: 'john@test.com' }]
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTeam
    })

    renderView()
    expect(screen.getByText('Administrar Equipo')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /opciones/i }))
    fireEvent.click(screen.getByText('Eliminar del Proyecto'))
    expect(mutate).toHaveBeenCalledWith({ projectId: 'proj123', userId: 'u1' })
  })
})