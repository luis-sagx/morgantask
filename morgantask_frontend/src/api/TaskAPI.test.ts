import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTask, deleteTask, getTaskById, updateStatus, updateTask } from './TaskAPI'

vi.mock('@/lib/axios')

describe('TaskAPI', () => {
  const axiosErr = (message: string) => ({
    isAxiosError: true,
    response: { data: { error: message } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTask', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: 'task123' })
      const result = await createTask({ formData: { name: 'T', description: 'D' }, projectId: 'proj123' })
      expect(result).toBe('task123')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('x'))
      const result = await createTask({ formData: { name: 'T', description: 'D' }, projectId: 'proj123' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.post).mockRejectedValue(axiosErr('Task creation failed'))
      await expect(createTask({ formData: { name: 'T', description: 'D' }, projectId: 'proj123' })).rejects.toThrow('Task creation failed')
    })
  })

  describe('getTaskById', () => {
    it('retorna tarea parseada', async () => {
      vi.mocked(api).mockResolvedValue({
        data: {
          _id: 'task123',
          name: 'Task',
          description: 'Desc',
          status: 'pending',
          project: 'proj123',
          completedBy: [],
          notes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      const result = await getTaskById({ projectId: 'proj123', taskId: 'task123' })
      expect(result?._id).toBe('task123')
    })

    it('retorna undefined si schema inválido', async () => {
      vi.mocked(api).mockResolvedValue({ data: { invalid: true } })
      const result = await getTaskById({ projectId: 'proj123', taskId: 'task123' })
      expect(result).toBeUndefined()
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api).mockRejectedValue(new Error('x'))
      const result = await getTaskById({ projectId: 'proj123', taskId: 'task123' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api).mockRejectedValue(axiosErr('Task not found'))
      await expect(getTaskById({ projectId: 'proj123', taskId: 'task123' })).rejects.toThrow('Task not found')
    })
  })

  describe('updateTask', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.put).mockResolvedValue({ data: 'updated' })
      const result = await updateTask({ formData: { name: 'A', description: 'B' }, projectId: 'proj123', taskId: 'task123' })
      expect(result).toBe('updated')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('x'))
      const result = await updateTask({ formData: { name: 'A', description: 'B' }, projectId: 'proj123', taskId: 'task123' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.put).mockRejectedValue(axiosErr('Update failed'))
      await expect(updateTask({ formData: { name: 'A', description: 'B' }, projectId: 'proj123', taskId: 'task123' })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteTask', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: 'deleted' })
      const result = await deleteTask({ projectId: 'proj123', taskId: 'task123' })
      expect(result).toBe('deleted')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('x'))
      const result = await deleteTask({ projectId: 'proj123', taskId: 'task123' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.delete).mockRejectedValue(axiosErr('Delete failed'))
      await expect(deleteTask({ projectId: 'proj123', taskId: 'task123' })).rejects.toThrow('Delete failed')
    })
  })

  describe('updateStatus', () => {
    it('retorna data en éxito', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: 'status updated' })
      const result = await updateStatus({ projectId: 'proj123', taskId: 'task123', status: 'completed' })
      expect(result).toBe('status updated')
    })

    it('retorna undefined en error no axios', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('x'))
      const result = await updateStatus({ projectId: 'proj123', taskId: 'task123', status: 'completed' })
      expect(result).toBeUndefined()
    })

    it('lanza error cuando axios response existe', async () => {
      vi.mocked(api.post).mockRejectedValue(axiosErr('Status update failed'))
      await expect(updateStatus({ projectId: 'proj123', taskId: 'task123', status: 'completed' })).rejects.toThrow('Status update failed')
    })
  })
})