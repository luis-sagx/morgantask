import { ITask, TaskStatus } from '../../domain/entities/Task'
import { ITaskRepository } from '../../domain/ports/ITaskRepository'
import TaskModel, { ITaskDoc } from '../models/TaskModel'

export class MongoTaskRepository implements ITaskRepository {
    private toEntity(doc: ITaskDoc): ITask {
        return {
            _id: doc.id.toString(),
            name: doc.name,
            description: doc.description,
            project: doc.project.toString(),
            status: doc.status,
            completedBy: doc.completedBy.map(cb => ({
                user: cb.user.toString(),
                status: cb.status
            })),
            notes: doc.notes.map(n => n.toString())
        }
    }

    async create(data: Pick<ITask, 'name' | 'description' | 'project'>): Promise<ITask> {
        const task = new TaskModel(data)
        await task.save()
        return this.toEntity(task)
    }

    async findByProject(projectId: string): Promise<ITask[]> {
        const tasks = await TaskModel.find({ project: projectId }).populate('project')
        return tasks.map(t => this.toEntity(t))
    }

    async findById(id: string): Promise<ITask | null> {
        const task = await TaskModel.findById(id)
        return task ? this.toEntity(task) : null
    }

    async findByIdWithDetails(id: string): Promise<ITask | null> {
        const task = await TaskModel.findById(id)
            .populate({ path: 'completedBy.user', select: 'id name email' })
            .populate({ path: 'notes', populate: { path: 'createdBy', select: 'id name email' } })
        return task ? this.toEntity(task) : null
    }

    async update(id: string, data: Pick<ITask, 'name' | 'description'>): Promise<void> {
        await TaskModel.findByIdAndUpdate(id, data)
    }

    async updateStatus(id: string, userId: string, status: TaskStatus): Promise<void> {
        await TaskModel.findByIdAndUpdate(id, {
            status,
            $push: { completedBy: { user: userId, status } }
        })
    }

    async delete(id: string): Promise<void> {
        const task = await TaskModel.findById(id)
        if (task) await task.deleteOne()
    }

    async addNote(taskId: string, noteId: string): Promise<void> {
        await TaskModel.findByIdAndUpdate(taskId, { $push: { notes: noteId } })
    }

    async removeNote(taskId: string, noteId: string): Promise<void> {
        await TaskModel.findByIdAndUpdate(taskId, { $pull: { notes: noteId } })
    }
}
