jest.mock('../infrastructure/models/UserModel', () => {
  const UserModel = jest.fn()
  Object.assign(UserModel, {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  })
  return { __esModule: true, default: UserModel }
})

jest.mock('../infrastructure/models/ProjectModel', () => {
  const ProjectModel = jest.fn()
  Object.assign(ProjectModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  })
  return { __esModule: true, default: ProjectModel }
})

jest.mock('../infrastructure/models/TaskModel', () => {
  const TaskModel = jest.fn()
  Object.assign(TaskModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  })
  return { __esModule: true, default: TaskModel }
})

jest.mock('../infrastructure/models/NoteModel', () => {
  const NoteModel = jest.fn()
  Object.assign(NoteModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  })
  return { __esModule: true, default: NoteModel }
})

import NoteModel from '../infrastructure/models/NoteModel'
import ProjectModel from '../infrastructure/models/ProjectModel'
import TaskModel from '../infrastructure/models/TaskModel'
import UserModel from '../infrastructure/models/UserModel'
import { MongoNoteRepository } from '../infrastructure/repositories/MongoNoteRepository'
import { MongoProjectRepository } from '../infrastructure/repositories/MongoProjectRepository'
import { MongoTaskRepository } from '../infrastructure/repositories/MongoTaskRepository'
import { MongoUserRepository } from '../infrastructure/repositories/MongoUserRepository'

const oid = (value: string) => ({ toString: () => value })
const execResult = (value: unknown) => ({ exec: jest.fn().mockResolvedValue(value) })

describe('MongoUserRepository', () => {
  const repo = new MongoUserRepository()

  beforeEach(() => jest.clearAllMocks())

  it('creates and maps a user', async () => {
    const save = jest.fn().mockResolvedValue(undefined)
    ;(UserModel as unknown as jest.Mock).mockImplementation(function Model(this: any, data: any) {
      Object.assign(this, { ...data, id: oid('u1'), save })
    })
    const result = await repo.create({ email: 'ana@test.com', password: 'hash', name: 'Ana', confirmed: true })
    expect(result._id).toBe('u1')
  })

  it('finds user by email and id', async () => {
    const userDoc = { id: oid('u1'), email: 'ana@test.com', password: 'hash', name: 'Ana', confirmed: true }
    ;(UserModel.findOne as jest.Mock).mockReturnValue(execResult(userDoc))
    ;(UserModel.findById as jest.Mock).mockReturnValue(execResult(userDoc))
    expect((await repo.findByEmail('ana@test.com'))?._id).toBe('u1')
    expect((await repo.findById('u1'))?._id).toBe('u1')
  })

  it('returns public variants and null when not found', async () => {
    const publicDoc = { id: oid('u1'), email: 'ana@test.com', name: 'Ana', confirmed: true }
    ;(UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue(execResult(publicDoc)) })
    ;(UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue(execResult(publicDoc)) })
    expect((await repo.findByIdPublic('u1'))?._id).toBe('u1')
    expect((await repo.findByEmailPublic('ana@test.com'))?.email).toBe('ana@test.com')
    ;(UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue(execResult(null)) })
    expect(await repo.findByIdPublic('missing')).toBeNull()
  })

  it('updates and searches members', async () => {
    ;(UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue(execResult(undefined))
    ;(UserModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue(execResult([{ id: oid('u1'), email: 'ana@test.com', name: 'Ana' }])),
    })
    await repo.update('u1', { name: 'Ana 2' })
    const users = await repo.searchMembers({ name: 'Ana' })
    expect(users[0]._id).toBe('u1')
  })
})

describe('MongoProjectRepository', () => {
  const repo = new MongoProjectRepository()
  const baseDoc = {
    id: oid('p1'),
    projectName: 'MorganTask',
    clientName: 'Acme',
    description: 'desc',
    tasks: [oid('t1')],
    manager: oid('u1'),
    team: [oid('u2')],
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates and finds projects', async () => {
    const save = jest.fn().mockResolvedValue(undefined)
    ;(ProjectModel as unknown as jest.Mock).mockImplementation(function Model(this: any, data: any) {
      Object.assign(this, { ...baseDoc, ...data, save })
    })
    ;(ProjectModel.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue(execResult([baseDoc])),
        }),
      }),
    })
    ;(ProjectModel.findById as jest.Mock).mockReturnValue(execResult(baseDoc))
    expect((await repo.create({ projectName: 'MorganTask', clientName: 'Acme', description: 'desc', manager: 'u1' }))._id).toBe('p1')
    expect((await repo.findByUser('u1')).length).toBe(1)
    expect((await repo.findById('p1'))?._id).toBe('p1')
  })

  it('finds project with populated tasks', async () => {
    const populated = {
      ...baseDoc,
      tasks: [{ id: oid('t1'), name: 'Task', description: 'desc', status: 'pending' }],
    }
    ;(ProjectModel.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(execResult(populated)) })
    const project = await repo.findByIdWithTasks('p1')
    expect(project?.tasks).toEqual([{ _id: 't1', name: 'Task', description: 'desc', status: 'pending' }])
  })

  it('updates delete tasks and members', async () => {
    ;(ProjectModel.findByIdAndUpdate as jest.Mock).mockReturnValue(execResult(undefined))
    ;(ProjectModel.findByIdAndDelete as jest.Mock).mockReturnValue(execResult(undefined))
    await repo.update('p1', { projectName: 'X', clientName: 'Y', description: 'Z' })
    await repo.delete('p1')
    await repo.addTask('p1', 't1')
    await repo.removeTask('p1', 't1')
    await repo.addMember('p1', 'u2')
    await repo.removeMember('p1', 'u2')
    expect(ProjectModel.findByIdAndUpdate).toHaveBeenCalledTimes(5)
  })

  it('returns populated team', async () => {
    ;(ProjectModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue(
        execResult({ team: [{ _id: oid('u2'), email: 'ana@test.com', name: 'Ana' }] }),
      ),
    })
    const team = await repo.getTeamPopulated('p1')
    expect(team[0]._id).toBe('u2')
  })
})

describe('MongoTaskRepository', () => {
  const repo = new MongoTaskRepository()
  const baseTask = {
    id: oid('t1'),
    name: 'Task 1',
    description: 'desc',
    project: oid('p1'),
    status: 'pending',
    completedBy: [{ _id: oid('c1'), user: oid('u1'), status: 'pending' }],
    notes: [oid('n1')],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates and finds tasks', async () => {
    const save = jest.fn().mockResolvedValue(undefined)
    ;(TaskModel as unknown as jest.Mock).mockImplementation(function Model(this: any, data: any) {
      Object.assign(this, { ...baseTask, ...data, save })
    })
    ;(TaskModel.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(execResult([baseTask])) })
    ;(TaskModel.findById as jest.Mock).mockReturnValue(execResult(baseTask))
    expect((await repo.create({ name: 'Task 1', description: 'desc', project: 'p1' }))._id).toBe('t1')
    expect((await repo.findByProject('p1')).length).toBe(1)
    expect((await repo.findById('t1'))?.project).toBe('p1')
  })

  it('finds task with populated details', async () => {
    const detailedTask = {
      ...baseTask,
      completedBy: [{ _id: oid('c1'), user: { toJSON: true, _id: oid('u1'), name: 'Ana', email: 'ana@test.com' }, status: 'completed' }],
      notes: [{ _id: oid('n1'), content: 'Hola', createdBy: { _id: oid('u1'), name: 'Ana', email: 'ana@test.com' }, task: oid('t1'), createdAt: '2024-01-01' }],
    }
    ;(TaskModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue(execResult(detailedTask)),
      }),
    })
    const task = await repo.findByIdWithDetails('t1')
    expect(task?.completedBy[0]).toEqual({
      _id: 'c1',
      user: { _id: 'u1', name: 'Ana', email: 'ana@test.com' },
      status: 'completed',
    })
    expect(task?.notes[0]).toEqual({
      _id: 'n1',
      content: 'Hola',
      createdBy: { _id: 'u1', name: 'Ana', email: 'ana@test.com' },
      task: 't1',
      createdAt: '2024-01-01',
    })
  })

  it('updates task state and note membership', async () => {
    ;(TaskModel.findByIdAndUpdate as jest.Mock).mockReturnValue(execResult(undefined))
    ;(TaskModel.findByIdAndDelete as jest.Mock).mockReturnValue(execResult(undefined))
    await repo.update('t1', { name: 'Task 2', description: 'desc 2' })
    await repo.updateStatus('t1', 'u1', 'completed')
    await repo.delete('t1')
    await repo.addNote('t1', 'n1')
    await repo.removeNote('t1', 'n1')
    expect(TaskModel.findByIdAndUpdate).toHaveBeenCalledTimes(4)
  })
})

describe('MongoNoteRepository', () => {
  const repo = new MongoNoteRepository()
  const baseNote = {
    id: oid('n1'),
    content: 'Hola',
    createdBy: oid('u1'),
    task: oid('t1'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates and finds notes', async () => {
    const save = jest.fn().mockResolvedValue(undefined)
    ;(NoteModel as unknown as jest.Mock).mockImplementation(function Model(this: any, data: any) {
      Object.assign(this, { ...baseNote, ...data, save })
    })
    ;(NoteModel.find as jest.Mock).mockReturnValue(execResult([baseNote]))
    ;(NoteModel.findById as jest.Mock).mockReturnValue(execResult(baseNote))
    expect((await repo.create({ content: 'Hola', createdBy: 'u1', task: 't1' }))._id).toBe('n1')
    expect((await repo.findByTask('t1')).length).toBe(1)
    expect((await repo.findById('n1'))?.task).toBe('t1')
  })

  it('returns null and deletes note', async () => {
    ;(NoteModel.findById as jest.Mock).mockReturnValue(execResult(null))
    ;(NoteModel.findByIdAndDelete as jest.Mock).mockReturnValue(execResult(undefined))
    expect(await repo.findById('missing')).toBeNull()
    await repo.delete('n1')
    expect(NoteModel.findByIdAndDelete).toHaveBeenCalledWith('n1')
  })
})
