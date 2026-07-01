jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}))

jest.mock('../infrastructure/models/UserModel', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

jest.mock('../infrastructure/models/ProjectModel', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

jest.mock('../infrastructure/models/TaskModel', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

import { verify } from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import UserModel from '../infrastructure/models/UserModel'
import ProjectModel from '../infrastructure/models/ProjectModel'
import TaskModel from '../infrastructure/models/TaskModel'
import { authenticate } from '../interfaces/middleware/auth'
import { projectExists } from '../interfaces/middleware/project'
import { handleInputErrors } from '../interfaces/middleware/validation'
import { hasAuthorization, taskBelongsToProject, taskExists } from '../interfaces/middleware/task'

const mockExec = (value: unknown) => ({ exec: jest.fn().mockResolvedValue(value) })
const makeRes = () => {
  const res: Record<string, jest.Mock> = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

describe('authenticate', () => {
  const next = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'secret'
  })

  it('returns 401 when header is missing', async () => {
    const res = makeRes()
    await authenticate({ headers: {} } as any, res as any, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('sets req.user and calls next on valid token', async () => {
    ;(verify as jest.Mock).mockReturnValue({ id: 'u1' })
    ;(UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue(mockExec({ id: 'u1', name: 'Ana' })) })
    const req = { headers: { authorization: 'Bearer token' } }
    await authenticate(req as any, makeRes() as any, next)
    expect((req as any).user).toEqual({ id: 'u1', name: 'Ana' })
    expect(next).toHaveBeenCalled()
  })

  it('returns invalid token when user is not found', async () => {
    ;(verify as jest.Mock).mockReturnValue({ id: 'u1' })
    ;(UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue(mockExec(null)) })
    const res = makeRes()
    await authenticate({ headers: { authorization: 'Bearer token' } } as any, res as any, next)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('returns error when verification fails', async () => {
    ;(verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad token')
    })
    const res = makeRes()
    await authenticate({ headers: { authorization: 'Bearer token' } } as any, res as any, next)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('projectExists', () => {
  const next = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('loads project and calls next', async () => {
    ;(ProjectModel.findById as jest.Mock).mockReturnValue(mockExec({ id: 'p1' }))
    const req = { params: { projectId: 'p1' } }
    await projectExists(req as any, makeRes() as any, next)
    expect((req as any).project).toEqual({ id: 'p1' })
    expect(next).toHaveBeenCalled()
  })

  it('returns 404 when project is missing', async () => {
    ;(ProjectModel.findById as jest.Mock).mockReturnValue(mockExec(null))
    const res = makeRes()
    await projectExists({ params: { projectId: 'p1' } } as any, res as any, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('task middleware', () => {
  const next = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('loads task and calls next', async () => {
    ;(TaskModel.findById as jest.Mock).mockReturnValue(mockExec({ id: 't1', project: 'p1' }))
    const req = { params: { taskId: 't1' } }
    await taskExists(req as any, makeRes() as any, next)
    expect((req as any).task).toEqual({ id: 't1', project: 'p1' })
    expect(next).toHaveBeenCalled()
  })

  it('returns 404 when task is missing', async () => {
    ;(TaskModel.findById as jest.Mock).mockReturnValue(mockExec(null))
    const res = makeRes()
    await taskExists({ params: { taskId: 't1' } } as any, res as any, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('validates task ownership and authorization', () => {
    const req = {
      task: { project: { toString: () => 'p1' } },
      project: { id: { toString: () => 'p1' }, manager: { toString: () => 'u1' } },
      user: { id: { toString: () => 'u1' } },
    }
    taskBelongsToProject(req as any, makeRes() as any, next)
    hasAuthorization(req as any, makeRes() as any, next)
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('returns 400 on invalid task ownership and authorization', () => {
    const res = makeRes()
    taskBelongsToProject(
      {
        task: { project: { toString: () => 'p2' } },
        project: { id: { toString: () => 'p1' } },
      } as any,
      res as any,
      next,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    hasAuthorization(
      {
        user: { id: { toString: () => 'u2' } },
        project: { manager: { toString: () => 'u1' } },
      } as any,
      res as any,
      next,
    )
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

describe('handleInputErrors', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls next when no validation errors exist', () => {
    const next = jest.fn()
    ;(validationResult as jest.Mock).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    })
    handleInputErrors(
      {} as any,
      makeRes() as any,
      next,
    )
    expect(next).toHaveBeenCalled()
  })

  it('returns 400 when validation errors exist', () => {
    const res = makeRes()
    ;(validationResult as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'required' }],
    })
    handleInputErrors({} as any, res as any, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'required' }] })
  })
})
