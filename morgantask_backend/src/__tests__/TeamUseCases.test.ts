import { TeamUseCases } from "../application/usecases/TeamUseCases";
import { IProject } from "../domain/entities/Project";
import { IUser } from "../domain/entities/User";
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
    const mockUser: IUser = {
      _id: "user-1",
      email: "miembro@test.com",
      name: "Miembro",
      password: "",
      confirmed: true
    };
    userRepositoryMock.findByEmailPublic.mockResolvedValue(mockUser);

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
    const mockTeam: IUser[] = [
      { _id: "user-1", name: "Usuario 1", email: "user1@test.com", password: "", confirmed: true },
      { _id: "user-2", name: "Usuario 2", email: "user2@test.com", password: "", confirmed: true }
    ];
    projectRepositoryMock.getTeamPopulated.mockResolvedValue(mockTeam);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    const result = await teamUseCases.getTeam("project-1");

    expect(projectRepositoryMock.getTeamPopulated).toHaveBeenCalledWith("project-1");
    expect(result).toEqual(mockTeam);
  });

  test("debe agregar un miembro al proyecto", async () => {
    const mockUser: IUser = {
      _id: "user-1",
      email: "nuevo@test.com",
      name: "Nuevo",
      password: "",
      confirmed: true
    };
    const mockProject: IProject = {
      _id: "project-1",
      projectName: "",
      clientName: "",
      description: "",
      manager: "",
      tasks: [],
      team: ["user-2"]
    };
    userRepositoryMock.findByIdPublic.mockResolvedValue(mockUser);
    projectRepositoryMock.findById.mockResolvedValue(mockProject);

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
    const mockUser: IUser = {
      _id: "user-1",
      email: "existente@test.com",
      name: "Existente",
      password: "",
      confirmed: true
    };
    const mockProject: IProject = {
      _id: "project-1",
      projectName: "",
      clientName: "",
      description: "",
      manager: "",
      tasks: [],
      team: ["user-1", "user-2"]
    };
    userRepositoryMock.findByIdPublic.mockResolvedValue(mockUser);
    projectRepositoryMock.findById.mockResolvedValue(mockProject);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.addMember("project-1", "user-1")
    ).rejects.toThrow("El usuario ya existe en el proyecto");
  });

  test("debe remover un miembro del proyecto", async () => {
    const mockProject: IProject = {
      _id: "project-1",
      projectName: "",
      clientName: "",
      description: "",
      manager: "",
      tasks: [],
      team: ["user-1", "user-2"]
    };
    projectRepositoryMock.findById.mockResolvedValue(mockProject);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await teamUseCases.removeMember("project-1", "user-1");

    expect(projectRepositoryMock.findById).toHaveBeenCalledWith("project-1");
    expect(projectRepositoryMock.removeMember).toHaveBeenCalledWith("project-1", "user-1");
  });

  test("debe lanzar error si el usuario no está en el proyecto", async () => {
    const mockProject: IProject = {
      _id: "project-1",
      projectName: "",
      clientName: "",
      description: "",
      manager: "",
      tasks: [],
      team: ["user-2", "user-3"]
    };
    projectRepositoryMock.findById.mockResolvedValue(mockProject);

    const teamUseCases = new TeamUseCases(projectRepositoryMock, userRepositoryMock);

    await expect(
      teamUseCases.removeMember("project-1", "user-1")
    ).rejects.toThrow("El usuario no existe en el proyecto");
  });
});