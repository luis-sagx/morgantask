import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beforeEach, describe, it, vi } from 'vitest'
import ProjectTeamView from './ProjectTeamView'
import type { TeamMember } from '@/types'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
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

vi.mock('@/components/team/AddMemberModal', () => ({
  default: () => <div>AddMemberModal</div>
}))

describe('ProjectTeamView', () => {
  const mutate = vi.fn()
  const invalidateQueries = vi.fn()
  let mutationOptions: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mutationOptions = []
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options)
      return { mutate } as any
    })
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
  })

  const renderView = () => {
    window.history.pushState({}, '', '/projects/proj123/team')
    render(
      <MemoryRouter initialEntries={['/projects/proj123/team']}>
        <Routes>
          <Route path="/projects/:projectId/team" element={<ProjectTeamView />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('muestra cargando', () => {
    vi.mocked(useQuery).mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    renderView()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra estado vacío', () => {
    vi.mocked(useQuery).mockReturnValue({ isLoading: false, isError: false, data: [] } as any)
    renderView()
    expect(screen.getByText('No hay miembros en este equipo')).toBeInTheDocument()
  })

  it('renderiza miembros y permite eliminar', () => {
    const mockTeam: TeamMember[] = [{ _id: 'u1', name: 'John', email: 'john@test.com' }]
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTeam
    } as any)

    renderView()
    expect(screen.getByText('Administrar Equipo')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /opciones/i }))
    fireEvent.click(screen.getByText('Eliminar del Proyecto'))
    expect(mutate).toHaveBeenCalledWith({ projectId: 'proj123', userId: 'u1' })
  })

  it('abre el modal para agregar colaborador', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ _id: 'u1', name: 'John', email: 'john@test.com' }]
    } as any)

    renderView()
    fireEvent.click(screen.getByText('Agregar Colaborador'))

    expect(navigate).toHaveBeenCalledWith('/projects/proj123/team?addMember=true')
  })

  it('muestra toast e invalida el equipo al remover un usuario', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ _id: 'u1', name: 'John', email: 'john@test.com' }]
    } as any)

    renderView()
    mutationOptions[0].onSuccess('Usuario eliminado')

    expect(toast.success).toHaveBeenCalledWith('Usuario eliminado')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['projectTeam', 'proj123'] })
  })

  it('muestra toast cuando falla la eliminación', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ _id: 'u1', name: 'John', email: 'john@test.com' }]
    } as any)

    renderView()
    mutationOptions[0].onError(new Error('No se pudo remover'))

    expect(toast.error).toHaveBeenCalledWith('No se pudo remover')
  })
})
