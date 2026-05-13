import type { Request, Response } from 'express'
import { projectUseCases } from '../../infrastructure/container'

export class ProjectController {
    static createProject = async (req: Request, res: Response) => {
        try {
            await projectUseCases.create({ ...req.body, manager: req.user.id.toString() })
            res.send('Proyecto Creando Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await projectUseCases.getAll(req.user.id.toString())
            res.json(projects)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await projectUseCases.getById(req.params.id, req.user.id.toString())
            res.json(project)
        } catch (error) {
            const status = error.message === 'Proyecto no encontrado' ? 404 : 403
            res.status(status).json({ error: error.message })
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        try {
            await projectUseCases.update(req.project.id.toString(), req.body)
            res.send('Proyecto Actualizado')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            await projectUseCases.delete(req.project.id.toString())
            res.send('Proyecto Eliminado')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}
