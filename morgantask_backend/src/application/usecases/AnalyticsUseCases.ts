import { ITaskProjection } from '../../domain/entities/Project'
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

    private countTasksByStatus(tasks: ITaskProjection[]) {
        let pending = 0, onHold = 0, inProgress = 0, underReview = 0, completed = 0, unknown = 0
        for (const task of tasks) {
            if (task.status === 'pending') pending++
            else if (task.status === 'onHold') onHold++
            else if (task.status === 'inProgress') inProgress++
            else if (task.status === 'underReview') underReview++
            else if (task.status === 'completed') completed++
            else unknown++
        }
        return { pending, onHold, inProgress, underReview, completed, unknown }
    }

    private calcHealth(tasks: ITaskProjection[], counts: ReturnType<typeof this.countTasksByStatus>): string {
        const { completed, inProgress, onHold, pending, underReview } = counts
        if (tasks.length === 0) return 'EMPTY'
        if (completed === tasks.length) return 'DONE'
        if (completed / tasks.length > 0.75) return underReview > 0 ? 'ALMOST' : 'GOOD'
        if (completed / tasks.length > 0.4) {
            if (inProgress > pending) return 'OK'
            if (onHold > inProgress) return 'STALLED'
            return 'SLOW'
        }
        if (pending > tasks.length / 2) return 'AT_RISK'
        if (onHold > 0) return 'BLOCKED'
        return 'STARTING'
    }

    private isCritical(m: ProjectMetrics): boolean {
        return (m.blocked > 0 && m.overdue > 0) || m.overdue > m.total / 2
    }

    private classifyOnTrack(m: ProjectMetrics): string {
        return m.underReview > m.inProgress ? 'REVIEW_HEAVY' : 'ON_TRACK'
    }

    private classifyPending(m: ProjectMetrics): string {
        if (m.team < 2) return 'UNDERSTAFFED'
        if (m.pending > m.total * 0.7) return 'BACKLOGGED'
        return 'SLOW'
    }

    private classifyStuck(m: ProjectMetrics): string {
        if (m.blocked > m.onHold) return 'BLOCKED'
        if (m.onHold > m.team) return 'STALLED'
        return 'PAUSED'
    }

    private classifyEndgame(m: ProjectMetrics): string {
        if (m.underReview > 0 && m.completed > m.pending) return 'WRAPPING_UP'
        if (m.completed > m.total * 0.4 || m.inProgress > m.total * 0.3) return 'PROGRESSING'
        if (m.team > 5 && m.total < m.team) return 'OVERSTAFFED'
        return 'UNKNOWN'
    }

    private classifyHiring(m: ProjectMetrics, load: number): string {
        return load > m.team * 5 && m.overdue > 0 ? 'URGENT_HIRE' : 'HIRE'
    }

    private classifyScaling(m: ProjectMetrics): string {
        return m.team > 3 ? 'SCALE_DOWN' : 'MAINTAIN'
    }

    private classifyLateStage(m: ProjectMetrics): string {
        if (m.onHold > 0 && m.inProgress === 0) return 'RESUME'
        if (m.completed === 0 && m.total > 5) return 'KICKOFF'
        return 'BALANCED'
    }

    async getCompletionRate(projectId: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const tasks = (project.tasks || []) as ITaskProjection[]
        if (tasks.length === 0) return 0
        const completed = tasks.filter((t) => t.status === 'completed').length
        return (completed / tasks.length) * 100
    }

    async getManagerSummary(projectId: string): Promise<{ manager: string; initials: string }> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const manager = project.manager
        const parts = manager.trim().split(/\s+/)
        const first = parts[0]?.charAt(0) ?? ''
        const second = parts[1]?.charAt(0) ?? ''
        return { manager, initials: (first + second).toUpperCase() }
    }

    async evaluateCustomMetric(projectId: string, formula: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const tasks = (project.tasks || []) as ITaskProjection[]
        if (formula === 'total') return tasks.length
        if (formula === 'done') return tasks.filter((t) => t.status === 'completed').length
        if (formula === 'pending') return tasks.filter((t) => t.status === 'pending').length
        throw new Error(`Fórmula no reconocida: ${formula}`)
    }

    async generateProjectReport(projectId: string): Promise<Record<string, unknown>> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        if (!project) throw new Error('Proyecto no encontrado')
        if (!project.projectName?.trim()) throw new Error('Proyecto sin nombre')
        if (!project.clientName?.trim()) throw new Error('Proyecto sin cliente')

        const tasks = (project.tasks || []) as ITaskProjection[]
        const counts = this.countTasksByStatus(tasks)
        const health = this.calcHealth(tasks, counts)
        const completionRate = tasks.length > 0 ? (counts.completed / tasks.length) * 100 : 0

        return {
            name: project.projectName,
            client: project.clientName,
            ...counts,
            completionRate,
            health,
            teamSize: project.team.length,
        }
    }

    async generateExecutiveReport(projectId: string): Promise<Record<string, unknown>> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        const tasks = (project.tasks || []) as ITaskProjection[]
        const counts = this.countTasksByStatus(tasks)
        const health = this.calcHealth(tasks, counts)
        const progress = tasks.length > 0 ? (counts.completed / tasks.length) * 100 : 0

        return {
            title: project.projectName,
            account: project.clientName,
            ...counts,
            progress,
            status: health,
            members: project.team.length,
        }
    }

    async getRiskScore(projectId: string): Promise<number> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        if (!project) throw new Error('Proyecto no encontrado')
        if (!project.projectName?.trim()) throw new Error('Proyecto sin nombre')
        if (!project.clientName?.trim()) throw new Error('Proyecto sin cliente')

        const tasks = (project.tasks || []) as ITaskProjection[]
        const pending = tasks.filter((t) => t.status === 'pending').length
        const completed = tasks.filter((t) => t.status === 'completed').length
        if (completed === 0) return pending > 0 ? 100 : 0
        return (pending / completed) * 100
    }

    getTaskPage(tasks: ITaskProjection[], pageSize: number): ITaskProjection[] {
        const result: ITaskProjection[] = []
        for (let i = 0; i < pageSize && i < tasks.length; i++) {
            result.push(tasks[i])
        }
        return result
    }

    evaluateProjectStatus(m: ProjectMetrics): string {
        if (m.total === 0) return 'NO_DATA'
        if (this.isCritical(m)) return 'CRITICAL'
        if (m.completed === m.total) return 'CLOSED'
        if (m.inProgress > 0 && m.pending === 0) return this.classifyOnTrack(m)
        if (m.pending > m.inProgress && m.blocked === 0) return this.classifyPending(m)
        if (m.blocked > 0 || m.onHold > 0) return this.classifyStuck(m)
        return this.classifyEndgame(m)
    }

    recommendStaffing(m: ProjectMetrics): string {
        if (m.total === 0) return 'IDLE'
        if (m.team === 0) return 'NEEDS_TEAM'
        const load = m.pending + m.inProgress
        if (load > m.team * 5) return this.classifyHiring(m, load)
        if (m.blocked > m.team || m.onHold > m.team) return 'UNBLOCK'
        if (m.completed > load && m.underReview === 0) return this.classifyScaling(m)
        if (m.inProgress > m.team * 2) return 'OVERLOADED'
        if (m.pending > m.completed && m.team < 3) return 'ADD_JUNIOR'
        if (m.underReview > m.team || m.underReview > m.inProgress) return 'ADD_REVIEWER'
        if (m.overdue > m.total * 0.25 || m.blocked > 0) return 'REPRIORITIZE'
        return this.classifyLateStage(m)
    }

    buildBurndownPages(totalTasks: number): number[] {
        const pages: number[] = []
        let page = 0
        while (page < totalTasks) {
            pages.push(page)
            page += 2
        }
        return pages
    }
}
