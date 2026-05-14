export type TaskStatus = 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed'

export interface ICompletedByUser {
    _id: string
    name: string
    email: string
}

export interface ICompletedByEntry {
    _id: string
    user: string | ICompletedByUser
    status: TaskStatus
}

export interface INoteProjection {
    _id: string
    content: string
    createdBy: ICompletedByUser
    task: string
    createdAt: string
}

export interface ITask {
    _id?: string
    name: string
    description: string
    project: string
    status: TaskStatus
    completedBy: ICompletedByEntry[]
    notes: string[] | INoteProjection[]
    createdAt: string
    updatedAt: string
}