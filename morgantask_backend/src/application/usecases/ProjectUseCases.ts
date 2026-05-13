import { IProject } from '../../domain/entities/Project'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'

export class ProjectUseCases {
    constructor(private projectRepository: IProjectRepository) {}

    async create(data: { projectName: string; clientName: string; description: string; manager: string }): Promise<IProject> {
        return this.projectRepository.create(data)
    }

    async getAll(userId: string): Promise<IProject[]> {
        return this.projectRepository.findByUser(userId)
    }

    async getById(projectId: string, userId: string): Promise<IProject> {
        const project = await this.projectRepository.findByIdWithTasks(projectId)
        if (!project) throw new Error('Proyecto no encontrado')

        const managerId = project.manager.toString()
        const inTeam = project.team.some((t) => t.toString() === userId)
        if (managerId !== userId && !inTeam) throw new Error('Acción no válida')

        return project
    }

    async update(projectId: string, data: Pick<IProject, 'projectName' | 'clientName' | 'description'>): Promise<void> {
        await this.projectRepository.update(projectId, data)
    }

    async delete(projectId: string): Promise<void> {
        await this.projectRepository.delete(projectId)
    }
}
