import { NoteUseCases } from "../application/usecases/NoteUseCases";
import { INoteRepository } from "../domain/ports/INoteRepository";
import { ITaskRepository } from "../domain/ports/ITaskRepository";

const noteRepositoryMock: jest.Mocked<INoteRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByTask: jest.fn(),
  delete: jest.fn()
};

const taskRepositoryMock: jest.Mocked<ITaskRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithDetails: jest.fn(),
  findByProject: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
  addNote: jest.fn(),
  removeNote: jest.fn()
};

describe("NoteUseCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe crear una nota correctamente", async () => {
    const mockNote = {
      _id: "note-1",
      content: "Contenido de la nota",
      createdBy: "user-1",
      task: "task-1"
    };
    noteRepositoryMock.create.mockResolvedValue(mockNote as any);

    const noteUseCases = new NoteUseCases(noteRepositoryMock, taskRepositoryMock);

    const result = await noteUseCases.create({
      content: "Contenido de la nota",
      taskId: "task-1",
      userId: "user-1"
    });

    expect(noteRepositoryMock.create).toHaveBeenCalledWith({
      content: "Contenido de la nota",
      createdBy: "user-1",
      task: "task-1"
    });
    expect(taskRepositoryMock.addNote).toHaveBeenCalledWith("task-1", "note-1");
    expect(result).toEqual(mockNote);
  });

  test("debe obtener notas por tarea", async () => {
    const mockNotes = [
      { _id: "note-1", content: "Nota 1", createdBy: "user-1", task: "task-1" },
      { _id: "note-2", content: "Nota 2", createdBy: "user-2", task: "task-1" }
    ];
    noteRepositoryMock.findByTask.mockResolvedValue(mockNotes as any);

    const noteUseCases = new NoteUseCases(noteRepositoryMock, taskRepositoryMock);

    const result = await noteUseCases.getByTask("task-1");

    expect(noteRepositoryMock.findByTask).toHaveBeenCalledWith("task-1");
    expect(result).toEqual(mockNotes);
  });

  test("debe eliminar una nota correctamente", async () => {
    const mockNote = {
      _id: "note-1",
      content: "Contenido",
      createdBy: "user-1",
      task: "task-1"
    };
    noteRepositoryMock.findById.mockResolvedValue(mockNote as any);

    const noteUseCases = new NoteUseCases(noteRepositoryMock, taskRepositoryMock);

    await noteUseCases.delete("note-1", "task-1", "user-1");

    expect(noteRepositoryMock.findById).toHaveBeenCalledWith("note-1");
    expect(noteRepositoryMock.delete).toHaveBeenCalledWith("note-1");
    expect(taskRepositoryMock.removeNote).toHaveBeenCalledWith("task-1", "note-1");
  });

  test("debe lanzar error si la nota no existe", async () => {
    noteRepositoryMock.findById.mockResolvedValue(null);

    const noteUseCases = new NoteUseCases(noteRepositoryMock, taskRepositoryMock);

    await expect(
      noteUseCases.delete("note-1", "task-1", "user-1")
    ).rejects.toThrow("Nota no encontrada");
  });

  test("debe lanzar error si el usuario no es el creador", async () => {
    const mockNote = {
      _id: "note-1",
      content: "Contenido",
      createdBy: "user-1",
      task: "task-1"
    };
    noteRepositoryMock.findById.mockResolvedValue(mockNote as any);

    const noteUseCases = new NoteUseCases(noteRepositoryMock, taskRepositoryMock);

    await expect(
      noteUseCases.delete("note-1", "task-1", "user-2")
    ).rejects.toThrow("Acción no válida");

    expect(noteRepositoryMock.delete).not.toHaveBeenCalled();
  });
});