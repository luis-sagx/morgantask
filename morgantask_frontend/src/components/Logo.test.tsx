import { render, screen } from '@testing-library/react'
import Logo from './Logo'

describe('Logo', () => {
  it('debe renderizar el logo con alt correcto', () => {
    render(<Logo />)
    const img = screen.getByAltText('Logotipo MorganTask')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/logo.png')
  })
})