import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound', () => {
  it('debe renderizar el título de página no encontrada', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    )
    expect(screen.getByText('Página No Encontrada')).toBeInTheDocument()
  })

  it('debe renderizar el enlace a proyectos', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    )
    const link = screen.getByText('Proyectos')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('debe renderizar el texto explicativo', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    )
    expect(screen.getByText(/Tal vez quieras volver a/)).toBeInTheDocument()
  })
})