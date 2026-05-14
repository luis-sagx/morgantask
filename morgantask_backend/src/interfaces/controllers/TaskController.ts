import type { Request, Response } from 'express'

import { TaskStatus } from '../../domain/entities/Task'
import { taskUseCases } from '../../infrastructure/container'
import { getErrorMessage } from '../utils/error'

export class TaskController {
    static readonly createTask = async (req: Request, res: Response) => {
        try {
            const task = await taskUseCases.create({
                ...req.body,
                projectId: req.project.id.toString()
            })
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await taskUseCases.getByProject(req.project.id.toString())
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await taskUseCases.getById(req.task.id.toString())
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly updateTask = async (req: Request, res: Response) => {
        try {
            await taskUseCases.update(req.task.id.toString(), req.body)
            res.send('Tarea Actualizada Correctamente')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly deleteTask = async (req: Request, res: Response) => {
        try {
            await taskUseCases.delete(req.task.id.toString(), req.project.id.toString())
            res.send('Tarea Eliminada Correctamente')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body as { status: TaskStatus }
            await taskUseCases.updateStatus(req.task.id.toString(), req.user.id.toString(), status)
            res.send('Tarea Actualizada')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }
}
