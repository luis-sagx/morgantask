import { TeamUseCases } from "../application/usecases/TeamUseCases";
import { IProjectRepository } from "../domain/ports/IProjectRepository";
import { IUserRepository } from "../domain/ports/IUserRepository";

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

const userRepositoryMock: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdPublic: jest.fn(),
  findByEmailPublic: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

describe("TeamUseCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe buscar un miembro por email", async () => {
    const mockUser = {
      _id: "user-1",
      email: "miembro@test.com",
      name: "Miembro"
    };
    userRepositoryMock.findByEmailPublic.mockResolvedValue(mockUser as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    const result = await teamUseCases.findMemberByEmail("miembro@test.com");

    expect(userRepositoryMock.findByEmailPublic).toHaveBeenCalledWith("miembro@test.com");
    expect(result).toEqual(mockUser);
  });

  test("debe lanzar error si el usuario no existe al buscar por email", async () => {
    userRepositoryMock.findByEmailPublic.mockResolvedValue(null);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.findMemberByEmail("noexiste@test.com")
    ).rejects.toThrow("Usuario No Encontrado");
  });

  test("debe obtener el equipo de un proyecto", async () => {
    const mockTeam = [
      { _id: "user-1", name: "Usuario 1", email: "user1@test.com" },
      { _id: "user-2", name: "Usuario 2", email: "user2@test.com" }
    ];
    projectRepositoryMock.getTeamPopulated.mockResolvedValue(mockTeam as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    const result = await teamUseCases.getTeam("project-1");

    expect(projectRepositoryMock.getTeamPopulated).toHaveBeenCalledWith("project-1");
    expect(result).toEqual(mockTeam);
  });

  test("debe agregar un miembro al proyecto", async () => {
    const mockUser = {
      _id: "user-1",
      email: "nuevo@test.com",
      name: "Nuevo"
    };
    const mockProject = {
      _id: "project-1",
      team: ["user-2"]
    };
    userRepositoryMock.findByIdPublic.mockResolvedValue(mockUser as any);
    projectRepositoryMock.findById.mockResolvedValue(mockProject as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await teamUseCases.addMember("project-1", "user-1");

    expect(userRepositoryMock.findByIdPublic).toHaveBeenCalledWith("user-1");
    expect(projectRepositoryMock.findById).toHaveBeenCalledWith("project-1");
    expect(projectRepositoryMock.addMember).toHaveBeenCalledWith("project-1", "user-1");
  });

  test("debe lanzar error si el usuario no existe al agregar", async () => {
    userRepositoryMock.findByIdPublic.mockResolvedValue(null);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.addMember("project-1", "user-1")
    ).rejects.toThrow("Usuario No Encontrado");
  });

  test("debe lanzar error si el usuario ya está en el proyecto", async () => {
    const mockUser = {
      _id: "user-1",
      email: "existente@test.com",
      name: "Existente"
    };
    const mockProject = {
      _id: "project-1",
      team: ["user-1", "user-2"]
    };
    userRepositoryMock.findByIdPublic.mockResolvedValue(mockUser as any);
    projectRepositoryMock.findById.mockResolvedValue(mockProject as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.addMember("project-1", "user-1")
    ).rejects.toThrow("El usuario ya existe en el proyecto");
  });

  test("debe remover un miembro del proyecto", async () => {
    const mockProject = {
      _id: "project-1",
      team: ["user-1", "user-2"]
    };
    projectRepositoryMock.findById.mockResolvedValue(mockProject as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await teamUseCases.removeMember("project-1", "user-1");

    expect(projectRepositoryMock.findById).toHaveBeenCalledWith("project-1");
    expect(projectRepositoryMock.removeMember).toHaveBeenCalledWith("project-1", "user-1");
  });

  test("debe lanzar error si el usuario no está en el proyecto", async () => {
    const mockProject = {
      _id: "project-1",
      team: ["user-2", "user-3"]
    };
    projectRepositoryMock.findById.mockResolvedValue(mockProject as any);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.removeMember("project-1", "user-1")
    ).rejects.toThrow("El usuario no existe en el proyecto");
  });
});