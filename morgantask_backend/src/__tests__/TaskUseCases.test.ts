import { TaskUseCases } from '../application/usecases/TaskUseCases'
import { ITaskRepository } from '../domain/ports/ITaskRepository'
import { IProjectRepository } from '../domain/ports/IProjectRepository'

const mockTaskRepo = (): jest.Mocked<ITaskRepository> => ({
    create: jest.fn(),
    findByProject: jest.fn(),
    findById: jest.fn(),
    findByIdWithDetails: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    addNote: jest.fn(),
    removeNote: jest.fn(),
})

const mockProjectRepo = (): jest.Mocked<IProjectRepository> => ({
    create: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    findByIdWithTasks: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addTask: jest.fn(),
    removeTask: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    getTeamPopulated: jest.fn(),
})

const baseTask = {
    _id: 't1',
    name: 'Task 1',
    description: 'desc',
    project: 'p1',
    status: 'pending' as const,
    completedBy: [],
    notes: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
}

describe('TaskUseCases', () => {
    let taskRepo: jest.Mocked<ITaskRepository>
    let projectRepo: jest.Mocked<IProjectRepository>
    let uc: TaskUseCases

    beforeEach(() => {
        taskRepo = mockTaskRepo()
        projectRepo = mockProjectRepo()
        uc = new TaskUseCases(taskRepo, projectRepo)
    })

    it('create saves task and adds it to project', async () => {
        taskRepo.create.mockResolvedValue(baseTask)
        projectRepo.addTask.mockResolvedValue(undefined)
        const result = await uc.create({ name: 'Task 1', description: 'desc', projectId: 'p1' })
        expect(result._id).toBe('t1')
        expect(projectRepo.addTask).toHaveBeenCalledWith('p1', 't1')
    })

    it('getByProject returns tasks', async () => {
        taskRepo.findByProject.mockResolvedValue([baseTask])
        const tasks = await uc.getByProject('p1')
        expect(tasks).toHaveLength(1)
    })

    describe('getById', () => {
        it('returns task when found', async () => {
            taskRepo.findByIdWithDetails.mockResolvedValue(baseTask)
            const task = await uc.getById('t1')
            expect(task.name).toBe('Task 1')
        })

        it('throws when task not found', async () => {
            taskRepo.findByIdWithDetails.mockResolvedValue(null)
            await expect(uc.getById('t1')).rejects.toThrow('Tarea no encontrada')
        })
    })

    it('update delegates to repository', async () => {
        taskRepo.update.mockResolvedValue(undefined)
        await uc.update('t1', { name: 'Updated', description: 'new' })
        expect(taskRepo.update).toHaveBeenCalledWith('t1', { name: 'Updated', description: 'new' })
    })

    it('delete removes task and removes from project', async () => {
        taskRepo.delete.mockResolvedValue(undefined)
        projectRepo.removeTask.mockResolvedValue(undefined)
        await uc.delete('t1', 'p1')
        expect(taskRepo.delete).toHaveBeenCalledWith('t1')
        expect(projectRepo.removeTask).toHaveBeenCalledWith('p1', 't1')
    })

    it('updateStatus delegates to repository', async () => {
        taskRepo.updateStatus.mockResolvedValue(undefined)
        await uc.updateStatus('t1', 'u1', 'completed')
        expect(taskRepo.updateStatus).toHaveBeenCalledWith('t1', 'u1', 'completed')
    })
})
