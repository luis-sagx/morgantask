import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  default: Object.assign(vi.fn(), {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }),
}))

const isAxiosErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/axios', () => apiMock)
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')
  return {
    ...actual,
    isAxiosError: isAxiosErrorMock,
  }
})

import {
  authenticateUser,
  checkPassword,
  createAccount,
  getUser,
} from '@/api/AuthAPI'
import { createNote, deleteNote } from '@/api/NoteAPI'
import { changePassword, updateProfile } from '@/api/ProfileAPI'
import {
  createProject,
  deleteProject,
  getFullProject,
  getProjectById,
  getProjects,
  updateProject,
} from '@/api/ProjectAPI'
import {
  createTask,
  deleteTask,
  getTaskById,
  updateStatus,
  updateTask,
} from '@/api/TaskAPI'
import {
  addUserToProject,
  findUserByEmail,
  getProjectTeam,
  removeUserFromProject,
} from '@/api/TeamAPI'
import {
  dashboardProjectSchema,
  projectSchema,
  taskSchema,
  teamMembersSchema,
  userSchema,
} from '@/types'

const api = apiMock.default

const sampleUser = {
  _id: 'u1',
  name: 'Ana',
  email: 'ana@test.com',
}

const sampleTask = {
  _id: 't1',
  name: 'Task 1',
  description: 'Desc',
  project: 'p1',
  status: 'pending',
  completedBy: [
    {
      _id: 'c1',
      user: sampleUser,
      status: 'pending',
    },
  ],
  notes: [
    {
      _id: 'n1',
      content: 'Hola',
      createdBy: sampleUser,
      task: 't1',
      createdAt: '2024-01-01',
    },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
} as const

const sampleProject = {
  _id: 'p1',
  projectName: 'MorganTask',
  clientName: 'Acme',
  description: 'Desc',
  manager: 'u1',
  tasks: [
    {
      _id: 't1',
      name: 'Task 1',
      description: 'Desc',
      status: 'pending',
    },
  ],
  team: ['u2'],
} as const

const axiosError = (message: string) => ({
  response: { data: { error: message } },
})

describe('frontend api modules and schemas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('parses zod schemas', () => {
    expect(userSchema.parse(sampleUser)._id).toBe('u1')
    expect(taskSchema.parse(sampleTask).notes).toHaveLength(1)
    expect(projectSchema.parse(sampleProject).tasks).toHaveLength(1)
    expect(dashboardProjectSchema.parse([sampleProject])).toHaveLength(1)
    expect(teamMembersSchema.parse([sampleUser])[0].email).toBe('ana@test.com')
  })

  it('covers AuthAPI success paths', async () => {
    api.post.mockResolvedValueOnce({ data: 'Cuenta creada' })
    api.post.mockResolvedValueOnce({ data: 'jwt-token' })
    api.mockResolvedValueOnce({ data: sampleUser })
    api.post.mockResolvedValueOnce({ data: 'Contraseña Correcta' })

    await expect(createAccount({ name: 'Ana', email: 'ana@test.com', password: 'secret123', password_confirmation: 'secret123' })).resolves.toBe('Cuenta creada')
    await expect(authenticateUser({ email: 'ana@test.com', password: 'secret123' })).resolves.toBe('jwt-token')
    await expect(getUser()).resolves.toEqual(sampleUser)
    await expect(checkPassword({ password: 'secret123' })).resolves.toBe('Contraseña Correcta')
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('jwt-token')
  })

  it('covers AuthAPI error paths', async () => {
    isAxiosErrorMock.mockReturnValue(true)
    api.post.mockRejectedValueOnce(axiosError('create error'))
    api.post.mockRejectedValueOnce(axiosError('login error'))
    api.mockRejectedValueOnce(axiosError('user error'))
    api.post.mockRejectedValueOnce(axiosError('password error'))

    await expect(createAccount({ name: 'Ana', email: 'ana@test.com', password: 'secret123', password_confirmation: 'secret123' })).rejects.toThrow('create error')
    await expect(authenticateUser({ email: 'ana@test.com', password: 'secret123' })).rejects.toThrow('login error')
    await expect(getUser()).rejects.toThrow('user error')
    await expect(checkPassword({ password: 'secret123' })).rejects.toThrow('password error')
  })

  it('covers NoteAPI and ProfileAPI', async () => {
    api.post.mockResolvedValueOnce({ data: 'Nota creada' })
    api.delete.mockResolvedValueOnce({ data: 'Nota eliminada' })
    api.put.mockResolvedValueOnce({ data: 'Perfil actualizado' })
    api.post.mockResolvedValueOnce({ data: 'Password actualizado' })

    await expect(createNote({ projectId: 'p1', taskId: 't1', formData: { content: 'Hola' } })).resolves.toBe('Nota creada')
    await expect(deleteNote({ projectId: 'p1', taskId: 't1', noteId: 'n1' })).resolves.toBe('Nota eliminada')
    await expect(updateProfile({ name: 'Ana', email: 'ana@test.com' })).resolves.toBe('Perfil actualizado')
    await expect(changePassword({ current_password: 'old', password: 'secret123', password_confirmation: 'secret123' })).resolves.toBe('Password actualizado')
  })

  it('covers NoteAPI and ProfileAPI error paths', async () => {
    isAxiosErrorMock.mockReturnValue(true)
    api.post.mockRejectedValueOnce(axiosError('note create error'))
    api.delete.mockRejectedValueOnce(axiosError('note delete error'))
    api.put.mockRejectedValueOnce(axiosError('profile error'))
    api.post.mockRejectedValueOnce(axiosError('change password error'))

    await expect(createNote({ projectId: 'p1', taskId: 't1', formData: { content: 'Hola' } })).rejects.toThrow('note create error')
    await expect(deleteNote({ projectId: 'p1', taskId: 't1', noteId: 'n1' })).rejects.toThrow('note delete error')
    await expect(updateProfile({ name: 'Ana', email: 'ana@test.com' })).rejects.toThrow('profile error')
    await expect(changePassword({ current_password: 'old', password: 'secret123', password_confirmation: 'secret123' })).rejects.toThrow('change password error')
  })

  it('covers ProjectAPI success and parse branches', async () => {
    api.post.mockResolvedValueOnce({ data: 'Proyecto creado' })
    api.mockResolvedValueOnce({ data: [sampleProject] })
    api.mockResolvedValueOnce({ data: sampleProject })
    api.mockResolvedValueOnce({ data: sampleProject })
    api.put.mockResolvedValueOnce({ data: 'Proyecto actualizado' })
    api.delete.mockResolvedValueOnce({ data: 'Proyecto eliminado' })

    await expect(createProject({ projectName: 'MorganTask', clientName: 'Acme', description: 'Desc' })).resolves.toBe('Proyecto creado')
    await expect(getProjects()).resolves.toEqual([
      {
        _id: 'p1',
        projectName: 'MorganTask',
        clientName: 'Acme',
        description: 'Desc',
        manager: 'u1',
      },
    ])
    await expect(getProjectById('p1')).resolves.toEqual({
      projectName: 'MorganTask',
      clientName: 'Acme',
      description: 'Desc',
    })
    await expect(getFullProject('p1')).resolves.toEqual(sampleProject)
    await expect(updateProject({ projectId: 'p1', formData: { projectName: 'MorganTask', clientName: 'Acme', description: 'Desc' } })).resolves.toBe('Proyecto actualizado')
    await expect(deleteProject('p1')).resolves.toBe('Proyecto eliminado')
  })

  it('covers TaskAPI and TeamAPI success paths', async () => {
    api.post.mockResolvedValueOnce({ data: 'Tarea creada' })
    api.mockResolvedValueOnce({ data: sampleTask })
    api.put.mockResolvedValueOnce({ data: 'Tarea actualizada' })
    api.delete.mockResolvedValueOnce({ data: 'Tarea eliminada' })
    api.post.mockResolvedValueOnce({ data: 'Estado actualizado' })
    api.post.mockResolvedValueOnce({ data: sampleUser })
    api.post.mockResolvedValueOnce({ data: 'Usuario agregado' })
    api.delete.mockResolvedValueOnce({ data: 'Usuario eliminado' })
    api.mockResolvedValueOnce({ data: [sampleUser] })

    await expect(createTask({ projectId: 'p1', formData: { name: 'Task 1', description: 'Desc' } })).resolves.toBe('Tarea creada')
    await expect(getTaskById({ projectId: 'p1', taskId: 't1' })).resolves.toEqual(sampleTask)
    await expect(updateTask({ projectId: 'p1', taskId: 't1', formData: { name: 'Task 2', description: 'Desc 2' } })).resolves.toBe('Tarea actualizada')
    await expect(deleteTask({ projectId: 'p1', taskId: 't1' })).resolves.toBe('Tarea eliminada')
    await expect(updateStatus({ projectId: 'p1', taskId: 't1', status: 'completed' })).resolves.toBe('Estado actualizado')
    await expect(findUserByEmail({ projectId: 'p1', formData: { email: 'ana@test.com' } })).resolves.toEqual(sampleUser)
    await expect(addUserToProject({ projectId: 'p1', id: 'u1' })).resolves.toBe('Usuario agregado')
    await expect(removeUserFromProject({ projectId: 'p1', userId: 'u1' })).resolves.toBe('Usuario eliminado')
    await expect(getProjectTeam('p1')).resolves.toEqual([sampleUser])
  })

  it('covers ProjectAPI, TaskAPI and TeamAPI error paths', async () => {
    isAxiosErrorMock.mockReturnValue(true)
    api.post.mockRejectedValueOnce(axiosError('project create error'))
    api.mockRejectedValueOnce(axiosError('projects error'))
    api.mockRejectedValueOnce(axiosError('project by id error'))
    api.mockRejectedValueOnce(axiosError('full project error'))
    api.put.mockRejectedValueOnce(axiosError('project update error'))
    api.delete.mockRejectedValueOnce(axiosError('project delete error'))
    api.post.mockRejectedValueOnce(axiosError('task create error'))
    api.mockRejectedValueOnce(axiosError('task by id error'))
    api.put.mockRejectedValueOnce(axiosError('task update error'))
    api.delete.mockRejectedValueOnce(axiosError('task delete error'))
    api.post.mockRejectedValueOnce(axiosError('task status error'))
    api.post.mockRejectedValueOnce(axiosError('find member error'))
    api.post.mockRejectedValueOnce(axiosError('add member error'))
    api.delete.mockRejectedValueOnce(axiosError('remove member error'))
    api.mockRejectedValueOnce(axiosError('team error'))

    await expect(createProject({ projectName: 'MorganTask', clientName: 'Acme', description: 'Desc' })).rejects.toThrow('project create error')
    await expect(getProjects()).rejects.toThrow('projects error')
    await expect(getProjectById('p1')).rejects.toThrow('project by id error')
    await expect(getFullProject('p1')).rejects.toThrow('full project error')
    await expect(updateProject({ projectId: 'p1', formData: { projectName: 'MorganTask', clientName: 'Acme', description: 'Desc' } })).rejects.toThrow('project update error')
    await expect(deleteProject('p1')).rejects.toThrow('project delete error')
    await expect(createTask({ projectId: 'p1', formData: { name: 'Task 1', description: 'Desc' } })).rejects.toThrow('task create error')
    await expect(getTaskById({ projectId: 'p1', taskId: 't1' })).rejects.toThrow('task by id error')
    await expect(updateTask({ projectId: 'p1', taskId: 't1', formData: { name: 'Task 2', description: 'Desc 2' } })).rejects.toThrow('task update error')
    await expect(deleteTask({ projectId: 'p1', taskId: 't1' })).rejects.toThrow('task delete error')
    await expect(updateStatus({ projectId: 'p1', taskId: 't1', status: 'completed' })).rejects.toThrow('task status error')
    await expect(findUserByEmail({ projectId: 'p1', formData: { email: 'ana@test.com' } })).rejects.toThrow('find member error')
    await expect(addUserToProject({ projectId: 'p1', id: 'u1' })).rejects.toThrow('add member error')
    await expect(removeUserFromProject({ projectId: 'p1', userId: 'u1' })).rejects.toThrow('remove member error')
    await expect(getProjectTeam('p1')).rejects.toThrow('team error')
  })

  it('returns undefined when schema safeParse fails', async () => {
    api.mockResolvedValueOnce({ data: { invalid: true } })
    api.mockResolvedValueOnce({ data: { invalid: true } })
    api.mockResolvedValueOnce({ data: { invalid: true } })
    api.mockResolvedValueOnce({ data: [{ invalid: true }] })

    await expect(getUser()).resolves.toBeUndefined()
    await expect(getTaskById({ projectId: 'p1', taskId: 't1' })).resolves.toBeUndefined()
    await expect(getFullProject('p1')).resolves.toBeUndefined()
    await expect(getProjectTeam('p1')).resolves.toBeUndefined()
  })

  it('returns undefined when a non-axios error is caught', async () => {
    isAxiosErrorMock.mockReturnValue(false)
    api.post.mockRejectedValueOnce(new Error('plain error'))
    api.delete.mockRejectedValueOnce(new Error('plain error'))
    api.put.mockRejectedValueOnce(new Error('plain error'))
    api.mockRejectedValueOnce(new Error('plain error'))
    api.post.mockRejectedValueOnce(new Error('plain error'))

    await expect(createNote({ projectId: 'p1', taskId: 't1', formData: { content: 'Hola' } })).resolves.toBeUndefined()
    await expect(deleteProject('p1')).resolves.toBeUndefined()
    await expect(updateTask({ projectId: 'p1', taskId: 't1', formData: { name: 'Task 2', description: 'Desc 2' } })).resolves.toBeUndefined()
    await expect(getProjects()).resolves.toBeUndefined()
    await expect(changePassword({ current_password: 'old', password: 'secret123', password_confirmation: 'secret123' })).resolves.toBeUndefined()
  })
})
