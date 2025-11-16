import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PermissionController } from '../../../src/infrastructure/http/controllers/permission.controller.js'
import { Context, Hono } from 'hono'
import { IPermissionService } from '../../../src/core/services/permission.service.js'

const createMockService = (): IPermissionService => ({
  create: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByTitle: vi.fn()
})



describe('PermissionController', () => {
  let app: Hono;
  let mockService: IPermissionService;
  let controller: PermissionController
  

  beforeEach(() => {
    app = new Hono();
    mockService = createMockService();
    controller = new PermissionController(mockService);
  })

  describe('create', () => {
    it('should create a permission and return 201', async () => {
      const permissionData = { name: 'NEW_PERMISSION', description: 'New permission' }
      const createdPermission = { id: '1', ...permissionData }
      
      vi.mocked(mockService.create).mockResolvedValue(createdPermission);

      app.post('/', async (c: Context) => {
        return controller.create(c);
      });

      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({permission: createdPermission});
    })
  })

  describe('getAll', () => {
    it('should return all permissions', async () => {
      const permissions = [
        { id: '1', title: 'PERMISSION_1' },
        { id: '2', title: 'PERMISSION_2' }
      ]

      vi.mocked(mockService.getAll).mockResolvedValue(permissions)

      app.get('/', async (c) => {
        return controller.getAll(c);
      })

      const res = await app.request('/');



      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ permissions });
    })
  })

  describe('getById', () => {
    it('should return permission by id when found', async () => {
      const permission = { id: '1', title: 'TEST_PERMISSION' }
      const id = '1'

      vi.mocked(mockService.getById).mockResolvedValue(permission)

      app.get('/id', async (c) => {
        return controller.getById(c)
      })

      const res = await app.request(`/${id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({  });
    })
  })
})