import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El Usuario ya esta registrado')
                return res.status(409).json({ error: error.message })
            }

            // Crea un usuario y lo confirma automáticamente
            const user = new User(req.body)
            user.confirmed = true

            // Hash Password
            user.password = await hashPassword(password)

            await user.save()
            res.send('Cuenta creada correctamente, ya podés iniciar sesión')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }

            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                return res.status(401).json({ error: error.message })
            }

            const token = generateJWT({id: user._id})

            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({email})
        if(userExists && userExists.id.toString() !== req.user.id.toString() ) {
            const error = new Error('Ese email ya esta registrado')
            return res.status(409).json({error: error.message})
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password actual es incorrecto')
            return res.status(401).json({error: error.message})
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El Password se modificó correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    } 

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password es incorrecto')
            return res.status(401).json({error: error.message})
        }

        res.send('Password Correcto')
    }
}