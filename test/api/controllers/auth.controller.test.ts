import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthController } from '../../../src/infrastructure/http/controllers/auth.controller.js'
import { Context, Hono } from 'hono';
import { IAuthService } from '../../../src/core/services/auth.service.js';

// Service mock
const createMockService = (): IAuthService => ({
  login: vi.fn(),
  register: vi.fn(),
});

describe('AuthController', () => {
  let app: Hono;
  let mockService: IAuthService;
  let controller: AuthController;

  beforeEach(() => {
    app = new Hono();
    mockService = createMockService();
    controller = new AuthController(mockService);
  });

  describe('login', () => {
    it('should return token from authService.login', async () => {
      const createdUser = {
        token: 'abc',
        expiresIn: '24h',
        user: { id: 'user-id-1', roleId: 2 }
      };
      vi.mocked(mockService.login).mockResolvedValue(createdUser);
  
      app.post('/login', async (c: Context) => {
        return controller.login(c);
      });
  
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  email: 'a@a.com', password: 'pass' })
      });
      const data = await res.json();
      expect(data).toEqual(createdUser);
      expect(mockService.login).toHaveBeenCalledWith('a@a.com', 'pass');
    })
  })

  describe('register', () => {
    it('should return userId on register', async () => {
      const createdUser = {
        token: 'abc',
        expiresIn: '24h',
        user: { id: 'user-id-1', roleId: 2 }
      };
      vi.mocked(mockService.register).mockResolvedValue(createdUser);
      app.post('/register', async (c: Context) => {
        return controller.register(c);
      });

      const res = await app.request('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@a.com', password: 'pass', name: 'Name' })
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdUser);
      expect(mockService.register).toHaveBeenCalledWith({
        email: 'a@a.com',
        password: 'pass',
        name: 'Name'
      });
    });
  });
});
