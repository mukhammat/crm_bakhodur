import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PermissionController } from '../../../src/api/controllers/permission.controller'
import { Context } from 'hono'

describe('PermissionController', () => {
  let permissionService: any
  let controller: PermissionController
  let mockContext: Partial<Context>

  beforeEach(() => {
    permissionService = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
    controller = new PermissionController(permissionService)
    mockContext: Partial<Context> = {
      json: vi.fn(),
      req: {
        json: vi.fn(),
        param: vi.fn()
      }
    }
  })

  describe('create', () => {
    it('should create a permission and return 201', async () => {
      const permissionData = { name: 'NEW_PERMISSION', description: 'New permission' }
      const createdPermission = { id: '1', ...permissionData }
      
      vi.mocked(mockContext.req!.json).mockResolvedValue(permissionData)
      vi.mocked(permissionService.create).mockResolvedValue(createdPermission)
      vi.mocked(mockContext.json!).mockReturnValue(undefined as any)

      await controller.create(mockContext as Context)

      expect(permissionService.create).toHaveBeenCalledWith(permissionData)
      expect(mockContext.json).toHaveBeenCalledWith({ permission: createdPermission }, 201)
    })
  })

  describe('getAll', () => {
    it('should return all permissions', async () => {
      const permissions = [
        { id: '1', name: 'PERMISSION_1', description: 'First permission' },
        { id: '2', name: 'PERMISSION_2', description: 'Second permission' }
      ]

      vi.mocked(permissionService.getAll).mockResolvedValue(permissions)
      vi.mocked(mockContext.json).mockReturnValue(undefined as any)

      await controller.getAll(mockContext as Context)

      expect(permissionService.getAll).toHaveBeenCalled()
      expect(mockContext.json).toHaveBeenCalledWith({ permissions })
    })
  })

  describe('getById', () => {
    it('should return permission by id when found', async () => {
      const permission = { id: '1', name: 'TEST_PERMISSION', description: 'Test permission' }
      const id = '1'

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(permissionService.getById).mockResolvedValue(permission)
      vi.mocked(mockContext.json).mockReturnValue(undefined as any)

      await controller.getById(mockContext as Context)

      expect(permissionService.getById).toHaveBeenCalledWith(id)
      expect(mockContext.json).toHaveBeenCalledWith({ permission })
    })

    it('should return 404 when permission not found', async () => {
      const id = '999'

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(permissionService.getById).mockResolvedValue(null)
      vi.mocked(mockContext.json).mockReturnValue(undefined as any)

      await controller.getById(mockContext as Context)

      expect(permissionService.getById).toHaveBeenCalledWith(id)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Разрешение не найдено' }, 404)
    })
  })

  describe('update', () => {
    it('should update permission', async () => {
      const id = '1'
      const updateData = { name: 'UPDATED_PERMISSION', description: 'Updated description' }
      const updatedPermission = { id, ...updateData }

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(mockContext.req.json).mockResolvedValue(updateData)
      vi.mocked(permissionService.update).mockResolvedValue(updatedPermission)
      vi.mocked(mockContext.json).mockReturnValue(undefined as any)

      await controller.update(mockContext as Context)

      expect(permissionService.update).toHaveBeenCalledWith(id, updateData)
      expect(mockContext.json).toHaveBeenCalledWith({ permission: updatedPermission })
    })
  })

  describe('delete', () => {
    it('should delete permission', async () => {
      const id = '1'
      const deletedPermission = { id, name: 'DELETED_PERMISSION', description: 'Deleted permission' }

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(permissionService.delete).mockResolvedValue(deletedPermission)
      vi.mocked(mockContext.json).mockReturnValue(undefined as any)

      await controller.delete(mockContext as Context)

      expect(permissionService.delete).toHaveBeenCalledWith(id)
      expect(mockContext.json).toHaveBeenCalledWith({ permission: deletedPermission })
    })
  })
})