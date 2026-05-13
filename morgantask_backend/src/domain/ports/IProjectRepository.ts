import { IProject } from '../entities/Project'
import { IPublicUser } from '../entities/User'

export interface IProjectRepository {
    create(data: Omit<IProject, '_id' | 'tasks' | 'team'>): Promise<IProject>
    findByUser(userId: string): Promise<IProject[]>
    findById(id: string): Promise<IProject | null>
    findByIdWithTasks(id: string): Promise<IProject | null>
    update(id: string, data: Pick<IProject, 'projectName' | 'clientName' | 'description'>): Promise<void>
    delete(id: string): Promise<void>
    addTask(projectId: string, taskId: string): Promise<void>
    removeTask(projectId: string, taskId: string): Promise<void>
    addMember(projectId: string, userId: string): Promise<void>
    removeMember(projectId: string, userId: string): Promise<void>
    getTeamPopulated(projectId: string): Promise<IPublicUser[]>
}
