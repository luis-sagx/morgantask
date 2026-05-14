export interface IUser {
    _id?: string
    email: string
    password: string
    name: string
    confirmed: boolean
}

export type IPublicUser = Pick<Required<IUser>, '_id' | 'email' | 'name'>
