import { Hono } from "hono";
import { PermissionService } from "../../core/services/permission.service.js";
import { PermissionController } from "../controllers/permission.controller.js";
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';
import type { DrizzleClient } from "../../database/index.js";

export const permissionRouter = (db: DrizzleClient) => {
    const permissionController = new PermissionController(new PermissionService(db));

    return new Hono()
        .use(requireAuth)
        .use(requirePermission(['MANAGE_PERMISSIONS']))
        .post('/', permissionController.create)
        .get('/', permissionController.getAll)
        .get('/:id', permissionController.getById)
        .put('/:id', permissionController.update)
        .delete('/:id', permissionController.delete);
};

