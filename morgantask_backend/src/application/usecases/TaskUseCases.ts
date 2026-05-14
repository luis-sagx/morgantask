import { ITask, TaskStatus } from '../../domain/entities/Task'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'
import { ITaskRepository } from '../../domain/ports/ITaskRepository'

export class TaskUseCases {
    constructor(
        private readonly taskRepository: ITaskRepository,
        private readonly projectRepository: IProjectRepository
    ) {}

    async create(data: { name: string; description: string; projectId: string }): Promise<ITask> {
        const task = await this.taskRepository.create({
            name: data.name,
            description: data.description,
            project: data.projectId
        })
        await this.projectRepository.addTask(data.projectId, task._id)
        return task
    }

    async getByProject(projectId: string): Promise<ITask[]> {
        return this.taskRepository.findByProject(projectId)
    }

    async getById(taskId: string): Promise<ITask> {
        const task = await this.taskRepository.findByIdWithDetails(taskId)
        if (!task) throw new Error('Tarea no encontrada')
        return task
    }

    async update(taskId: string, data: Pick<ITask, 'name' | 'description'>): Promise<void> {
        await this.taskRepository.update(taskId, data)
    }

    async delete(taskId: string, projectId: string): Promise<void> {
        await Promise.all([
            this.taskRepository.delete(taskId),
            this.projectRepository.removeTask(projectId, taskId)
        ])
    }

    async updateStatus(taskId: string, userId: string, status: TaskStatus): Promise<void> {
        await this.taskRepository.updateStatus(taskId, userId, status)
    }
}
