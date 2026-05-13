import { ProjectUseCases } from "../application/usecases/ProjectUseCases";
import { IProjectRepository } from "../domain/ports/IProjectRepository";

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

describe("ProjectUseCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe crear un proyecto correctamente", async () => {
    const mockProject = {
      _id: "project-1",
      projectName: "Nuevo Proyecto",
      clientName: "Cliente",
      description: "Descripción",
      manager: "user-1"
    };
    projectRepositoryMock.create.mockResolvedValue(mockProject as any);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    const result = await projectUseCases.create({
      projectName: "Nuevo Proyecto",
      clientName: "Cliente",
      description: "Descripción",
      manager: "user-1"
    });

    expect(projectRepositoryMock.create).toHaveBeenCalledWith({
      projectName: "Nuevo Proyecto",
      clientName: "Cliente",
      description: "Descripción",
      manager: "user-1"
    });
    expect(result).toEqual(mockProject);
  });

  test("debe obtener todos los proyectos de un usuario", async () => {
    const mockProjects = [
      { _id: "project-1", projectName: "Proyecto 1", clientName: "Cliente 1" },
      { _id: "project-2", projectName: "Proyecto 2", clientName: "Cliente 2" }
    ];
    projectRepositoryMock.findByUser.mockResolvedValue(mockProjects as any);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    const result = await projectUseCases.getAll("user-1");

    expect(projectRepositoryMock.findByUser).toHaveBeenCalledWith("user-1");
    expect(result).toEqual(mockProjects);
  });

  test("debe obtener un proyecto por ID para el manager", async () => {
    const mockProject = {
      _id: "project-1",
      projectName: "Proyecto",
      clientName: "Cliente",
      manager: "user-1",
      team: []
    };
    projectRepositoryMock.findByIdWithTasks.mockResolvedValue(mockProject as any);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    const result = await projectUseCases.getById("project-1", "user-1");

    expect(projectRepositoryMock.findByIdWithTasks).toHaveBeenCalledWith("project-1");
    expect(result).toEqual(mockProject);
  });

  test("debe obtener un proyecto por ID para un miembro del equipo", async () => {
    const mockProject = {
      _id: "project-1",
      projectName: "Proyecto",
      clientName: "Cliente",
      manager: "user-1",
      team: ["user-2", "user-3"]
    };
    projectRepositoryMock.findByIdWithTasks.mockResolvedValue(mockProject as any);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    const result = await projectUseCases.getById("project-1", "user-2");

    expect(result).toEqual(mockProject);
  });

  test("debe lanzar error si el proyecto no existe", async () => {
    projectRepositoryMock.findByIdWithTasks.mockResolvedValue(null);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    await expect(projectUseCases.getById("project-1", "user-1")).rejects.toThrow("Proyecto no encontrado");
  });

  test("debe lanzar error si el usuario no es manager ni miembro", async () => {
    const mockProject = {
      _id: "project-1",
      projectName: "Proyecto",
      clientName: "Cliente",
      manager: "user-1",
      team: ["user-2"]
    };
    projectRepositoryMock.findByIdWithTasks.mockResolvedValue(mockProject as any);

    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    await expect(projectUseCases.getById("project-1", "user-3")).rejects.toThrow("Acción no válida");
  });

  test("debe actualizar un proyecto", async () => {
    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    await projectUseCases.update("project-1", {
      projectName: "Nuevo Nombre",
      clientName: "Nuevo Cliente",
      description: "Nueva Descripción"
    });

    expect(projectRepositoryMock.update).toHaveBeenCalledWith("project-1", {
      projectName: "Nuevo Nombre",
      clientName: "Nuevo Cliente",
      description: "Nueva Descripción"
    });
  });

  test("debe eliminar un proyecto", async () => {
    const projectUseCases = new ProjectUseCases(projectRepositoryMock);

    await projectUseCases.delete("project-1");

    expect(projectRepositoryMock.delete).toHaveBeenCalledWith("project-1");
  });
});