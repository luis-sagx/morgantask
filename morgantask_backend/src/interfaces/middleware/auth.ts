import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'

import UserModel, { IUserDoc } from '../../infrastructure/models/UserModel'
import { getErrorMessage } from '../utils/error'

declare global {
    namespace Express {
        interface Request {
            user?: IUserDoc
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        return res.status(401).json({ error: 'No Autorizado' })
    }

    const [, token] = bearer.split(' ')

    try {
        const decoded = verify(token, process.env.JWT_SECRET)
        if (typeof decoded === 'object' && decoded.id) {
            const user = await UserModel.findById(decoded.id).select('_id name email')
            if (user) {
                req.user = user
                next()
            } else {
                res.status(500).json({ error: 'Token No Válido' })
            }
        }
    } catch (error) {
        res.status(500).json({ error: getErrorMessage(error, 'Token No Válido') })
    }
}
