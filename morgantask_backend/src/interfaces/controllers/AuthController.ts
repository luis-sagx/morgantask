import type { Request, Response } from 'express'
import { authUseCases } from '../../infrastructure/container'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            await authUseCases.createAccount(req.body)
            res.send('Cuenta creada correctamente, ya podés iniciar sesión')
        } catch (error) {
            const status = error.message === 'El Usuario ya esta registrado' ? 409 : 500
            res.status(status).json({ error: error.message })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const token = await authUseCases.login(req.body)
            res.send(token)
        } catch (error) {
            const status = error.message === 'Usuario no encontrado' ? 404 : 401
            res.status(status).json({ error: error.message })
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        try {
            await authUseCases.updateProfile(req.user.id.toString(), req.body)
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            const status = error.message === 'Ese email ya esta registrado' ? 409 : 500
            res.status(status).json({ error: error.message })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        try {
            const { current_password, password } = req.body
            await authUseCases.updatePassword(req.user.id.toString(), current_password, password)
            res.send('La contraseña se modificó correctamente')
        } catch (error) {
            const status = error.message === 'El Contraseña actual es incorrecto' ? 401 : 500
            res.status(status).json({ error: error.message })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        try {
            await authUseCases.checkPassword(req.user.id.toString(), req.body.password)
            res.send('Contraseña Correcta')
        } catch (error) {
            res.status(401).json({ error: error.message })
        }
    }
}
