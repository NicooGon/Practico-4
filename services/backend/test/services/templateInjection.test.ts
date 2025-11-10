// test/services/templateInjection.test.ts
import AuthService from '../../src/services/authService';
import db from '../../src/db';
import { User } from '../../src/types/user';

// Imita la Base de datos falsa controlada en el test
jest.mock('../../src/db');

describe('TemplateInjectionTest', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reinicia el estado de todos los mocks antes del test
  });

  // Creo el usuario con el código malicioso en first_name
  it('CreateUserTInjection', async () => {
    const user = {
      id: 'user-123',
      email: 'a@a.com',
      password: 'password123',
      first_name: '<%= process.exit(0) %>',
      last_name: 'Last',
      username: 'username',
    } as User;

    // Simula insert() de la base de datos
    const insertMock = jest.fn().mockResolvedValue([user]);

    // Simula el Select de la base de datos
    const selectMock = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    };
    
    // Simula llamadas a la BD devolviendo los mocks en lugar de conexiones reales
    (db as any)
      .mockReturnValueOnce(selectMock)
      .mockReturnValueOnce({ insert: insertMock, returning: jest.fn().mockReturnValue([user]) });

    // Es para detectar si process.exit es llamado a causa del codigo de first_name (en caso de fallar el test)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit fue llamado');
    });

    await AuthService.createUser(user);
    
    // Verifica que no se haya intentado ejecutar process.exit
    expect(exitSpy).not.toHaveBeenCalled();
    
    // Verifica que el método insert haya sido llamado
    expect(insertMock).toHaveBeenCalled();

    // Restaura el exitSpy
    exitSpy.mockRestore();
  });
});
