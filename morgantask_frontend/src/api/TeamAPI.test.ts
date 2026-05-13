import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addUserToProject, findUserByEmail, getProjectTeam, removeUserFromProject } from './TeamAPI'

vi.mock('@/lib/axios')

describe('TeamAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findUserByEmail', () => {
    it('debe encontrar un usuario por email exitosamente', async () => {
      const mockResponse = { _id: 'user123', name: 'John', email: 'john@test.com', role: 'member' }
      const projectId = 'proj123'
      const formData = { email: 'john@test.com' }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await findUserByEmail({ projectId, formData })

      expect(result).toEqual(mockResponse)
      expect(api.post).toHaveBeenCalledWith(`/projects/${projectId}/team/find`, formData)
    })

    it('debe retornar undefined cuando no encuentra el usuario', async () => {
      const projectId = 'proj123'
      const formData = { email: 'notfound@test.com' }
      const errorMessage = 'User not found'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await findUserByEmail({ projectId, formData })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta', async () => {
      const projectId = 'proj123'
      const formData = { email: 'john@test.com' }

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await findUserByEmail({ projectId, formData })
      expect(result).toBeUndefined()
    })
  })

  describe('addUserToProject', () => {
    it('debe agregar un usuario al proyecto exitosamente', async () => {
      const mockResponse = 'User added'
      const projectId = 'proj123'
      const userId = 'user123'

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await addUserToProject({ projectId, id: userId })

      expect(result).toBe(mockResponse)
      expect(api.post).toHaveBeenCalledWith(`/projects/${projectId}/team`, { id: userId })
    })

    it('debe retornar undefined cuando falla agregar usuario', async () => {
      const projectId = 'proj123'
      const userId = 'user123'
      const errorMessage = 'User already in project'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await addUserToProject({ projectId, id: userId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en add', async () => {
      const projectId = 'proj123'
      const userId = 'user123'

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await addUserToProject({ projectId, id: userId })
      expect(result).toBeUndefined()
    })
  })

  describe('removeUserFromProject', () => {
    it('debe remover un usuario del proyecto exitosamente', async () => {
      const mockResponse = 'User removed'
      const projectId = 'proj123'
      const userId = 'user123'

      vi.mocked(api.delete).mockResolvedValue({ data: mockResponse })

      const result = await removeUserFromProject({ projectId, userId })

      expect(result).toBe(mockResponse)
      expect(api.delete).toHaveBeenCalledWith(`/projects/${projectId}/team/${userId}`)
    })

    it('debe retornar undefined cuando falla remover usuario', async () => {
      const projectId = 'proj123'
      const userId = 'user123'
      const errorMessage = 'Cannot remove owner'

      vi.mocked(api.delete).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await removeUserFromProject({ projectId, userId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en remove', async () => {
      const projectId = 'proj123'
      const userId = 'user123'

      vi.mocked(api.delete).mockRejectedValue(new Error('Network error'))

      const result = await removeUserFromProject({ projectId, userId })
      expect(result).toBeUndefined()
    })
  })

  describe('getProjectTeam', () => {
    it('debe obtener el equipo del proyecto exitosamente', async () => {
      const projectId = 'proj123'
      const mockTeam = [
        { _id: 'user1', name: 'User 1', email: 'user1@test.com' },
        { _id: 'user2', name: 'User 2', email: 'user2@test.com' }
      ]

      vi.mocked(api).mockResolvedValue({ data: mockTeam })

      const result = await getProjectTeam(projectId)

      expect(result).toEqual(mockTeam)
      expect(api).toHaveBeenCalledWith(`/projects/${projectId}/team`)
    })

    it('debe retornar undefined cuando falla obtener equipo', async () => {
      const projectId = 'proj123'
      const errorMessage = 'Project not found'

      vi.mocked(api).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await getProjectTeam(projectId)
      expect(result).toBeUndefined()
    })

    it('debe retornar undefined si el schema no valida', async () => {
      const projectId = 'proj123'
      const invalidData = { invalid: 'data' }

      vi.mocked(api).mockResolvedValue({ data: invalidData })

      const result = await getProjectTeam(projectId)
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en getTeam', async () => {
      const projectId = 'proj123'

      vi.mocked(api).mockRejectedValue(new Error('Network error'))

      const result = await getProjectTeam(projectId)
      expect(result).toBeUndefined()
    })
  })
})
