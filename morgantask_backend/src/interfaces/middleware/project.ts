import type { Request, Response, NextFunction } from 'express'

import ProjectModel, { IProjectDoc } from '../../infrastructure/models/ProjectModel'
import { getErrorMessage } from '../utils/error'

declare global {
    namespace Express {
        interface Request {
            project?: IProjectDoc
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { projectId } = req.params
        const project = await ProjectModel.findById(projectId).exec()
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' })
        }
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({ error: getErrorMessage(error) })
    }
}
