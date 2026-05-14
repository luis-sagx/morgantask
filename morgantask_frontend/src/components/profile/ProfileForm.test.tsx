import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import ProfileForm from './ProfileForm'
import { User } from '@/types'
import { beforeEach, vi } from 'vitest'

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn()
  }
})

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

const mockUser: User = {
  _id: '123',
  name: 'Test User',
  email: 'test@test.com'
}

describe('ProfileForm', () => {
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

  it('debe renderizar el título del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
  })

  it('debe renderizar la descripción del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByText('Aquí puedes actualizar tu información')).toBeInTheDocument()
  })

  it('debe renderizar los campos del formulario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    // El input de email usa id="text" en vez de "email", verificar por placeholder
    expect(screen.getByPlaceholderText('Tu Email')).toBeInTheDocument()
  })

  it('debe renderizar el botón de guardar', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    expect(screen.getByDisplayValue('Guardar Cambios')).toBeInTheDocument()
  })

  it('debe tener los valores por defecto del usuario', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })
    const nameInput = screen.getByDisplayValue('Test User')
    const emailInput = screen.getByDisplayValue('test@test.com')
    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
  })

  it('debe enviar el perfil actualizado', async () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByDisplayValue('Guardar Cambios'))

    await waitFor(() => {
    expect(mutate).toHaveBeenCalledWith({
      _id: '123',
      name: 'Test User',
      email: 'test@test.com'
    })
    })
  })

  it('debe mostrar toast e invalidar user cuando actualiza bien', () => {
    render(<ProfileForm data={mockUser} />, { wrapper: createWrapper() })

    mutationOptions[0].onSuccess('Perfil actualizado')

    expect(toast.success).toHaveBeenCalledWith('Perfil actualizado')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user'] })
  })
})
