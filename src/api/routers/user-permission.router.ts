import { Hono } from 'hono';
import type { DrizzleClient } from '../../database/index.js';
import { UserPermissionService } from '../../core/services/user-permission.service.js';
import { UserPermissionController } from '../controllers/user-permission.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';

export const userPermissionRouter = (db: DrizzleClient) => {
  const controller = new UserPermissionController(new UserPermissionService(db));

  return new Hono()
    .use(requireAuth)
    .use(requirePermission(['MANAGE_PERMISSIONS']))
    .get('/:userId', controller.getByUserId)
    .post('/:userId', controller.assignPermission)
    .delete('/:userId', controller.removePermission);
};

