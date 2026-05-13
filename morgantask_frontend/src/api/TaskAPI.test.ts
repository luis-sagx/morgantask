import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTask, deleteTask, getTaskById, updateStatus, updateTask } from './TaskAPI'

vi.mock('@/lib/axios')

describe('TaskAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTask', () => {
    it('debe crear una tarea exitosamente', async () => {
      const mockResponse = 'task123'
      const formData = { title: 'Test Task', description: 'Test' }
      const projectId = 'proj123'

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createTask({ formData, projectId })

      expect(result).toBe(mockResponse)
      expect(api.post).toHaveBeenCalledWith(`/projects/${projectId}/tasks`, formData)
    })

    it('debe retornar undefined cuando falla la creación', async () => {
      const formData = { title: 'Test Task', description: 'Test' }
      const projectId = 'proj123'
      const errorMessage = 'Task creation failed'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await createTask({ formData, projectId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta', async () => {
      const formData = { title: 'Test Task', description: 'Test' }
      const projectId = 'proj123'

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await createTask({ formData, projectId })
      expect(result).toBeUndefined()
    })
  })

  describe('getTaskById', () => {
    it('debe obtener una tarea por ID exitosamente', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const mockTask = {
        _id: taskId,
        name: 'Test Task',
        description: 'Test',
        status: 'pending' as const,
        project: projectId,
        completedBy: [],
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(api).mockResolvedValue({ data: mockTask })

      const result = await getTaskById({ projectId, taskId })

      expect(result).toEqual(mockTask)
      expect(api).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}`)
    })

    it('debe retornar undefined cuando falla la obtención', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const errorMessage = 'Task not found'

      vi.mocked(api).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await getTaskById({ projectId, taskId })
      expect(result).toBeUndefined()
    })

    it('debe retornar undefined si el schema no valida', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const invalidData = { invalid: 'data' }

      vi.mocked(api).mockResolvedValue({ data: invalidData })

      const result = await getTaskById({ projectId, taskId })
      expect(result).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('debe actualizar una tarea exitosamente', async () => {
      const mockResponse = 'updated'
      const formData = { title: 'Updated Task', description: 'Updated' }
      const projectId = 'proj123'
      const taskId = 'task123'

      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateTask({ formData, projectId, taskId })

      expect(result).toBe(mockResponse)
      expect(api.put).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}`, formData)
    })

    it('debe retornar undefined cuando falla la actualización', async () => {
      const formData = { title: 'Updated Task', description: 'Updated' }
      const projectId = 'proj123'
      const taskId = 'task123'
      const errorMessage = 'Update failed'

      vi.mocked(api.put).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await updateTask({ formData, projectId, taskId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en update', async () => {
      const formData = { title: 'Updated Task', description: 'Updated' }
      const projectId = 'proj123'
      const taskId = 'task123'

      vi.mocked(api.put).mockRejectedValue(new Error('Network error'))

      const result = await updateTask({ formData, projectId, taskId })
      expect(result).toBeUndefined()
    })
  })

  describe('deleteTask', () => {
    it('debe eliminar una tarea exitosamente', async () => {
      const mockResponse = 'deleted'
      const projectId = 'proj123'
      const taskId = 'task123'

      vi.mocked(api.delete).mockResolvedValue({ data: mockResponse })

      const result = await deleteTask({ projectId, taskId })

      expect(result).toBe(mockResponse)
      expect(api.delete).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}`)
    })

    it('debe retornar undefined cuando falla la eliminación', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const errorMessage = 'Delete failed'

      vi.mocked(api.delete).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await deleteTask({ projectId, taskId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en delete', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'

      vi.mocked(api.delete).mockRejectedValue(new Error('Network error'))

      const result = await deleteTask({ projectId, taskId })
      expect(result).toBeUndefined()
    })
  })

  describe('updateStatus', () => {
    it('debe actualizar el estado de una tarea exitosamente', async () => {
      const mockResponse = 'status updated'
      const projectId = 'proj123'
      const taskId = 'task123'
      const status = 'in_progress' as const

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await updateStatus({ projectId, taskId, status })

      expect(result).toBe(mockResponse)
      expect(api.post).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}/status`, { status })
    })

    it('debe retornar undefined cuando falla actualizar status', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const status = 'done' as const
      const errorMessage = 'Status update failed'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await updateStatus({ projectId, taskId, status })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en updateStatus', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const status = 'done' as const

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await updateStatus({ projectId, taskId, status })
      expect(result).toBeUndefined()
    })
  })
})
