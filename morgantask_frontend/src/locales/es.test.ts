import { statusTranslations } from './es'

describe('es locales', () => {
  it('debe tener las traducciones definidas', () => {
    expect(statusTranslations).toBeDefined()
    expect(typeof statusTranslations).toBe('object')
  })

  it('debe tener las claves de traducción principales', () => {
    // Verificar que el objeto tiene las propiedades básicas
    expect(Object.keys(statusTranslations).length).toBeGreaterThan(0)
  })

  it('debe tener las traducciones de estados', () => {
    expect(statusTranslations.pending).toBe('Pendiente')
    expect(statusTranslations.onHold).toBe('En Espera')
    expect(statusTranslations.inProgress).toBe('En Progreso')
    expect(statusTranslations.underReview).toBe('En Revisión')
    expect(statusTranslations.completed).toBe('Completado')
  })
})