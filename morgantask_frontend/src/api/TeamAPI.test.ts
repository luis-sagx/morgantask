import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addUserToProject, findUserByEmail, getProjectTeam, removeUserFromProject } from './TeamAPI'

vi.mock('@/lib/axios')

describe('TeamAPI', () => {
  const axiosErr = (message: string) => ({
    isAxiosError: true,
    response: { data: { error: message } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findUserByEmail', () => {
    it('retorna usuario en éxito', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { _id: 'u1', name: 'John', email: 'john@test.com', role: 'member' } } as any)
      const result = await findUserByEmail({ projectId: 'proj123', formData: { email: 'john@test.com' } })
      expect(result?._id).toBe('u1')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('x'))
      const result = await findUserByEmail({ projectId: 'proj123', formData: { email: 'x@test.com' } })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.post).mockRejectedValue(axiosErr('User not found') as any)
      await expect(findUserByEmail({ projectId: 'proj123', formData: { email: 'x@test.com' } })).rejects.toThrow('User not found')
    })
  })

  describe('addUserToProject', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: 'ok' } as any)
      const result = await addUserToProject({ projectId: 'proj123', id: 'u1' })
      expect(result).toBe('ok')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('x'))
      const result = await addUserToProject({ projectId: 'proj123', id: 'u1' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.post).mockRejectedValue(axiosErr('User already in project') as any)
      await expect(addUserToProject({ projectId: 'proj123', id: 'u1' })).rejects.toThrow('User already in project')
    })
  })

  describe('removeUserFromProject', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: 'removed' } as any)
      const result = await removeUserFromProject({ projectId: 'proj123', userId: 'u1' })
      expect(result).toBe('removed')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('x'))
      const result = await removeUserFromProject({ projectId: 'proj123', userId: 'u1' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.delete).mockRejectedValue(axiosErr('Cannot remove owner') as any)
      await expect(removeUserFromProject({ projectId: 'proj123', userId: 'u1' })).rejects.toThrow('Cannot remove owner')
    })
  })

  describe('getProjectTeam', () => {
    it('retorna equipo parseado', async () => {
      vi.mocked(api).mockResolvedValue({ data: [{ _id: 'u1', name: 'A', email: 'a@test.com' }] } as any)
      const result = await getProjectTeam('proj123')
      expect(result).toHaveLength(1)
    })

    it('retorna undefined si schema falla', async () => {
      vi.mocked(api).mockResolvedValue({ data: { bad: true } } as any)
      const result = await getProjectTeam('proj123')
      expect(result).toBeUndefined()
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api).mockRejectedValue(new Error('x'))
      const result = await getProjectTeam('proj123')
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api).mockRejectedValue(axiosErr('Project not found') as any)
      await expect(getProjectTeam('proj123')).rejects.toThrow('Project not found')
    })
  })
})
