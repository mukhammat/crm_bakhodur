import { Hono } from 'hono';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { IUserService } from '../../../../src/core/services/user.service.js';
import { UserController } from '../../../../src/infrastructure/http/controllers/user.controller.js';
import { ContextJWT } from '../../../../src/infrastructure/http/types/context-jwt.js';
import { errorHandler } from '../../../../src/infrastructure/http/middlewares/error-handler.js';
import { CustomError } from '../../../../src/core/errors/custom.error.js'

const createMockService = (): IUserService => ({
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getByTelegramId: vi.fn(),
  saveFcmToken: vi.fn(),
});

describe('UserController', () => {
  let app: Hono;
  let mockService: IUserService;
  let controller: UserController;

  beforeEach(() => {
    app = new Hono();
    mockService = createMockService();
    controller = new UserController(mockService);
  });

  describe('me', () => {
    it('should return user data from userService.getById', async () => {
      const userData = {
          id: 'string',
          name: 'string',
          roleId: 2,
          email: 'a@a.com',
          isActive: true,
          telegramId: null,
          fcmToken: null
      }
      vi.mocked(mockService.getById).mockResolvedValue(userData);

      app.get('/me', async (c: ContextJWT) => {
        c.set('jwtPayload', { id: 'user-1' });
        return controller.me(c);
      });

      const res = await app.request('/me');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ user: { ...userData } });
      expect(mockService.getById).toHaveBeenCalledWith('user-1');
    });

    it('should handle user not found', async () => {
      const customError = new CustomError('User not found or deleted', 404);

      vi.mocked(mockService.getById).mockImplementation(() => {
        throw customError;
      });

      app.get('/me', async (c: ContextJWT) => {
        c.set('jwtPayload', { id: 'user-1' });
        return controller.me(c);
      });
      app.onError(errorHandler);

      const res = await app.request('/me');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ message: customError.message });
      expect(mockService.getById).toHaveBeenCalledWith('user-1');
    });

    it('should return 500 on unexpected error', async () => {
      const customError = new CustomError('Database connection failed');

      vi.mocked(mockService.getById).mockImplementation(() => {
        throw customError;
      });

      app.get('/me', async (c: ContextJWT) => {
        c.set('jwtPayload', { id: 'user-1' });
        return controller.me(c);
      });
      app.onError(errorHandler);

      const res = await app.request('/me');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ message: customError.message });
      expect(mockService.getById).toHaveBeenCalledWith('user-1');
    });
  })

  describe('getAll', () => {
    it('should return users filtered by role from userService.getAll', async () => {
      const users = [
        {
          id: 'user-1',
          name: 'user-1',
          roleId: 1,
          email: 'a1@a.com',
          isActive: true,
          telegramId: null,
          role: {
            id: 2,
            title: 'ADMIN'
          },
          fcmToken: null
        },
        {
          id: 'user-2',
          name: 'user-2',
          roleId: 2,
          email: 'a2@a.com',
          isActive: true,
          telegramId: null,
          role: {
            id: 2,
            title: 'ADMIN'
          },
          fcmToken: null
        }
      ];
      vi.mocked(mockService.getAll).mockResolvedValue(users);

      app.get('/users', async (c: ContextJWT) => {
        return controller.getAll(c);
      });

      const res = await app.request('/users?roleId=2', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ users });
      expect(mockService.getAll).toHaveBeenCalledWith({ roleId: 2 });
    });

    it('should return user array with length 0 is user not found', async () => {
      vi.mocked(mockService.getAll).mockResolvedValue([]);

      app.get('/users', async (c: ContextJWT) => {
        return controller.getAll(c);
      });

      const res = await app.request('/users?roleId=2', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ users: [] });
      expect(mockService.getAll).toHaveBeenCalledWith({ roleId: 2 });
    })
  });


})