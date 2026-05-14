import type { Request, Response } from 'express'

import { noteUseCases } from '../../infrastructure/container'
import { getErrorMessage } from '../utils/error'

export class NoteController {
    static readonly createNote = async (req: Request, res: Response) => {
        try {
            await noteUseCases.create({
                content: req.body.content,
                taskId: req.task.id.toString(),
                userId: req.user.id.toString()
            })
            res.send('Nota Creada Correctamente')
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await noteUseCases.getByTask(req.task.id.toString())
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly deleteNote = async (req: Request, res: Response) => {
        try {
            const { noteId } = req.params
            await noteUseCases.delete(noteId, req.task.id.toString(), req.user.id.toString())
            res.send('Nota Eliminada')
        } catch (error) {
            const message = getErrorMessage(error)
            let status = 500

            if (message === 'Nota no encontrada') {
                status = 404
            } else if (message === 'Acción no válida') {
                status = 401
            }

            res.status(status).json({ error: message })
        }
    }
}
