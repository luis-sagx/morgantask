import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AddMemberModal from './AddMemberModal'

const createWrapper = (initialEntry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/projects/:projectId/team" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AddMemberModal', () => {
  it('debe renderizar el modal cuando existe el query param addMember', () => {
    render(<AddMemberModal />, {
      wrapper: createWrapper('/projects/proj123/team?addMember=true')
    })

    expect(screen.getByText('Agregar Integrante al equipo')).toBeInTheDocument()
    expect(screen.getByText(/para agregarlo al proyecto/i)).toBeInTheDocument()
  })

  it('debe renderizar el formulario dentro del modal', () => {
    render(<AddMemberModal />, {
      wrapper: createWrapper('/projects/proj123/team?addMember=true')
    })

    expect(screen.getByPlaceholderText('E-mail del usuario a Agregar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Buscar Usuario')).toBeInTheDocument()
  })
})
