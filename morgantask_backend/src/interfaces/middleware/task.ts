import type { Request, Response, NextFunction } from 'express'

import TaskModel, { ITaskDoc } from '../../infrastructure/models/TaskModel'
import { getErrorMessage } from '../utils/error'

declare global {
    namespace Express {
        interface Request {
            task?: ITaskDoc
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params
        const task = await TaskModel.findById(taskId)
        if (!task) {
            return res.status(404).json({ error: 'Tarea no encontrada' })
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({ error: getErrorMessage(error) })
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        return res.status(400).json({ error: 'Acción no válida' })
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        return res.status(400).json({ error: 'Acción no válida' })
    }
    next()
}
