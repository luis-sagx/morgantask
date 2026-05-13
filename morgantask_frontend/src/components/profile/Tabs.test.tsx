import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Tabs from './Tabs'

// Wrapper para envolver el componente con router
const renderWithRouter = (initialPath = '/profile') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/profile" element={<Tabs />} />
        <Route path="/profile/password" element={<Tabs />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Tabs', () => {
  it('debe renderizar las tabs en desktop', () => {
    renderWithRouter('/profile')
    // Usar getAllByText para obtener el elemento del span (no el option)
    const miCuenta = screen.getAllByText('Mi Cuenta')
    expect(miCuenta.find(el => el.tagName === 'SPAN')).toBeInTheDocument()
    const cambiarPassword = screen.getAllByText('Cambiar Contraseña')
    expect(cambiarPassword.find(el => el.tagName === 'SPAN')).toBeInTheDocument()
  })

  it('debe renderizar el select en mobile', () => {
    renderWithRouter('/profile')
    const select = screen.getByLabelText('Select a tab')
    expect(select).toBeInTheDocument()
    expect(select).toHaveAttribute('id', 'tabs')
    expect(select).toHaveAttribute('name', 'tabs')
  })

  it('debe tener las opciones del select', () => {
    renderWithRouter('/profile')
    expect(screen.getByRole('option', { name: 'Mi Cuenta' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cambiar Contraseña' })).toBeInTheDocument()
  })

  it('debe marcar la tab activa según la ruta', () => {
    renderWithRouter('/profile')
    const miCuenta = screen.getAllByText('Mi Cuenta')
    const span = miCuenta.find(el => el.tagName === 'SPAN')
    const link = span?.closest('a')
    expect(link).toHaveClass('border-sky-800', 'text-sky-800')
  })

  it('debe renderizar correctamente en ruta de contraseña', () => {
    renderWithRouter('/profile/password')
    const cambiarPassword = screen.getAllByText('Cambiar Contraseña')
    const span = cambiarPassword.find(el => el.tagName === 'SPAN')
    const link = span?.closest('a')
    expect(link).toHaveClass('border-sky-800', 'text-sky-800')
  })
})