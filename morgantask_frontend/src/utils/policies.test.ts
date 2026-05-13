import { isManager } from './policies'
import { Project, TeamMember } from '@/types'

describe('policies', () => {
  describe('isManager', () => {
    const managerId = 'manager-123' as Project['manager']
    const userId: TeamMember['_id'] = 'user-456'
    const managerUserId: TeamMember['_id'] = 'manager-123'

    it('debe retornar true cuando el usuario es el manager', () => {
      const result = isManager(managerId, managerUserId)
      expect(result).toBe(true)
    })

    it('debe retornar false cuando el usuario no es el manager', () => {
      const result = isManager(managerId, userId)
      expect(result).toBe(false)
    })
  })
})