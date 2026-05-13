import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNote, deleteNote } from './NoteAPI'

vi.mock('@/lib/axios')

describe('NoteAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createNote', () => {
    it('debe crear una nota exitosamente', async () => {
      const mockResponse = 'note123'
      const projectId = 'proj123'
      const taskId = 'task123'
      const formData = { content: 'Test note content' }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createNote({ projectId, taskId, formData })

      expect(result).toBe(mockResponse)
      expect(api.post).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}/notes`, formData)
    })

    it('debe retornar undefined cuando falla la creación de nota', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const formData = { content: 'Test note content' }
      const errorMessage = 'Note creation failed'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await createNote({ projectId, taskId, formData })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en create', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const formData = { content: 'Test note content' }

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await createNote({ projectId, taskId, formData })
      expect(result).toBeUndefined()
    })
  })

  describe('deleteNote', () => {
    it('debe eliminar una nota exitosamente', async () => {
      const mockResponse = 'deleted'
      const projectId = 'proj123'
      const taskId = 'task123'
      const noteId = 'note123'

      vi.mocked(api.delete).mockResolvedValue({ data: mockResponse })

      const result = await deleteNote({ projectId, taskId, noteId })

      expect(result).toBe(mockResponse)
      expect(api.delete).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}/notes/${noteId}`)
    })

    it('debe retornar undefined cuando falla la eliminación de nota', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const noteId = 'note123'
      const errorMessage = 'Note not found'

      vi.mocked(api.delete).mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const result = await deleteNote({ projectId, taskId, noteId })
      expect(result).toBeUndefined()
    })

    it('debe manejar errores sin respuesta en delete', async () => {
      const projectId = 'proj123'
      const taskId = 'task123'
      const noteId = 'note123'

      vi.mocked(api.delete).mockRejectedValue(new Error('Network error'))

      const result = await deleteNote({ projectId, taskId, noteId })
      expect(result).toBeUndefined()
    })
  })
})
