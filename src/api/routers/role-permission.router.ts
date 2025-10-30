import { Hono } from 'hono';
import type { DrizzleClient } from '../../database/index.js';
import { RolePermissionService } from '../../core/services/role-permission.service.js';
import { RolePermissionController } from '../controllers/role-permission.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';

export const rolePermissionRouter = (db: DrizzleClient) => {
  const controller = new RolePermissionController(new RolePermissionService(db));

  return new Hono()
    .use(requireAuth)
    .use(requirePermission(['MANAGE_PERMISSIONS']))
    .get('/me', controller.me)
    .get('/:roleId', controller.getByRoleId)
    .post('/:roleId', controller.assignPermission)
    .delete('/:roleId', controller.removePermission);
};

