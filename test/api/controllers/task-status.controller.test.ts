import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusController } from '../../../src/infrastructure/http/controllers/task-status.controller.js'
import { Context } from 'hono'
import { CustomError } from '../../../src/core/errors/custom.error.js'
import type { ITaskStatusService } from '../../../src/core/services/task-status.service.js'

describe('TaskStatusController', () => {
  let taskStatusService: ITaskStatusService
  let controller: TaskStatusController
  let mockContext: Context

  beforeEach(() => {
    taskStatusService = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    controller = new TaskStatusController(taskStatusService)
    mockContext = {
      json: vi.fn(),
      req: {
        json: vi.fn(),
        param: vi.fn()
      }
    } as any
  })
  describe('create', () => {
    it('should create a task status and return 201', async () => {
      const taskStatusData = { title: 'New Status' }
      const createdId = 1
      
      vi.mocked(mockContext.req.json).mockResolvedValue(taskStatusData)
      vi.mocked(taskStatusService.create).mockResolvedValue(createdId)

      await controller.create(mockContext as Context)

      expect(taskStatusService.create).toHaveBeenCalledWith(taskStatusData)
      expect(mockContext.json).toHaveBeenCalledWith({ taskStatus: { id: createdId } }, 201)
    })
  })

  describe('getById', () => {
    it('should return task status by id', async () => {
      const taskStatus = { id: 1, title: 'Status' }
      const id = '1'

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(taskStatusService.getById).mockResolvedValue(taskStatus)

      await controller.getById(mockContext as Context)

      expect(taskStatusService.getById).toHaveBeenCalledWith(1)
      expect(mockContext.json).toHaveBeenCalledWith({ taskStatus })
    })

    it('should throw error for invalid id format', async () => {
      vi.mocked(mockContext.req.param).mockReturnValue('invalid')

      await expect(controller.getById(mockContext as Context))
        .rejects
        .toThrow(new CustomError('Invalid format', 401))
    })
  })

  describe('getAll', () => {
    it('should return all task statuses', async () => {
      const taskStatuses = [
        { id: 1, title: 'Status 1' },
        { id: 2, title: 'Status 2' }
      ]

      vi.mocked(taskStatusService.getAll).mockResolvedValue(taskStatuses)

      await controller.getAll(mockContext as Context)

      expect(taskStatusService.getAll).toHaveBeenCalled()
      expect(mockContext.json).toHaveBeenCalledWith({ taskStatuses })
    })
  })

  describe('update', () => {
    it('should update task status', async () => {
      const id = '1'
      const updateData = { title: 'Updated Status' }

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(mockContext.req.json).mockResolvedValue(updateData)
      vi.mocked(taskStatusService.update).mockResolvedValue(1)
      vi.mocked(mockContext.json).mockReturnValue({ status: 200 } as any)

      await controller.update(mockContext as Context)

      expect(taskStatusService.update).toHaveBeenCalledWith(1, updateData)
      expect(mockContext.json).toHaveBeenCalledWith({ taskStatus: { id: 1 } })
    })

    it('should throw error for invalid id format on update', async () => {
      vi.mocked(mockContext.req.param).mockReturnValue('invalid')

      await expect(controller.update(mockContext as Context))
        .rejects
        .toThrow(new CustomError('Invalid format', 401))
    })
  })

  describe('delete', () => {
    it('should delete task status', async () => {
      const id = '1'

      vi.mocked(mockContext.req.param).mockReturnValue(id)
      vi.mocked(taskStatusService.delete).mockResolvedValue(1)
      vi.mocked(mockContext.json).mockReturnValue({ status: 200 } as any)

      await controller.delete(mockContext as Context)

      expect(taskStatusService.delete).toHaveBeenCalledWith(1)
      expect(mockContext.json).toHaveBeenCalledWith({ taskStatus: { id: 1 } })
    })

    it('should throw error for invalid id format on delete', async () => {
      vi.mocked(mockContext.req.param).mockReturnValue('invalid')

      await expect(controller.delete(mockContext as Context))
        .rejects
        .toThrow(new CustomError('Invalid format', 401))
    })
  })
})
