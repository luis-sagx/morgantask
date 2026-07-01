import { describe, it, expect } from 'vitest'
import { statusTranslations } from '../locales/es'

describe('statusTranslations', () => {
    it('has all task statuses', () => {
        const statuses = ['pending', 'onHold', 'inProgress', 'underReview', 'completed']
        statuses.forEach(s => {
            expect(statusTranslations[s]).toBeDefined()
            expect(statusTranslations[s].length).toBeGreaterThan(0)
        })
    })

    it('pending translates to Pendiente', () => {
        expect(statusTranslations['pending']).toBe('Pendiente')
    })

    it('completed translates to Completado', () => {
        expect(statusTranslations['completed']).toBe('Completado')
    })
})
