import { render, screen } from '@testing-library/react'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('debe renderizar el mensaje de error', () => {
    render(<ErrorMessage>Error de prueba</ErrorMessage>)
    expect(screen.getByText('Error de prueba')).toBeInTheDocument()
  })

  it('debe renderizar con clases de estilo correctas', () => {
    render(<ErrorMessage>Mensaje</ErrorMessage>)
    const div = screen.getByText('Mensaje')
    expect(div).toHaveClass('text-center', 'my-4', 'bg-red-100', 'text-red-600', 'font-bold', 'p-3', 'uppercase', 'text-sm')
  })
})