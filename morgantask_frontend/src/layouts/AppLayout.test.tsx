import { useAuth } from '@/hooks/useAuth'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, vi } from 'vitest'
import AppLayout from './AppLayout'

vi.mock('@/hooks/useAuth')
vi.mock('@/components/NavMenu', () => ({
  default: ({ name }: { name: string }) => <div>Nav {name}</div>
}))

describe('AppLayout', () => {
  it('muestra cargando cuando auth está cargando', () => {
    vi.mocked(useAuth).mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    render(<AppLayout />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('redirecciona a login cuando hay error', () => {
    vi.mocked(useAuth).mockReturnValue({ isLoading: false, isError: true, data: undefined } as any)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path='/' element={<div>Home</div>} />
          </Route>
          <Route path='/auth/login' element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renderiza layout cuando hay usuario', () => {
    vi.mocked(useAuth).mockReturnValue({ isLoading: false, isError: false, data: { name: 'Luis' } } as any)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path='/' element={<div>Contenido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Nav Luis')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})
