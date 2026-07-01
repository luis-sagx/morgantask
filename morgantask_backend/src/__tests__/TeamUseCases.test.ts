import { TeamUseCases } from '../application/usecases/TeamUseCases'
import { IProjectRepository } from '../domain/ports/IProjectRepository'
import { IUserRepository } from '../domain/ports/IUserRepository'

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

const mockUserRepo = (): jest.Mocked<IUserRepository> => ({
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIdPublic: jest.fn(),
    findByEmailPublic: jest.fn(),
    update: jest.fn(),
    searchMembers: jest.fn(),
})

const publicUser = { _id: 'u1', email: 'a@a.com', name: 'Ana' }
const project = { _id: 'p1', projectName: 'P', clientName: 'C', description: 'd', tasks: [], manager: 'u2', team: [] }

describe('TeamUseCases', () => {
    let projectRepo: jest.Mocked<IProjectRepository>
    let userRepo: jest.Mocked<IUserRepository>
    let uc: TeamUseCases

    beforeEach(() => {
        projectRepo = mockProjectRepo()
        userRepo = mockUserRepo()
        uc = new TeamUseCases(projectRepo, userRepo)
    })

    describe('findMemberByEmail', () => {
        it('returns user when found', async () => {
            userRepo.findByEmailPublic.mockResolvedValue(publicUser)
            const result = await uc.findMemberByEmail('a@a.com')
            expect(result.email).toBe('a@a.com')
        })

        it('throws when user not found', async () => {
            userRepo.findByEmailPublic.mockResolvedValue(null)
            await expect(uc.findMemberByEmail('x@x.com')).rejects.toThrow('Usuario No Encontrado')
        })
    })

    it('searchMembers delegates to repository', async () => {
        userRepo.searchMembers.mockResolvedValue([publicUser])
        const result = await uc.searchMembers({ name: 'Ana' })
        expect(result).toHaveLength(1)
    })

    it('getTeam returns populated team', async () => {
        projectRepo.getTeamPopulated.mockResolvedValue([publicUser])
        const result = await uc.getTeam('p1')
        expect(result).toHaveLength(1)
    })

    describe('addMember', () => {
        it('adds member when user exists and not in team', async () => {
            userRepo.findByIdPublic.mockResolvedValue(publicUser)
            projectRepo.findById.mockResolvedValue(project)
            projectRepo.addMember.mockResolvedValue(undefined)
            await uc.addMember('p1', 'u1')
            expect(projectRepo.addMember).toHaveBeenCalledWith('p1', 'u1')
        })

        it('throws when user not found', async () => {
            userRepo.findByIdPublic.mockResolvedValue(null)
            await expect(uc.addMember('p1', 'u1')).rejects.toThrow('Usuario No Encontrado')
        })

        it('throws when user already in team', async () => {
            userRepo.findByIdPublic.mockResolvedValue(publicUser)
            projectRepo.findById.mockResolvedValue({ ...project, team: ['u1'] })
            await expect(uc.addMember('p1', 'u1')).rejects.toThrow('El usuario ya existe en el proyecto')
        })
    })

    describe('removeMember', () => {
        it('removes member when user is in team', async () => {
            projectRepo.findById.mockResolvedValue({ ...project, team: ['u1'] })
            projectRepo.removeMember.mockResolvedValue(undefined)
            await uc.removeMember('p1', 'u1')
            expect(projectRepo.removeMember).toHaveBeenCalledWith('p1', 'u1')
        })

        it('throws when user not in team', async () => {
            projectRepo.findById.mockResolvedValue(project)
            await expect(uc.removeMember('p1', 'u99')).rejects.toThrow('El usuario no existe en el proyecto')
        })
    })
})
