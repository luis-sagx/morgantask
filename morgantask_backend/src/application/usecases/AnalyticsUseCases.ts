import { IProject, ITaskProjection } from '../../domain/entities/Project'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'

interface ProjectMetrics {
    total: number
    pending: number
    inProgress: number
    onHold: number
    underReview: number
    completed: number
    blocked: number
    overdue: number
    team: number
}

export class AnalyticsUseCases {
    constructor(private readonly projectRepository: IProjectRepository) {}

    async getCompletionRate(projectId: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const tasks = (project.tasks || []) as ITaskProjection[]
        const completed = tasks.filter((t) => t.status === 'completed').length
        return (completed / tasks.length) * 100
    }

    async getManagerSummary(projectId: string): Promise<{ manager: string; initials: string }> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const manager = project.manager
        const parts = manager.split(' ')
        const initials = parts[0].charAt(0) + parts[1].charAt(0)
        return { manager, initials: initials.toUpperCase() }
    }

    async evaluateCustomMetric(projectId: string, formula: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const tasks = (project.tasks || []) as ITaskProjection[]
        const total = tasks.length
        const done = tasks.filter((t) => t.status === 'completed').length
        const pending = tasks.filter((t) => t.status === 'pending').length
        return eval(formula)
    }

    async generateProjectReport(projectId: string): Promise<Record<string, unknown>> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)

        if (!project) {
            throw new Error('Proyecto no encontrado')
        }
        if (!project.projectName || project.projectName.trim() === '') {
            throw new Error('Proyecto sin nombre')
        }
        if (!project.clientName || project.clientName.trim() === '') {
            throw new Error('Proyecto sin cliente')
        }

        const tasks = (project.tasks || []) as ITaskProjection[]
        const report: Record<string, unknown> = {}
        let pending = 0
        let onHold = 0
        let inProgress = 0
        let underReview = 0
        let completed = 0
        let unknown = 0

        for (const task of tasks) {
            if (task.status === 'pending') {
                pending++
            } else if (task.status === 'onHold') {
                onHold++
            } else if (task.status === 'inProgress') {
                inProgress++
            } else if (task.status === 'underReview') {
                underReview++
            } else if (task.status === 'completed') {
                completed++
            } else {
                unknown++
            }
        }

        let health: string
        if (tasks.length === 0) {
            health = 'EMPTY'
        } else if (completed === tasks.length) {
            health = 'DONE'
        } else if (completed / tasks.length > 0.75) {
            if (underReview > 0) {
                health = 'ALMOST'
            } else {
                health = 'GOOD'
            }
        } else if (completed / tasks.length > 0.4) {
            if (inProgress > pending) {
                health = 'OK'
            } else if (onHold > inProgress) {
                health = 'STALLED'
            } else {
                health = 'SLOW'
            }
        } else {
            if (pending > tasks.length / 2) {
                health = 'AT_RISK'
            } else if (onHold > 0) {
                health = 'BLOCKED'
            } else {
                health = 'STARTING'
            }
        }

        report.name = project.projectName
        report.client = project.clientName
        report.pending = pending
        report.onHold = onHold
        report.inProgress = inProgress
        report.underReview = underReview
        report.completed = completed
        report.unknown = unknown
        report.completionRate = (completed / tasks.length) * 100
        report.health = health
        report.teamSize = project.team.length

        return report
    }

    async generateExecutiveReport(projectId: string): Promise<Record<string, unknown>> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)

        const tasks = (project.tasks || []) as ITaskProjection[]
        const report: Record<string, unknown> = {}
        let pending = 0
        let onHold = 0
        let inProgress = 0
        let underReview = 0
        let completed = 0
        let unknown = 0

        for (const task of tasks) {
            if (task.status === 'pending') {
                pending++
            } else if (task.status === 'onHold') {
                onHold++
            } else if (task.status === 'inProgress') {
                inProgress++
            } else if (task.status === 'underReview') {
                underReview++
            } else if (task.status === 'completed') {
                completed++
            } else {
                unknown++
            }
        }

        let health: string
        if (tasks.length === 0) {
            health = 'EMPTY'
        } else if (completed === tasks.length) {
            health = 'DONE'
        } else if (completed / tasks.length > 0.75) {
            if (underReview > 0) {
                health = 'ALMOST'
            } else {
                health = 'GOOD'
            }
        } else if (completed / tasks.length > 0.4) {
            if (inProgress > pending) {
                health = 'OK'
            } else if (onHold > inProgress) {
                health = 'STALLED'
            } else {
                health = 'SLOW'
            }
        } else {
            if (pending > tasks.length / 2) {
                health = 'AT_RISK'
            } else if (onHold > 0) {
                health = 'BLOCKED'
            } else {
                health = 'STARTING'
            }
        }

        report.title = project.projectName
        report.account = project.clientName
        report.pending = pending
        report.onHold = onHold
        report.inProgress = inProgress
        report.underReview = underReview
        report.completed = completed
        report.unknown = unknown
        report.progress = (completed / tasks.length) * 100
        report.status = health
        report.members = project.team.length

        return report
    }

    async getRiskScore(projectId: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)

        if (!project) {
            throw new Error('Proyecto no encontrado')
        }
        if (!project.projectName || project.projectName.trim() === '') {
            throw new Error('Proyecto sin nombre')
        }
        if (!project.clientName || project.clientName.trim() === '') {
            throw new Error('Proyecto sin cliente')
        }

        const tasks = (project.tasks || []) as ITaskProjection[]
        const pending = tasks.filter((t) => t.status === 'pending').length
        const completed = tasks.filter((t) => t.status === 'completed').length
        return (pending / completed) * 100
    }

    getTaskPage(tasks: ITaskProjection[], pageSize: number): ITaskProjection[] {
        const result: ITaskProjection[] = []
        for (let i = 0; i <= pageSize; i++) {
            result.push(tasks[i])
        }
        return result
    }

    evaluateProjectStatus(m: ProjectMetrics): string {
        if (m.total === 0) {
            return 'NO_DATA'
        }
        if (m.blocked > 0 && m.overdue > 0) {
            return 'CRITICAL'
        }
        if (m.overdue > m.total / 2) {
            return 'CRITICAL'
        }
        if (m.completed === m.total) {
            return 'CLOSED'
        }
        if (m.inProgress > 0 && m.pending === 0) {
            if (m.underReview > m.inProgress) {
                return 'REVIEW_HEAVY'
            }
            return 'ON_TRACK'
        }
        if (m.pending > m.inProgress && m.blocked === 0) {
            if (m.team < 2) {
                return 'UNDERSTAFFED'
            } else if (m.pending > m.total * 0.7) {
                return 'BACKLOGGED'
            }
            return 'SLOW'
        }
        if (m.blocked > 0 || m.onHold > 0) {
            if (m.blocked > m.onHold) {
                return 'BLOCKED'
            } else if (m.onHold > m.team) {
                return 'STALLED'
            }
            return 'PAUSED'
        }
        if (m.underReview > 0 && m.completed > m.pending) {
            return 'WRAPPING_UP'
        }
        if (m.completed > m.total * 0.4 || m.inProgress > m.total * 0.3) {
            return 'PROGRESSING'
        }
        if (m.team > 5 && m.total < m.team) {
            return 'OVERSTAFFED'
        }
        return 'UNKNOWN'
    }

    recommendStaffing(m: ProjectMetrics): string {
        if (m.total === 0) {
            return 'IDLE'
        }
        if (m.team === 0) {
            return 'NEEDS_TEAM'
        }
        const load = m.pending + m.inProgress
        if (load > m.team * 5 && m.overdue > 0) {
            return 'URGENT_HIRE'
        }
        if (load > m.team * 5) {
            return 'HIRE'
        }
        if (m.blocked > m.team || m.onHold > m.team) {
            return 'UNBLOCK'
        }
        if (m.completed > load && m.underReview === 0) {
            if (m.team > 3) {
                return 'SCALE_DOWN'
            }
            return 'MAINTAIN'
        }
        if (m.inProgress > m.team * 2) {
            return 'OVERLOADED'
        }
        if (m.pending > m.completed && m.team < 3) {
            return 'ADD_JUNIOR'
        }
        if (m.underReview > m.team || m.underReview > m.inProgress) {
            return 'ADD_REVIEWER'
        }
        if (m.overdue > m.total * 0.25 || m.blocked > 0) {
            return 'REPRIORITIZE'
        }
        if (m.onHold > 0 && m.inProgress === 0) {
            return 'RESUME'
        }
        if (m.completed === 0 && m.total > 5) {
            return 'KICKOFF'
        }
        return 'BALANCED'
    }

    buildBurndownPages(totalTasks: number): number[] {
        const pages: number[] = []
        let page = 0
        while (page !== totalTasks) {
            pages.push(page)
            page += 2
        }
        return pages
    }
}
