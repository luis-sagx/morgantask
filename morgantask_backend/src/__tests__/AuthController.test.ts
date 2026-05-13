// Mock the database to prevent real MongoDB connection
jest.mock('../infrastructure/config/db', () => ({
  connectDB: jest.fn(),
}));

jest.mock('../infrastructure/repositories/MongoUserRepository', () => ({
  MongoUserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIdPublic: jest.fn(),
    findByEmailPublic: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  })),
}));

jest.mock('../infrastructure/repositories/MongoProjectRepository', () => ({
  MongoProjectRepository: jest.fn().mockImplementation(() => ({
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
    getTeamPopulated: jest.fn(),
  })),
}));

jest.mock('../infrastructure/repositories/MongoTaskRepository', () => ({
  MongoTaskRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithDetails: jest.fn(),
    findByProject: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    addNote: jest.fn(),
    removeNote: jest.fn(),
  })),
}));

jest.mock('../infrastructure/repositories/MongoNoteRepository', () => ({
  MongoNoteRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByTask: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Import container after mocks are set up
import { authUseCases, projectUseCases, taskUseCases, noteUseCases, teamUseCases } from '../infrastructure/container';
import { AuthController } from '../interfaces/controllers/AuthController';

describe('AuthController', () => {
  let mockReq: any;
  let mockRes: any;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';

    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });

    mockReq = {
      body: {},
      user: { id: 'user-1' }
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
      send: sendMock
    };
  });

  describe('createAccount', () => {
    test('debe crear cuenta exitosamente', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      jest.spyOn(authUseCases, 'createAccount').mockResolvedValue(undefined);

      await AuthController.createAccount(mockReq, mockRes);

      expect(authUseCases.createAccount).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      expect(sendMock).toHaveBeenCalledWith('Cuenta creada correctamente, ya podés iniciar sesión');
    });

    test('debe manejar error de usuario ya registrado', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'existing@test.com',
        password: 'password123'
      };

      jest.spyOn(authUseCases, 'createAccount').mockRejectedValue(
        new Error('El Usuario ya esta registrado')
      );

      await AuthController.createAccount(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'El Usuario ya esta registrado' });
    });

    test('debe manejar errores genéricos', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      jest.spyOn(authUseCases, 'createAccount').mockRejectedValue(
        new Error('Some other error')
      );

      await AuthController.createAccount(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Some other error' });
    });
  });

  describe('login', () => {
    test('debe iniciar sesión exitosamente', async () => {
      mockReq.body = {
        email: 'test@test.com',
        password: 'password123'
      };

      jest.spyOn(authUseCases, 'login').mockResolvedValue('mock-jwt-token');

      await AuthController.login(mockReq, mockRes);

      expect(authUseCases.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
      expect(sendMock).toHaveBeenCalledWith('mock-jwt-token');
    });

    test('debe manejar error de usuario no encontrado', async () => {
      mockReq.body = {
        email: 'notfound@test.com',
        password: 'password123'
      };

      jest.spyOn(authUseCases, 'login').mockRejectedValue(
        new Error('Usuario no encontrado')
      );

      await AuthController.login(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    test('debe manejar error de contraseña incorrecta', async () => {
      mockReq.body = {
        email: 'test@test.com',
        password: 'wrongpassword'
      };

      jest.spyOn(authUseCases, 'login').mockRejectedValue(
        new Error('Password Incorrecto')
      );

      await AuthController.login(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Password Incorrecto' });
    });
  });

  describe('user', () => {
    test('debe retornar información del usuario', async () => {
      await AuthController.user(mockReq, mockRes);

      expect(jsonMock).toHaveBeenCalledWith(mockReq.user);
    });
  });

  describe('updateProfile', () => {
    test('debe actualizar perfil exitosamente', async () => {
      mockReq.body = {
        name: 'Nuevo Nombre',
        email: 'nuevo@test.com'
      };

      jest.spyOn(authUseCases, 'updateProfile').mockResolvedValue(undefined);

      await AuthController.updateProfile(mockReq, mockRes);

      expect(authUseCases.updateProfile).toHaveBeenCalledWith('user-1', {
        name: 'Nuevo Nombre',
        email: 'nuevo@test.com'
      });
      expect(sendMock).toHaveBeenCalledWith('Perfil actualizado correctamente');
    });

    test('debe manejar error de email ya registrado', async () => {
      mockReq.body = {
        name: 'Usuario',
        email: 'existing@test.com'
      };

      jest.spyOn(authUseCases, 'updateProfile').mockRejectedValue(
        new Error('Ese email ya esta registrado')
      );

      await AuthController.updateProfile(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Ese email ya esta registrado' });
    });
  });

  describe('updateCurrentUserPassword', () => {
    test('debe actualizar contraseña exitosamente', async () => {
      mockReq.body = {
        current_password: 'oldpassword',
        password: 'newpassword'
      };

      jest.spyOn(authUseCases, 'updatePassword').mockResolvedValue(undefined);

      await AuthController.updateCurrentUserPassword(mockReq, mockRes);

      expect(authUseCases.updatePassword).toHaveBeenCalledWith('user-1', 'oldpassword', 'newpassword');
      expect(sendMock).toHaveBeenCalledWith('La contraseña se modificó correctamente');
    });

    test('debe manejar error de contraseña incorrecta', async () => {
      mockReq.body = {
        current_password: 'wrongpassword',
        password: 'newpassword'
      };

      jest.spyOn(authUseCases, 'updatePassword').mockRejectedValue(
        new Error('El Contraseña actual es incorrecto')
      );

      await AuthController.updateCurrentUserPassword(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'El Contraseña actual es incorrecto' });
    });
  });

  describe('checkPassword', () => {
    test('debe verificar contraseña exitosamente', async () => {
      mockReq.body = { password: 'correctpassword' };

      jest.spyOn(authUseCases, 'checkPassword').mockResolvedValue(undefined);

      await AuthController.checkPassword(mockReq, mockRes);

      expect(authUseCases.checkPassword).toHaveBeenCalledWith('user-1', 'correctpassword');
      expect(sendMock).toHaveBeenCalledWith('Contraseña Correcta');
    });

    test('debe manejar error de contraseña incorrecta', async () => {
      mockReq.body = { password: 'wrongpassword' };

      jest.spyOn(authUseCases, 'checkPassword').mockRejectedValue(
        new Error('La contraseña es incorrecta')
      );

      await AuthController.checkPassword(mockReq, mockRes);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'La contraseña es incorrecta' });
    });
  });
});