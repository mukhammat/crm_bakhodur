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
    
    // Получение назначений по ID пользователя
    router.get('/user/:userId', requirePermission(['VIEW_TASKS']), controller.getByUserId)

    // Получение статистики назначений по ID пользователя
    router.get('/user/:userId/length', requirePermission(['VIEW_TASKS']), controller.getLengthByUserId)
    
    // Для назначения/отмены назначения нужны соответствующие разрешения
    router.post('/', requirePermission(['CREATE_TASKS']), controller.create)
    router.delete('/:id', requirePermission(['UPDATE_TASKS']), controller.delete)

    return router
}