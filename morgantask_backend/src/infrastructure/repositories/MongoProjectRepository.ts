import { IProject } from '../../domain/entities/Project'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'
import ProjectModel, { IProjectDoc } from '../models/ProjectModel'

export class MongoProjectRepository implements IProjectRepository {
    private toEntity(doc: IProjectDoc): IProject {
        return {
            _id: doc.id.toString(),
            projectName: doc.projectName,
            clientName: doc.clientName,
            description: doc.description,
            tasks: doc.tasks.map(t => t.toString()),
            manager: doc.manager.toString(),
            team: doc.team.map(m => m.toString())
        }
    }

    async create(data: Omit<IProject, 'id' | 'tasks' | 'team'>): Promise<IProject> {
        const project = new ProjectModel(data)
        await project.save()
        return this.toEntity(project)
    }

    async findByUser(userId: string): Promise<IProject[]> {
        const projects = await ProjectModel.find({
            $or: [
                { manager: { $in: userId } },
                { team: { $in: userId } }
            ]
        })
        return projects.map(p => this.toEntity(p))
    }

    async findById(id: string): Promise<IProject | null> {
        const project = await ProjectModel.findById(id)
        return project ? this.toEntity(project) : null
    }

    async findByIdWithTasks(id: string): Promise<any> {
        return ProjectModel.findById(id).populate('tasks')
    }

    async update(id: string, data: Pick<IProject, 'projectName' | 'clientName' | 'description'>): Promise<void> {
        await ProjectModel.findByIdAndUpdate(id, data)
    }

    async delete(id: string): Promise<void> {
        const project = await ProjectModel.findById(id)
        if (project) await project.deleteOne()
    }

    async addTask(projectId: string, taskId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $push: { tasks: taskId } })
    }

    async removeTask(projectId: string, taskId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } })
    }

    async addMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $push: { team: userId } })
    }

    async removeMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { $pull: { team: userId } })
    }

    async getTeamPopulated(projectId: string): Promise<any> {
        const project = await ProjectModel.findById(projectId).populate({
            path: 'team',
            select: 'id email name'
        })
        return project?.team ?? []
    }
}
