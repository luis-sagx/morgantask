import { describe, it, expect } from 'vitest'
import { formatDate } from '../utils/utils'

describe('formatDate', () => {
    it('formats a valid ISO date in Spanish', () => {
        const result = formatDate('2024-06-15T00:00:00.000Z')
        expect(result).toMatch(/junio/)
        expect(result).toMatch(/2024/)
    })

    it('includes the day number', () => {
        const result = formatDate('2024-01-05T12:00:00.000Z')
        expect(result).toMatch(/enero/)
    })

    it('returns a non-empty string', () => {
        const result = formatDate('2024-12-25T00:00:00.000Z')
        expect(result.length).toBeGreaterThan(0)
    })
})
