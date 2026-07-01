import { getErrorMessage } from '../interfaces/utils/error'

describe('getErrorMessage', () => {
    it('returns error message when given an Error', () => {
        expect(getErrorMessage(new Error('algo falló'))).toBe('algo falló')
    })

    it('returns fallback when given a non-Error', () => {
        expect(getErrorMessage('string error')).toBe('Hubo un error')
        expect(getErrorMessage(null)).toBe('Hubo un error')
        expect(getErrorMessage(42)).toBe('Hubo un error')
    })

    it('uses custom fallback', () => {
        expect(getErrorMessage(null, 'Error personalizado')).toBe('Error personalizado')
    })
})
