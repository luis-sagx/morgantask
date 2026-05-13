import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject, deleteProject, getFullProject, getProjectById, getProjects, updateProject } from './ProjectAPI'

vi.mock('@/lib/axios')

describe('ProjectAPI', () => {
  const axiosErr = (message: string) => ({
    isAxiosError: true,
    response: { data: { error: message } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createProject retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'ok' } as any)
    const result = await createProject({ projectName: 'P', clientName: 'C', description: 'D' })
    expect(result).toBe('ok')
  })

  it('createProject retorna undefined en error no axios', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('x'))
    const result = await createProject({ projectName: 'P', clientName: 'C', description: 'D' })
    expect(result).toBeUndefined()
  })

  it('createProject lanza error cuando axios response existe', async () => {
    vi.mocked(api.post).mockRejectedValue(axiosErr('create failed') as any)
    await expect(createProject({ projectName: 'P', clientName: 'C', description: 'D' })).rejects.toThrow('create failed')
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

  it('getProjects lanza error cuando axios response existe', async () => {
    vi.mocked(api).mockRejectedValue(axiosErr('projects failed') as any)
    await expect(getProjects()).rejects.toThrow('projects failed')
  })

  it('getProjectById retorna data parseada', async () => {
    vi.mocked(api).mockResolvedValue({ data: { projectName: 'P', clientName: 'C', description: 'D' } } as any)
    const result = await getProjectById('1')
    expect(result?.projectName).toBe('P')
  })

  it('getProjectById lanza error cuando axios response existe', async () => {
    vi.mocked(api).mockRejectedValue(axiosErr('project failed') as any)
    await expect(getProjectById('1')).rejects.toThrow('project failed')
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

  it('getFullProject lanza error cuando axios response existe', async () => {
    vi.mocked(api).mockRejectedValue(axiosErr('full project failed') as any)
    await expect(getFullProject('1')).rejects.toThrow('full project failed')
  })

  it('updateProject retorna data', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: 'updated' } as any)
    const result = await updateProject({ projectId: '1', formData: { projectName: 'P2', clientName: 'C', description: 'D' } })
    expect(result).toBe('updated')
  })

  it('updateProject lanza error cuando axios response existe', async () => {
    vi.mocked(api.put).mockRejectedValue(axiosErr('update failed') as any)
    await expect(updateProject({ projectId: '1', formData: { projectName: 'P2', clientName: 'C', description: 'D' } })).rejects.toThrow('update failed')
  })

  it('deleteProject retorna data', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: 'deleted' } as any)
    const result = await deleteProject('1')
    expect(result).toBe('deleted')
  })

  it('deleteProject lanza error cuando axios response existe', async () => {
    vi.mocked(api.delete).mockRejectedValue(axiosErr('delete failed') as any)
    await expect(deleteProject('1')).rejects.toThrow('delete failed')
  })
})
