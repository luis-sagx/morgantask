import mongoose, { Schema, Document, Types } from 'mongoose'
import NoteModel from './NoteModel'

export type TaskStatus = 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed'

const taskStatusValues = ['pending', 'onHold', 'inProgress', 'underReview', 'completed']

export interface ITaskDoc extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: {
        user: Types.ObjectId
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: taskStatusValues,
        default: 'pending'
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: taskStatusValues,
                default: 'pending'
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, { timestamps: true })

TaskSchema.pre('deleteOne', { document: true }, async function () {
    const taskId = this._id
    if (!taskId) return
    await NoteModel.deleteMany({ task: taskId })
})

const TaskModel = mongoose.model<ITaskDoc>('Task', TaskSchema)
export default TaskModel
