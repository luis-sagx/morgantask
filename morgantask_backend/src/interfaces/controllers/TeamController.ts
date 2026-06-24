import type { Request, Response } from 'express'

import { teamUseCases } from '../../infrastructure/container'
import { getErrorMessage } from '../utils/error'

export class TeamMemberController {
    static readonly findMemberByEmail = async (req: Request, res: Response) => {
        try {
            const user = await teamUseCases.findMemberByEmail(req.body.email)
            res.json(user)
        } catch (error) {
            res.status(404).json({ error: getErrorMessage(error) })
        }
    }

    static readonly searchMembers = async (req: Request, res: Response) => {
        try {
            const members = await teamUseCases.searchMembers(req.body)
            res.json(members)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getProjecTeam = async (req: Request, res: Response) => {
        try {
            const team = await teamUseCases.getTeam(req.project.id.toString())
            res.json(team)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly addMemberById = async (req: Request, res: Response) => {
        try {
            await teamUseCases.addMember(req.project.id.toString(), req.body.id)
            res.send('Usuario agregado correctamente')
        } catch (error) {
            const message = getErrorMessage(error)
            let status = 500

            if (message === 'Usuario No Encontrado') {
                status = 404
            } else if (message === 'El usuario ya existe en el proyecto') {
                status = 409
            }

            res.status(status).json({ error: message })
        }
    }

    static readonly removeMemberById = async (req: Request, res: Response) => {
        try {
            await teamUseCases.removeMember(req.project.id.toString(), req.params.userId)
            res.send('Usuario eliminado correctamente')
        } catch (error) {
            const message = getErrorMessage(error)
            const status = message === 'El usuario no existe en el proyecto' ? 409 : 500
            res.status(status).json({ error: message })
        }
    }
}
