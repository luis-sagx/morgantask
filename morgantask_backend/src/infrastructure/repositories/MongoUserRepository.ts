import { IUser, IPublicUser } from '../../domain/entities/User'
import { IUserRepository } from '../../domain/ports/IUserRepository'
import UserModel, { IUserDoc } from '../models/UserModel'

export class MongoUserRepository implements IUserRepository {
    private toEntity(doc: IUserDoc): IUser {
        return {
            _id: doc.id.toString(),
            email: doc.email,
            password: doc.password,
            name: doc.name,
            confirmed: doc.confirmed
        }
    }

    async create(data: Omit<IUser, '_id'>): Promise<IUser> {
        const user = new UserModel(data)
        await user.save()
        return this.toEntity(user)
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ email }).exec()
        return user ? this.toEntity(user) : null
    }

    async findById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id).exec()
        return user ? this.toEntity(user) : null
    }

    async findByIdPublic(id: string): Promise<Omit<IUser, 'password'> | null> {
        const user = await UserModel.findById(id).select('_id name email confirmed').exec()
        if (!user) return null
        return {
            _id: user.id.toString(),
            email: user.email,
            name: user.name,
            confirmed: user.confirmed
        }
    }

    async findByEmailPublic(email: string): Promise<IPublicUser | null> {
        const user = await UserModel.findOne({ email }).select('_id email name').exec()
        if (!user) return null
        return { _id: user.id.toString(), email: user.email, name: user.name }
    }

    async update(id: string, data: Partial<Omit<IUser, '_id'>>): Promise<void> {
        await UserModel.findByIdAndUpdate(id, data).exec()
    }

    async searchMembers(filter: Record<string, unknown>): Promise<IPublicUser[]> {
        const users = await UserModel.find(filter).select('_id email name').exec()
        return users.map((u) => ({ _id: u.id.toString(), email: u.email, name: u.name }))
    }
}
