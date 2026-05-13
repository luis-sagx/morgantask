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
});

test("debe iniciar sesión correctamente", async () => {
  userRepositoryMock.findByEmail.mockResolvedValue({
    _id: "1",
    name: "Jeff",
    email: "jeff@test.com",
    password: await require("bcrypt").hash("123456", 10),
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