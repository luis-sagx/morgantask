import { IUserRepository } from '../../domain/ports/IUserRepository'
import { hashPassword, checkPassword } from '../../infrastructure/security/bcrypt'
import { generateJWT } from '../../infrastructure/security/jwt'

export class AuthUseCases {
    constructor(private readonly userRepository: IUserRepository) {}

    async createAccount(data: { email: string; password: string; name: string }): Promise<void> {
        const exists = await this.userRepository.findByEmail(data.email)
        if (exists) throw new Error('El Usuario ya esta registrado')

        const hashed = await hashPassword(data.password)
        await this.userRepository.create({ ...data, password: hashed, confirmed: true })
    }

    async login(data: { email: string; password: string }): Promise<string> {
        const user = await this.userRepository.findByEmail(data.email)
        if (!user) throw new Error('Usuario no encontrado')

        const valid = await checkPassword(data.password, user.password)
        if (!valid) throw new Error('Password Incorrecto')

        return generateJWT({ id: user._id })
    }

    async updateProfile(userId: string, data: { name: string; email: string }): Promise<void> {
        const existing = await this.userRepository.findByEmail(data.email)
        if (existing && existing._id !== userId) {
            throw new Error('Ese email ya esta registrado')
        }
        await this.userRepository.update(userId, data)
    }

    async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findById(userId)
        if (!user) throw new Error('Usuario no encontrado')

        const valid = await checkPassword(currentPassword, user.password)
        if (!valid) throw new Error('El Contraseña actual es incorrecto')

        const hashed = await hashPassword(newPassword)
        await this.userRepository.update(userId, { password: hashed })
    }

    async checkPassword(userId: string, password: string): Promise<void> {
        const user = await this.userRepository.findById(userId)
        if (!user) throw new Error('Usuario no encontrado')

        const valid = await checkPassword(password, user.password)
        if (!valid) throw new Error('La contraseña es incorrecta')
    }
}
