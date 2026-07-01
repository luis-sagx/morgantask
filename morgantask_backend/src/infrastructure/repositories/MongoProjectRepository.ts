import { IProject, ITaskProjection } from '../../domain/entities/Project'
import { IPublicUser } from '../../domain/entities/User'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'
import ProjectModel, { IProjectDoc } from '../models/ProjectModel'

export class MongoProjectRepository implements IProjectRepository {
    private toEntity(doc: IProjectDoc, populateTasks = false): IProject {
        let tasks: string[] | ITaskProjection[]
        if (populateTasks) {
            tasks = (doc.tasks as unknown as Array<{ id: { toString(): string }; name: string; description: string; status: string }>).map(t => ({
                _id: t.id.toString(),
                name: t.name,
                description: t.description,
                status: t.status
            }))
        } else {
            tasks = doc.tasks.map(t => t.toString())
        }

        return {
            _id: doc.id.toString(),
            projectName: doc.projectName,
            clientName: doc.clientName,
            description: doc.description,
            tasks,
            manager: doc.manager.toString(),
            team: doc.team.map(m => m.toString())
        }
    }

    async create(data: Omit<IProject, 'id' | 'tasks' | 'team'>): Promise<IProject> {
        const project = new ProjectModel(data)
        await project.save()
        return this.toEntity(project)
    }

    async findByUser(userId: string, limit = 20, skip = 0): Promise<IProject[]> {
        const projects = await ProjectModel.find({
            $or: [
                { manager: { $in: userId } },
                { team: { $in: userId } }
            ]
        }).limit(limit).skip(skip).sort({ _id: -1 }).exec()
        return projects.map(p => this.toEntity(p))
    }

    async findById(id: string): Promise<IProject | null> {
        const project = await ProjectModel.findById(id).exec()
        return project ? this.toEntity(project) : null
    }

    async findByIdWithTasks(id: string): Promise<IProject | null> {
        const project = await ProjectModel.findById(id).populate('tasks').exec()
        return project ? this.toEntity(project, true) : null
    }

    async update(id: string, data: Pick<IProject, 'projectName' | 'clientName' | 'description'>): Promise<void> {
        await ProjectModel.findByIdAndUpdate(id, data).exec()
    }

    async delete(id: string): Promise<void> {
        await ProjectModel.findByIdAndDelete(id).exec()
    }

    async addTask(projectId: string, taskId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $push: { tasks: taskId } }).exec()
    }

    async removeTask(projectId: string, taskId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } }).exec()
    }

    async addMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $push: { team: userId } }).exec()
    }

    async removeMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $pull: { team: userId } }).exec()
    }

    async getTeamPopulated(projectId: string): Promise<IPublicUser[]> {
        const project = await ProjectModel.findById(projectId).populate({
            path: 'team',
            select: 'id email name'
        }).exec()
        const team = project?.team ?? []
        return team.map((m: unknown) => {
            const member = m as { _id?: { toString(): string }; email?: string; name?: string }
            return {
                _id: member._id?.toString() ?? '',
                email: member.email ?? '',
                name: member.name ?? ''
            }
        })
    }
}
