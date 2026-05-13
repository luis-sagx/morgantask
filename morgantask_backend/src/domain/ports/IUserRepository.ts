import { IUser, IPublicUser } from '../entities/User'

export interface IUserRepository {
    create(data: Omit<IUser, '_id'>): Promise<IUser>
    findByEmail(email: string): Promise<IUser | null>
    findById(id: string): Promise<IUser | null>
    findByIdPublic(id: string): Promise<Omit<IUser, 'password'> | null>
    findByEmailPublic(email: string): Promise<IPublicUser | null>
    update(id: string, data: Partial<Omit<IUser, '_id'>>): Promise<void>
}
