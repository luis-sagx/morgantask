import { ProjectUseCases } from '../application/usecases/ProjectUseCases'
import { IProjectRepository } from '../domain/ports/IProjectRepository'

const mockRepo = (): jest.Mocked<IProjectRepository> => ({
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

const baseProject = {
    _id: 'p1',
    projectName: 'MorganTask',
    clientName: 'Acme',
    description: 'desc',
    tasks: [],
    manager: 'u1',
    team: [],
}

describe('ProjectUseCases', () => {
    let repo: jest.Mocked<IProjectRepository>
    let uc: ProjectUseCases

    beforeEach(() => {
        repo = mockRepo()
        uc = new ProjectUseCases(repo)
    })

    it('create delegates to repository', async () => {
        repo.create.mockResolvedValue(baseProject)
        const result = await uc.create({ projectName: 'MorganTask', clientName: 'Acme', description: 'desc', manager: 'u1' })
        expect(result).toEqual(baseProject)
        expect(repo.create).toHaveBeenCalledTimes(1)
    })

    it('getAll delegates to repository with defaults', async () => {
        repo.findByUser.mockResolvedValue([baseProject])
        const result = await uc.getAll('u1')
        expect(result).toHaveLength(1)
        expect(repo.findByUser).toHaveBeenCalledWith('u1', 20, 0)
    })

    describe('getById', () => {
        it('returns project when user is manager', async () => {
            repo.findByIdWithTasks.mockResolvedValue(baseProject)
            const result = await uc.getById('p1', 'u1')
            expect(result.projectName).toBe('MorganTask')
        })

        it('returns project when user is team member', async () => {
            repo.findByIdWithTasks.mockResolvedValue({ ...baseProject, manager: 'u2', team: ['u1'] })
            const result = await uc.getById('p1', 'u1')
            expect(result).toBeDefined()
        })

        it('throws when project not found', async () => {
            repo.findByIdWithTasks.mockResolvedValue(null)
            await expect(uc.getById('p1', 'u1')).rejects.toThrow('Proyecto no encontrado')
        })

        it('throws when user has no access', async () => {
            repo.findByIdWithTasks.mockResolvedValue({ ...baseProject, manager: 'u2', team: [] })
            await expect(uc.getById('p1', 'u1')).rejects.toThrow('Acción no válida')
        })
    })

    it('update delegates to repository', async () => {
        repo.update.mockResolvedValue(undefined)
        await uc.update('p1', { projectName: 'New', clientName: 'New Client', description: 'new desc' })
        expect(repo.update).toHaveBeenCalledWith('p1', expect.objectContaining({ projectName: 'New' }))
    })

    it('delete delegates to repository', async () => {
        repo.delete.mockResolvedValue(undefined)
        await uc.delete('p1')
        expect(repo.delete).toHaveBeenCalledWith('p1')
    })
})
