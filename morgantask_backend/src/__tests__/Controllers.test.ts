jest.mock('../infrastructure/container', () => ({
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
    getTeam: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
  },
}))

import { noteUseCases, projectUseCases, taskUseCases, teamUseCases } from '../infrastructure/container'
import { NoteController } from '../interfaces/controllers/NoteController'
import { ProjectController } from '../interfaces/controllers/ProjectController'
import { TaskController } from '../interfaces/controllers/TaskController'
import { TeamMemberController } from '../interfaces/controllers/TeamController'

const createResponse = () => {
  const json = jest.fn()
  const send = jest.fn()
  const status = jest.fn().mockReturnValue({ json, send })

  return { json, send, status }
}

describe('Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ProjectController', () => {
    test('obtiene proyectos usando los parametros de paginacion', async () => {
      const req = {
        query: { limit: '25', skip: '5' },
        user: { id: 'user-1' }
      } as any
      const res = createResponse()
      const projects = [{ _id: 'project-1' }]

      jest.spyOn(projectUseCases, 'getAll').mockResolvedValue(projects as never)

      await ProjectController.getAllProjects(req, res as any)

      expect(projectUseCases.getAll).toHaveBeenCalledWith('user-1', 25, 5)
      expect(res.json).toHaveBeenCalledWith(projects)
    })

    test('retorna 404 si el proyecto no existe', async () => {
      const req = {
        params: { id: 'project-1' },
        user: { id: 'user-1' }
      } as any
      const res = createResponse()

      jest.spyOn(projectUseCases, 'getById').mockRejectedValue(new Error('Proyecto no encontrado'))

      await ProjectController.getProjectById(req, res as any)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.status().json).toHaveBeenCalledWith({ error: 'Proyecto no encontrado' })
    })

    test('actualiza y elimina un proyecto', async () => {
      const updateReq = {
        body: { projectName: 'Nuevo nombre' },
        project: { id: 'project-1' }
      } as any
      const deleteReq = {
        project: { id: 'project-1' }
      } as any
      const updateRes = createResponse()
      const deleteRes = createResponse()

      jest.spyOn(projectUseCases, 'update').mockResolvedValue(undefined)
      jest.spyOn(projectUseCases, 'delete').mockResolvedValue(undefined)

      await ProjectController.updateProject(updateReq, updateRes as any)
      await ProjectController.deleteProject(deleteReq, deleteRes as any)

      expect(projectUseCases.update).toHaveBeenCalledWith('project-1', { projectName: 'Nuevo nombre' })
      expect(updateRes.send).toHaveBeenCalledWith('Proyecto Actualizado')
      expect(projectUseCases.delete).toHaveBeenCalledWith('project-1')
      expect(deleteRes.send).toHaveBeenCalledWith('Proyecto Eliminado')
    })
  })

  describe('TaskController', () => {
    test('crea una tarea dentro de un proyecto', async () => {
      const req = {
        body: { name: 'Nueva tarea', description: 'Desc' },
        project: { id: 'project-1' }
      } as any
      const res = createResponse()
      const task = { _id: 'task-1' }

      jest.spyOn(taskUseCases, 'create').mockResolvedValue(task as never)

      await TaskController.createTask(req, res as any)

      expect(taskUseCases.create).toHaveBeenCalledWith({
        name: 'Nueva tarea',
        description: 'Desc',
        projectId: 'project-1'
      })
      expect(res.json).toHaveBeenCalledWith(task)
    })

    test('elimina y cambia el estado de una tarea', async () => {
      const deleteReq = {
        task: { id: 'task-1' },
        project: { id: 'project-1' }
      } as any
      const statusReq = {
        body: { status: 'completed' },
        task: { id: 'task-1' },
        user: { id: 'user-1' }
      } as any
      const deleteRes = createResponse()
      const statusRes = createResponse()

      jest.spyOn(taskUseCases, 'delete').mockResolvedValue(undefined)
      jest.spyOn(taskUseCases, 'updateStatus').mockResolvedValue(undefined)

      await TaskController.deleteTask(deleteReq, deleteRes as any)
      await TaskController.updateStatus(statusReq, statusRes as any)

      expect(taskUseCases.delete).toHaveBeenCalledWith('task-1', 'project-1')
      expect(deleteRes.send).toHaveBeenCalledWith('Tarea Eliminada Correctamente')
      expect(taskUseCases.updateStatus).toHaveBeenCalledWith('task-1', 'user-1', 'completed')
      expect(statusRes.send).toHaveBeenCalledWith('Tarea Actualizada')
    })
  })

  describe('NoteController', () => {
    test('crea una nota y lista las notas de una tarea', async () => {
      const createReq = {
        body: { content: 'Nueva nota' },
        task: { id: 'task-1' },
        user: { id: 'user-1' }
      } as any
      const listReq = {
        task: { id: 'task-1' }
      } as any
      const createRes = createResponse()
      const listRes = createResponse()
      const notes = [{ _id: 'note-1', content: 'Nueva nota' }]

      jest.spyOn(noteUseCases, 'create').mockResolvedValue(undefined)
      jest.spyOn(noteUseCases, 'getByTask').mockResolvedValue(notes as never)

      await NoteController.createNote(createReq, createRes as any)
      await NoteController.getTaskNotes(listReq, listRes as any)

      expect(noteUseCases.create).toHaveBeenCalledWith({
        content: 'Nueva nota',
        taskId: 'task-1',
        userId: 'user-1'
      })
      expect(createRes.send).toHaveBeenCalledWith('Nota Creada Correctamente')
      expect(listRes.json).toHaveBeenCalledWith(notes)
    })

    test('retorna 401 cuando no tiene permiso para borrar una nota', async () => {
      const req = {
        params: { noteId: 'note-1' },
        task: { id: 'task-1' },
        user: { id: 'user-1' }
      } as any
      const res = createResponse()

      jest.spyOn(noteUseCases, 'delete').mockRejectedValue(new Error('Acción no válida'))

      await NoteController.deleteNote(req, res as any)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.status().json).toHaveBeenCalledWith({ error: 'Acción no válida' })
    })
  })

  describe('TeamMemberController', () => {
    test('busca miembros y devuelve el equipo del proyecto', async () => {
      const findReq = {
        body: { email: 'john@test.com' }
      } as any
      const teamReq = {
        project: { id: 'project-1' }
      } as any
      const findRes = createResponse()
      const teamRes = createResponse()
      const member = { _id: 'user-1', email: 'john@test.com' }
      const team = [member]

      jest.spyOn(teamUseCases, 'findMemberByEmail').mockResolvedValue(member as never)
      jest.spyOn(teamUseCases, 'getTeam').mockResolvedValue(team as never)

      await TeamMemberController.findMemberByEmail(findReq, findRes as any)
      await TeamMemberController.getProjecTeam(teamReq, teamRes as any)

      expect(findRes.json).toHaveBeenCalledWith(member)
      expect(teamUseCases.getTeam).toHaveBeenCalledWith('project-1')
      expect(teamRes.json).toHaveBeenCalledWith(team)
    })

    test('maneja conflicto al agregar y borrar miembros', async () => {
      const addReq = {
        body: { id: 'user-2' },
        project: { id: 'project-1' }
      } as any
      const removeReq = {
        params: { userId: 'user-2' },
        project: { id: 'project-1' }
      } as any
      const addRes = createResponse()
      const removeRes = createResponse()

      jest.spyOn(teamUseCases, 'addMember').mockRejectedValue(new Error('El usuario ya existe en el proyecto'))
      jest.spyOn(teamUseCases, 'removeMember').mockResolvedValue(undefined)

      await TeamMemberController.addMemberById(addReq, addRes as any)
      await TeamMemberController.removeMemberById(removeReq, removeRes as any)

      expect(addRes.status).toHaveBeenCalledWith(409)
      expect(addRes.status().json).toHaveBeenCalledWith({ error: 'El usuario ya existe en el proyecto' })
      expect(teamUseCases.removeMember).toHaveBeenCalledWith('project-1', 'user-2')
      expect(removeRes.send).toHaveBeenCalledWith('Usuario eliminado correctamente')
    })
  })
})
