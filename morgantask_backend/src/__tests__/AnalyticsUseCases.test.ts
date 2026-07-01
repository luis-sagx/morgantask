import { AnalyticsUseCases } from '../application/usecases/AnalyticsUseCases'
import { IProjectRepository } from '../domain/ports/IProjectRepository'
import { ITaskProjection } from '../domain/entities/Project'

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

const makeProject = (tasks: ITaskProjection[], overrides = {}) => ({
    _id: 'p1',
    projectName: 'MorganTask',
    clientName: 'Acme',
    description: 'desc',
    manager: 'John Doe',
    team: ['u1', 'u2'],
    tasks,
    ...overrides,
})

const task = (status: string): ITaskProjection => ({ _id: 't1', name: 'T', description: 'd', status })

describe('AnalyticsUseCases', () => {
    let repo: jest.Mocked<IProjectRepository>
    let uc: AnalyticsUseCases

    beforeEach(() => {
        repo = mockRepo()
        uc = new AnalyticsUseCases(repo)
    })

    describe('getCompletionRate', () => {
        it('returns 0 when no tasks', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([]))
            expect(await uc.getCompletionRate('p1')).toBe(0)
        })

        it('returns 100 when all completed', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('completed'), task('completed')]))
            expect(await uc.getCompletionRate('p1')).toBe(100)
        })

        it('returns 50 when half completed', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('completed'), task('pending')]))
            expect(await uc.getCompletionRate('p1')).toBe(50)
        })
    })

    describe('getManagerSummary', () => {
        it('returns initials for two-word name', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([]))
            const result = await uc.getManagerSummary('p1')
            expect(result.initials).toBe('JD')
        })

        it('handles single-word manager name', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([], { manager: 'John' }))
            const result = await uc.getManagerSummary('p1')
            expect(result.initials).toBe('J')
        })
    })

    describe('evaluateCustomMetric', () => {
        it('returns total', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('pending'), task('completed')]))
            expect(await uc.evaluateCustomMetric('p1', 'total')).toBe(2)
        })

        it('returns done count', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('completed')]))
            expect(await uc.evaluateCustomMetric('p1', 'done')).toBe(1)
        })

        it('returns pending count', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('pending'), task('pending')]))
            expect(await uc.evaluateCustomMetric('p1', 'pending')).toBe(2)
        })

        it('throws for unrecognized formula', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([]))
            await expect(uc.evaluateCustomMetric('p1', 'malicious_code()')).rejects.toThrow('Fórmula no reconocida')
        })
    })

    describe('generateProjectReport', () => {
        it('returns EMPTY health when no tasks', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([]))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('EMPTY')
        })

        it('returns DONE health when all completed', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('completed'), task('completed')]))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('DONE')
        })

        it('returns ALMOST when >75% done and has underReview', async () => {
            // 4/5 = 80% > 75%, with underReview
            const tasks = [task('completed'), task('completed'), task('completed'), task('completed'), task('underReview')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('ALMOST')
        })

        it('returns GOOD when >75% done and no underReview', async () => {
            // 4/5 = 80% > 75%, no underReview
            const tasks = [task('completed'), task('completed'), task('completed'), task('completed'), task('pending')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('GOOD')
        })

        it('returns OK when 40-75% done and inProgress > pending', async () => {
            // 3/6 = 50%, inProgress(2) > pending(1)
            const tasks = [task('completed'), task('completed'), task('completed'), task('inProgress'), task('inProgress'), task('pending')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('OK')
        })

        it('returns STALLED when 40-75% done and onHold > inProgress', async () => {
            // 5/10 = 50%, inProgress(1) not > pending(2) → skip OK, onHold(2) > inProgress(1) → STALLED
            const tasks = Array(5).fill(null).map(() => task('completed'))
                .concat([task('onHold'), task('onHold'), task('inProgress'), task('pending'), task('pending')])
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('STALLED')
        })

        it('returns SLOW when 40-75% done otherwise', async () => {
            // 3/6 = 50%, inProgress(1) <= pending(2), onHold(0) <= inProgress(1)
            const tasks = [task('completed'), task('completed'), task('completed'), task('pending'), task('pending'), task('inProgress')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('SLOW')
        })

        it('returns AT_RISK when <40% done and pending > half', async () => {
            // 1/4 = 25%, pending(3) > 4/2=2
            const tasks = [task('completed'), task('pending'), task('pending'), task('pending')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('AT_RISK')
        })

        it('returns BLOCKED when <40% done and onHold exists', async () => {
            // 1/5 = 20%, pending(1) <= 5/2=2.5, onHold(2)>0
            const tasks = [task('completed'), task('onHold'), task('onHold'), task('inProgress'), task('pending')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('BLOCKED')
        })

        it('returns STARTING when <40% done otherwise', async () => {
            // 1/3 = 33%, pending(0) <= 3/2, onHold(0)=0
            const tasks = [task('completed'), task('inProgress'), task('inProgress')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.health).toBe('STARTING')
        })

        it('counts unknown status', async () => {
            const tasks = [task('completed'), task('unknownStatus')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            const r = await uc.generateProjectReport('p1')
            expect(r.unknown).toBe(1)
        })

        it('throws when project has no name', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([], { projectName: '' }))
            await expect(uc.generateProjectReport('p1')).rejects.toThrow('Proyecto sin nombre')
        })

        it('throws when project has no client', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([], { clientName: '' }))
            await expect(uc.generateProjectReport('p1')).rejects.toThrow('Proyecto sin cliente')
        })
    })

    describe('generateExecutiveReport', () => {
        it('returns progress and members', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('completed'), task('pending')]))
            const r = await uc.generateExecutiveReport('p1')
            expect(r.progress).toBe(50)
            expect(r.members).toBe(2)
            expect(r.title).toBe('MorganTask')
        })
    })

    describe('getRiskScore', () => {
        it('returns ratio when completed > 0', async () => {
            const tasks = [task('pending'), task('pending'), task('completed')]
            repo.findByIdWithTasks.mockResolvedValue(makeProject(tasks))
            expect(await uc.getRiskScore('p1')).toBeCloseTo(200)
        })

        it('returns 100 when completed=0 and pending>0', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([task('pending')]))
            expect(await uc.getRiskScore('p1')).toBe(100)
        })

        it('returns 0 when no tasks at all', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([]))
            expect(await uc.getRiskScore('p1')).toBe(0)
        })

        it('throws when project has no name', async () => {
            repo.findByIdWithTasks.mockResolvedValue(makeProject([], { projectName: '' }))
            await expect(uc.getRiskScore('p1')).rejects.toThrow('Proyecto sin nombre')
        })
    })

    describe('getTaskPage', () => {
        const tasks = [task('pending'), task('inProgress'), task('completed')]

        it('returns first N tasks', () => {
            expect(uc.getTaskPage(tasks, 2)).toHaveLength(2)
        })

        it('does not exceed tasks array length', () => {
            expect(uc.getTaskPage(tasks, 10)).toHaveLength(3)
        })

        it('returns empty when pageSize is 0', () => {
            expect(uc.getTaskPage(tasks, 0)).toHaveLength(0)
        })
    })

    describe('evaluateProjectStatus', () => {
        const base = { total: 10, pending: 0, inProgress: 0, onHold: 0, underReview: 0, completed: 0, blocked: 0, overdue: 0, team: 3 }

        it('NO_DATA when total=0', () => {
            expect(uc.evaluateProjectStatus({ ...base, total: 0 })).toBe('NO_DATA')
        })

        it('CRITICAL when blocked and overdue', () => {
            expect(uc.evaluateProjectStatus({ ...base, blocked: 1, overdue: 1 })).toBe('CRITICAL')
        })

        it('CRITICAL when overdue > half total', () => {
            expect(uc.evaluateProjectStatus({ ...base, overdue: 6 })).toBe('CRITICAL')
        })

        it('CLOSED when all completed', () => {
            expect(uc.evaluateProjectStatus({ ...base, completed: 10 })).toBe('CLOSED')
        })

        it('REVIEW_HEAVY when inProgress>0 pending=0 and underReview > inProgress', () => {
            expect(uc.evaluateProjectStatus({ ...base, inProgress: 2, underReview: 5 })).toBe('REVIEW_HEAVY')
        })

        it('ON_TRACK when inProgress>0 and pending=0', () => {
            expect(uc.evaluateProjectStatus({ ...base, inProgress: 3 })).toBe('ON_TRACK')
        })

        it('UNDERSTAFFED when pending>inProgress blocked=0 and team<2', () => {
            expect(uc.evaluateProjectStatus({ ...base, pending: 5, team: 1 })).toBe('UNDERSTAFFED')
        })

        it('BACKLOGGED when pending > 70% total', () => {
            expect(uc.evaluateProjectStatus({ ...base, pending: 8 })).toBe('BACKLOGGED')
        })

        it('SLOW when pending>inProgress blocked=0', () => {
            expect(uc.evaluateProjectStatus({ ...base, pending: 4, inProgress: 2 })).toBe('SLOW')
        })

        it('BLOCKED when blocked > onHold', () => {
            expect(uc.evaluateProjectStatus({ ...base, blocked: 3, onHold: 1 })).toBe('BLOCKED')
        })

        it('STALLED when onHold > team', () => {
            expect(uc.evaluateProjectStatus({ ...base, onHold: 5, team: 3 })).toBe('STALLED')
        })

        it('PAUSED when onHold exists and onHold <= team', () => {
            expect(uc.evaluateProjectStatus({ ...base, onHold: 2, team: 3 })).toBe('PAUSED')
        })

        it('WRAPPING_UP when underReview and completed > pending', () => {
            // pending=0, inProgress=0 to avoid the "pending>inProgress" branch
            expect(uc.evaluateProjectStatus({ ...base, underReview: 1, completed: 5, pending: 0, inProgress: 0 })).toBe('WRAPPING_UP')
        })

        it('PROGRESSING when completed > 40%', () => {
            expect(uc.evaluateProjectStatus({ ...base, completed: 5 })).toBe('PROGRESSING')
        })

        it('OVERSTAFFED when team>5 and total < team', () => {
            expect(uc.evaluateProjectStatus({ ...base, total: 4, team: 8 })).toBe('OVERSTAFFED')
        })

        it('UNKNOWN otherwise', () => {
            expect(uc.evaluateProjectStatus({ ...base, total: 10, team: 3 })).toBe('UNKNOWN')
        })
    })

    describe('recommendStaffing', () => {
        const base = { total: 10, pending: 2, inProgress: 2, onHold: 0, underReview: 0, completed: 4, blocked: 0, overdue: 0, team: 3 }

        it('IDLE when total=0', () => {
            expect(uc.recommendStaffing({ ...base, total: 0, pending: 0, inProgress: 0 })).toBe('IDLE')
        })

        it('NEEDS_TEAM when team=0', () => {
            expect(uc.recommendStaffing({ ...base, team: 0 })).toBe('NEEDS_TEAM')
        })

        it('URGENT_HIRE when load > team*5 and overdue>0', () => {
            expect(uc.recommendStaffing({ ...base, pending: 20, inProgress: 10, overdue: 1, team: 2 })).toBe('URGENT_HIRE')
        })

        it('HIRE when load > team*5', () => {
            expect(uc.recommendStaffing({ ...base, pending: 20, inProgress: 10, team: 2 })).toBe('HIRE')
        })

        it('UNBLOCK when blocked > team', () => {
            expect(uc.recommendStaffing({ ...base, blocked: 5, team: 3 })).toBe('UNBLOCK')
        })

        it('SCALE_DOWN when completed > load and underReview=0 and team>3', () => {
            expect(uc.recommendStaffing({ ...base, completed: 8, pending: 1, inProgress: 1, team: 5 })).toBe('SCALE_DOWN')
        })

        it('MAINTAIN when completed > load and underReview=0 and team<=3', () => {
            expect(uc.recommendStaffing({ ...base, completed: 8, pending: 1, inProgress: 1, team: 3 })).toBe('MAINTAIN')
        })

        it('OVERLOADED when inProgress > team*2', () => {
            expect(uc.recommendStaffing({ ...base, inProgress: 10, team: 3 })).toBe('OVERLOADED')
        })

        it('ADD_JUNIOR when pending > completed and team < 3', () => {
            expect(uc.recommendStaffing({ ...base, pending: 6, completed: 2, team: 2 })).toBe('ADD_JUNIOR')
        })

        it('ADD_REVIEWER when underReview > team', () => {
            expect(uc.recommendStaffing({ ...base, underReview: 5, team: 3 })).toBe('ADD_REVIEWER')
        })

        it('REPRIORITIZE when overdue > 25% or blocked > 0', () => {
            expect(uc.recommendStaffing({ ...base, overdue: 4 })).toBe('REPRIORITIZE')
        })

        it('RESUME when onHold > 0 and inProgress=0', () => {
            // completed=0 so MAINTAIN/SCALE_DOWN condition (completed > load) fails
            expect(uc.recommendStaffing({ ...base, onHold: 2, inProgress: 0, pending: 0, completed: 0 })).toBe('RESUME')
        })

        it('KICKOFF when completed=0 and total>5', () => {
            expect(uc.recommendStaffing({ ...base, completed: 0, pending: 3, inProgress: 0 })).toBe('KICKOFF')
        })

        it('BALANCED otherwise', () => {
            expect(uc.recommendStaffing({ ...base })).toBe('BALANCED')
        })
    })

    describe('buildBurndownPages', () => {
        it('returns pages for even total', () => {
            expect(uc.buildBurndownPages(6)).toEqual([0, 2, 4])
        })

        it('returns pages for odd total without infinite loop', () => {
            expect(uc.buildBurndownPages(5)).toEqual([0, 2, 4])
        })

        it('returns empty for 0', () => {
            expect(uc.buildBurndownPages(0)).toEqual([])
        })
    })
})
