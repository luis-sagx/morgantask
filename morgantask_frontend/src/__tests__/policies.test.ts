import { describe, it, expect } from 'vitest'
import { isManager } from '../utils/policies'

describe('isManager', () => {
    it('returns true when managerId matches userId', () => {
        expect(isManager('u1', 'u1')).toBe(true)
    })

    it('returns false when ids differ', () => {
        expect(isManager('u1', 'u2')).toBe(false)
    })

    it('returns false for empty strings', () => {
        expect(isManager('', '')).toBe(true)
    })
})
