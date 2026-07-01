import { INote } from '../../domain/entities/Note'
import { INoteRepository } from '../../domain/ports/INoteRepository'
import NoteModel, { INoteDoc } from '../models/NoteModel'

export class MongoNoteRepository implements INoteRepository {
    private toEntity(doc: INoteDoc): INote {
        return {
            _id: doc.id.toString(),
            content: doc.content,
            createdBy: doc.createdBy.toString(),
            task: doc.task.toString()
        }
    }

    async create(data: Omit<INote, 'id'>): Promise<INote> {
        const note = new NoteModel(data)
        await note.save()
        return this.toEntity(note)
    }

    async findByTask(taskId: string): Promise<INote[]> {
        const notes = await NoteModel.find({ task: taskId }).exec()
        return notes.map(n => this.toEntity(n))
    }

    async findById(id: string): Promise<INote | null> {
        const note = await NoteModel.findById(id).exec()
        return note ? this.toEntity(note) : null
    }

    async delete(id: string): Promise<void> {
        await NoteModel.findByIdAndDelete(id).exec()
    }
}
