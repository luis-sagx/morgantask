import { generateJWT, verifyJWT } from '../infrastructure/security/jwt'
import { hashPassword, checkPassword } from '../infrastructure/security/bcrypt'

describe('JWT', () => {
    it('generates and verifies a token', () => {
        const token = generateJWT({ id: 'u1' })
        expect(typeof token).toBe('string')
        const payload = verifyJWT(token) as { id: string }
        expect(payload.id).toBe('u1')
    })

    it('throws on invalid token', () => {
        expect(() => verifyJWT('invalid.token.here')).toThrow()
    })
})

describe('bcrypt', () => {
    it('hashes and verifies password', async () => {
        const hash = await hashPassword('secret123')
        expect(hash).not.toBe('secret123')
        expect(await checkPassword('secret123', hash)).toBe(true)
    })

    it('returns false for wrong password', async () => {
        const hash = await hashPassword('secret123')
        expect(await checkPassword('wrong', hash)).toBe(false)
    })
})
