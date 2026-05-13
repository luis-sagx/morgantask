import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject, deleteProject, getFullProject, getProjectById, getProjects, updateProject } from './ProjectAPI'

vi.mock('@/lib/axios')

describe('ProjectAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createProject retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'ok' } as any)
    const result = await createProject({ projectName: 'P', clientName: 'C', description: 'D' })
    expect(result).toBe('ok')
  })

  it('createProject retorna undefined en error', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('x'))
    const result = await createProject({ projectName: 'P', clientName: 'C', description: 'D' })
    expect(result).toBeUndefined()
  })

  it('getProjects retorna data parseada', async () => {
    vi.mocked(api).mockResolvedValue({
      data: [{ _id: '1', projectName: 'P', clientName: 'C', description: 'D', manager: 'u1' }]
    } as any)
    const result = await getProjects()
    expect(result).toHaveLength(1)
  })

  it('getProjects retorna undefined si schema falla', async () => {
    vi.mocked(api).mockResolvedValue({ data: [{ bad: true }] } as any)
    const result = await getProjects()
    expect(result).toBeUndefined()
  })

  it('getProjectById retorna data parseada', async () => {
    vi.mocked(api).mockResolvedValue({
      data: { projectName: 'P', clientName: 'C', description: 'D' }
    } as any)
    const result = await getProjectById('1')
    expect(result?.projectName).toBe('P')
  })

  it('getFullProject retorna data parseada', async () => {
    vi.mocked(api).mockResolvedValue({
      data: {
        _id: '1',
        projectName: 'P',
        clientName: 'C',
        description: 'D',
        manager: 'u1',
        tasks: [],
        team: []
      }
    } as any)
    const result = await getFullProject('1')
    expect(result?._id).toBe('1')
  })

  it('updateProject retorna data', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: 'updated' } as any)
    const result = await updateProject({ projectId: '1', formData: { projectName: 'P2', clientName: 'C', description: 'D' } })
    expect(result).toBe('updated')
  })

  it('deleteProject retorna data', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: 'deleted' } as any)
    const result = await deleteProject('1')
    expect(result).toBe('deleted')
  })
})
