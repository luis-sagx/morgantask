import { ITask, INoteProjection, TaskStatus } from '../../domain/entities/Task'
import { ITaskRepository } from '../../domain/ports/ITaskRepository'
import TaskModel, { ITaskDoc } from '../models/TaskModel'

type PopulatedUser = { _id: { toString(): string }; name: string; email: string }
type PopulatedNote = { _id: { toString(): string }; content: string; createdBy: PopulatedUser; task: { toString(): string }; createdAt: string }

export class MongoTaskRepository implements ITaskRepository {
    private toEntity(doc: ITaskDoc, populate = false): ITask {
        const completedBy: ITask['completedBy'] = doc.completedBy.map(cb => {
            const user = cb.user as unknown
            if (populate && typeof user === 'object' && user !== null && 'toJSON' in user) {
                const u = user as unknown as PopulatedUser
                return {
                    _id: cb._id.toString(),
                    user: { _id: u._id.toString(), name: u.name, email: u.email },
                    status: cb.status
                }
            }
            return {
                _id: cb._id.toString(),
                user: (user as { toString(): string }).toString(),
                status: cb.status
            }
        })

        const notes: ITask['notes'] = populate
            ? doc.notes.map(n => {
                const note = n as unknown as PopulatedNote
                return {
                    _id: note._id.toString(),
                    content: note.content,
                    createdBy: { _id: note.createdBy._id.toString(), name: note.createdBy.name, email: note.createdBy.email },
                    task: note.task.toString(),
                    createdAt: note.createdAt
                } as INoteProjection
            })
            : doc.notes.map(n => n.toString())

        return {
            _id: doc.id.toString(),
            name: doc.name,
            description: doc.description,
            project: doc.project.toString(),
            status: doc.status,
            completedBy,
            notes,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString()
        }
    }

    async create(data: Pick<ITask, 'name' | 'description' | 'project'>): Promise<ITask> {
        const task = new TaskModel(data)
        await task.save()
        return this.toEntity(task)
    }

    async findByProject(projectId: string): Promise<ITask[]> {
        const tasks = await TaskModel.find({ project: projectId }).populate('project').exec()
        return tasks.map(t => this.toEntity(t))
    }

    async findById(id: string): Promise<ITask | null> {
        const task = await TaskModel.findById(id).exec()
        return task ? this.toEntity(task) : null
    }

    async findByIdWithDetails(id: string): Promise<ITask | null> {
        const task = await TaskModel.findById(id)
            .populate({ path: 'completedBy.user', select: 'id name email' })
            .populate({ path: 'notes', populate: { path: 'createdBy', select: 'id name email' } })
            .exec()
        return task ? this.toEntity(task, true) : null
    }

    async update(id: string, data: Pick<ITask, 'name' | 'description'>): Promise<void> {
        await TaskModel.findByIdAndUpdate(id, data).exec()
    }

    async updateStatus(id: string, userId: string, status: TaskStatus): Promise<void> {
        await TaskModel.findByIdAndUpdate(id, {
            status,
            $push: { completedBy: { user: userId, status } }
        }).exec()
    }

    async delete(id: string): Promise<void> {
        await TaskModel.findByIdAndDelete(id).exec()
    }

    async addNote(taskId: string, noteId: string): Promise<void> {
        await TaskModel.findByIdAndUpdate(taskId, { $push: { notes: noteId } }).exec()
    }

    async removeNote(taskId: string, noteId: string): Promise<void> {
        await TaskModel.findByIdAndUpdate(taskId, { $pull: { notes: noteId } }).exec()
    }
}
