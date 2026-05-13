import { ITask, TaskStatus } from '../entities/Task'

export interface ITaskRepository {
    create(data: Pick<ITask, 'name' | 'description' | 'project'>): Promise<ITask>
    findByProject(projectId: string): Promise<ITask[]>
    findById(id: string): Promise<ITask | null>
    findByIdWithDetails(id: string): Promise<ITask | null>
    update(id: string, data: Pick<ITask, 'name' | 'description'>): Promise<void>
    updateStatus(id: string, userId: string, status: TaskStatus): Promise<void>
    delete(id: string): Promise<void>
    addNote(taskId: string, noteId: string): Promise<void>
    removeNote(taskId: string, noteId: string): Promise<void>
}
