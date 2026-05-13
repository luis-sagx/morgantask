import type { Request, Response } from 'express'

import { noteUseCases } from '../../infrastructure/container'

export class NoteController {
    static createNote = async (req: Request, res: Response) => {
        try {
            await noteUseCases.create({
                content: req.body.content,
                taskId: req.task.id.toString(),
                userId: req.user.id.toString()
            })
            res.send('Nota Creada Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await noteUseCases.getByTask(req.task.id.toString())
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteNote = async (req: Request, res: Response) => {
        try {
            const { noteId } = req.params
            await noteUseCases.delete(noteId, req.task.id.toString(), req.user.id.toString())
            res.send('Nota Eliminada')
        } catch (error) {
            const status = error.message === 'Nota no encontrada' ? 404
                : error.message === 'Acción no válida' ? 401
                : 500
            res.status(status).json({ error: error.message })
        }
    }
}
