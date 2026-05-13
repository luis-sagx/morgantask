import type { Request, Response } from 'express'

import { teamUseCases } from '../../infrastructure/container'

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        try {
            const user = await teamUseCases.findMemberByEmail(req.body.email)
            res.json(user)
        } catch (error) {
            res.status(404).json({ error: error.message })
        }
    }

    static getProjecTeam = async (req: Request, res: Response) => {
        try {
            const team = await teamUseCases.getTeam(req.project.id.toString())
            res.json(team)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static addMemberById = async (req: Request, res: Response) => {
        try {
            await teamUseCases.addMember(req.project.id.toString(), req.body.id)
            res.send('Usuario agregado correctamente')
        } catch (error) {
            const status = error.message === 'Usuario No Encontrado' ? 404
                : error.message === 'El usuario ya existe en el proyecto' ? 409
                : 500
            res.status(status).json({ error: error.message })
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        try {
            await teamUseCases.removeMember(req.project.id.toString(), req.params.userId)
            res.send('Usuario eliminado correctamente')
        } catch (error) {
            const status = error.message === 'El usuario no existe en el proyecto' ? 409 : 500
            res.status(status).json({ error: error.message })
        }
    }
}
