import bcrypt from "bcrypt";

import { AuthUseCases } from "../application/usecases/AuthUseCases";
import { IUserRepository } from "../domain/ports/IUserRepository";

const userRepositoryMock: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdPublic: jest.fn(),
  findByEmailPublic: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

describe("AuthUseCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "palabrasupersecreta";
  });

  test("debe crear una cuenta cuando el usuario no existe", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await authUseCases.createAccount({
      name: "Jeff",
      email: "jeff@test.com",
      password: "123456"
    });

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith("jeff@test.com");
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(userRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jeff",
        email: "jeff@test.com",
        confirmed: true
      })
    );
  });

  test("debe lanzar error si el usuario ya está registrado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      _id: "1",
      name: "Jeff",
      email: "jeff@test.com",
      password: "123456",
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.createAccount({
        name: "Jeff",
        email: "jeff@test.com",
        password: "123456"
      })
    ).rejects.toThrow("El Usuario ya esta registrado");

    expect(userRepositoryMock.create).not.toHaveBeenCalled();
  });

  test("debe iniciar sesión correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      _id: "1",
      name: "Jeff",
      email: "jeff@test.com",
      password: await bcrypt.hash("123456", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    const token = await authUseCases.login({
      email: "jeff@test.com",
      password: "123456"
    });

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith("jeff@test.com");
    expect(token).toBeDefined();
  });

  test("debe lanzar error si el usuario no existe al hacer login", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.login({
        email: "noexiste@test.com",
        password: "123456"
      })
    ).rejects.toThrow("Usuario no encontrado");
  });

  test("debe lanzar error si la contraseña es incorrecta", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      _id: "1",
      name: "Jeff",
      email: "jeff@test.com",
      password: await bcrypt.hash("passwordcorrecta", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.login({
        email: "jeff@test.com",
        password: "passwordincorrecta"
      })
    ).rejects.toThrow("Password Incorrecto");
  });

  test("debe actualizar el perfil correctamente", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await authUseCases.updateProfile("1", {
      name: "Nuevo Nombre",
      email: "nuevo@test.com"
    });

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith("nuevo@test.com");
    expect(userRepositoryMock.update).toHaveBeenCalledWith("1", {
      name: "Nuevo Nombre",
      email: "nuevo@test.com"
    });
  });

  test("debe lanzar error si el email ya está en uso por otro usuario", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      _id: "2",
      name: "Otro",
      email: "otro@test.com",
      password: "123456",
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.updateProfile("1", {
        name: "Usuario",
        email: "otro@test.com"
      })
    ).rejects.toThrow("Ese email ya esta registrado");

    expect(userRepositoryMock.update).not.toHaveBeenCalled();
  });

  test("debe permitir actualizar el mismo email", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({
      _id: "1",
      name: "Usuario",
      email: "usuario@test.com",
      password: "123456",
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await authUseCases.updateProfile("1", {
      name: "Nuevo Nombre",
      email: "usuario@test.com"
    });

    expect(userRepositoryMock.update).toHaveBeenCalledWith("1", {
      name: "Nuevo Nombre",
      email: "usuario@test.com"
    });
  });

  test("debe actualizar la contraseña correctamente", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      _id: "1",
      name: "Usuario",
      email: "usuario@test.com",
      password: await bcrypt.hash("passwordactual", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await authUseCases.updatePassword("1", "passwordactual", "nuevapassword");

    expect(userRepositoryMock.update).toHaveBeenCalledWith("1", {
      password: expect.any(String)
    });
  });

  test("debe lanzar error si el usuario no existe al actualizar contraseña", async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.updatePassword("1", "passwordactual", "nuevapassword")
    ).rejects.toThrow("Usuario no encontrado");
  });

  test("debe lanzar error si la contraseña actual es incorrecta", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      _id: "1",
      name: "Usuario",
      email: "usuario@test.com",
      password: await bcrypt.hash("passwordcorrecta", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.updatePassword("1", "passwordincorrecta", "nuevapassword")
    ).rejects.toThrow("El Contraseña actual es incorrecto");
  });

  test("debe verificar la contraseña correctamente", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      _id: "1",
      name: "Usuario",
      email: "usuario@test.com",
      password: await bcrypt.hash("passwordcorrecta", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.checkPassword("1", "passwordcorrecta")
    ).resolves.not.toThrow();
  });

  test("debe lanzar error si el usuario no existe al verificar contraseña", async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.checkPassword("1", "password")
    ).rejects.toThrow("Usuario no encontrado");
  });

  test("debe lanzar error si la contraseña es incorrecta al verificar", async () => {
    userRepositoryMock.findById.mockResolvedValue({
      _id: "1",
      name: "Usuario",
      email: "usuario@test.com",
      password: await bcrypt.hash("passwordcorrecta", 10),
      confirmed: true
    });

    const authUseCases = new AuthUseCases(userRepositoryMock);

    await expect(
      authUseCases.checkPassword("1", "passwordincorrecta")
    ).rejects.toThrow("La contraseña es incorrecta");
  });
});