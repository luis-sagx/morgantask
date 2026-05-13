import { formatDate } from './utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('debe formatear una fecha ISO correctamente', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toBe('15 de enero de 2024')
    })

    it('debe formatear fecha con diferentes meses', () => {
      expect(formatDate('2024-06-20T12:00:00Z')).toBe('20 de junio de 2024')
      expect(formatDate('2024-12-25T08:00:00Z')).toBe('25 de diciembre de 2024')
    })

    it('debe manejar fechas en diferentes años', () => {
      expect(formatDate('2023-03-10T09:00:00Z')).toBe('10 de marzo de 2023')
    })
  })
})