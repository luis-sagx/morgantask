import { INote } from '../../domain/entities/Note'
import { INoteRepository } from '../../domain/ports/INoteRepository'
import { ITaskRepository } from '../../domain/ports/ITaskRepository'

export class NoteUseCases {
    constructor(
        private noteRepository: INoteRepository,
        private taskRepository: ITaskRepository
    ) {}

    async create(data: { content: string; taskId: string; userId: string }): Promise<INote> {
        const note = await this.noteRepository.create({
            content: data.content,
            createdBy: data.userId,
            task: data.taskId
        })
        await this.taskRepository.addNote(data.taskId, note._id)
        return note
    }

    async getByTask(taskId: string): Promise<INote[]> {
        return this.noteRepository.findByTask(taskId)
    }

    async delete(noteId: string, taskId: string, userId: string): Promise<void> {
        const note = await this.noteRepository.findById(noteId)
        if (!note) throw new Error('Nota no encontrada')
        if (note.createdBy !== userId) throw new Error('Acción no válida')

        await Promise.all([
            this.noteRepository.delete(noteId),
            this.taskRepository.removeNote(taskId, noteId)
        ])
    }
}
