import type { Request, Response } from 'express'

import { projectUseCases } from '../../infrastructure/container'
import { getErrorMessage } from '../utils/error'

export class ProjectController {
    static readonly createProject = async (req: Request, res: Response) => {
        try {
            const project = await projectUseCases.create({ ...req.body, manager: req.user.id.toString() })
            res.json(project)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getAllProjects = async (req: Request, res: Response) => {
        try {
            const limit = Math.min(Number.parseInt(req.query.limit as string, 10) || 20, 100)
            const skip = Number.parseInt(req.query.skip as string, 10) || 0
            const projects = await projectUseCases.getAll(req.user.id.toString(), limit, skip)
            res.json(projects)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await projectUseCases.getById(req.params.id, req.user.id.toString())
            res.json(project)
        } catch (error) {
            const message = getErrorMessage(error)
            const status = message === 'Proyecto no encontrado' ? 404 : 403
            res.status(status).json({ error: message })
        }
    }

    static readonly updateProject = async (req: Request, res: Response) => {
        try {
            await projectUseCases.update(req.project.id.toString(), req.body)
            res.send('Proyecto Actualizado')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly deleteProject = async (req: Request, res: Response) => {
        try {
            await projectUseCases.delete(req.project.id.toString())
            res.send('Proyecto Eliminado')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }
}
