import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskAssignmentController } from '../../../src/api/controllers/task-assignment.controller'
import { Context } from 'hono'
import type { ITaskAssignmentService } from '../../../src/core/services/task-assignment.service'

describe('TaskAssignmentController', () => {
    let taskAssignmentService: ITaskAssignmentService
    let controller: TaskAssignmentController
    let mockContext: Context

    beforeEach(() => {
        taskAssignmentService = {
            create: vi.fn(),
            delete: vi.fn(),
            getByUserId: vi.fn(),
            getLengthByUserId: vi.fn()
        }

        controller = new TaskAssignmentController(taskAssignmentService)
        mockContext = {
            json: vi.fn(),
            req: {
                json: vi.fn(),
                param: vi.fn()
            }
        } as any
    })

    describe('assignTaskToUser', () => {
        it('should assign task to user and return 201', async () => {
            const assignmentData = { taskId: '1', userId: '2' }
            const createdAssignment = { id: '1' }
            
            vi.mocked(mockContext.req.json).mockResolvedValue(assignmentData)
            vi.mocked(taskAssignmentService.create).mockResolvedValue(createdAssignment)
            vi.mocked(mockContext.json).mockReturnValue({ status: 201 } as any)

            await controller.assignTaskToUser(mockContext)

            expect(taskAssignmentService.create).toHaveBeenCalledWith(assignmentData.taskId, assignmentData.userId)
            expect(mockContext.json).toHaveBeenCalledWith({ assignment: createdAssignment }, 201)
        })
    })

    describe('unassignTaskFromUser', () => {
        it('should unassign task from user', async () => {
            const assignmentId = '1'
            const unassignedAssignment = { id: assignmentId }

            vi.mocked(mockContext.req.param).mockReturnValue(assignmentId)
            vi.mocked(taskAssignmentService.delete).mockResolvedValue(unassignedAssignment)
            vi.mocked(mockContext.json).mockReturnValue({ status: 200 } as any)

            await controller.unassignTaskFromUser(mockContext)

            expect(taskAssignmentService.delete).toHaveBeenCalledWith(assignmentId)
            expect(mockContext.json).toHaveBeenCalledWith({ assignment: unassignedAssignment })
        })
    })

    describe('getAssignmentsByUserId', () => {
        it('should return user assignments', async () => {
            const userId = '1'
            const assignments = [
                { 
                    id: '1', 
                    taskId: '1', 
                    userId: '1',
                    task: {
                        id: '1',
                        title: 'Task 1',
                        description: 'Description 1',
                        statusId: 1,
                        createdAt: new Date(),
                        dueDate: null,
                        createdBy: '1'
                    }
                },
                { 
                    id: '2', 
                    taskId: '2', 
                    userId: '1',
                    task: {
                        id: '2',
                        title: 'Task 2',
                        description: 'Description 2',
                        statusId: 1,
                        createdAt: new Date(),
                        dueDate: null,
                        createdBy: '1'
                    }
                }
            ]

            vi.mocked(mockContext.req.param).mockReturnValue(userId)
            vi.mocked(taskAssignmentService.getByUserId).mockResolvedValue(assignments)
            vi.mocked(mockContext.json).mockReturnValue({ status: 200 } as any)

            await controller.getAssignmentsByUserId(mockContext)

            expect(taskAssignmentService.getByUserId).toHaveBeenCalledWith(userId)
            expect(mockContext.json).toHaveBeenCalledWith({ assignments })
        })
    })

    describe('getAssignmentLengthByUserId', () => {
        it('should return assignment lengths by status', async () => {
            const userId = '1'
            const assignmentLengths = [
                { status: 'TODO', count: 2 },
                { status: 'IN_PROGRESS', count: 1 }
            ]

            vi.mocked(mockContext.req.param).mockReturnValue(userId)
            vi.mocked(taskAssignmentService.getLengthByUserId).mockResolvedValue(assignmentLengths)
            vi.mocked(mockContext.json).mockReturnValue({ status: 200 } as any)

            await controller.getAssignmentLengthByUserId(mockContext)

            expect(taskAssignmentService.getLengthByUserId).toHaveBeenCalledWith(userId)
            expect(mockContext.json).toHaveBeenCalledWith({ assignmentLengths })
        })
    })
})