import { Hono } from 'hono';
import type { DrizzleClient } from '../../database/index.js';
import { RolePermissionService } from '../../core/services/role-permission.service.js';
import { RolePermissionController } from '../controllers/role-permission.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';

export const rolePermissionRouter = (db: DrizzleClient) => {
  const controller = new RolePermissionController(new RolePermissionService(db));

  const router = new Hono()
    .use(requireAuth)
    // доступ к собственным правам должен быть у любого аутентифицированного пользователя
    .get('/me', controller.me);

  // дальнейшие операции с правами требуют MANAGE_PERMISSIONS
  router
    .use(requirePermission(['MANAGE_PERMISSIONS']))
    .get('/:roleId', controller.getByRoleId)
    .post('/:roleId', controller.assignPermission)
    .delete('/:roleId', controller.removePermission);

  return router;
};

