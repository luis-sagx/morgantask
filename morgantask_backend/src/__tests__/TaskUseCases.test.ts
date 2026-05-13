import { TaskUseCases } from "../application/usecases/TaskUseCases";
import { IProjectRepository } from "../domain/ports/IProjectRepository";
import { ITaskRepository } from "../domain/ports/ITaskRepository";

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

const projectRepositoryMock: jest.Mocked<IProjectRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithTasks: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addTask: jest.fn(),
  removeTask: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  getTeamPopulated: jest.fn()
};

describe("TaskUseCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe crear una tarea correctamente", async () => {
    const mockTask = {
      _id: "task-1",
      name: "Nueva Tarea",
      description: "Descripción",
      project: "project-1"
    };
    taskRepositoryMock.create.mockResolvedValue(mockTask as any);

    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    const result = await taskUseCases.create({
      name: "Nueva Tarea",
      description: "Descripción",
      projectId: "project-1"
    });

    expect(taskRepositoryMock.create).toHaveBeenCalledWith({
      name: "Nueva Tarea",
      description: "Descripción",
      project: "project-1"
    });
    expect(projectRepositoryMock.addTask).toHaveBeenCalledWith("project-1", "task-1");
    expect(result).toEqual(mockTask);
  });

  test("debe obtener tareas por proyecto", async () => {
    const mockTasks = [
      { _id: "task-1", name: "Tarea 1", description: "Desc 1", project: "project-1" },
      { _id: "task-2", name: "Tarea 2", description: "Desc 2", project: "project-1" }
    ];
    taskRepositoryMock.findByProject.mockResolvedValue(mockTasks as any);

    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    const result = await taskUseCases.getByProject("project-1");

    expect(taskRepositoryMock.findByProject).toHaveBeenCalledWith("project-1");
    expect(result).toEqual(mockTasks);
  });

  test("debe obtener una tarea por ID", async () => {
    const mockTask = { _id: "task-1", name: "Tarea", description: "Desc" };
    taskRepositoryMock.findByIdWithDetails.mockResolvedValue(mockTask as any);

    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    const result = await taskUseCases.getById("task-1");

    expect(taskRepositoryMock.findByIdWithDetails).toHaveBeenCalledWith("task-1");
    expect(result).toEqual(mockTask);
  });

  test("debe lanzar error si la tarea no existe", async () => {
    taskRepositoryMock.findByIdWithDetails.mockResolvedValue(null);

    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    await expect(taskUseCases.getById("task-1")).rejects.toThrow("Tarea no encontrada");
  });

  test("debe actualizar una tarea", async () => {
    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    await taskUseCases.update("task-1", {
      name: "Nuevo Nombre",
      description: "Nueva Descripción"
    });

    expect(taskRepositoryMock.update).toHaveBeenCalledWith("task-1", {
      name: "Nuevo Nombre",
      description: "Nueva Descripción"
    });
  });

  test("debe eliminar una tarea", async () => {
    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    await taskUseCases.delete("task-1", "project-1");

    expect(taskRepositoryMock.delete).toHaveBeenCalledWith("task-1");
    expect(projectRepositoryMock.removeTask).toHaveBeenCalledWith("project-1", "task-1");
  });

  test("debe actualizar el estado de una tarea", async () => {
    const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);

    await taskUseCases.updateStatus("task-1", "user-1", "completed" as any);

    expect(taskRepositoryMock.updateStatus).toHaveBeenCalledWith("task-1", "user-1", "completed");
  });
});