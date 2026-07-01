jest.mock('../infrastructure/container', () => ({
  authUseCases: {
    createAccount: jest.fn(),
    login: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    checkPassword: jest.fn(),
  },
  projectUseCases: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  taskUseCases: {
    create: jest.fn(),
    getByProject: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
  },
  noteUseCases: {
    create: jest.fn(),
    getByTask: jest.fn(),
    delete: jest.fn(),
  },
  teamUseCases: {
    findMemberByEmail: jest.fn(),
    searchMembers: jest.fn(),
    getTeam: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
  },
  analyticsUseCases: {
    generateProjectReport: jest.fn(),
    getCompletionRate: jest.fn(),
    evaluateCustomMetric: jest.fn(),
  },
}))

import { AnalyticsController } from '../interfaces/controllers/AnalyticsController'
import { AuthController } from '../interfaces/controllers/AuthController'
import { NoteController } from '../interfaces/controllers/NoteController'
import { ProjectController } from '../interfaces/controllers/ProjectController'
import { TaskController } from '../interfaces/controllers/TaskController'
import { TeamMemberController } from '../interfaces/controllers/TeamController'
import {
  analyticsUseCases,
  authUseCases,
  noteUseCases,
  projectUseCases,
  taskUseCases,
  teamUseCases,
} from '../infrastructure/container'

const makeRes = () => {
  const res: Record<string, jest.Mock> = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  res.send.mockReturnValue(res)
  return res
}

const makeReq = (overrides: Record<string, unknown> = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'u1' },
  project: { id: 'p1', manager: 'u1' },
  task: { id: 't1' },
  ...overrides,
})

describe('AuthController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates an account', async () => {
    const req = makeReq({ body: { email: 'ana@test.com' } })
    const res = makeRes()
    await AuthController.createAccount(req as any, res as any)
    expect(authUseCases.createAccount).toHaveBeenCalledWith(req.body)
    expect(res.send).toHaveBeenCalledWith('Cuenta creada correctamente, ya podés iniciar sesión')
  })

  it('returns 409 on duplicated account', async () => {
    ;(authUseCases.createAccount as jest.Mock).mockRejectedValue(new Error('El Usuario ya esta registrado'))
    const res = makeRes()
    await AuthController.createAccount(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('returns 500 on unexpected account creation error', async () => {
    ;(authUseCases.createAccount as jest.Mock).mockRejectedValue(new Error('boom'))
    const res = makeRes()
    await AuthController.createAccount(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('logs in and returns token', async () => {
    ;(authUseCases.login as jest.Mock).mockResolvedValue('jwt')
    const req = makeReq({ body: { email: 'ana@test.com', password: 'secret' } })
    const res = makeRes()
    await AuthController.login(req as any, res as any)
    expect(res.send).toHaveBeenCalledWith('jwt')
  })

  it('returns 404 when user is missing on login', async () => {
    ;(authUseCases.login as jest.Mock).mockRejectedValue(new Error('Usuario no encontrado'))
    const res = makeRes()
    await AuthController.login(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 401 on unexpected login error', async () => {
    ;(authUseCases.login as jest.Mock).mockRejectedValue(new Error('bad credentials'))
    const res = makeRes()
    await AuthController.login(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns current user', async () => {
    const req = makeReq({ user: { id: 'u1', name: 'Ana' } })
    const res = makeRes()
    await AuthController.user(req as any, res as any)
    expect(res.json).toHaveBeenCalledWith(req.user)
  })

  it('updates profile', async () => {
    const req = makeReq({ body: { name: 'Ana 2' } })
    const res = makeRes()
    await AuthController.updateProfile(req as any, res as any)
    expect(authUseCases.updateProfile).toHaveBeenCalledWith('u1', req.body)
    expect(res.send).toHaveBeenCalledWith('Perfil actualizado correctamente')
  })

  it('returns 409 when profile email already exists', async () => {
    ;(authUseCases.updateProfile as jest.Mock).mockRejectedValue(new Error('Ese email ya esta registrado'))
    const res = makeRes()
    await AuthController.updateProfile(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('returns 500 on unexpected profile update error', async () => {
    ;(authUseCases.updateProfile as jest.Mock).mockRejectedValue(new Error('boom'))
    const res = makeRes()
    await AuthController.updateProfile(makeReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('updates password', async () => {
    const req = makeReq({ body: { current_password: 'old', password: 'new' } })
    const res = makeRes()
    await AuthController.updateCurrentUserPassword(req as any, res as any)
    expect(authUseCases.updatePassword).toHaveBeenCalledWith('u1', 'old', 'new')
    expect(res.send).toHaveBeenCalledWith('La contraseña se modificó correctamente')
  })

  it('returns 401 on wrong current password', async () => {
    ;(authUseCases.updatePassword as jest.Mock).mockRejectedValue(new Error('El Contraseña actual es incorrecto'))
    const res = makeRes()
    await AuthController.updateCurrentUserPassword(makeReq({ body: { current_password: 'old', password: 'new' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 500 on unexpected password update error', async () => {
    ;(authUseCases.updatePassword as jest.Mock).mockRejectedValue(new Error('boom'))
    const res = makeRes()
    await AuthController.updateCurrentUserPassword(makeReq({ body: { current_password: 'old', password: 'new' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('checks password', async () => {
    const req = makeReq({ body: { password: 'secret' } })
    const res = makeRes()
    await AuthController.checkPassword(req as any, res as any)
    expect(authUseCases.checkPassword).toHaveBeenCalledWith('u1', 'secret')
    expect(res.send).toHaveBeenCalledWith('Contraseña Correcta')
  })

  it('returns 401 when password check fails', async () => {
    ;(authUseCases.checkPassword as jest.Mock).mockRejectedValue(new Error('invalid'))
    const res = makeRes()
    await AuthController.checkPassword(makeReq({ body: { password: 'bad' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('ProjectController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a project with manager id', async () => {
    ;(projectUseCases.create as jest.Mock).mockResolvedValue({ _id: 'p1' })
    const req = makeReq({ body: { projectName: 'P' } })
    const res = makeRes()
    await ProjectController.createProject(req as any, res as any)
    expect(projectUseCases.create).toHaveBeenCalledWith({ projectName: 'P', manager: 'u1' })
    expect(res.json).toHaveBeenCalledWith({ _id: 'p1' })
  })

  it('gets all projects with parsed pagination', async () => {
    ;(projectUseCases.getAll as jest.Mock).mockResolvedValue([])
    const req = makeReq({ query: { limit: '150', skip: '4' } })
    const res = makeRes()
    await ProjectController.getAllProjects(req as any, res as any)
    expect(projectUseCases.getAll).toHaveBeenCalledWith('u1', 100, 4)
  })

  it('gets project by id', async () => {
    ;(projectUseCases.getById as jest.Mock).mockResolvedValue({ _id: 'p1' })
    const req = makeReq({ params: { id: 'p1' } })
    const res = makeRes()
    await ProjectController.getProjectById(req as any, res as any)
    expect(res.json).toHaveBeenCalledWith({ _id: 'p1' })
  })

  it('returns 404 when project does not exist', async () => {
    ;(projectUseCases.getById as jest.Mock).mockRejectedValue(new Error('Proyecto no encontrado'))
    const req = makeReq({ params: { id: 'p1' } })
    const res = makeRes()
    await ProjectController.getProjectById(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('updates and deletes a project', async () => {
    const req = makeReq({ body: { projectName: 'X' } })
    const res = makeRes()
    await ProjectController.updateProject(req as any, res as any)
    await ProjectController.deleteProject(req as any, res as any)
    expect(projectUseCases.update).toHaveBeenCalledWith('p1', { projectName: 'X' })
    expect(projectUseCases.delete).toHaveBeenCalledWith('p1')
  })
})

describe('TaskController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a task for project', async () => {
    ;(taskUseCases.create as jest.Mock).mockResolvedValue({ _id: 't1' })
    const req = makeReq({ body: { name: 'Task' } })
    const res = makeRes()
    await TaskController.createTask(req as any, res as any)
    expect(taskUseCases.create).toHaveBeenCalledWith({ name: 'Task', projectId: 'p1' })
    expect(res.json).toHaveBeenCalledWith({ _id: 't1' })
  })

  it('gets project tasks and task by id', async () => {
    ;(taskUseCases.getByProject as jest.Mock).mockResolvedValue([{ _id: 't1' }])
    ;(taskUseCases.getById as jest.Mock).mockResolvedValue({ _id: 't1' })
    const req = makeReq()
    const res = makeRes()
    await TaskController.getProjectTasks(req as any, res as any)
    await TaskController.getTaskById(req as any, res as any)
    expect(res.json).toHaveBeenNthCalledWith(1, [{ _id: 't1' }])
    expect(res.json).toHaveBeenNthCalledWith(2, { _id: 't1' })
  })

  it('updates, deletes and changes status', async () => {
    const req = makeReq({ body: { name: 'Updated', status: 'completed' } })
    const res = makeRes()
    await TaskController.updateTask(req as any, res as any)
    await TaskController.deleteTask(req as any, res as any)
    await TaskController.updateStatus(req as any, res as any)
    expect(taskUseCases.update).toHaveBeenCalledWith('t1', { name: 'Updated', status: 'completed' })
    expect(taskUseCases.delete).toHaveBeenCalledWith('t1', 'p1')
    expect(taskUseCases.updateStatus).toHaveBeenCalledWith('t1', 'u1', 'completed')
  })
})

describe('NoteController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates and lists notes', async () => {
    const req = makeReq({ body: { content: 'Hola' } })
    const res = makeRes()
    ;(noteUseCases.getByTask as jest.Mock).mockResolvedValue([{ _id: 'n1' }])
    await NoteController.createNote(req as any, res as any)
    await NoteController.getTaskNotes(req as any, res as any)
    expect(noteUseCases.create).toHaveBeenCalledWith({ content: 'Hola', taskId: 't1', userId: 'u1' })
    expect(res.send).toHaveBeenCalledWith('Nota Creada Correctamente')
    expect(res.json).toHaveBeenCalledWith([{ _id: 'n1' }])
  })

  it('deletes a note', async () => {
    const req = makeReq({ params: { noteId: 'n1' } })
    const res = makeRes()
    await NoteController.deleteNote(req as any, res as any)
    expect(noteUseCases.delete).toHaveBeenCalledWith('n1', 't1', 'u1')
    expect(res.send).toHaveBeenCalledWith('Nota Eliminada')
  })

  it('maps delete errors to status codes', async () => {
    const req = makeReq({ params: { noteId: 'n1' } })
    const res = makeRes()
    ;(noteUseCases.delete as jest.Mock).mockRejectedValueOnce(new Error('Nota no encontrada'))
    await NoteController.deleteNote(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(404)
    ;(noteUseCases.delete as jest.Mock).mockRejectedValueOnce(new Error('Acción no válida'))
    await NoteController.deleteNote(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('TeamMemberController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('finds, searches and lists members', async () => {
    ;(teamUseCases.findMemberByEmail as jest.Mock).mockResolvedValue({ _id: 'u2' })
    ;(teamUseCases.searchMembers as jest.Mock).mockResolvedValue([{ _id: 'u2' }])
    ;(teamUseCases.getTeam as jest.Mock).mockResolvedValue([{ _id: 'u2' }])
    const req = makeReq({ body: { email: 'a@test.com' } })
    const res = makeRes()
    await TeamMemberController.findMemberByEmail(req as any, res as any)
    await TeamMemberController.searchMembers(req as any, res as any)
    await TeamMemberController.getProjecTeam(req as any, res as any)
    expect(res.json).toHaveBeenNthCalledWith(1, { _id: 'u2' })
    expect(res.json).toHaveBeenNthCalledWith(2, [{ _id: 'u2' }])
    expect(res.json).toHaveBeenNthCalledWith(3, [{ _id: 'u2' }])
  })

  it('adds and removes a member', async () => {
    const req = makeReq({ body: { id: 'u2' }, params: { userId: 'u2' } })
    const res = makeRes()
    await TeamMemberController.addMemberById(req as any, res as any)
    await TeamMemberController.removeMemberById(req as any, res as any)
    expect(teamUseCases.addMember).toHaveBeenCalledWith('p1', 'u2')
    expect(teamUseCases.removeMember).toHaveBeenCalledWith('p1', 'u2')
  })

  it('maps member add and remove errors', async () => {
    const req = makeReq({ body: { id: 'u2' }, params: { userId: 'u2' } })
    const res = makeRes()
    ;(teamUseCases.addMember as jest.Mock).mockRejectedValueOnce(new Error('Usuario No Encontrado'))
    await TeamMemberController.addMemberById(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(404)
    ;(teamUseCases.addMember as jest.Mock).mockRejectedValueOnce(new Error('El usuario ya existe en el proyecto'))
    await TeamMemberController.addMemberById(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(409)
    ;(teamUseCases.removeMember as jest.Mock).mockRejectedValueOnce(new Error('El usuario no existe en el proyecto'))
    await TeamMemberController.removeMemberById(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(409)
  })
})

describe('AnalyticsController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns analytics endpoints', async () => {
    ;(analyticsUseCases.generateProjectReport as jest.Mock).mockResolvedValue({ total: 1 })
    ;(analyticsUseCases.getCompletionRate as jest.Mock).mockResolvedValue(75)
    ;(analyticsUseCases.evaluateCustomMetric as jest.Mock).mockResolvedValue(3)
    const req = makeReq({ params: { projectId: 'p1' }, query: { formula: 'done' } })
    const res = makeRes()
    await AnalyticsController.getReport(req as any, res as any)
    await AnalyticsController.getCompletion(req as any, res as any)
    await AnalyticsController.getCustomMetric(req as any, res as any)
    expect(res.json).toHaveBeenNthCalledWith(1, { total: 1 })
    expect(res.json).toHaveBeenNthCalledWith(2, { completionRate: 75 })
    expect(res.json).toHaveBeenNthCalledWith(3, { value: 3 })
  })

  it('handles analytics errors', async () => {
    ;(analyticsUseCases.generateProjectReport as jest.Mock).mockRejectedValue(new Error('boom'))
    const req = makeReq({ params: { projectId: 'p1' } })
    const res = makeRes()
    await AnalyticsController.getReport(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
