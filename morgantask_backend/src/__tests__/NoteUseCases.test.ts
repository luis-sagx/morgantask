import { NoteUseCases } from '../application/usecases/NoteUseCases'
import { INoteRepository } from '../domain/ports/INoteRepository'
import { ITaskRepository } from '../domain/ports/ITaskRepository'

const mockNoteRepo = (): jest.Mocked<INoteRepository> => ({
    create: jest.fn(),
    findByTask: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
})

const mockTaskRepo = (): jest.Mocked<ITaskRepository> => ({
    create: jest.fn(),
    findByProject: jest.fn(),
    findById: jest.fn(),
    findByIdWithDetails: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    addNote: jest.fn(),
    removeNote: jest.fn(),
})

const note = { _id: 'n1', content: 'Test note', createdBy: 'u1', task: 't1' }

describe('NoteUseCases', () => {
    let noteRepo: jest.Mocked<INoteRepository>
    let taskRepo: jest.Mocked<ITaskRepository>
    let uc: NoteUseCases

    beforeEach(() => {
        noteRepo = mockNoteRepo()
        taskRepo = mockTaskRepo()
        uc = new NoteUseCases(noteRepo, taskRepo)
    })

    it('create saves note and adds to task', async () => {
        noteRepo.create.mockResolvedValue(note)
        taskRepo.addNote.mockResolvedValue(undefined)
        const result = await uc.create({ content: 'Test note', taskId: 't1', userId: 'u1' })
        expect(result._id).toBe('n1')
        expect(taskRepo.addNote).toHaveBeenCalledWith('t1', 'n1')
    })

    it('getByTask returns notes', async () => {
        noteRepo.findByTask.mockResolvedValue([note])
        const result = await uc.getByTask('t1')
        expect(result).toHaveLength(1)
    })

    describe('delete', () => {
        it('deletes note when user is owner', async () => {
            noteRepo.findById.mockResolvedValue(note)
            noteRepo.delete.mockResolvedValue(undefined)
            taskRepo.removeNote.mockResolvedValue(undefined)
            await uc.delete('n1', 't1', 'u1')
            expect(noteRepo.delete).toHaveBeenCalledWith('n1')
            expect(taskRepo.removeNote).toHaveBeenCalledWith('t1', 'n1')
        })

        it('throws when note not found', async () => {
            noteRepo.findById.mockResolvedValue(null)
            await expect(uc.delete('n1', 't1', 'u1')).rejects.toThrow('Nota no encontrada')
        })

        it('throws when user is not the note owner', async () => {
            noteRepo.findById.mockResolvedValue(note)
            await expect(uc.delete('n1', 't1', 'u99')).rejects.toThrow('Acción no válida')
        })
    })
})
