import { Hono } from "hono";
import { PermissionController } from "../controllers/permission.controller.js";
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from '../middlewares/require-permission.js';

export const permissionRouter = (permissionController: PermissionController) => {
    return new Hono()
        .use(requireAuth)
        .use(requirePermission(['MANAGE_PERMISSIONS']))
        .post('/', permissionController.create)
        .get('/', permissionController.getAll)
        .get('/:id', permissionController.getById)
        .put('/:id', permissionController.update)
        .delete('/:id', permissionController.delete);
};

