import { AuthUseCases } from '../application/usecases/AuthUseCases'
import { IUserRepository } from '../domain/ports/IUserRepository'
import * as bcryptModule from '../infrastructure/security/bcrypt'
import * as jwtModule from '../infrastructure/security/jwt'

jest.mock('../infrastructure/security/bcrypt')
jest.mock('../infrastructure/security/jwt')

const mockRepo = (): jest.Mocked<IUserRepository> => ({
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIdPublic: jest.fn(),
    findByEmailPublic: jest.fn(),
    update: jest.fn(),
    searchMembers: jest.fn(),
})

const hashPassword = bcryptModule.hashPassword as jest.Mock
const checkPassword = bcryptModule.checkPassword as jest.Mock
const generateJWT = jwtModule.generateJWT as jest.Mock

const user = { _id: 'u1', email: 'a@a.com', password: 'hashed', name: 'Ana', confirmed: true }

describe('AuthUseCases', () => {
    let repo: jest.Mocked<IUserRepository>
    let uc: AuthUseCases

    beforeEach(() => {
        repo = mockRepo()
        uc = new AuthUseCases(repo)
        hashPassword.mockResolvedValue('hashed')
        generateJWT.mockReturnValue('token123')
    })

    describe('createAccount', () => {
        it('creates user when email is new', async () => {
            repo.findByEmail.mockResolvedValue(null)
            await uc.createAccount({ email: 'a@a.com', password: '123', name: 'Ana' })
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@a.com', password: 'hashed' }))
        })

        it('throws when email already exists', async () => {
            repo.findByEmail.mockResolvedValue(user)
            await expect(uc.createAccount({ email: 'a@a.com', password: '123', name: 'Ana' }))
                .rejects.toThrow('El Usuario ya esta registrado')
        })
    })

    describe('login', () => {
        it('returns token on valid credentials', async () => {
            repo.findByEmail.mockResolvedValue(user)
            checkPassword.mockResolvedValue(true)
            const token = await uc.login({ email: 'a@a.com', password: '123' })
            expect(token).toBe('token123')
        })

        it('throws when user not found', async () => {
            repo.findByEmail.mockResolvedValue(null)
            await expect(uc.login({ email: 'a@a.com', password: '123' }))
                .rejects.toThrow('Usuario no encontrado')
        })

        it('throws on wrong password', async () => {
            repo.findByEmail.mockResolvedValue(user)
            checkPassword.mockResolvedValue(false)
            await expect(uc.login({ email: 'a@a.com', password: 'wrong' }))
                .rejects.toThrow('Password Incorrecto')
        })
    })

    describe('updateProfile', () => {
        it('updates when email is not taken by another user', async () => {
            repo.findByEmail.mockResolvedValue(null)
            await uc.updateProfile('u1', { name: 'Ana B', email: 'b@b.com' })
            expect(repo.update).toHaveBeenCalledWith('u1', { name: 'Ana B', email: 'b@b.com' })
        })

        it('updates when same user owns the email', async () => {
            repo.findByEmail.mockResolvedValue(user)
            await uc.updateProfile('u1', { name: 'Ana', email: 'a@a.com' })
            expect(repo.update).toHaveBeenCalled()
        })

        it('throws when email taken by another user', async () => {
            repo.findByEmail.mockResolvedValue({ ...user, _id: 'u2' })
            await expect(uc.updateProfile('u1', { name: 'Ana', email: 'a@a.com' }))
                .rejects.toThrow('Ese email ya esta registrado')
        })
    })

    describe('updatePassword', () => {
        it('updates password on success', async () => {
            repo.findById.mockResolvedValue(user)
            checkPassword.mockResolvedValue(true)
            await uc.updatePassword('u1', 'old', 'new')
            expect(repo.update).toHaveBeenCalledWith('u1', { password: 'hashed' })
        })

        it('throws when user not found', async () => {
            repo.findById.mockResolvedValue(null)
            await expect(uc.updatePassword('u1', 'old', 'new'))
                .rejects.toThrow('Usuario no encontrado')
        })

        it('throws on wrong current password', async () => {
            repo.findById.mockResolvedValue(user)
            checkPassword.mockResolvedValue(false)
            await expect(uc.updatePassword('u1', 'wrong', 'new'))
                .rejects.toThrow('El Contraseña actual es incorrecto')
        })
    })

    describe('checkPassword', () => {
        it('resolves when password is correct', async () => {
            repo.findById.mockResolvedValue(user)
            checkPassword.mockResolvedValue(true)
            await expect(uc.checkPassword('u1', '123')).resolves.toBeUndefined()
        })

        it('throws when user not found', async () => {
            repo.findById.mockResolvedValue(null)
            await expect(uc.checkPassword('u1', '123')).rejects.toThrow('Usuario no encontrado')
        })

        it('throws when password is wrong', async () => {
            repo.findById.mockResolvedValue(user)
            checkPassword.mockResolvedValue(false)
            await expect(uc.checkPassword('u1', 'bad')).rejects.toThrow('La contraseña es incorrecta')
        })
    })
})
