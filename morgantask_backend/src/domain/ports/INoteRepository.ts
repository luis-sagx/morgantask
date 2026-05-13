import { INote } from '../entities/Note'

export interface INoteRepository {
    create(data: Omit<INote, '_id'>): Promise<INote>
    findByTask(taskId: string): Promise<INote[]>
    findById(id: string): Promise<INote | null>
    delete(id: string): Promise<void>
}
