import { Hono } from 'hono'
import { TaskAssignmentController } from '../controllers/task-assignment.controller.js'
import { TaskAssignmentService } from '../../core/services/task-assignment.service.js'
import type { DrizzleClient } from '../../database/index.js'
import { requireAuth } from '../middlewares/require-auth.js'
import { requirePermission } from '../middlewares/require-permission.js'

export const taskAssignmentRouter = (db: DrizzleClient) => {
    const controller = new TaskAssignmentController(new TaskAssignmentService(db))
    const router = new Hono()

    router.use(requireAuth)
    
    // Для просмотра назначений нужно право на просмотр задач
    router.use(requirePermission(['VIEW_TASKS']))
    
    // Для назначения/отмены назначения нужно право на управление задачами
    router.post('/', requirePermission(['MANAGE_TASKS']), controller.create)
    router.delete('/:id', requirePermission(['MANAGE_TASKS']), controller.delete)
    
    // Получение назначений по ID пользователя
    router.get('/user/:userId', controller.getByUserId)

    // Получение статистики назначений по ID пользователя
    router.get('/user/:userId/length', controller.getLengthByUserId)

    return router
}