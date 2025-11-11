import { Hono } from 'hono';
import { RolePermissionController } from '../controllers/role-permission.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';

export const rolePermissionRouter = (controller: RolePermissionController) => {

  const router = new Hono()
    .use(requireAuth)
    .get('/me', controller.me);

  router
    .use(requirePermission(['MANAGE_PERMISSIONS']))
    .get('/:roleId', controller.getByRoleId)
    .post('/:roleId', controller.assignPermission)
    .delete('/:roleId', controller.removePermission);

  return router;
};