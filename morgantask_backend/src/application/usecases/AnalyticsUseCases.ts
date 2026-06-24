import { IProject, ITaskProjection } from '../../domain/entities/Project'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'

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
