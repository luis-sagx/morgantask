import mongoose, { Schema, Document, Types } from 'mongoose'
import TaskModel from './TaskModel'
import NoteModel from './NoteModel'

export interface IProjectDoc extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: Types.ObjectId[]
    manager: Types.ObjectId
    team: Types.ObjectId[]
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true })

ProjectSchema.pre('deleteOne', { document: true }, async function () {
    const projectId = this._id
    if (!projectId) return

    const tasks = await TaskModel.find({ project: projectId })
    for (const task of tasks) {
        await NoteModel.deleteMany({ task: task.id })
    }
    await TaskModel.deleteMany({ project: projectId })
})

const ProjectModel = mongoose.model<IProjectDoc>('Project', ProjectSchema)
export default ProjectModel
