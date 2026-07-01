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
        _id: Types.ObjectId
        user: Types.ObjectId
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
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

TaskSchema.pre('findOneAndDelete', async function () {
    const doc = await this.model.findOne(this.getFilter()).exec()
    if (!doc) return
    await NoteModel.deleteMany({ task: doc._id }).exec()
})

const TaskModel = mongoose.model<ITaskDoc>('Task', TaskSchema)
export default TaskModel
