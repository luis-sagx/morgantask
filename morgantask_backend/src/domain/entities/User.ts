export interface IUser {
    _id?: string
    email: string
    password: string
    name: string
    confirmed: boolean
}

export interface IPublicUser {
    _id: string
    email: string
    name: string
}
