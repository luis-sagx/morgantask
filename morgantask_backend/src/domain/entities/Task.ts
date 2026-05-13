export type TaskStatus = 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed'

export interface ITask {
    _id?: string
    name: string
    description: string
    project: string
    status: TaskStatus
    completedBy: { user: string; status: TaskStatus }[]
    notes: string[]
}
