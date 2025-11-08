// test/services/templateInjection.test.ts
import AuthService from '../../src/services/authService';
import db from '../../src/db';
import { User } from '../../src/types/user';

jest.mock('../../src/db');

describe('TemplateInjectionTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // No debe ejecutar código del input en first_name
  it('CreateUserTInjection', async () => {
    const user = {
      id: 'user-123',
      email: 'a@a.com',
      password: 'password123',
      first_name: '<%= process.exit(0) %>',
      last_name: 'Last',
      username: 'username',
    } as User;

    const insertMock = jest.fn().mockResolvedValue([user]);
    const selectMock = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    };

    (db as any)
      .mockReturnValueOnce(selectMock)
      .mockReturnValueOnce({ insert: insertMock, returning: jest.fn().mockReturnValue([user]) });

    // Es para detectar si process.exit es llamado a causa del codigo de first_name (en caso de fallar el test)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit fue llamado');
    });

    await AuthService.createUser(user);

    expect(exitSpy).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    exitSpy.mockRestore();
  });
});
