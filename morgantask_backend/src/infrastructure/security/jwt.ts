import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'morgan_t4sk_super_secret_2024!_dev'

export const generateJWT = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '180d' })
}

export const verifyJWT = (token: string): object | string => {
    return jwt.verify(token, JWT_SECRET)
}
