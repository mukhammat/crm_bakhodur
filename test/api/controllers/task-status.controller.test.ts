import { describe, it, expect, vi, beforeEach, MockedClass } from 'vitest'
import type { ITaskStatusService } from '../../../src/core/services/task-status.service.js'
//import { UserRoleController } from '../../../src/api/controllers/task-status.controller.js'
import { Hono } from 'hono';

const createMockService = (): ITaskStatusService => ({
    create: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
});

describe('TaskStatusController', () => {
    let app: Hono;
    let mockService: ITaskStatusService;
    //let controller: AuthController;

    beforeEach(() => {

    })
})
