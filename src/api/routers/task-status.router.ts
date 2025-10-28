import { Hono } from 'hono'
import type { DrizzleClient } from '../../database/index.js'
import { TaskStatusService } from '../../core/services/task-status.service.js'
import { TaskStatusController } from '../controllers/task-status.controller.js'
import { requireAuth } from '../middlewares/require-auth.js'
import { requirePermission } from '../middlewares/require-permission.js'

export const taskStatusRouter = (db: DrizzleClient) => {
  const controller = new TaskStatusController(new TaskStatusService(db))

  const router = new Hono()
  router.use(requireAuth)
  // allow viewing to users with VIEW_TASKS permission
  router.use(requirePermission(['VIEW_TASKS']))
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)

  // management endpoints require higher permission
  router.use(requirePermission(['MANAGE_PERMISSIONS']))
  router.post('/', controller.create)
  router.put('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
