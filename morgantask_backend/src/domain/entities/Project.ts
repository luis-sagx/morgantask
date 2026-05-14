export interface ITaskProjection {
    _id: string
    name: string
    description: string
    status: string
}

export interface IProject {
    _id?: string
    projectName: string
    clientName: string
    description: string
    tasks: string[] | ITaskProjection[]
    manager: string
    team: string[]
}
